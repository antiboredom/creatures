/* @pjs pauseOnBlur=true; 
*/
var bodies = [];
var names = [];
var sc = 1.5;
var follow = false, flocking = false, looping = true, showAllLabels = false;
var follower = 0;
var toFollow;

if (typeof isServer != 'undefined' && isServer == true){
  //window = {};
  screen = {};
  p5 = require('./p5/dist/p5.js');
  Body = require(__dirname + '/body.js');
  width = 1280;
  height = 720;
  //readNames();
} else {
  isServer = false;
}

var isClient = !isServer;

function init(callback) {
  fs = require('fs')
  fs.readFile(__dirname + '/data/names.txt', 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    names = data.split("\n");
    callback();
    //serverSetup();
    //serverUpdate();
  });
}

function serverUpdate() {
  //var frames = [];

  var frame = {updates: [], births: [], deaths: []};
  for (var i = 0; i < bodies.length; i++) {
    bodies[i].runOnServer(bodies);
    frame.updates.push(JSON.parse(JSON.stringify(bodies[i])));
    var baby = checkPregnancy(bodies[i]);
    if (typeof baby == "object") {
      frame.births.push(baby);
    }
    var corpse = checkMortality(bodies[i], i)
    if (typeof corpse == "number") {
      frame.deaths.push(i);
    }
  }
  return frame;

  //setInterval(function(){
  //for (var i = bodies.length - 1; i >= 0; i--) {
  //var b = bodies[i];
  //b.runOnServer(bodies);
  //checkPregnancy(b);
  //checkMortality(b, i)
  //}
  //}, 1000/30);
}

function preload() {
  names = p5.loadStrings("data/names.txt");
}

function serverSetup() {
  for (var i = 0; i < 30; i ++) {
    b = new Body(p5.random(width), p5.random(height), names[parseInt(p5.random(0, names.length-1))]);
    console.log(b.name + " is born");
    b.r = p5.random(10, 20);
    b.age = parseInt(p5.random(0, 1000));
    bodies.push(b);
  }
}

function setup(){
  createGraphics(1280, 720);
}


function draw() {
  cleanupClientFrames();
  currentFrame ++;
  if (follower > bodies.length - 1) { 
    follower = 0;
  }
  toFollow = bodies[follower];

  if (follow) {
    scale(sc);
    translate((toFollow.location.x - width/(2*sc))*-1, (toFollow.location.y - height/(2*sc))*-1);
  }

  background(250);

  for (var i = 0; i < bodies.length; i ++) {
    bodies[i].display();
  }

  //socket.emit('fetch', {bufferCount: clientFrames.length, currentMoment: currentFrame});

  var frame = clientFrames[frameIndex];
  if (typeof frame == 'undefined') {
    return false;
  }

  var updates = frame.updates;
  //console.log(updates[0].location.x);
  for (var i = 0; i < updates.length; i++) {
    var b = updates[i];
    updateAttributes(bodies[i].location, b.location);
    updateAttributes(bodies[i].velocity, b.velocity);
    updateAttributes(bodies[i].acceleration, b.acceleration);
    bodies[i].hunger = b.hunger;
    bodies[i].alive = b.alive;
    bodies[i].pregnant = b.pregnant;
  }

  var deaths = frame.deaths;
  for (var i = 0; i < deaths.length; i++) {
    bodies.splice(deaths[i], 1);
  }

  var births = frame.births;
  for (var i = 0; i < births.length; i++) {
    var b = new Body(births[i].x, births[i].y, births[i].name);
    bodies.push(b);
  }

  //frameIndex ++;
  clientFrames.shift();
  //if (clientFrames.length < 90 && syncing === false){
    //syncing = true;
  //}
  //if (bodies.length > 50) {
  //bodies.splice(50, 1);
  //}
}

function checkPregnancy(b) {
  if (b.pregnant) {
    var baby = new Body(b.location.x, b.location.y, names[parseInt(p5.random(0, names.length-1))]);
    println(baby.name + " is born");
    bodies.push(baby);
    b.pregnant = false;
    return baby;
  } else {
    return false;
  }
}

function checkMortality(b, i) {
  if (!b.alive) {
    println(b.name + " has died of " + (b.age > 4800 ? "old age" : "hunger. RIP."));
    bodies.splice(i, 1);
    return i;
  } else {
    return false;
  }
}

//function mouseWheel(event) {
//var e = event.wheelDelta;
//sc += e / 200;
//if (sc > 10) { 
//sc = 10;
//}
//if (sc < 1) { 
//sc = 1;
//}
//}

function keyReleased() {
  if (keyCode == 32) { 
    follow = !follow;
  }
  if (keyCode == 76) {
    follower ++;
  }
  if (keyCode == 75) {
    follower --;
  }
  if (follower >= bodies.length) { 
    follower = 0;
  }
  if (follower < 0) { 
    follower = bodies.length -1;
  }

  if (keyCode == 78) {
    m = new Map(width, height);
  }
}

function keyPressed() {
  if (keyCode == 38) {
    toFollow.go("up");
  }

  if (keyCode == 40) {
    toFollow.go("down");
  }

  if (keyCode == 37) {
    toFollow.go("left");
  }

  if (keyCode == 39) {
    toFollow.go("right");
  }

  if (keyCode == 80) {
    looping = !looping;
    if (looping) {
      loop();
    }
    else {
      noLoop();
    }
  }

  if (keyCode == 73) {
    showAllLabels = !showAllLabels;
  }
}


function mousePressed() {
  //m.plant(mouseX, mouseY);
}

function updateAttributes(obj, attr) {
  for(var prop in attr) {
    if(attr.hasOwnProperty(prop)) {
      if (typeof attr[prop] == "object" && typeof obj[prop] == "object") {
        updateAttributes(obj[prop], attr[prop]);
      } else {
        obj[prop] = attr[prop];
      }
    }
  }
}

if (typeof isServer != 'undefined' && isServer == true) {
  exports.setup = serverSetup;
  exports.bodies = bodies;
  exports.checkMortality = checkMortality;
  exports.checkPregnancy = checkPregnancy;
  exports.serverUpdate = serverUpdate;
  exports.init = init;
}

