# ENVORA LoRa Packet Protocol (v0)

All multi-byte fields are **little-endian**.

| Offset | Size | Field | Notes |
|---|---|---|---|
| 0 | 2 | node_id | Originating node, never changed by relays |
| 2 | 2 | seq | Per-node counter, increments each new packet |
| 4 | 1 | hop_count | +1 at each relay |
| 5 | 1 | ttl | -1 at each relay, packet dropped at 0 |
| 6 | 1 | type | 1 = sensor, 2 = heartbeat |
| 7 | 1 | payload_len | 0..32 |
| 8 | N | payload | type-specific |
| 8+N | 2 | crc16 | CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF) over all previous bytes |

Because `hop_count` and `ttl` change at each relay, the relaying node **recomputes the CRC**.

## Sensor payload (type 1, example layout, adjust to real sensors)
| Field | Type | Unit |
|---|---|---|
| temp_c_x100 | int16 | 0.01 C |
| humidity_x100 | uint16 | 0.01 % |
| pm25_x10 | uint16 | 0.1 ug/m3 |
| water_level_mm | uint16 | mm |
| flags | uint8 | bit0 = flame, bit1 = gas |

## Duplicate suppression
Each node keeps a small ring buffer of recent `(node_id, seq)` pairs. A packet already seen is not relayed again.

## Relay rules
1. Validate CRC, drop if invalid.
2. Drop if `(node_id, seq)` already seen.
3. Drop if `ttl == 0`.
4. Otherwise `ttl -= 1`, `hop_count += 1`, recompute CRC, retransmit (with a small random delay to reduce collisions).

## Open items
- Time-slotting or channel-activity detection to reduce collisions.
- Optional payload encryption / authentication.
