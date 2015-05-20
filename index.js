

var tessel = require('tessel');
var http = require('http');
var Npx = require('npx');

// Config
var numPixels = 64;
var pollingTime = 5000;
var animationFrameDelay = 10;
var lumiereEndpoint = 'http://lumiere.lighting/api/colors?limit=10&noInput=true';

// Create object for NeoPixels
var npx = new Npx(numPixels);

// Other globals
var currentID;

// Loop, but run first since setInterval doesn't do that;
loop();
setInterval(loop, pollingTime);

// Main looping function
function loop() {
  getColors(function(error, data) {
    if (!error && data._id && data._id !== currentID) {
      console.log(data);
      currentID = data._id;
      updateLights(data);
    }
  });
}

// Make HTTP request to API
function getColors(done) {
  // Make request
  http.get(lumiereEndpoint, function(response) {
    if (response.statusCode >= 300) {
      console.log('Error from API: ', response.statusCode);
      done(response.statusCode, null);
      return;
    }

    // We want a string
    response.setEncoding('utf-8');
    var incoming = '';

    // On data
    response.on('data', function(data) {
      incoming += data;
    });

    response.on('end', function() {
      done(null, JSON.parse(incoming));
    });
  })

  // Request error
  .on('error', function(e) {
    console.log('Request error: ', e.message);
    done(e.message, null);
  });
}

// Update lights
function updateLights(data) {
  var black = '#000000';
  var animation = npx.newAnimation(1);
  var count = data.colors.length;
  var i;

  // Go black
  /*
  for (i = numPixels - 1; i >= 0; i--) {
    animation.setPixel(i, black, 64 - i);
  }
  */

  // Then put in colors
  for (i = 0; i < numPixels; i++) {
    animation.setPixel(i, data.colors[i % count]);
  }

  npx.play(animation);
}
