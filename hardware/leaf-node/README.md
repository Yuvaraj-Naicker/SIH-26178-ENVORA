# Leaf Node Hardware

Files: `schematic/`, `pcb/`, `bom.csv`.

## Current design
- SX1276 LoRa module
- Sensor connector (CN1)
- Battery: being upgraded from CR1220 coin cell, since relaying data means frequent LoRa RX

## Known issues / next revision
- **MCU not clearly identified**: no MCU is driving the LoRa module and sensors in the reviewed schematic. Select and add one.
- **Redundant antenna paths**: both an on-board antenna footprint and an SMA edge connector are present. Keep one.
- **Battery**: coin cell is insufficient for a relaying node. Move to a larger cell and size it using `docs/power-budget.md`.
