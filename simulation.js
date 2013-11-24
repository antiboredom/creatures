/* @pjs pauseOnBlur=true; 
*/
var bodies = [];
var names = [];
var sc = 1.5;
var follow = false, flocking = false, looping = true, showAllLabels = false;
var follower = 0;
var toFollow;
var lastDrawn = 0;
var timeNow = 0;
var canv;

if (typeof isServer != 'undefined' && isServer == true){
  //window = {};
  screen = {};
  p5 = require('./p5/dist/p5.js');
  Body = require('./body.js');
  Food = require('./food.js');
  Map = require('./map.js');
  Log = function(msg) { console.log(msg) };
  width = 1280;
  height = 720;
  //readNames();
} else {
  isServer = false;
}

var m = new Map(width, height, true);
var isClient = !isServer;

function init(callback) {
  fs = require('fs')
  fs.readFile(__dirname + '/data/names.txt', 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    }
    names = data.split("\n");
    callback();
  });
}

function serverUpdate() {
  m.update();
  for (var i = 0; i < bodies.length; i++) {
    bodies[i].runOnServer(bodies, m);
    checkPregnancy(bodies[i]);
    checkMortality(bodies[i], i)
  }
  resetIfNeeded();
}

function preload() {
  names = p5.loadStrings("data/names.txt");
}

function serverSetup() {
  for (var i = 0; i < 30; i ++) {
    b = new Body(p5.random(width), p5.random(height), names[parseInt(p5.random(0, names.length-1))]);
    console.log(b.name + " is born");
    b.r = p5.random(10, 20);
    b.age = parseInt(p5.random(0, 6000));
    bodies.push(b);
  }
}

function setup(){
  canv = createGraphics(1280, 720);
  setFrameRate(30);
  if (typeof io == "undefined") {
    m = new Map(width, height, true);
    for (var i = 0; i < 30; i ++) {
      var b = new Body(random(width), random(height), names[parseInt(p5.random(0, names.length-1))]);
      Log(b.name + " is born");
      b.r = random(10, 20);
      b.age = random(0, 6000);
      bodies.push(b);
    }
  }
}


function draw() {
  //console.log(currentFrame);

  if (follower > bodies.length - 1) {
    follower = 0;
    toFollow = bodies[follower];
  }

  background(250);

  if (follow && typeof toFollow != "undefined") {
    scale(sc);
    translate((toFollow.location.x - width/(2*sc))*-1, (toFollow.location.y - height/(2*sc))*-1);
  }

  m.run();

  for (var i = 0; i < bodies.length; i ++) {
    if (!follow && dist(mouseX, mouseY, bodies[i].location.x, bodies[i].location.y) < bodies[i].r * 2) {
      follower = i;
      toFollow = bodies[follower];
      pushMatrix();
      translate(-bodies[i].location.x, -bodies[i].location.y);
      scale(2);
      bodies[i].run(bodies, m);
      popMatrix();
    } else {
      bodies[i].run(bodies, m);
    }
    checkPregnancy(bodies[i]);
    checkMortality(bodies[i], i)
  }
  currentFrame ++;
  timeNow = millis();
  fill(0);
  text("fps: " + (timeNow - lastDrawn + "  time: " + Math.floor(timeNow/1000) + "  total verme: " + bodies.length), 10, 10);
  lastDrawn = timeNow;

  resetIfNeeded();
}

function resetIfNeeded() {
  if (bodies.length == 0) {
    if (isServer) {
      serverSetup();
    } else {
      setup();
    }
  }
}

function checkPregnancy(b) {
  if (b.pregnant) {
    var baby = new Body(b.location.x, b.location.y, names[parseInt(p5.random(0, names.length-1))]);
    Log(baby.name + " is born");
    bodies.push(baby);
    b.pregnant = false;
    return baby;
  } else {
    return false;
  }
}

function checkMortality(b, i) {
  if (!b.alive) {
    Log(b.name + " has died of " + b.causeOfDeath + ". R.I.P.");
    bodies.splice(i, 1);
    m.plant(b.location);
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
    toFollow = bodies[follower];
  }
  if (keyCode == 75) {
    follower --;
    toFollow = bodies[follower];
  }
  if (follower >= bodies.length) { 
    follower = 0;
    toFollow = bodies[follower];
  }
  if (follower < 0) { 
    follower = bodies.length -1;
    toFollow = bodies[follower];
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
  follow = !follow;
  //m.plantFood();
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
  exports.m = m;
}

