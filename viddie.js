"use strict";

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
      haarcascade: __dirname + "/haarcascade_frontalface_alt.xml"
    }
  },

  work: function(my) {                                           
    my.camera.once("cameraReady", function() {                   
      console.log("The camera is ready!");                                                                     
                                                       
      every(500, function(){
        my.buzzer.turnOff();                              
        my.camera.readFrame();
      });                                      
    });
    
    my.camera.on("facesDetected", function(err, im, faces) {
      if (err) {
        console.log(err);
        return;
      }

      var biggest, center_x, f, face, turn, _i, _len;
      biggest = 0;
      face = null;
      for (_i = 0, _len = faces.length; _i < _len; _i++) {
        f = faces[_i];
        if (f.width > biggest) {
          biggest = f.width;
          face = f;
        }
      }
      if (face !== null && (face.width <= 100 && face.width >= 45)) {
        my.buzzer.turnOn();
      }
    });                                                          
                                                              
    my.camera.on("frameReady", function(err, im) {
      if (err) {
        console.log(err);
      } else {
        my.camera.detectFaces(im);
      }
    });
  }                         
}).start();
