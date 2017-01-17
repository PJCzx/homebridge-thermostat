var rpi433    = require('rpi-433');

module.exports = function WirelessAcova (TX_GPIO, RX_GPIO) {
  return {
    COMMAND_OK_WITH_VALUE: 31,
    BITS_ID: 8,
    BITS_AVAILABLE: 2,
    BITS_COMMAND: 5,
    BITS_VALUE: 9,
    init: function() {
      this.rfEmitter = rpi433.emitter({
            pin: TX_GPIO || 4
      });

      this.rfSniffer = rpi433.sniffer({
          pin: RX_GPIO || 2,  
          debounceDelay: 500
      })
      return this;
    },
    decToBinaryHelper: function (dec, bits) {
      var binary = (dec >>> 0).toString(2);
      if (bits !== undefined && binary.length > bits) throw new Error("Value exeeded allowed bits.");
      else while (binary.length < bits) binary = "0" + binary;
      return binary
    },
    binaryToDecHelper: function (binaryValue) {
      return parseInt(binaryValue, 2);
    },
    encode: function (id, availabe, command, value) {
      return this.decToBinaryHelper(id, this.BITS_ID) + this.decToBinaryHelper(availabe, this.BITS_AVAILABLE) + this.decToBinaryHelper(command, this.BITS_COMMAND) + this.decToBinaryHelper(value, this.BITS_VALUE); 
    },
    decode: function(binaryValue) {
        var rb = this.decToBinaryHelper(binaryValue, this.BITS_ID + this.BITS_AVAILABLE + this.BITS_COMMAND + this.BITS_VALUE);
        var position = 0;

        var rbid = rb.substring(position, position + this.BITS_ID); position += this.BITS_ID;
        var rbavailable = rb.substring(position, position + this.BITS_AVAILABLE); position += this.BITS_AVAILABLE;
        var rbcommand = rb.substring(position, position + this.BITS_COMMAND); position += this.BITS_COMMAND;
        var rbvalue = rb.substring(position, position + this.BITS_VALUE); position += this.BITS_VALUE;

        console.log("Received (binary)", rbid, rbavailable, rbcommand, rbvalue);

        var decoded = {
          id: this.binaryToDecHelper(rbid),
          available: this.binaryToDecHelper(rbavailable),
          command: this.binaryToDecHelper(rbcommand),
          value: this.binaryToDecHelper(rbvalue)
        };
        
        console.log("Received (dec)", decoded.id, decoded.available, decoded.command, decoded.value);

        return decoded;
    },
    send: function (id, command, value, callback) {
      
      var binaryValue = this.encode(id, 0, command, value || 0);
      var decimalValue = this.binaryToDecHelper(binaryValue);

      console.log("Sending", id, command, value, "As this binay", binaryValue, "(" + decimalValue + ") DEC");

      var timeout;

      this.rfSniffer.on('data', function (data) {
        if(data.code == decimalValue) { return; }
        
        var response = this.decode(data.code)
        
        if(response.id == id) {
          clearTimeout(timeout);
          if(callback) callback(response.command == this.COMMAND_OK_WITH_VALUE ? response.value : undefined);
          this.rfSniffer.removeListener('data');
        } else {
          console.log("Received another signal:", data.code, "pulse length :", data.pulseLength);
        }

      }.bind(this));

      var repeat = function() {
        this.rfEmitter.sendCode(decimalValue, function(error, stdout) {
            if(error) console.log("An error occured");
            console.log("Sent: " + stdout);
        });
        timeout = setTimeout(repeat, 2000);
      }.bind(this);
      repeat();
    },
    clean: function(){
      this.rfSniffer.removeListener('data', function(){console.log("eventLstener removed");});
    }
  }
};
