var Service, Characteristic;
var request = require("request");

module.exports = function(homebridge){
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-thermostat", "Thermostat", Thermostat);
};

function Thermostat(log, config) {
	this.log = log;

  this.name = config.name;
  this.manufacturer = config.manufacturer || 'HTTP Manufacturer';
  this.model = config.model || 'homebridge-thermostat';
  this.serial = config.serial || 'HTTP Serial Number';

  this.apiroute = config.apiroute
  this.username = config.username || null;
	this.password = config.password || null;
  this.timeout = config.timeout || 5000;
  this.http_method = config.http_method || 'GET';

  this.currentHumidity = config.currentHumidity || false;
  this.targetHumidity = config.targetHumidity || false;
  this.temperatureDisplayUnits = config.temperatureDisplayUnits || 0;
	this.maxTemp = config.maxTemp || 30;
	this.minTemp = config.minTemp || 15;
  this.targetRelativeHumidity = 90;
  this.currentRelativeHumidity = 90;
  this.targetTemperature = 25;
	this.currentTemperature = 20;
  this.targetHeatingCoolingState = 3;
	this.heatingCoolingState = 1;

  if(this.username != null && this.password != null){
    this.auth = {
      user : this.username,
      pass : this.password
    };
  }

  this.log(this.name, this.apiroute);

	this.service = new Service.Thermostat(this.name);
}

Thermostat.prototype = {

	identify: function(callback) {
		this.log("Identify requested!");
		callback();
	},

  _httpRequest: function (url, body, method, callback) {
      request({
          url: url,
          body: body,
          method: this.http_method,
          timeout: this.timeout,
          rejectUnauthorized: false,
          auth: this.auth
      },
          function (error, response, body) {
              callback(error, response, body);
          });
  },

	getCurrentHeatingCoolingState: function(callback) {
    this.log("[+] getCurrentHeatingCoolingState from:", this.apiroute+"/status");
    var url = this.apiroute+"/status";
    this._httpRequest(url, '', 'GET', function (error, response, responseBody) {
        if (error) {
          this.log("[!] Error getting currentHeatingCoolingState: %s", error.message);
  				callback(error);
        } else {
          var json = JSON.parse(responseBody);
          this.log("[*] currentHeatingCoolingState: %s", json.currentHeatingCoolingState);
          this.currentHeatingCoolingState = json.currentHeatingCoolingState;
          callback(null, this.currentHeatingCoolingState);
        }
    }.bind(this));
	},

  getTargetHeatingCoolingState: function(callback) {
    this.log("[+] getTargerHeatingCoolingState from:", this.apiroute+"/status");
    var url = this.apiroute+"/status";
    this._httpRequest(url, '', 'GET', function (error, response, responseBody) {
        if (error) {
          this.log("[!] Error getting targetHeatingCoolingState: %s", error.message);
  				callback(error);
        } else {
          var json = JSON.parse(responseBody);
          this.log("[*] targetHeatingCoolingState: %s", json.targetHeatingCoolingState);
          this.targetHeatingCoolingState = json.targetHeatingCoolingState;
          callback(null, this.targetHeatingCoolingState);
        }
    }.bind(this));
  },

  setTargetHeatingCoolingState: function(value, callback) {
    this.log("[+] setTargetHeatingCoolingState from %s to %s", this.targetHeatingCoolingState, value);
    url = this.apiroute + '/targetHeatingCoolingState/' + value;
    this._httpRequest(url, '', 'GET', function (error, response, responseBody) {
        if (error) {
          this.log("[!] Error setting targetHeatingCoolingState: %s", error.message);
					callback(error);
        } else {
          this.log("[*] Sucessfully set targetHeatingCoolingState to %s", value);
          this.service.setCharacteristic(Characteristic.CurrentHeatingCoolingState, value);
          callback();
        }
    }.bind(this));
  },

  getCurrentTemperature: function(callback) {
    this.log("[+] getCurrentTemperature from:", this.apiroute+"/status");
    var url = this.apiroute+"/status";
    this._httpRequest(url, '', 'GET', function (error, response, responseBody) {
        if (error) {
          this.log("[!] Error getting currentTemperature: %s", error.message);
  				callback(error);
        } else {
  				var json = JSON.parse(responseBody);
          this.currentTemperature = parseFloat(json.currentTemperature);
          this.log("[*] currentTemperature: %s", json.currentTemperature);
  				callback(null, this.currentTemperature);
        }
    }.bind(this));
  },

  getTargetTemperature: function(callback) {
    this.log("[+] getTargetTemperature from:", this.apiroute+"/status");
    var url = this.apiroute+"/status";
    this._httpRequest(url, '', 'GET', function (error, response, responseBody) {
        if (error) {
          this.log("[!] Error getting targetTemperature: %s", error.message);
  				callback(error);
        } else {
  				var json = JSON.parse(responseBody);
  				this.targetTemperature = parseFloat(json.targetTemperature);
  				this.log("[*] targetTemperature: %s", this.targetTemperature);
  				callback(null, this.targetTemperature);
        }
    }.bind(this));
  },

  setTargetTemperature: function(value, callback) {
    this.log("[+] setTargetTemperature from %s to %s", this.targetTemperature, value);
    var url = this.apiroute+"/targetTemperature/"+value;
    this._httpRequest(url, '', 'GET', function (error, response, responseBody) {
        if (error) {
          this.log("[!] Error setting targetTemperature", error.message);
  				callback(error);
        } else {
          this.log("[*] Sucessfully set targetTemperature to %s", value);
  				callback();
        }
    }.bind(this));
  },

  getCurrentRelativeHumidity: function(callback) {
    this.log("[+] getCurrentRelativeHumidity from:", this.apiroute+"/status");
    var url = this.apiroute+"/status";
    this._httpRequest(url, '', 'GET', function (error, response, responseBody) {
        if (error) {
          this.log("[!] Error getting currentRelativeHumidity: %s", error.message);
  				callback(error);
        } else {
  				var json = JSON.parse(responseBody);
  				this.currentRelativeHumidity = parseFloat(json.currentRelativeHumidity);
  				this.log("[*] currentRelativeHumidity: %s", this.currentRelativeHumidity);
  				callback(null, this.currentRelativeHumidity);
        }
    }.bind(this));
  },

  getTargetRelativeHumidity: function(callback) {
    this.log("[+] getTargetRelativeHumidity from:", this.apiroute+"/status");
    var url = this.apiroute+"/status";
    this._httpRequest(url, '', 'GET', function (error, response, responseBody) {
        if (error) {
          this.log("[!] Error getting targetRelativeHumidity: %s", error.message);
  				callback(error);
        } else {
  				var json = JSON.parse(responseBody);
  				this.targetRelativeHumidity = parseFloat(json.targetRelativeHumidity);
  				this.log("[*] targetRelativeHumidity: %s", this.targetRelativeHumidity);
  				callback(null, this.targetRelativeHumidity);
        }
    }.bind(this));
  },

  setTargetRelativeHumidity: function(value, callback) {
    this.log("[+] setTargetRelativeHumidity from %s to %s", this.targetRelativeHumidity, value);
    var url = this.apiroute+"/targetRelativeHumidity/"+value;
    this._httpRequest(url, '', 'GET', function (error, response, responseBody) {
        if (error) {
          this.log("[!] Error setting targetRelativeHumidity", error.message);
  				callback(error);
        } else {
          this.log("[*] Sucessfully set targetRelativeHumidity to %s", value);
  				callback();
        }
    }.bind(this));
  },

	getTemperatureDisplayUnits: function(callback) {
		//this.log("getTemperatureDisplayUnits:", this.temperatureDisplayUnits);
		callback(null, this.temperatureDisplayUnits);
	},

  setTemperatureDisplayUnits: function(value, callback) {
		this.log("[*] setTemperatureDisplayUnits from %s to %s", this.temperatureDisplayUnits, value);
		this.temperatureDisplayUnits = value;
		callback();
	},

	getName: function(callback) {
		this.log("getName :", this.name);
		callback(null, this.name);
	},

	getServices: function() {

		this.informationService = new Service.AccessoryInformation();
    this.informationService
		  .setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
		  .setCharacteristic(Characteristic.Model, this.model)
		  .setCharacteristic(Characteristic.SerialNumber, this.serial);

		this.service
			.getCharacteristic(Characteristic.CurrentHeatingCoolingState)
			.on('get', this.getCurrentHeatingCoolingState.bind(this));

		this.service
			.getCharacteristic(Characteristic.TargetHeatingCoolingState)
			.on('get', this.getTargetHeatingCoolingState.bind(this))
			.on('set', this.setTargetHeatingCoolingState.bind(this));

		this.service
			.getCharacteristic(Characteristic.CurrentTemperature)
			.on('get', this.getCurrentTemperature.bind(this));

		this.service
			.getCharacteristic(Characteristic.TargetTemperature)
			.on('get', this.getTargetTemperature.bind(this))
			.on('set', this.setTargetTemperature.bind(this));

		this.service
			.getCharacteristic(Characteristic.TemperatureDisplayUnits)
			.on('get', this.getTemperatureDisplayUnits.bind(this))
      .on('set', this.setTemperatureDisplayUnits.bind(this));

		this.service
			.getCharacteristic(Characteristic.Name)
			.on('get', this.getName.bind(this));

    if (this.currentHumidity) {
      this.service
			  .getCharacteristic(Characteristic.CurrentRelativeHumidity)
			  .on('get', this.getCurrentRelativeHumidity.bind(this));
    }

    if (this.targetHumidity) {
      this.service
        .getCharacteristic(Characteristic.TargetRelativeHumidity)
        .on('get', this.getTargetRelativeHumidity.bind(this))
        .on('set', this.setTargetRelativeHumidity.bind(this));
    }

		this.service.getCharacteristic(Characteristic.CurrentTemperature)
			.setProps({
				minValue: this.minTemp,
				maxValue: this.maxTemp,
				minStep: 1
			});

		this.service.getCharacteristic(Characteristic.TargetTemperature)
			.setProps({
				minValue: this.minTemp,
				maxValue: this.maxTemp,
				minStep: 1
			});
		return [this.informationService, this.service];
	}
};
