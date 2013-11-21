if (typeof isServer != 'undefined' && isServer == true) {
  random = p5.random;
  PVector = p5.PVector;
  millis = p5.millis;
  cos = p5.cos;
  sin = p5.sin;
  println = p5.println;
}

function Body(x, y, name) {
  this.r = 10;
  this.location = new PVector(x, y);
  this.maxspeed = p5.random(1, 2);
  this.maxforce = .1;
  this.acceleration = new PVector(0, 0);
  this.velocity = new PVector(0, 0);
  this.name = name;
  this.age = 0;
  this.obstacleWeight = 1.3;
  this.seekWeight = .1;
  this.wanderWeight = .1
  this.mateWeight = 0;
  this.wandertheta = 0;
  this.lastPregnant = 0;
  this.hungry = true;
  this.hunger = p5.random(0, 2);
  this.mateTheta = 0;
  this.bornAt = millis();
  this.alive = true;
  this.pregnant = false;
}


Body.prototype.update = function() {
  this.age ++;
  if ((this.age > 4800 || this.hunger > 10) && p5.random(1) > .5) { 
    //this.alive = false;
  }

  this.velocity.add(this.acceleration);
  this.velocity.limit(this.maxspeed);
  this.location.add(this.velocity);
  this.borders();
  this.acceleration.mult(0);
}

Body.prototype.runOnServer = function(bodies) {
  this.applyBehaviors(bodies);
  this.update();
}

Body.prototype.run = function(bodies) {
  //this.applyBehaviors(bodies);
  //this.update();
  this.display();
}

Body.prototype.applyForce = function(force) {
  // We could add mass here if we want A = F / M
  this.acceleration.add(force);
}

Body.prototype.applyBehaviors = function(bodies) {
  this.mateWeight = 2.5 - this.hunger;
  if (this.mateWeight < 0) { 
    this.mateWeight = 0;
  }
  var mateDance = this.matingDance();
  //this.mateWeight = 2;
  mateDance.mult(this.mateWeight);
  this.applyForce(mateDance);

  this.mate(bodies);

  this.hunger += .005;

  if (this.hunger < 1) {
    this.mateWeight = 1;
    this.hungry = false;
  } else {
    this.mateWeight = 0;
    this.hungry = true;
  }

  //this.obstacleVector = this.obstacleSeparation();
  //this.obstacleVector.mult(this.hungry ? this.hunger : 3);
  //this.applyForce(this.obstacleVector);

  this.wanderVector = this.wander();
  this.wanderVector.mult(this.wanderWeight);
  this.applyForce(this.wanderVector);

  var sep = this.separate(bodies);
  sep.mult(2.5 - this.mateWeight);
  this.applyForce(sep);
}

Body.prototype.display = function() {
  pushMatrix();
  translate(this.location.x, this.location.y);
  rotate(this.velocity.heading());

  //body
  noStroke();
  fill(100);
  ellipse(0, 0, this.r, this.r);

  //tail
  fill(255, 0, 0);
  var vel = this.velocity.mag() * 10;
  ellipse(-vel, 0, 2, 2);
  stroke(100);
  line(-this.r/2, 0, -vel, 0);

  //eyes
  fill(255);
  ellipse(2, -3, 4, 4);
  ellipse(2, 3, 4, 4);

  if (this.hunger > 5) {
    fill(200, 0, 0, 100);
    noStroke();
    ellipse(0, 0, this.r+3, this.r+3);
  }

  if (this == toFollow) {
    noStroke();
    fill(0, 150, 255, 100);
    if (this.hunger > 5) { 
      fill(255, 0, 0, 100);
    }
    ellipse(0, 0, this.r+6, this.r+6);
  }

  popMatrix();

  if (this == toFollow || showAllLabels) {
    fill(50);
    textSize(10);
    text(this.name, this.location.x + this.r, this.location.y);
    textSize(9);
    text(this.hungerToS() + " " + this.ageToS(), this.location.x + this.r, this.location.y + 12);
  }
}


Body.prototype.eat = function(x, y) {
  //this.r += .005;
  //m.clearPixel(x, y);
  //this.hunger -= .01;
}


Body.prototype.steer = function(desired) {
  desired.normalize();
  desired.mult(this.maxspeed);
  var steerV = PVector.sub(desired, this.velocity);
  steerV.limit(this.maxforce);
  return steerV;
}

Body.prototype.hungerToS = function() {
  var toReturn = "satisfied";
  if (this.hunger > 1 && this.hunger < 2) {
    return "peckish";
  }
  else if (this.hunger > 2 && this.hunger < 3) {
    return "hungry";
  }
  else if (this.hunger > 3 && this.hunger < 4) {
    return "famished";
  }
  else if (this.hunger > 4) {
    toReturn = "starving";
  }

  return toReturn;
}

Body.prototype.ageToS = function() {
  var toReturn = "new born";
  if (this.age > 0 && this.age < 400) {
    return "infant";
  }

  else if (this.age > 400 && this.age < 800) {
    return "toddler";
  }
  else if (this.age > 800 && this.age < 1200) {
    return "child";
  }
  else if (this.age > 1200 && this.age < 1600) {
    return "adolescent";
  }
  else if (this.age > 1600 && this.age < 2000) {
    return "young adult";
  }
  else if (this.age > 2000 && this.age < 3000) {
    return "adult";
  }
  else if (this.age > 3000 && this.age < 3800) {
    return "middle-aged";
  }
  else if (this.age > 3800 && this.age < 4400) {
    return "senior citizen";
  }
  else if (this.age > 4400 && this.age < 4600) {
    return "rapidly degenerating";
  }
  else if (this.age > 4600) {
    return "ready to die";
  }

  return toReturn;
}

Body.prototype.go = function(dir) {
  if (dir == "up") {
    this.applyForce(new PVector(0, -10));
  }
  if (dir == "down") {
    this.applyForce(new PVector(0, 10));
  }
  if (dir == "left") {
    this.applyForce(new PVector(-10, 0));
  }
  if (dir == "right") {
    this.applyForce(new PVector(10, 0));
  }
}

Body.prototype.mate = function(bodies) {
  for (var i = 0; i < bodies.length; i++) {
    var b = bodies[i];
    if (millis() - this.lastPregnant > 1000 && millis() - this.bornAt > 10000 && b != this && this.location.dist(b.location) < 10 && random(1) > .5) {
      console.log(this.name + " and " + b.name + " have mated!");
      this.pregnant = true;
      this.lastPregnant = millis();
    }
  }
}


Body.prototype.matingDance = function() {
  var target = new PVector(width/2 + cos(this.r + this.mateTheta) * (width/4 + this.mateTheta*10), height/2 + sin(this.r + this.mateTheta) * (height/4 + this.mateTheta*10));
  this.mateTheta += .01;
  return this.seek(target);
}

Body.prototype.seekFarthest = function(bodies) {
  var longestDistance = 0;
  var target = bodies[0];
  for (var i = 0; i < bodies.length; i++) {
    var b = bodies[i];
    if (b != this) {
      var d = this.location.dist(b.location);
      if (d > longestDistance) { 
        longestDistance = d;
        target = b;
      }
    }
  }
  return this.seek(target.location);
}

Body.prototype.seekFatest = function(bodies) {
  var target = new PVector();
  var largestBody = 0;
  for (var i = 0; i < bodies.length; i++) {
    var b = bodies[i];
    if (b != this && b.r > largestBody && this.location.dist(b.location) < 100) {
      target = b.location;
      largestBody = b.r;
    }
  }
  return this.seek(target);
}


Body.prototype.seek = function(target) {
  var desired = PVector.sub(target, this.location);
  return this.steer(desired);
}

Body.prototype.wander = function() {
  var wanderR = 30;         // Radius for our "wander circle"
  var wanderD = 80;         // Distance for our "wander circle"
  var change = 0.3;
  this.wandertheta += random(-change, change); // Randomly change wander theta

  // Now we have to calculate the new location to steer towards on the wander circle
  var circleloc = this.velocity.get();    // Start with velocity
  circleloc.normalize();                 // Normalize to get heading
  circleloc.mult(wanderD);               // Multiply by distance
  circleloc.add(this.location);               // Make it relative to boid's location
  var h = this.velocity.heading();        // We need to know the heading to offset wandertheta

  var circleOffSet = new PVector(wanderR * cos(this.wandertheta + h), wanderR * sin(this.wandertheta + h));
  var target = PVector.add(circleloc, circleOffSet);
  return this.seek(target);
}

Body.prototype.obstacles = function() {
  var steerV = new PVector();
  var target = PVector.add(this.location, this.velocity);//velocity.get();

  if (m.blocked(target.x, target.y)) {
    var desired = PVector.sub(this.location, target);
    steerV = PVector.sub(desired, this.velocity);
    steerV.limit(this.maxforce);
  }
  return steerV;
}

Body.prototype.obstacleSeparation = function() {
  var steerV = new PVector();
  var desired = new PVector();
  var sep = this.r;
  var sum = new PVector();
  var count = 0;

  for (var x = parseInt(this.location.x - sep/2); x < this.location.x + sep/2; x ++) {
    for (var y = parseInt(this.location.y - sep/2); y < this.location.y + sep/2; y ++) {
      if (dist(this.location.x, this.location.y, x, y) < sep/2 && m.blocked(x, y)) {
        var d = PVector.dist(this.location, new PVector(x, y));
        var diff;
        if (this.hungry) {
          diff = PVector.sub(new PVector(x, y), this.location);
          this.eat(x, y);
        }
        else {
          diff = PVector.sub(this.location, new PVector(x, y));
        }
        diff.normalize();
        diff.div(d); // Weight by distance
        sum.add(diff);
        count++;
      }
    }
  }

  if (count > 0) {
    //println(name + " has a meal");

    sum.div(count);
    // Our desired vector is the average scaled to maximum speed
    sum.normalize();
    sum.mult(this.maxspeed);
    steerV = PVector.sub(sum, this.velocity);
    steerV.limit(this.maxforce);
    //obstacleWeight = 3;
    //wanderWeight = 1;
  } 
  else {
    //obstacleWeight = 0.0;
    //wanderWeight = .1;
  }

  return steerV;
}


Body.prototype.flock = function() {
  var sep = this.separate();   // Separation
  var ali = this.align();      // Alignment
  var coh = this.cohesion();   // Cohesion
  // Arbitrarily weight these forces
  sep.mult(1.5);
  ali.mult(1.0);
  coh.mult(1.0);
  // Add the force vectors to acceleration
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
}


// Separation
// Method checks for nearby boids and steers away
Body.prototype.separate = function(bodies) {
  var desiredseparation = 25.0;
  var steerV = new PVector(0, 0, 0);
  var count = 0;
  // For every boid in the system, check if it's too close
  for (var i = 0; i < bodies.length; i++) {
    var other = bodies[i];
    var d = PVector.dist(this.location, other.location);
    // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
    if ((d > 0) && (d < desiredseparation)) {
      // Calculate vector povaring away from neighbor
      var diff = PVector.sub(this.location, other.location);
      diff.normalize();
      diff.div(d);        // Weight by distance
      steerV.add(diff);
      count++;            // Keep track of how many
    }
  }
  // Average -- divide by how many
  if (count > 0) {
    steerV.div(count);
  }

  // As long as the vector is greater than 0
  if (steerV.mag() > 0) {
    // Implement Reynolds: Steering = Desired - Velocity
    steerV.normalize();
    steerV.mult(this.maxspeed);
    steerV.sub(this.velocity);
    steerV.limit(this.maxforce);
  }
  return steerV;
}

// Alignment
// For every nearby boid in the system, calculate the average velocity
Body.prototype.align = function(bodies) {
  var neighbordist = 50;
  var sum = new PVector(0, 0);
  var count = 0;
  for (var i = 0; i < bodies.length; i++) {
    var b = bodies[i];
    var d = PVector.dist(this.location, other.location);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(other.velocity);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    var steerV = PVector.sub(sum, this.velocity);
    steerV.limit(this.maxforce);
    return steerV;
  }
  else {
    return new PVector(0, 0);
  }
}

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
Body.prototype.cohesion = function(bodies) {
  var neighbordist = 50;
  var sum = new PVector(0, 0);   // Start with empty vector to accumulate all locations
  var count = 0;
  for (var i = 0; i < bodies.length; i++) {
    var b = bodies[i];
    var d = PVector.dist(this.location, other.location);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(other.location); // Add location
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return seek(sum);  // Steer towards the location
  }
  else {
    return new PVector(0, 0);
  }
}


Body.prototype.borders = function() {
  if (this.location.x < -this.r) this.location.x = width+this.r;
  if (this.location.y < -this.r) this.location.y = height+this.r;
  if (this.location.x > width+this.r) this.location.x = -this.r;
  if (this.location.y > height+this.r) this.location.y = -this.r;
}

if (typeof isServer != 'undefined' && isServer == true) {
  module.exports = Body;
}
