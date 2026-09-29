# Root Node (Gateway) Hardware

Final PCB: **ROOT_NODE_FINAL**. Files:
- `schematic/`: schematic PDF and source
- `pcb/`: Gerbers (zip) and drill files
- `3d/final.glb`: 3D model shown on the project website
- `bom.csv`: bill of materials

The board is organised into five schematic sections.

## 1. Microcontroller Unit
- **ESP32-WROOM** module running the receive loop, alert logic / edge AI and modem control.
- Boot/reset circuitry and a programming header. TODO: list exact parts from schematic.

## 2. LoRa Wireless
- **SX1276** LoRa module connected over SPI, receiving packets from all leaf nodes in the area.
- Antenna connection. TODO: note matching network / connector type.

## 3. Cellular NB-IoT
- **Quectel BG95-M3** NB-IoT modem with a SIM slot, used for the cloud uplink.
- Controlled from the ESP32 over UART with AT commands.
- Bulk capacitance on the modem VBAT pins is needed for transmit current spikes (see known issues).

## 4. Power Management
- **18650 cell** in holder BT1 (replaced the CR1220 coin cell).
- **USB-C** and **solar** charging input through a **CN3065** charger.
- **FS8205A** dual MOSFET for battery protection.
- TODO: list regulators and their output rails from the schematic.

## 5. Local Alerting
- **Buzzer** for an on-site audible alert when a hazard is detected, independent of the uplink.

## Design decisions
| Decision | Reason |
|---|---|
| CR1220 replaced by 18650 | Relaying and receiving over LoRa drains a coin cell quickly |
| One NB-IoT modem on the root only | Avoids SIM/modem power drain on every node |
| USB-C + solar input | Off-grid operation and easy bench charging |

## Known issues / next revision
- Bulk capacitor **C9** is not yet connected to decouple the BG95 (U3) VBAT pins (U3.32 / 33 / 52 / 53). Needs a manual fix.
