// ENVORA leaf node: sample -> transmit -> listen/relay -> deep sleep
#include <Arduino.h>
#include <RadioLib.h>
#include "config.h"
#include "packet.h"
#include "sensors.h"

SX1276 radio = new Module(LORA_CS, LORA_DIO0, LORA_RST, LORA_DIO1);

RTC_DATA_ATTR uint16_t seqCounter = 0;  // survives deep sleep
DedupCache dedup;

static void transmit(const EnvoraPacket &pkt) {
  uint8_t buf[ENVORA_MAX_PACKET];
  size_t len = envoraEncode(pkt, buf);
  int st = radio.transmit(buf, len);
  Serial.printf("TX node=%u seq=%u hop=%u ttl=%u status=%d\n", pkt.node_id, pkt.seq, pkt.hop_count, pkt.ttl, st);
}

static void sendOwnReading() {
  EnvoraPacket pkt = {};
  pkt.node_id = NODE_ID;
  pkt.seq = seqCounter++;
  pkt.hop_count = 0;
  pkt.ttl = PACKET_TTL;
  pkt.type = PKT_SENSOR;
  pkt.payload_len = SENSOR_PAYLOAD_LEN;
  SensorPayload s;
  readSensors(s);
  sensorPayloadPack(s, pkt.payload);
  dedup.add(pkt.node_id, pkt.seq);
  transmit(pkt);
}

// Listen for neighbours and relay new packets.
static void relayWindow() {
  uint32_t start = millis();
  while (millis() - start < RELAY_WINDOW_MS) {
    uint8_t buf[ENVORA_MAX_PACKET];
    // Blocking receive; returns on packet or on the driver's RX timeout.
    int st = radio.receive(buf, sizeof(buf));
    if (st != RADIOLIB_ERR_NONE) continue;
    size_t len = radio.getPacketLength();
    EnvoraPacket pkt;
    if (!envoraDecode(buf, len, pkt)) continue;       // bad CRC / length
    if (pkt.node_id == NODE_ID) continue;             // our own packet echoed back
    if (dedup.seen(pkt.node_id, pkt.seq)) continue;   // already relayed
    dedup.add(pkt.node_id, pkt.seq);
    if (pkt.ttl == 0) continue;                       // out of hops
    pkt.ttl--;
    pkt.hop_count++;
    delay(random(20, 200));                           // reduce collisions
    transmit(pkt);
  }
}

void setup() {
  Serial.begin(115200);
  int st = radio.begin(LORA_FREQ_MHZ, LORA_BW_KHZ, LORA_SF, LORA_CR, LORA_SYNC, LORA_TX_DBM);
  if (st != RADIOLIB_ERR_NONE) {
    Serial.printf("LoRa init failed: %d\n", st);
  } else {
    sendOwnReading();
    relayWindow();
    radio.sleep();
  }
  esp_sleep_enable_timer_wakeup((uint64_t)SLEEP_SECONDS * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {}
