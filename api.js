
var express = require('express');

var app = express();
var WirelessThermostat = require('./WirelessThermostat.js');
var wirelessThermostat = new WirelessThermostat().init();

//ROUTING
app.get('/', function (req, res) {
  res.sendStatus(200);
})
.get('/:id/:command/:value', function (req, res, next) {
  
  var id = parseInt(req.params.id);
  var command = parseInt(req.params.command);
  var value = parseInt(req.params.value);
  
  wirelessThermostat.send(id, command, value, function(value) {
    if (value !== undefined) {
      if(value.error !== undefined) {
        console.log("The error is", value.error);
        res.sendStatus(200);
      } else {
        console.log("The value is", value);
        res.send({value: value});
      }
    } else {
      res.sendStatus(200);
    }
  });

});

var server = app.listen(1234, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Global : app listening at', host, port);

  man();
});



function man() {
 console.log(
  "-------------\n",
  "COMMAND_SET_TARGET_HEATING_COOLING_STATE\t0\n",
  "COMMAND_SET_TARGET_TEMPERATURE\t\t\t1\n",
  "COMMAND_SET_TARGET_RELATIVE_HUMIDITY\t\t2\n",
  "COMMAND_GET_CURRENT_HEATING_COOLING_STATE\t3\n",
  "COMMAND_GET_CURRENT_TEMPERATURE\t\t4\n",
  "COMMAND_GET_CURRENT_RELATIVE_HUMIDITY\t\t5\n",
  "COMMAND_OK_WITH_VALUE\t\t\t\t31\n",
  "-------------\n",
  "HEATING_COOLING_STATE_OFF\t\t0\n",
  "HEATING_COOLING_STATE_HEATING\t\t1\n",
  "HEATING_COOLING_STATE_COOLING\t\t2\n",
  "HEATING_COOLING_STATE_AUTO\t\t3\n",
  "-------------\n",
  "Set temprature\t/1/1/19\n",
  "Set auto      \t/1/0/3\n",
  "Set eco       \t/1/0/2\n",
  "-------------\n"
);
}