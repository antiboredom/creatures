isServer = true;
totalMoments = 0;
serverFrameRate = 30;
var seed = 0;

var sim = require('./simulation.js');

sim.init(function() {
  sim.setup();

  setInterval(function(){
    seed = p5.seed;
    sim.serverUpdate();
    totalMoments ++;
  }, 1000/serverFrameRate);

  var io = require('socket.io').listen(8000);
  io.set('log level', 1);

  io.sockets.on('connection', function (socket) {
    reset(socket);
    socket.on('ping', function (data) {
      if (Math.abs(data.clientMoments - totalMoments) > 5) {
        reset(socket);
      }
    });

    //setInterval(function() {
      //socket.emit('timecheck', { totalMoments: totalMoments });
    //}, 1000)
  });


  function reset(socket) {
    socket.emit('setup', { seed: seed, startedAt: totalMoments, map: sim.m, bodies: getBodies()});
  }

});


var getBodies = function() {
  var output = [];
  for (var i = sim.bodies.length - 1; i >= 0; i--) {
    var b = sim.bodies[i];
    output.push(b);
  }
  return output;
}

