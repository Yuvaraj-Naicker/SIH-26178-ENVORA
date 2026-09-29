#pragma once
#include <Arduino.h>
bool bg95Begin();
bool bg95MqttPublish(const char *topic, const char *payload);
