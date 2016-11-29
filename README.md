# homebridge-thermostat

Supports thermostat devices on HomeBridge Platform

# Installation

1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g homebridge-thermostat
3. Update your configuration file. See bellow for a sample. 

# Configuration

Configuration sample:

 ```
    {
        "bridge": {
            ...
        },
        
        "description": "...",

        "accessories": [
            {
                "accessory": "Thermostat",
                "name": "Thermostat Demo",
                "apiroute": "http://myurl.com",
                "maxTemp": 30,
                "minTemp": 12
            }
        ],

        "platforms":[]
    }
```
# API Expectations

The `apiroute` is used for two main calls: Get from the thermostat and set the target temperature. Your API should provide

1. GET `/status` 
```
{
    "targetTemperature":18,
    "temperature":"21.40",
    "humidity":"69.20",
    "currentHeatingCoolingState": 1, # Pinned to HEAT
    "targetState": "HEAT",
    "targetStateCode": 1 # Pinned to AUTO
}
```

2. GET `/targetTemperature/{FLOAT_VALUE}`
