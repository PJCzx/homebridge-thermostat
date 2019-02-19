var exec = require('child_process').exec;
var express = require('express');
var app = express();

var data = {
    targetHeatingCoolingState: 1,
    targetTemperature: 20,
    targetRelativeHumidity: 30,
    currentHeatingCoolingState: 1,
    currentTemperature: 19,
    currentRelativeHumidity: 30
};

plCmd = '~/heatmiser-wifi/bin/heatmiser_json.pl';

//ROUTING
app
.get('/status', function (req, res, next) {
  child = exec(plCmd,
   function (error, stdout, stderr) {
      if (error !== null) {
          console.log('exec error: ' + error);
      }
      hmOutput = JSON.parse(stdout);
      data.currentTemperature = hmOutput.heater.temperature.internal;
      data.targetTemperature = hmOutput.heater.heating.target;
      data.currentHeatingCoolingState = hmOutput.heater.heating.on;
      if (hmOutput.heater.runmode == "heating") {
        data.targetHeatingCoolingState = 1;
      } else {
        data.targetHeatingCoolingState = 0;
      }
      res.send(data);
      console.log(data);
   });
})

.get('/targetTemperature/:temperature', function (req, res, next) { //Set Temperature
  var heatOn = {"heating":{"target":19}};
  data.targetTemperature = parseFloat(req.params.temperature);
  heatOn.heating.target = data.targetTemperature;
  sendMessage(heatOn);
  res.sendStatus(200);
  console.log('set temp to ', req.params.temperature);
})

.get('/targetHeatingCoolingState/:state', function (req, res, next) { //Set target state

  var runMode = { "runmode":"heating" };
  if (req.params.state == 0) {
    runMode.runmode = "frost";
  }
  sendMessage(runMode);
  res.sendStatus(200);

})

// NOT IMPLEMENTED
.get('/targetRelativeHumidity/:humidity', function (req, res, next) { //Set target state
  data.currentRelativeHumidity = data.targetRelativeHumidity;
  data.targetRelativeHumidity = parseFloat(req.params.humidity);
  res.sendStatus(200);
});

function sendMessage(message) {
  command = plCmd + " '" + JSON.stringify(message) + "'";
  child = exec(command,
   function (error, stdout, stderr) {
      if (error !== null) {
          console.log('exec error: ' + error);
      }
      console.log('Message Sent');
      console.log(message);
   });
}

var server = app.listen(4321, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Heatmiser API listening at', host, port);
});
