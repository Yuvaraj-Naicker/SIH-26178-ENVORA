# Edge AI
- `training/train_classifier.py`: small decision-tree classifier (normal / fire / flood / pollution). **Uses synthetic data**: replace with real logs.
- `models/`: exported models
- `tlm/`: optional tiny char-level RNN that turns alert packets into readable alert text (planned)

Deployment to the ESP32 root node is a TODO. Until then the root node uses rule-based thresholds in `firmware/root-node/src/main.cpp`.
