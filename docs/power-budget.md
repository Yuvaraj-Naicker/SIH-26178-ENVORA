# Power Budget (template)

All values below are TODO. Fill them with **measured** numbers, not guesses.

## Leaf node
| State | Current (mA) | Duty (%) | Notes |
|---|---|---|---|
| Deep sleep | TODO | TODO | |
| Sensor read | TODO | TODO | |
| LoRa TX | TODO | TODO | |
| LoRa RX (relay window) | TODO | TODO | |

Average current = sum(current x duty). Battery life (h) = capacity (mAh) x derating / average current (mA).

## Root node
| State | Current (mA) | Duty (%) | Notes |
|---|---|---|---|
| LoRa RX (continuous) | TODO | TODO | |
| BG95 idle / PSM | TODO | TODO | |
| BG95 uplink burst | TODO | TODO | |
| Buzzer | TODO | TODO | |

Solar sizing: TODO.
