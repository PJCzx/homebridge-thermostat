var rpi433    = require('rpi-433');

module.exports = function WirelessAcova (TX_GPIO, RX_GPIO, DHT_GPIO) {
  return {
    rfEmitter: rpi433.emitter({
          pin: 4 || TX_GPIO
    }),
    rfSniffer: rpi433.sniffer({
        pin: 2 || RX_GPIO,  
        debounceDelay: 500
    }),
    decToBinaryHelper: function (dec, bits) {
      var binary = (dec).toString(2);
      if (bits !== undefined && binary.length > bits) throw new Error("Value exeeded allowed bits.");
      else while (binary.length < bits) binary = "0"+ binary;
      return binary
    },
    encode: function (id, command, value) {
      return
        this.decToBinaryHelper(id || 1, 8) +
        this.decToBinaryHelper(0, 5) +
        this.decToBinaryHelper(command || 1, 4) +
        this.decToBinaryHelper(value || 1, 7); 
    },
    send: function(id, command, value, callback) {
      var binaryValue = this.encode(id, command, value);
      var decimalValue = parseInt(binaryValue, 2);
      var timeout;

      this.rfSniffer.on('data', function (data) {
        if(data.code == decimalValue) { return; }
        
        var rb = this.decToBinaryHelper(data.code, 24);
        var rid = rb.substring(0, 8);
        //console.log("Ack", data.code, rb, id)
        
        if(rid == id) {
          console.log("Acknowledge received");
          clearTimeout(timeout);
          callback();
        } else {
          console.log("Received another signal, possible id: " + id + '. Code received: '+data.code+' pulse length : '+data.pulseLength);
        }

      });

      var repeat = function() {
        this.rfEmitter.sendCode(decimalValue, function(error, stdout) {
            if(!error) console.log("Sent: " + stdout);
        });
        timeout = setTimeout(repeat, 2000);
      }
      repeat();
    }
  }
}


var wirelessAcova = require('WirelessAcova');
wirelessAcova.send(1, 1);

