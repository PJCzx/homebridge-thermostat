#include <RCSwitch.h>

RCSwitch mySwitch = RCSwitch();

const int POS_ALT_PIN = 11;
const int NEG_ALT_PIN = 12;
const int LED_PIN = 13;

unsigned long int loopcount;
int currentHeatingCollingState;
int targetHeatingCollingState;
int targetTemperature;
int currentTemperature;

unsigned long int blinkCounter;
int blinkAmount;

void off(boolean useByThermostat = false);
void comfort(boolean useByThermostat = false);
void noFrost(boolean useByThermostat = false);
void automatic(boolean useByThermostat = false);

void setup() {
  loopcount = 0;
  currentHeatingCollingState = 0;
  targetHeatingCollingState = 0;
  
  Serial.begin(9600);
  mySwitch.enableReceive(0);  // Receiver on interrupt 0 => that is pin #2
  
  
  pinMode(POS_ALT_PIN, OUTPUT);
  pinMode(NEG_ALT_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  
  Serial.println("Ready");
  //blinkLed(10);
}

void loop() {
  doBlink();
  if (loopcount >= 1000000) {
    Serial.println("Alive");
    displayVariables();
    loopcount = 0;
  } 
  if (mySwitch.available()) {   
    int value = mySwitch.getReceivedValue();
    
    if (value == 0) {
      Serial.println("Unknown encoding");
    } else {
      Serial.print("Received ");
      Serial.print( mySwitch.getReceivedValue() );
      Serial.print(" / ");
      Serial.print( mySwitch.getReceivedBitlength() );
      Serial.print("bit ");
      Serial.print("Protocol: ");
      Serial.println( mySwitch.getReceivedProtocol() );
      const char* b = dec2binWzerofill(mySwitch.getReceivedValue(), mySwitch.getReceivedBitlength());
      
      String s = String(b);
      
      String id = s.substring(0,8);
      String dispo = s.substring(8,13);
      String command = s.substring(13,17);
      String value = s.substring(17,24);

      Serial.println( id + " " + dispo + " " + command + " " + value);
      
      if (id == "00000001") {
        Serial.println("id: " + id);

             if (command == "0000") off();
        else if (command == "0001") comfort();
        else if (command == "0010") noFrost();
        else if (command == "0011") automatic(value);
        else Serial.println("Unknown Command: " + command);
        
      } else {
        Serial.println("Unknown ID " + id);
      }

    }

    Serial.println("-------------");
    delay(1000);//Wait 1 Sec before getting any other signal
    
    mySwitch.resetAvailable();
  }
  
  loopcount++;
}

void comfort(boolean useByThermostat) {
  if (!useByThermostat) targetHeatingCollingState = 1;
  //CLEAR INTERVALS IF NOT USED BY AUTO MODE
  Serial.println("Comfort: (HEATING: 1)");
  digitalWrite(POS_ALT_PIN, LOW);
  digitalWrite(NEG_ALT_PIN, LOW);
  currentHeatingCollingState = 1;

  displayVariables();
}

void off(boolean useByThermostat) {
  if (!useByThermostat) targetHeatingCollingState = 0;
  //CLEAR INTERVALS IF NOT USED BY AUTO MODE
  Serial.println("OFF (OFF: 0)");
  digitalWrite(POS_ALT_PIN, HIGH);
  digitalWrite(NEG_ALT_PIN, LOW);
  currentHeatingCollingState = 0;
  
  displayVariables();
}

void noFrost(boolean useByThermostat) {
  if (!useByThermostat) targetHeatingCollingState = 2;
  //CLEAR INTERVALS IF ANY
  Serial.println("NO FROST (COOLING: 2)");
  digitalWrite(POS_ALT_PIN, LOW);
  digitalWrite(NEG_ALT_PIN, HIGH);
  currentHeatingCollingState = 2;

  displayVariables();
}

void automatic(String targetTemperature) { //INT?
  targetHeatingCollingState = 3;
  //CLEAR INTERVALS IF ANY
  Serial.println("Command 4 : AUTO (besoin temperature + emmeteur)");

  if(loopcount%2 == 0) comfort(true);
  else noFrost(true);
  
  displayVariables();
}

void displayVariables() {
  Serial.print("targetHeatingCollingState is ");
  Serial.println(targetHeatingCollingState);
  Serial.print("currentHeatingCollingState is: ");
  Serial.println(currentHeatingCollingState);
  Serial.print("targetTemperature is ");
  Serial.println(targetTemperature); //NEED TO BE CONVERTED
  Serial.print("currentTemperature is: ");
  Serial.println("DHT22 + EMITTER"); //NEED DHT22 + EMMITER 
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
