# Firmware
- `common/packet.h`: packet encode/decode, CRC16, dedup cache (shared by both nodes)
- `leaf-node/`: sample, transmit, relay window, deep sleep
- `root-node/`: LoRa receive, alert logic, buzzer, BG95 MQTT uplink

Both are PlatformIO projects. All pins in `include/config.h` are **placeholders**: set them from your schematics.
Sensor drivers on the leaf are stubs (`leaf-node/src/sensors.cpp`).
The BG95 AT sequence is untested on the real board and must be validated.
