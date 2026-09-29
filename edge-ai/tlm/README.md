# Optional: tiny alert-text model (planned)
Idea: run a ~1M-parameter int8-quantized char-level RNN on the root node to turn a structured alert packet
(node, hazard type, readings) into a short human-readable message.

Status: not implemented. Until then the root node builds messages from fixed templates.
Open questions: RAM/flash budget next to the LoRa + modem stacks, latency, and whether templates are sufficient.
