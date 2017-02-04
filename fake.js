
var express = require('express');
var app = express();

var data = {
    targetHeatingCoolingState: 3,
    targetTemperature: 20,
    currentHeatingCoolingState: 1,
    currentTemperature: 19,
    currentRelativeHumidity: 30
};

//ROUTING
app
.get('/', function (req, res, next) {
  res.sendStatus(200);
})
.get('/status', function (req, res, next) {
  res.send(data);
})
.get('/targetTemperature/:temperature?', function (req, res, next) {

  var temperature = req.params.temperature !== undefined ? parseInt(req.params.temperature) : undefined;

  if (temperature) {
      data.currentTemperature = data.targetTemperature;
      data.targetTemperature = temperature;
  }

  res.sendStatus(200);
});

var server = app.listen(4321, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Global : app listening at', host, port);
});
