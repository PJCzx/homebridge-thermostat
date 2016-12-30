var rpi433    = require('rpi-433');

//RX
var rfSniffer = rpi433.sniffer({
      pin: 2,                     //Snif on GPIO 2 (or Physical PIN 13)
      debounceDelay: 500          //Wait 500ms before reading another code
    });

// Receive (data is like {code: xxx, pulseLength: xxx})
rfSniffer.on('data', function (data) {
  if(data.code == decimalValue) {
  	//console.log("Nope");
  	return;
  }
  var rb = decToBinary(data.code, 24);
  var id = rb.substring(0, 8);
  //console.log("Ack", data.code, rb, id)
  if(id == myObj.id) {
  	console.log("Acknowledge received");
  	process.exit();
  }
  else console.log("Possible id: " + id + 'Code received: '+data.code+' pulse length : '+data.pulseLength);

});

//TX
var rfEmitter = rpi433.emitter({
      pin: 4           //Send the code with a 350 pulse length
    });

// Send
//process.argv.forEach(function (val, index, array) {
//  console.log(index + ': ' + val);
//});

var aCommand = parseInt(process.argv[2] || 1);
var aValue = parseInt(process.argv[3] || 0);


var myObj = {
	id: 		decToBinary(1, 8), 		// 0 - 255 	(8 bits)
	free: 		decToBinary(0, 5),		// free		(5 bits)
	command: 	decToBinary(aCommand, 4),// 0 - 15 	(4 bits)
	value: 		decToBinary(aValue, 7)	// 0 - 127 	(7 bits)
};

var binaryValue = myObj.id + myObj.free + myObj.command + myObj.value;

var decimalValue = parseInt(binaryValue, 2);

console.log(binaryValue, decimalValue);

rfEmitter.sendCode(decimalValue, function(error, stdout) {
  	if(!error) console.log("Sent: " + stdout);
});

function decToBinary (dec, bits) {
	var binary = (dec).toString(2);
	if (bits !== undefined && binary.length > bits) throw new Error("Value exeeded allowed bits.");
	else while (binary.length < bits) binary = "0"+ binary;
	return binary
}
