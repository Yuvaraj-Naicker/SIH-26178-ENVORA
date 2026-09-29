import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "tools"))
from envora_packet import encode, decode, crc16, pack_sensor, unpack_sensor, PKT_SENSOR


def test_crc_known_value():
    # Standard check value for CRC-16/CCITT-FALSE
    assert crc16(b"123456789") == 0x29B1


def test_roundtrip():
    payload = pack_sensor(25.5, 60.0, 12.3, 40, 1)
    raw = encode(7, 42, 0, 4, PKT_SENSOR, payload)
    pkt = decode(raw)
    assert pkt["node_id"] == 7 and pkt["seq"] == 42 and pkt["ttl"] == 4
    s = unpack_sensor(pkt["payload"])
    assert s["temp_c"] == 25.5 and s["water_mm"] == 40 and s["flags"] == 1


def test_corrupted_packet_rejected():
    raw = bytearray(encode(1, 1, 0, 4, PKT_SENSOR, pack_sensor(20, 50, 10, 0)))
    raw[9] ^= 0xFF
    assert decode(bytes(raw)) is None


def test_bad_length_rejected():
    raw = encode(1, 1, 0, 4, PKT_SENSOR, pack_sensor(20, 50, 10, 0))
    assert decode(raw[:-1]) is None


def test_relay_changes_ttl_and_recomputes_crc():
    raw = encode(1, 1, 0, 4, PKT_SENSOR, pack_sensor(20, 50, 10, 0))
    p = decode(raw)
    relayed = encode(p["node_id"], p["seq"], p["hop_count"] + 1, p["ttl"] - 1, p["type"], p["payload"])
    q = decode(relayed)
    assert q["ttl"] == 3 and q["hop_count"] == 1
