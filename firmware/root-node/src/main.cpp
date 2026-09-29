// ENVORA root node: LoRa RX -> validate -> alert logic -> buzzer -> NB-IoT uplink
#include <Arduino.h>
#include <RadioLib.h>
#include "config.h"
#include "packet.h"
#include "bg95.h"

SX1276 radio = new Module(LORA_CS, LORA_DIO0, LORA_RST, LORA_DIO1);
volatile bool rxFlag = false;
DedupCache dedup;

void IRAM_ATTR onRx() { rxFlag = true; }

// Placeholder rule-based check. TODO: replace with the trained edge model.
static bool isHazard(const SensorPayload &s, char *reason, size_t n) {
  if (s.temp_c_x100 >= ALERT_TEMP_C_X100 || (s.flags & 0x01)) { snprintf(reason, n, "Possible fire"); return true; }
  if (s.water_level_mm >= ALERT_WATER_MM)                     { snprintf(reason, n, "Possible flood"); return true; }
  if (s.pm25_x10 >= ALERT_PM25_X10)                           { snprintf(reason, n, "Severe air pollution"); return true; }
  return false;
}

static void beep(int ms) { digitalWrite(BUZZER_PIN, HIGH); delay(ms); digitalWrite(BUZZER_PIN, LOW); }

static void handlePacket(const EnvoraPacket &pkt) {
  if (pkt.type != PKT_SENSOR || pkt.payload_len != SENSOR_PAYLOAD_LEN) return;
  SensorPayload s;
  sensorPayloadUnpack(pkt.payload, s);

  char reason[32] = "";
  bool hazard = isHazard(s, reason, sizeof(reason));

  char json[224];
  snprintf(json, sizeof(json),
           "{\"node\":%u,\"seq\":%u,\"hops\":%u,\"temp\":%.2f,\"hum\":%.2f,\"pm25\":%.1f,\"water_mm\":%u,\"flags\":%u,\"alert\":\"%s\"}",
           pkt.node_id, pkt.seq, pkt.hop_count, s.temp_c_x100 / 100.0, s.humidity_x100 / 100.0,
           s.pm25_x10 / 10.0, s.water_level_mm, s.flags, hazard ? reason : "");
  Serial.println(json);

  if (hazard) beep(500);  // local alert first, independent of the uplink
  if (!bg95MqttPublish(hazard ? MQTT_ALERT_TOPIC : MQTT_TOPIC, json)) Serial.println("Uplink failed");
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  int st = radio.begin(LORA_FREQ_MHZ, LORA_BW_KHZ, LORA_SF, LORA_CR, LORA_SYNC, LORA_TX_DBM);
  if (st != RADIOLIB_ERR_NONE) Serial.printf("LoRa init failed: %d\n", st);
  radio.setPacketReceivedAction(onRx);
  radio.startReceive();
  if (!bg95Begin()) Serial.println("BG95 init failed (check power, SIM, antenna)");
}

void loop() {
  if (!rxFlag) return;
  rxFlag = false;
  uint8_t buf[ENVORA_MAX_PACKET];
  size_t len = radio.getPacketLength();
  int st = radio.readData(buf, len);
  radio.startReceive();
  if (st != RADIOLIB_ERR_NONE) return;
  EnvoraPacket pkt;
  if (!envoraDecode(buf, len, pkt)) return;
  if (dedup.seen(pkt.node_id, pkt.seq)) return;
  dedup.add(pkt.node_id, pkt.seq);
  handlePacket(pkt);
}
