//var p5 = require(__dirname + '/p5.js/src/math/pvector.js');
//var p5 = require('./p5.js/src/core/constants.js');
isServer = true;
var sim = require('./simulation.js');

//var b = require(__dirname + '/body.js');
//var body = new b.Body(0, 0, "sam");

var io = require('socket.io').listen(8000);

io.sockets.on('connection', function (socket) {
  socket.emit('setup', { bodies: getData() });
  socket.on('my other event', function (data) {
    console.log(data);
  });
  setInterval(function(){
    socket.broadcast.emit('updates', { bodies: getData()} );
  }, 100);
});

var getData = function() {
  var output = [];
  for (var i = sim.bodies.length - 1; i >= 0; i--) {
    var b = sim.bodies[i];
    output.push(b);
  }
  return output;
}

//setInterval(function(){
  //for (var i = sim.bodies.length - 1; i >= 0; i--) {
    //var b = sim.bodies[i];
    //b.runOnServer(sim.bodies);
    //sim.checkPregnancy(b);
    //sim.checkMortality(b, i)
    //output.push(b);
  //}
  //socket.broadcast.emit('updates', { bodies: output} );


//}, 10);
