#include <RCSwitch.h>
#include <DHTlib.h>

RCSwitch mySwitch = RCSwitch();
dht DHT;

const int POS_ALT_PIN = 11;
const int NEG_ALT_PIN = 12;
const int LED_PIN = 13;
const int DHT22_PIN = 6;
const int RESPONSE_DELAY = 500;

const int BITS_ID = 8;
const int BITS_AVAILABLE = 2;
const int BITS_COMMAND = 5;
const int BITS_VALUE = 9;
//BITS SUM MUST BE 24 FON NOW UNETILL RF PROTOCOL SENDS 24 BITS SIGNALS

const int   ID                = 1;
const float TEMPERATURE_DELTA = 0.25;

const int COMMAND_SET_TARGET_HEATING_COOLING_STATE   = 0;
const int COMMAND_SET_TARGET_TEMPERATURE             = 1;
const int COMMAND_SET_TARGET_RELATIVE_HUMIDITY       = 2;
const int COMMAND_GET_CURRENT_HEATING_COOLING_STATE  = 3;
const int COMMAND_GET_CURRENT_TEMPERATURE            = 4;
const int COMMAND_GET_CURRENT_RELATIVE_HUMIDITY      = 5;
const int COMMAND_OK_WITH_VALUE                      = 31;

const int HEATING_COOLING_STATE_OFF                  = 0;
const int HEATING_COOLING_STATE_HEATING              = 1;
const int HEATING_COOLING_STATE_COOLING              = 2;
const int HEATING_COOLING_STATE_AUTO                 = 3;

unsigned long int loopcount;
int lastCodeReceived;

int currentHeatingCollingState;
int targetHeatingCollingState;
double targetTemperature;
double currentTemperature;
double targetRelativeHumidity;
double currentRelativeHumidity;

unsigned long int blinkCounter;
int blinkAmount;
void updateDHTData(boolean debug = false);
void sendResponse(int id = ID, int disp = 0, int command = 0 , int value = 0);

void off(boolean useByThermostat = false);
void comfort(boolean useByThermostat = false);
void noFrost(boolean useByThermostat = false);
void automatic();


void setup() {
  loopcount = 0;
  currentHeatingCollingState = 0;
  
  targetHeatingCollingState = HEATING_COOLING_STATE_AUTO;
  targetTemperature = 20;
  targetRelativeHumidity = 30;
  updateDHTData();
  
  Serial.begin(9600);
  mySwitch.enableReceive(0);  // Receiver on interrupt 0 => that is pin #D2
  mySwitch.enableTransmit(5); //PIN D5

  // Optional set pulse length.
  // mySwitch.setPulseLength(320);
  
  // Optional set protocol (default is 1, will work for most outlets)
  // mySwitch.setProtocol(2);
  
  // Optional set number of transmission repetitions.
   mySwitch.setRepeatTransmit(7);

  pinMode(POS_ALT_PIN, OUTPUT);
  pinMode(NEG_ALT_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  
  Serial.println("Ready");
  //blinkLed(10);
}

void loop() {
  doBlink();
  if (loopcount >= 1000000) {
    updateDHTData();
    displayVariables();
    if (targetHeatingCollingState == HEATING_COOLING_STATE_AUTO) autoChoseHeatingOrCooling();
    loopcount = 0;
  } 
  if (mySwitch.available()) {
      lastCodeReceived = mySwitch.getReceivedValue();
      Serial.print("Received ");
      Serial.print( mySwitch.getReceivedValue() );
      Serial.print(" / ");
      Serial.print( mySwitch.getReceivedBitlength() );
      Serial.print("bit ");
      Serial.print("Protocol: ");
      Serial.println( mySwitch.getReceivedProtocol() );
      const char* b = dec2binWzerofill(mySwitch.getReceivedValue(), mySwitch.getReceivedBitlength());
      
      String s = String(b);

      int bitPosition = 0;
      String id_string = s.substring(bitPosition, bitPosition + BITS_ID); bitPosition += BITS_ID;
      String dispo_string = s.substring(bitPosition, bitPosition + BITS_AVAILABLE); bitPosition += BITS_AVAILABLE;
      String command_string = s.substring(bitPosition, bitPosition + BITS_COMMAND); bitPosition += BITS_COMMAND;
      String value_string = s.substring(bitPosition, bitPosition + BITS_VALUE); bitPosition += BITS_VALUE;

      int id = binaryStringToInt(id_string);
      int dispo = binaryStringToInt(dispo_string);
      int command = binaryStringToInt(command_string);
      int value = binaryStringToInt(value_string);

      Serial.println( id_string + " " + dispo_string + " " + command_string + " " + value_string);
      Serial.print("ID: "); Serial.print(id); 
      Serial.print("\t AVAILABLE:"); Serial.print(dispo);
      Serial.print("\t COMMAND:"); Serial.print(command);
      Serial.print("\t VALUE:"); Serial.println(value);
      
      if (id == ID) {
        Serial.println("ID Recognized");

        if (command == COMMAND_SET_TARGET_HEATING_COOLING_STATE) {
               if (value == HEATING_COOLING_STATE_OFF) off();
          else if (value == HEATING_COOLING_STATE_HEATING) comfort();
          else if (value == HEATING_COOLING_STATE_COOLING) noFrost();
          else if (value == HEATING_COOLING_STATE_AUTO) automatic();
        }
        else if (command == COMMAND_SET_TARGET_TEMPERATURE) setTargetTemperature(value);
        else if (command == COMMAND_SET_TARGET_RELATIVE_HUMIDITY) setTargetRelativeHumidity(value);
        
        else if (command == COMMAND_GET_CURRENT_HEATING_COOLING_STATE) getCurrentHeatingCollingState();
        else if (command == COMMAND_GET_CURRENT_TEMPERATURE) getCurrentTemperature();
        else if (command == COMMAND_GET_CURRENT_RELATIVE_HUMIDITY) getCurrentRelativeHumidity();
        else Serial.println("Unknown Command: " + command);

        
      } else {
        Serial.println("Unknown ID " + id);
      }
      Serial.println("--------------------------------------");
    

    mySwitch.resetAvailable();
  }
  
  loopcount++;
}

void sendResponse(int id, int disp, int command, int value) {
    String as = String(dec2binWzerofill(id, BITS_ID)) + String(dec2binWzerofill(disp, BITS_AVAILABLE)) + String(dec2binWzerofill(command, BITS_COMMAND)) + String(dec2binWzerofill(value, BITS_VALUE));
    char akmessage[BITS_ID + BITS_AVAILABLE + BITS_COMMAND + BITS_VALUE +1];
    as.toCharArray(akmessage, BITS_ID + BITS_AVAILABLE + BITS_COMMAND + BITS_VALUE +1);
    //Wait before answering   
    delay(RESPONSE_DELAY);
    mySwitch.send(akmessage);
    Serial.print("OK after ");
    Serial.print(RESPONSE_DELAY);
    Serial.print("ms (Response: ");
    Serial.print(akmessage);
    Serial.println(")");
}

void comfort(boolean useByThermostat) {
  if (!useByThermostat) targetHeatingCollingState = 1;
  //CLEAR INTERVALS IF NOT USED BY AUTO MODE
  Serial.println("COMFORT - HEATING (1)");
  digitalWrite(POS_ALT_PIN, LOW);
  digitalWrite(NEG_ALT_PIN, LOW);
  currentHeatingCollingState = 1;

  if (!useByThermostat) displayVariables();
  if (!useByThermostat) sendResponse();
}

void off(boolean useByThermostat) {
  if (!useByThermostat) targetHeatingCollingState = 0;
  //CLEAR INTERVALS IF NOT USED BY AUTO MODE
  Serial.println("OFF - OFF (0)");
  digitalWrite(POS_ALT_PIN, HIGH);
  digitalWrite(NEG_ALT_PIN, LOW);
  currentHeatingCollingState = 0;
  
  if (!useByThermostat) displayVariables();
  if (!useByThermostat) sendResponse(ID, 1); //because response == initial order wont be taken in consideration
}

void noFrost(boolean useByThermostat) {
  if (!useByThermostat) targetHeatingCollingState = 2;
  //CLEAR INTERVALS IF ANY
  Serial.println("NO FROST - COOLING (2)");
  digitalWrite(POS_ALT_PIN, LOW);
  digitalWrite(NEG_ALT_PIN, HIGH);
  currentHeatingCollingState = 2;

  if (!useByThermostat) displayVariables();
  if (!useByThermostat) sendResponse();
}

void automatic() {
  targetHeatingCollingState = 3;
  Serial.println("AUTO - AUTO (4)");

  autoChoseHeatingOrCooling();
  
  displayVariables();
  sendResponse();
}

void autoChoseHeatingOrCooling() {
  Serial.print("Current temperature is ");
  Serial.print(currentTemperature);
  Serial.print(" and target is ");
  Serial.print(targetTemperature);
  if(currentTemperature >= targetTemperature + TEMPERATURE_DELTA) {
    Serial.print(". Lets coll down a little bit >");
    noFrost(true);
  } else if(currentTemperature <= targetTemperature - TEMPERATURE_DELTA) {
    Serial.print(". Lets warm up a little bit > ");
    comfort(true);
  } else {
    Serial.println(". Great, keep it like this.");
  }
}

void setTargetTemperature(int value) {
  Serial.print("setTargetTemperature to ");
  Serial.println(value);
  targetTemperature = value;
  displayVariables();
  sendResponse();
}
void setTargetRelativeHumidity(int value) {
  Serial.print("setTargetRelativeHumidity to ");
  Serial.println(value);
  targetRelativeHumidity = value;
  displayVariables();
  sendResponse();
}
        
void getCurrentHeatingCollingState() {
  Serial.print("getCurrentHeatingCollingState: ");
  Serial.println(currentHeatingCollingState);
  displayVariables();
  sendResponse(ID, 0, COMMAND_OK_WITH_VALUE, currentHeatingCollingState);
}
void getCurrentTemperature() {
  Serial.print("getCurrentTemperature: ");
  Serial.println(currentTemperature);
  displayVariables();
  sendResponse(ID, 0, COMMAND_OK_WITH_VALUE, currentTemperature*10);
}
void getCurrentRelativeHumidity() {
  Serial.print("getCurrentRelativeHumidity: ");
  Serial.println(currentRelativeHumidity);
  displayVariables();
  sendResponse(ID, 0, COMMAND_OK_WITH_VALUE, currentRelativeHumidity*10);
}

void displayVariables() {
  Serial.println("--------------------------------------");
  Serial.print("targetHeatingCollingState:\t");
  Serial.println(targetHeatingCollingState);
  Serial.print("currentHeatingCollingState:\t");
  Serial.println(currentHeatingCollingState);
  Serial.print("targetTemperature:\t\t");
  Serial.print(targetTemperature);
  Serial.println("°C");
  Serial.print("currentTemperature:\t\t");
  Serial.print(currentTemperature);
  Serial.println("°C");
  Serial.print("targetRelativeHumidity:\t\t");
  Serial.print(targetRelativeHumidity);  
  Serial.println("%");
  Serial.print("currentRelativeHumidity:\t");
  Serial.print(currentRelativeHumidity);  
  Serial.println("%");
  Serial.println("--------------------------------------");
  
  blinkLed(targetHeatingCollingState);
}


static char * dec2binWzerofill(unsigned long Dec, unsigned int bitLength) {
  static char bin[64]; 
  unsigned int i=0;

  while (Dec > 0) {
    bin[32+i++] = ((Dec & 1) > 0) ? '1' : '0';
    Dec = Dec >> 1;
  }

  for (unsigned int j = 0; j< bitLength; j++) {
    if (j >= bitLength - i) {
      bin[j] = bin[ 31 + i - (j - (bitLength - i)) ];
    } else {
      bin[j] = '0';
    }
  }
  bin[bitLength] = '\0';
  
  return bin;
}

void blinkLed(int blinks) {
  blinkAmount = blinks;
  blinkCounter = 0;
}

void doBlink() {
  int blinkDuration = 3000;
  
  if(blinkAmount >= 0 && blinkCounter >= 0             && blinkCounter < blinkDuration  ) digitalWrite(LED_PIN, HIGH);
  if(blinkAmount >= 0 && blinkCounter >= blinkDuration && blinkCounter < blinkDuration*2) digitalWrite(LED_PIN, LOW);
  if(blinkCounter % (blinkDuration*2) == 0) {
    blinkAmount--;
    blinkCounter = 0;
  }
  //Serial.println(blinkCounter);
  //Serial.println(blinkAmount);
  
  blinkCounter++;
}

void updateDHTData(boolean debug) {
    // READ DATA
    if (debug) Serial.println("Type,\tstatus,\tHumidity (%),\tTemperature (C)\tTime (us)");
    
    uint32_t start = micros();
    int chk = DHT.read22(DHT22_PIN);
    uint32_t stop = micros();

    currentTemperature = DHT.temperature;
    currentRelativeHumidity = DHT.humidity;

    if (debug) Serial.print("DHT22\t");
    
    switch (chk)
    {
    case DHTLIB_OK:
        if (debug) Serial.print("OK\t");
        break;
    case DHTLIB_ERROR_CHECKSUM:
        Serial.println("DHT22 Checksum error\t");
        currentTemperature = 0;
        currentRelativeHumidity = 0;
        break;
    case DHTLIB_ERROR_TIMEOUT:
        Serial.println("DHT22 Time out error\t");
        currentTemperature = 0;
        currentRelativeHumidity = 0;
        break;
    default:
        Serial.println("DHT22 Unknown error\t");
        currentTemperature = 0;
        currentRelativeHumidity = 0;
        break;
    }
    // DISPLAY DATA
    if (debug) Serial.print(DHT.humidity, 2);
    if (debug) Serial.print("\t\t");
    if (debug) Serial.print(DHT.temperature, 2);//,1
    if (debug) Serial.print("\t\t");
    if (debug) Serial.print(stop - start);
    if (debug) Serial.println();
}

int readBinaryString(char *s) {
  int result = 0;
  while(*s) {
    result <<= 1;
    if(*s++ == '1') result |= 1;
  }
  return result;
}


int binaryStringToInt(String aString) {
  int charArraySize = aString.length() + 1;
  char aCharArray[charArraySize];
  aString.toCharArray(aCharArray, charArraySize);
  return readBinaryString(aCharArray);
}

