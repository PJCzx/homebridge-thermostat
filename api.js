
var express = require('express');
var app = express();
var WirelessThermostat = require('./WirelessThermostat.js');

var wirelessThermostat = new WirelessThermostat().init();

//ROUTING
app.get('/', function (req, res) {
  res.sendStatus(200);
})
.get('/:id/:command/:value', function (req, res) {
  console.log("in");
  //res.sendStatus(200);
  
  var id = parseInt(req.params.id);
  var command = parseInt(req.params.command);
  var value = parseInt(req.params.value)
  wirelessThermostat.send(id, command, value, function() {
    res.sendStatus(200);
  });
  
});

var server = app.listen(1234, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Global : app listening at', host, port);
});

