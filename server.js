isServer = true;
totalMoments = 0;
serverFrameRate = 30;
var seed = 0;
perlinSeed = Math.random();

var sim = require('./simulation.js');

sim.init(function() {
  sim.setup();
  setInterval(function(){
    seed = p5.seed;
    sim.serverUpdate();
    m = sim.m();
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

    socket.on('changeClass', function(data) {
      if (sim.bodies[data.i] && sim.bodies[data.i].name == data.b.name) {
        sim.bodies[data.i].type = data.b.type;
        socket.broadcast.emit('changeClass', { i: data.i, b: data.b});
      }
    });

    //setInterval(function() {
      //socket.emit('timecheck', { totalMoments: totalMoments });
    //}, 1000)
  });


  function reset(socket) {
    socket.emit('setup', { seed: seed, perlinSeed: perlinSeed, startedAt: totalMoments, m: m, bodies: getBodies()});
  }

});


var getBodies = function() {
  var output = [];
  for (var i = 0; i < sim.bodies.length; i++) {
    var b = sim.bodies[i];
    output.push(b);
  }
  return output;
}

