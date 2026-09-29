#pragma once
// TODO: set every pin from your leaf node schematic. These are placeholders.
#define LORA_CS    5
#define LORA_DIO0  26
#define LORA_DIO1  33
#define LORA_RST   14

#define LORA_FREQ_MHZ 865.0   // India ISM band; confirm regulations for your use
#define LORA_BW_KHZ   125.0
#define LORA_SF       9
#define LORA_CR       5
#define LORA_SYNC     0x12
#define LORA_TX_DBM   14

#define NODE_ID         1     // unique per leaf node
#define PACKET_TTL      4     // max hops
#define SLEEP_SECONDS   60    // time between measurements
#define RELAY_WINDOW_MS 3000  // how long to listen for neighbour packets
