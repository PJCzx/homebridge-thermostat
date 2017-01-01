var WirelessThermostat = require('./WirelessThermostat.js');
var wirelessThermostat = new WirelessThermostat().init();

var COMMAND_SET_TARGET_HEATING_COOLING_STATE   = 0;
var COMMAND_SET_TARGET_TEMPERATURE             = 1;
var COMMAND_SET_TARGET_RELATIVE_HUMIDITY       = 2;

var COMMAND_GET_CURRENT_HEATING_COOLING_STATE  = 3;
var COMMAND_GET_CURRENT_TEMPERATURE            = 4;
var COMMAND_GET_CURRENT_RELATIVE_HUMIDITY      = 5;

var HEATING_COOLING_STATE_OFF                  = 0;
var HEATING_COOLING_STATE_HEATING              = 1;
var HEATING_COOLING_STATE_COOLING              = 2;
var HEATING_COOLING_STATE_AUTO                 = 3;




//send(1,0,0);
//send(1,0,1);
//send(1,0,2);
//send(1,0,3);
//send(1,1,20);
//send(1,2,11);
//send(1,3);
//send(1,4);
//send(1,5);


send(process.argv[2] || 1, process.argv[3] || 1, process.argv[4] || 21, function(){process.exit()}); 

function send(id, command, value, callback) {
	wirelessThermostat.send(id, command, value, function(value){
		//console.log(id, command, value, "received:", value);
		if (callback) callback();
	});
	
}


/*
send(1, 0, 0, function(){ //1, 0, 0 shoul be instead
	send(1, 0, 1, function(){
		send(1, 0, 2, function(){
			send(1, 0, 3, function(){
				send(1, 1, 22, function(){
					send(1, 2, 33, function(){
						send(1, 3, undefined, function(){
							send(1, 4, undefined, function(){
								send(1, 5, undefined, function(){
									console.log("Yeah");
								})
							})
						})
					})
				})
			})
		})
	})
});

*/