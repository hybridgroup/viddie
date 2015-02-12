var Cylon = require("cylon");

Cylon.robot({
  connections: {
    edison: { adaptor: 'intel-iot' },
    opencv: { adaptor: "opencv" }
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

      every(300, function(){                             
        my.buzzer.turnOff();                             
        my.camera.readFrame();                           
      });
    });

    my.camera.on("facesDetected", function(err, im, faces) {
      if (err) {
        console.log(err);
        return;
      }
      my.buzzer.turnOn();
      my.camera.readFrame();
    });

    my.camera.on("frameReady", function(err, im) {
      if (err) {                                                 
        console.log(err);                                        
        return;                                               
      }                                                       

      my.camera.detectFaces(im);
    });    
  }
}).start();
