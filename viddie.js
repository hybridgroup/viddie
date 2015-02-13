var Cylon = require("cylon");

Cylon.robot({
  connections: {
    edison: { adaptor: 'intel-iot' },
    opencv: { adaptor: "opencv" },
    mqtt: { adaptor: "mqtt", 
            host: "mqtt://" + process.env.MECHANOID_MQTT_BROKER + 
              ":" + process.env.MECHANOID_MQTT_BROKER_PORT,
            username: process.env.MECHANOID_MQTT_USER,
            password: process.env.MECHANOID_MQTT_PASSWORD },
  },

  devices: {
    buzzer: { connection: "edison", driver: 'led', pin: 4 },
    camera: {
      connection: "opencv",
      driver: "camera",
      camera: 0,
      haarcascade: __dirname + "/haarcascade_eye.xml"
    }
  },

  work: function(my) {
    my.camera.once("cameraReady", function() {
      console.log("The camera is ready!");

      every(100, function(){                             
        my.buzzer.turnOff();
        my.mqtt.publish(process.env.MECHANOID_MQTT_BASE_TOPIC + "/blink", "0");
        my.camera.readFrame();                           
      });
    });

    my.camera.on("frameReady", function(err, im) {
      if (err) {                                                 
        console.log(err);                                        
        return;                                               
      }                                                       

      my.camera.detectFaces(im);
    });    

    my.camera.on("facesDetected", function(err, im, faces) {
      if (err) {
        console.log(err);
        return;
      }
      my.buzzer.turnOn();
      my.mqtt.publish(process.env.MECHANOID_MQTT_BASE_TOPIC + "/blink", "1");
      my.camera.readFrame();
    });
  }
}).start();
