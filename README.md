# homebridge-thermostat

#### Homebridge plugin to control a web-based thermostat

# Installation

1. Install [homebridge](https://github.com/nfarina/homebridge#installation-details)
2. Install this plugin: `npm install -g homebridge-thermostat`
3. Update your `config.json` file (See below).

## Configuration example

```json
"accessories": [
     {
       "accessory": "Thermostat",
       "name": "Thermostat",
       "apiroute": "http://myurl.com"
     }
]
```

## Structure

| Key | Description |
| --- | --- |
| `accessory` | Must be `Thermostat` |
| `name` | Thermostat name to appear in the Home app |
| `apiroute` | Root URL of your Thermostat device (excluding the rest of the requests) |
| `temperatureDisplayUnits` _(optional)_ | Whether you want °C (`0`) or °F (`1`) as your units (`0` default) |
| `humidity` _(optional)_ | (`true` or `false`) whether you want to include `currentRelativeHumidity` as a field in `/status` |
| `maxTemp` _(optional)_ | Upper bound for the temperature selector in the Home app (`30` default) |
| `minTemp` _(optional)_ | Lower bound for the temperature selector in the Home app (`15` default) |
| `model` _(optional)_ | Appears under "Model" for your accessory in the Home app |
| `serial` _(optional)_ | Appears under "Serial" for your accessory in the Home app |
| `manufacturer` _(optional)_ | Appears under "Manufacturer" for your accessory in the Home app |
| `timeout` _(optional)_ | Time (in milliseconds) until the accessory will be marked as "Not Responding" if it is unreachable. (5000ms default) |
| `http_method` _(optional)_ | The HTTP method used to communicate with the thermostat (`GET` is default) |
| `username` _(optional)_ | Username if HTTP authentication is enabled on the thermostat |
| `password` _(optional)_ | Password if HTTP authentication is enabled on the thermostat |

## API Interfacing

Your API should be able to:

1. Return thermostat info when it recieves `/status` in the following format:
```
{
    "targetHeatingCoolingState": INT_VALUE_0_TO_3,
    "targetTemperature": FLOAT_VALUE,
    "currentHeatingCoolingState": INT_VALUE_0_TO_2,
    "currentTemperature": FLOAT_VALUE
}
```

2. Set the target state when it recieves:
```
/targetHeatingCoolingState/{INT_VALUE_0_TO_3}
```

3. Set the target temperature when it recieves:
```
/targetTemperature/{INT_VALUE}
```

### HeatingCoolingState Key

| Number | Name |
| --- | --- |
| `0` | Off |
| `1` | Heat |
| `2` | Cool |
| `3` | Auto |

# Heatmiser Support

Folder 'heatmiser' contains a contributed example of the API. It supports Heatmiser wireless thermostats, as long as https://github.com/thoukydides/heatmiser-wifi is installed and working.

