isServer = true;
totalMoments = 0;

var sim = require('./simulation.js');

sim.init(function() {
  var frameBufferLength = 500;
  var serverFrameRate = 30;
  var framesToSync = 90;
  var frames = [];
  sim.setup();
  for (var i = 0; i < frameBufferLength; i++) {
    frames.push(sim.serverUpdate());
    totalMoments ++;
  }

  //total moments = 1200
  //frames.length = 500
  //first moment we can get: 700 (total - frames)
  //the 500th moment is inaccessable
  //imagine we want to get the 800th moment (desiredMoment)
  //the desiredMoment is frames[totalMoments - desiredMoment] 
  //
  //1,2,3,4,5
  //2,3,4,5,6
  //3,4,5,6,7
  //15,16,17,18,19 arraylength - (totalmoments - desiredmoment) = 5 - (19-18) -1
  //5 - (19-16) - 1
  //on 7th moment, want to get 4th. should be frames[1]. frames.length = 5; index = totalMoment(7) - desired(4)
  //current % arraylength - 1

  setInterval(function(){
    frames.push(sim.serverUpdate());
    totalMoments ++;
    if (frames.length > frameBufferLength) {
      frames.shift();
    } 
  }, 1000/serverFrameRate);

  var io = require('socket.io').listen(8000);
  io.set('log level', 1);

  io.sockets.on('connection', function (socket) {
    var startMoment = totalMoments - frameBufferLength;
    if (startMoment < 0) startMoment = 0;
    socket.emit('setup', { startedAt: startMoment, syncedUntil: startMoment + framesToSync, frames: frames.slice(0, framesToSync*2) });
    socket.on("fetch", function(data){
      var startAt = data.startAt;
      var beginSlice = frameBufferLength - totalMoments - startAt + framesToSync*2;
      var clientFrame = data.currentFrame;
      //console.log("syncing issue:" + (totalMoments - clientFrame));
      //console.log(startAt);
      //console.log(totalMoments);
      //console.log("begin slice: " + beginSlice);
      //if (beginSlice > 0 && beginSlice < frameBufferLength) {
        //socket.emit('history', {frames: frames.slice(beginSlice, framesToSync)});
      //} else {
        socket.emit('history', {currentFrame: totalMoments - frameBufferLength, frames: frames.slice(0, framesToSync)});
      //}
    });
    //console.log(startMoment);
    //console.log(startMoment + framesToSync);
    //setInterval(function(){
      ////var startMoment = totalMoments - frameBufferLength;
      ////if (startMoment < 0) startMoment = 0;
      //socket.emit('history', { startedAt: totalMoments - frameBufferLength, frames: frames.slice(0, framesToSync)} );
      //startMoment = totalMoments;
    //}, 3000);
    //socket.on("fetch", function(data){
      //var startAt = data.startAt;
      //var syncedUntil = data.syncedUntil;
      //var currentMoment = data.currentMoment;
      //console.log("synced until:" + syncedUntil);
      //console.log("current client moment:" + currentMoment);
      //console.log("totalMoments:" + totalMoments);
      //console.log("start slice at: " + (frameBufferLength - (totalMoments - syncedUntil) - 1));
      //if (syncedUntil - currentMoment < framesToSync) {
        //var f = frames.slice(totalMoments - syncedUntil - 1, framesToSync);
        ////var f = frames.slice(frameBufferLength - (totalMoments - syncedUntil) - 1, framesToSync);
        //if (totalMoments - currentMoment > frameBufferLength) {
          //socket.emit('history', {currentFrame: totalMoments - frameBufferLength + 10, theEnd: "of history"});
        //} else { 
          //socket.emit('history', {syncedUntil: syncedUntil + f.length, frames: f});
        //}
        ////socket.emit('history', {startedAt: startAt, frames: frames.slice(0, framesToSync)});
      //} else {
        //socket.emit('history', {currentFrame: totalMoments - frameBufferLength + 100, theEnd: "of history"});
      //}
    //});
  });

});


//var getData = function() {
  //var output = [];
  //for (var i = sim.bodies.length - 1; i >= 0; i--) {
    //var b = sim.bodies[i];
    //output.push(b);
  //}
  //return output;
//}

