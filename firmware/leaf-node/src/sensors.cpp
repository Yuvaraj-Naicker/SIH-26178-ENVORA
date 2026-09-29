#include "sensors.h"

// PLACEHOLDER: returns fixed dummy values until real sensor drivers are added.
void readSensors(SensorPayload &out) {
  out.temp_c_x100 = 2500;      // TODO real temperature
  out.humidity_x100 = 5000;    // TODO real humidity
  out.pm25_x10 = 100;          // TODO real PM2.5
  out.water_level_mm = 0;      // TODO real water level
  out.flags = 0;               // TODO flame / gas
}
