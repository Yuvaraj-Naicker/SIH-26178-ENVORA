"""Python mirror of firmware/common/packet.h (protocol v0)."""
import struct

MAX_PAYLOAD = 32
HEADER_LEN = 8
PKT_SENSOR = 1
PKT_HEARTBEAT = 2


def crc16(data: bytes) -> int:
    """CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF)."""
    crc = 0xFFFF
    for byte in data:
        crc ^= byte << 8
        for _ in range(8):
            crc = ((crc << 1) ^ 0x1021) & 0xFFFF if crc & 0x8000 else (crc << 1) & 0xFFFF
    return crc


def encode(node_id, seq, hop_count, ttl, ptype, payload: bytes) -> bytes:
    if len(payload) > MAX_PAYLOAD:
        raise ValueError("payload too long")
    body = struct.pack("<HHBBBB", node_id, seq, hop_count, ttl, ptype, len(payload)) + payload
    return body + struct.pack("<H", crc16(body))


def decode(buf: bytes):
    """Return dict or None if invalid."""
    if len(buf) < HEADER_LEN + 2:
        return None
    node_id, seq, hop, ttl, ptype, plen = struct.unpack("<HHBBBB", buf[:HEADER_LEN])
    if plen > MAX_PAYLOAD or len(buf) != HEADER_LEN + plen + 2:
        return None
    body, (crc,) = buf[:-2], struct.unpack("<H", buf[-2:])
    if crc16(body) != crc:
        return None
    return {"node_id": node_id, "seq": seq, "hop_count": hop, "ttl": ttl,
            "type": ptype, "payload": buf[HEADER_LEN:-2]}


def pack_sensor(temp_c, humidity, pm25, water_mm, flags=0) -> bytes:
    return struct.pack("<hHHHB", round(temp_c * 100), round(humidity * 100),
                       round(pm25 * 10), water_mm, flags)


def unpack_sensor(payload: bytes) -> dict:
    t, h, p, w, f = struct.unpack("<hHHHB", payload)
    return {"temp_c": t / 100, "humidity": h / 100, "pm25": p / 10, "water_mm": w, "flags": f}
