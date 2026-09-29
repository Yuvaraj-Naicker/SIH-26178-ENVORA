// ENVORA packet format v0. See docs/lora-mesh-protocol.md
#pragma once
#include <stdint.h>
#include <stddef.h>
#include <string.h>

#define ENVORA_MAX_PAYLOAD 32
#define ENVORA_HEADER_LEN 8
#define ENVORA_CRC_LEN 2
#define ENVORA_MAX_PACKET (ENVORA_HEADER_LEN + ENVORA_MAX_PAYLOAD + ENVORA_CRC_LEN)

enum PacketType : uint8_t { PKT_SENSOR = 1, PKT_HEARTBEAT = 2 };

struct EnvoraPacket {
  uint16_t node_id;
  uint16_t seq;
  uint8_t hop_count;
  uint8_t ttl;
  uint8_t type;
  uint8_t payload_len;
  uint8_t payload[ENVORA_MAX_PAYLOAD];
};

// Example sensor payload (adjust to real sensors). 9 bytes on the wire.
struct SensorPayload {
  int16_t temp_c_x100;
  uint16_t humidity_x100;
  uint16_t pm25_x10;
  uint16_t water_level_mm;
  uint8_t flags;  // bit0 flame, bit1 gas
};
#define SENSOR_PAYLOAD_LEN 9

// CRC-16/CCITT-FALSE
inline uint16_t envoraCrc16(const uint8_t *data, size_t len) {
  uint16_t crc = 0xFFFF;
  for (size_t i = 0; i < len; i++) {
    crc ^= (uint16_t)data[i] << 8;
    for (int b = 0; b < 8; b++) crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : (crc << 1);
  }
  return crc;
}

inline void putU16(uint8_t *p, uint16_t v) { p[0] = v & 0xFF; p[1] = v >> 8; }
inline uint16_t getU16(const uint8_t *p) { return (uint16_t)p[0] | ((uint16_t)p[1] << 8); }

// Serialize packet into buf (needs ENVORA_MAX_PACKET bytes). Returns total length.
inline size_t envoraEncode(const EnvoraPacket &pkt, uint8_t *buf) {
  putU16(buf + 0, pkt.node_id);
  putU16(buf + 2, pkt.seq);
  buf[4] = pkt.hop_count;
  buf[5] = pkt.ttl;
  buf[6] = pkt.type;
  buf[7] = pkt.payload_len;
  memcpy(buf + ENVORA_HEADER_LEN, pkt.payload, pkt.payload_len);
  size_t n = ENVORA_HEADER_LEN + pkt.payload_len;
  putU16(buf + n, envoraCrc16(buf, n));
  return n + ENVORA_CRC_LEN;
}

// Parse and validate. Returns true if length and CRC are OK.
inline bool envoraDecode(const uint8_t *buf, size_t len, EnvoraPacket &pkt) {
  if (len < ENVORA_HEADER_LEN + ENVORA_CRC_LEN) return false;
  uint8_t plen = buf[7];
  if (plen > ENVORA_MAX_PAYLOAD) return false;
  if (len != (size_t)(ENVORA_HEADER_LEN + plen + ENVORA_CRC_LEN)) return false;
  size_t n = ENVORA_HEADER_LEN + plen;
  if (envoraCrc16(buf, n) != getU16(buf + n)) return false;
  pkt.node_id = getU16(buf + 0);
  pkt.seq = getU16(buf + 2);
  pkt.hop_count = buf[4];
  pkt.ttl = buf[5];
  pkt.type = buf[6];
  pkt.payload_len = plen;
  memcpy(pkt.payload, buf + ENVORA_HEADER_LEN, plen);
  return true;
}

inline void sensorPayloadPack(const SensorPayload &s, uint8_t *out) {
  putU16(out + 0, (uint16_t)s.temp_c_x100);
  putU16(out + 2, s.humidity_x100);
  putU16(out + 4, s.pm25_x10);
  putU16(out + 6, s.water_level_mm);
  out[8] = s.flags;
}
inline void sensorPayloadUnpack(const uint8_t *in, SensorPayload &s) {
  s.temp_c_x100 = (int16_t)getU16(in + 0);
  s.humidity_x100 = getU16(in + 2);
  s.pm25_x10 = getU16(in + 4);
  s.water_level_mm = getU16(in + 6);
  s.flags = in[8];
}

// Remembers recent (node_id, seq) pairs to stop duplicates and relay loops.
class DedupCache {
 public:
  bool seen(uint16_t node, uint16_t seq) {
    for (int i = 0; i < N; i++)
      if (used[i] && nodes[i] == node && seqs[i] == seq) return true;
    return false;
  }
  void add(uint16_t node, uint16_t seq) {
    nodes[head] = node; seqs[head] = seq; used[head] = true;
    head = (head + 1) % N;
  }
 private:
  static const int N = 32;
  uint16_t nodes[N] = {0};
  uint16_t seqs[N] = {0};
  bool used[N] = {false};
  int head = 0;
};
