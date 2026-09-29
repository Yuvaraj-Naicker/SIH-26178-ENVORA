// Quectel BG95 uplink over AT commands (MQTT).
// NOTE: command sequence follows Quectel's BG95 MQTT AT manual but is UNTESTED on this
// board. Validate each step with a serial terminal first, and adjust for your network.
#include "bg95.h"
#include "config.h"

static HardwareSerial &modem = Serial2;

static bool sendAT(const char *cmd, const char *expect, uint32_t timeoutMs = 2000) {
  while (modem.available()) modem.read();
  modem.println(cmd);
  String resp;
  uint32_t start = millis();
  while (millis() - start < timeoutMs) {
    while (modem.available()) resp += (char)modem.read();
    if (resp.indexOf(expect) >= 0) return true;
    if (resp.indexOf("ERROR") >= 0) break;
  }
  Serial.printf("AT fail: %s -> %s\n", cmd, resp.c_str());
  return false;
}

bool bg95Begin() {
  modem.begin(115200, SERIAL_8N1, BG95_RX_PIN, BG95_TX_PIN);
  pinMode(BG95_PWRKEY_PIN, OUTPUT);
  // TODO: verify PWRKEY polarity/timing against the schematic and datasheet.
  digitalWrite(BG95_PWRKEY_PIN, HIGH); delay(600); digitalWrite(BG95_PWRKEY_PIN, LOW);
  delay(5000);
  if (!sendAT("AT", "OK")) return false;
  sendAT("ATE0", "OK");
  char cmd[96];
  snprintf(cmd, sizeof(cmd), "AT+QICSGP=1,1,\"%s\",\"\",\"\",1", SECRET_APN);
  sendAT(cmd, "OK");
  return sendAT("AT+CEREG?", "+CEREG", 3000);  // TODO: wait until registered (stat 1 or 5)
}

bool bg95MqttPublish(const char *topic, const char *payload) {
  char cmd[128];
  snprintf(cmd, sizeof(cmd), "AT+QMTOPEN=0,\"%s\",%d", SECRET_MQTT_HOST, SECRET_MQTT_PORT);
  if (!sendAT(cmd, "+QMTOPEN: 0,0", 15000)) return false;
  snprintf(cmd, sizeof(cmd), "AT+QMTCONN=0,\"%s\"", SECRET_MQTT_CLIENT);
  if (!sendAT(cmd, "+QMTCONN: 0,0", 10000)) return false;
  snprintf(cmd, sizeof(cmd), "AT+QMTPUB=0,0,0,0,\"%s\"", topic);
  if (!sendAT(cmd, ">", 3000)) return false;
  modem.print(payload);
  modem.write(0x1A);  // Ctrl+Z ends the payload
  bool ok = sendAT("", "+QMTPUB: 0,0,0", 10000);
  sendAT("AT+QMTDISC=0", "OK", 5000);
  return ok;
}
