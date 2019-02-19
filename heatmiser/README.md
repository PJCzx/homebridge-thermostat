This Node.JS code starts up a very simple microserver (using express) to provide an API for the homebridge-thermostat module.

It translates the API calls to command-line calls to heatmiser_json.pl from

https://github.com/thoukydides/heatmiser-wifi

The code is based on the 'fake.js' example from PJCzx. If it works for you, that's at least two of us!

I am using iOS 11.2.1 and homebridge.

Basic steps to get going:

1. Install homebridge and homebridge-thermostat
2. Confgure and test the above
3. Install and configure https://github.com/thoukydides/heatmiser-wifi
4. Make sure running 'heatmiser_json.pl' without arguments gives you valid results (hint - set up ~/.heatmiser to avoid needing to specify -h and -p)
5. Edit this heatmiser.pl to check the path of the heatmiser_json.pl
6. Start this microserver with 'node heatmiser.js'

The code does very little error checking, so beware. If the heatmiser perl script cannot contact the thermostat, the server will abort, so I recommend running this as a systemd service under Linux.

Setting / reading Relative Humidity is not implemented and returns dummy values as per fake.js.

Only 'Heat' and 'Off' modes are possible. If HomeKit sets to Cool or Auto, Heat will be selected. 'Off' sets frost mode.
