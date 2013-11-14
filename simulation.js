/* @pjs pauseOnBlur=true; 
 */

var bodies = [];
var names = [];
var m;
var sc = 1.5;
var follow = false, flocking = false, looping = true, showAllLabels = false;
var follower = 0;
var toFollow;

function setup() {
  canv = createGraphics(1280, 720);

  names = loadStrings("names.txt");
  for (var i = 0; i < 30; i ++) {
    b = new Body(random(width), random(height), names[parseInt(random(0, names.length-1))]);
    b.r = random(10, 20);
    b.age = parseInt(random(0, 1000));
    bodies.push(b);
  }
  m = new Map(width, height);
}


function draw() {
  if (follower > bodies.size() - 1) { 
    follower = 0;
  }
  toFollow = bodies.get(follower);
  if (follow) {
    scale(sc);
    translate((toFollow.location.x - width/(2*sc))*-1, (toFollow.location.y - height/(2*sc))*-1);
  }

  background(200);

  m.display();
  for (var i = bodies.size() - 1; i >= 0; i--) {
    var b = bodies[i];
    b.run();

    if (b.pregnant) {
      var baby = new Body(b.location.x, b.location.y, names[int(random(0, names.length-1))]);
      println(baby.name + " is born");

      bodies.push(baby);
      b.pregnant = false;
    }

    if (toFollow != b && !b.alive && bodies.size() > i) {
      println(b.name + " has died of " + (b.age > 4800 ? "old age" : "hunger. RIP."));
      m.regrow(b.location.x, b.location.y);      
      bodies.splice(i, 1);
    }
  }

  if (bodies.size() > 50) {
    bodies.splice(50, 1);
  }
  fill(0);
  textSize(12);
  text(frameRate, 20, 20);
}

function mouseWheel(event) {
  var e = event.getAmount();
  sc += e / 20;
  if (sc > 10) { 
    sc = 10;
  }
  if (sc < 1) { 
    sc = 1;
  }
}

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
  if (follower >= bodies.size()) { 
    follower = 0;
  }
  if (follower < 0) { 
    follower = bodies.size() -1;
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
  m.plant(mouseX, mouseY);
}
