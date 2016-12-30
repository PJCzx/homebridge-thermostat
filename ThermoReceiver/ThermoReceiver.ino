#include <RCSwitch.h>

RCSwitch mySwitch = RCSwitch();

int POS_ALT_PIN = 11;
int NEG_ALT_PIN = 12;
int LED_PIN = 13;

void setup() {
  Serial.begin(9600);
  mySwitch.enableReceive(0);  // Receiver on interrupt 0 => that is pin #2
  
  
  pinMode(POS_ALT_PIN, OUTPUT);
  pinMode(NEG_ALT_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  
  Serial.println("Ready");
  //blinkLed(10);
}

void loop() {
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

    mySwitch.resetAvailable();
  }
}

void comfort() {
  //CLEAR INTERVALS IF NOT USED BY AUTO MODE
  Serial.println("Comfort: (HEATING: 1)");
  digitalWrite(POS_ALT_PIN, LOW);
  digitalWrite(NEG_ALT_PIN, LOW);
}

void off() {
  //CLEAR INTERVALS IF NOT USED BY AUTO MODE
  Serial.println("OFF (OFF: 0)");
  digitalWrite(POS_ALT_PIN, HIGH);
  digitalWrite(NEG_ALT_PIN, LOW);
}

void noFrost() {
  //CLEAR INTERVALS IF ANY
  Serial.println("NO FROST (COOLING: 2)");
  digitalWrite(POS_ALT_PIN, LOW);
  digitalWrite(NEG_ALT_PIN, HIGH);
}

void automatic(String targetTemperature) { //INT?
  //CLEAR INTERVALS IF ANY
  Serial.println("Command 4 : AUTO (besoin temperature + emmeteur)");
  Serial.print("targetTemperature: ");
  Serial.println(targetTemperature); //NEED TO BE CONVERTED
  Serial.print("currentTemperature: DHT22 + EMITTER"); //NEED DHT22 + EMMITER
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
  for (int i = 0; i < blinks; i++) {
      digitalWrite(LED_PIN, HIGH);
      delay(300);
      digitalWrite(LED_PIN, LOW);
    }
}