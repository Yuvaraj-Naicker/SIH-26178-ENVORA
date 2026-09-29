#pragma once
#if __has_include("secrets.h")
#include "secrets.h"
#else
#include "secrets.example.h"
#endif

// TODO: set every pin from your ROOT_NODE_FINAL schematic. These are placeholders.
#define LORA_CS    5
#define LORA_DIO0  26
#define LORA_DIO1  33
#define LORA_RST   14

#define BG95_RX_PIN 16   // ESP32 RX  <- BG95 TXD
#define BG95_TX_PIN 17   // ESP32 TX  -> BG95 RXD
#define BG95_PWRKEY_PIN 4
#define BUZZER_PIN 25

#define LORA_FREQ_MHZ 865.0
#define LORA_BW_KHZ   125.0
#define LORA_SF       9
#define LORA_CR       5
#define LORA_SYNC     0x12
#define LORA_TX_DBM   14

// Placeholder alert thresholds. TODO: calibrate from real data / replace with the ML model.
#define ALERT_TEMP_C_X100   6000   // 60.00 C
#define ALERT_PM25_X10      2500   // 250.0 ug/m3
#define ALERT_WATER_MM      300

#define MQTT_TOPIC "envora/readings"
#define MQTT_ALERT_TOPIC "envora/alerts"
