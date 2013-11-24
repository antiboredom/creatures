if (typeof isServer != 'undefined' && isServer == true) {
  random = p5.random;
  PVector = p5.PVector;
  millis = p5.millis;
  cos = p5.cos;
  sin = p5.sin;
  println = p5.println;
  dist = p5.dist;
}

//Ages
var INFANT =      800;
var TODDLER =     1600;
var CHILD =       2400;
var ADOLESCENT =  3200;
var YOUNGADULT =  4000;
var ADULT =       6000;
var MIDDLEAGE =   7600;
var SENIOR =      8800;
var ALMOSTDEAD =  9200;
var DIEING =      9400;

//Emotions
var NEUTRAL =   0;
var HAPPY =   1;
var UPSET =   2;
var CONTEMPLATIVE =   3;
var ANGRY =   4;
var CONTENT =   5;
var HOSTILE =   6;

var emotions = ["neutral", "happy", "upset", "contemplative", "angry", "content", "hostile"];

var health = ["healthy", "sore", "ailing", "wounded", "badly hurt"];

//HAPPY
//EXCITED
//TENDER
//SCARED
//ANGRY
//SAD

//EMOTION = {sad: ["down", "mopey", "grieved", "dejected", "depressed", "heartbroken"], 
  //angry: "annoyed", "resentful", "upset", "mad", "angry", "furious",
  //scared: "tense", "nervous", "anxious", "frightened", "panicked", "terrified"
  //tender: "kind", "touched", "sympathetic", "warm-hearted", "tender", "loving", "intimate"
  //excited: "antsy", "aroused", "energetic", "ecstatic", "manic"
  //happy: "pleased", "optimistic", "glad", "content", "fulfilled", "very happy"

//"vigilant", "anxious", "interested"
//"ecstatic", "joyful", "serene"
//"admiring", "trustful", "accepting"
//"terrorized", "afraid", "apprehensive"
//"amazed", "surprised", "distracted"
//"grieved", "sad", "pensive"
//"malicious", "hostile", "disgusted", "bored"
//"enraged", "angry", "annoyed"
// remorseful

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
  this.wanderWeight = .3;//.1;
  this.mateWeight = 0;
  this.wandertheta = 0;
  this.lastPregnant = 0;
  this.hungry = true;
  this.hunger = p5.random(0, 2);
  this.mateTheta = 0;
  this.bornAt = millis();
  this.alive = true;
  this.pregnant = false;
  this.emotion = Math.floor(random(0, 30));
  this.health = 0;
}


Body.prototype.update = function(bodies, m) {
  this.age ++;
  if ((this.age > 9400 || this.hunger > 10)) { 
    this.alive = false;
    this.causeOfDeath = this.hunger > 10 ? "hunger" : "old age";
  }

  if (this.hunger > 3 && this.r > 9) {
    //this.r -= .005;
  }

  this.personalContact(bodies);

  this.hunger += .005;

  //for (var i = 0; i < m.food.length; i++) {
    //var food = m.food[i];
    //if (food.location.dist(this.location) < food.r / 2 + this.r/2 + 2) {
      //this.eat(food);
    //}
  //}

  this.velocity.add(this.acceleration);
  this.velocity.limit(this.maxspeed);
  this.location.add(this.velocity);
  this.borders();
  this.acceleration.mult(0);
}

Body.prototype.runOnServer = function(bodies, m) {
  this.applyBehaviors(bodies, m);
  this.update(bodies, m);
}

Body.prototype.run = function(bodies, m) {
  this.applyBehaviors(bodies, m);
  this.update(bodies, m);
  this.display();
}

Body.prototype.applyForce = function(force) {
  // We could add mass here if we want A = F / M
  this.acceleration.add(force);
}

Body.prototype.applyBehaviors = function(bodies, m) {
  //this.mateWeight = 2.5 - this.hunger;
  //if (this.mateWeight < 0) { 
    //this.mateWeight = 0;
  //}
  //var mateDance = this.matingDance();
  if (this.age > CHILD) {
    var mateDance = this.matingDance();
    //var mateDance = this.seekFatest(bodies);
    if (mateDance) {
      this.mateWeight = p5.map(bodies.length, 0, 40, 3, 0);// - this.hunger/2;
      if (this.mateWeight < 0) { 
        this.mateWeight = 0;
      }
      mateDance.mult(this.mateWeight);
      this.applyForce(mateDance);
    }
  }

  if (this.hunger < 1) {
    //this.mateWeight = 1;
    this.hungry = false;
  } else {
    //this.mateWeight = 0;
    this.hungry = true;
  }

  //this.obstacleVector = this.obstacles(m);
  //this.obstacleVector.mult(4);
  //this.obstacleVector.mult(this.hungry ? this.hunger : 3);
  //this.applyForce(this.obstacleVector);

  var seekFoodVector = this.seekClosestFood(m);
  if (seekFoodVector) {
    seekFoodVector.mult(this.hunger > 2 ? this.hunger : 0);
    this.applyForce(seekFoodVector);
  }

  var gatherVector = this.gatherFood(m);
  gatherVector.mult(this.hungry ? this.hunger : 3);
  this.applyForce(gatherVector);

  //this.obstacleVector = this.obstacleSeparation(m);
  //this.obstacleVector.mult(this.hungry ? this.hunger : 3);
  //this.applyForce(this.obstacleVector);

  this.wanderVector = this.wander();
  this.wanderVector.mult(this.wanderWeight);
  this.applyForce(this.wanderVector);

  var sep = this.separate(bodies);
  var sepWeight = Math.max(2.5 - this.mateWeight, 0);
  sep.mult(sepWeight);
  this.applyForce(sep);

  if (this.emotion == HOSTILE) {
    var attackVector = this.bloodLust(bodies);
    if (attackVector) {
      attackVector.mult(2.5);
      this.applyForce(attackVector);
    }
  }
}

Body.prototype.display = function() {
  pushMatrix();
  translate(this.location.x, this.location.y);
  rotate(this.velocity.heading());

  if (this == toFollow) {
    noStroke();
    fill(0, 150, 255, 80);
    if (this.emotion == HOSTILE) { 
      fill(255, 0, 0, 100);
    }
    ellipse(0, 0, this.r+6, this.r+6);
  }
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

  //if (this.hunger > 5) {
  if (this.emotion == HOSTILE) {
    fill(200, 0, 0, 100);
    noStroke();
    ellipse(0, 0, this.r+3, this.r+3);
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


Body.prototype.eat = function(food) {
  //this.r += .005;
  this.r += .05;
  food.eat(this);
  //this.hunger -= .02;
  //this.hunger -= .5;
  this.hunger -= 1;
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
  if (this.age > 0 && this.age < INFANT) {
    return "infant";
  }

  else if (this.age > INFANT && this.age < TODDLER) {
    return "toddler";
  }
  else if (this.age > TODDLER && this.age < CHILD) {
    return "child";
  }
  else if (this.age > CHILD && this.age < ADOLESCENT) {
    return "adolescent";
  }
  else if (this.age > ADOLESCENT && this.age < YOUNGADULT) {
    return "young adult";
  }
  else if (this.age > YOUNGADULT && this.age < ADULT) {
    return "adult";
  }
  else if (this.age > ADULT && this.age < MIDDLEAGE) {
    return "middle-aged";
  }
  else if (this.age > MIDDLEAGE && this.age < SENIOR) {
    return "senior citizen";
  }
  else if (this.age > SENIOR && this.age < ALMOSTDEAD) {
    return "rapidly degenerating";
  }
  else if (this.age > ALMOSTDEAD) {
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

Body.prototype.personalContact = function(bodies) {
  for (var i = 0; i < bodies.length; i++) {
    var b = bodies[i];
    if (this != b && this.location.dist(b.location) < 10 ) {
      if (this.emotion == HOSTILE) {
        b.alive = false;
        b.causeOfDeath = "vermecide";
        Log(this.name + " has viciously attacked and murdered " + b.name);
        this.hunger --;
      }
      if (this.emotion != HOSTILE && b.emotion != HOSTILE && millis() - this.lastPregnant > 1000 && this.age > ADOLESCENT && this.age < MIDDLEAGE && random(1) > .5) {
        Log(this.name + " and " + b.name + " have mated!");
        this.pregnant = true;
        this.lastPregnant = millis();
      }
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

Body.prototype.bloodLust = function(bodies) {
  var target = false;
  var closest = 0;
  for (var i = 0; i < bodies.length; i++) {
    var b = bodies[i];
    var dist = this.location.dist(b.location)
    if (b != this && dist < 100) {
      target = b.location;
      closest = dist;
    }
  }
  if (target) {
    return this.seek(target);
  } else {
    return false;
  }
}

Body.prototype.seekFatest = function(bodies) {
  var target = false;//new PVector();
  var largestBody = 0;
  for (var i = 0; i < bodies.length; i++) {
    var b = bodies[i];
    if (b.emotion != HOSTILE && b.age > CHILD && b != this && b.r > largestBody && this.location.dist(b.location) < 100) {
      target = b.location;
      largestBody = b.r;
    }
  }
  if (target) {
    return this.seek(target);
  } else {
    return false;
  }
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

Body.prototype.obstacles = function(m) {
  var steerV = new PVector();
  var target = PVector.add(this.location, this.velocity.mult(10));//velocity.get();
  var food = m.blocked(target.x, target.y);

  if (food && this.hungry) {
    var desired = PVector.sub(this.location, target);
    steerV = PVector.sub(desired, this.velocity);
    steerV.limit(this.maxforce);
  }
  return steerV;
}


Body.prototype.seekClosestFood = function(m) {
  var target = false;
  var sep = 200;
  var closest = 10000;

  for (var i = 0; i < m.food.length; i++) {
    var food = m.food[i];
    var distance = food.location.dist(this.location); 
    if (distance < sep && distance < closest) {
      closest = distance;
      target = food.location; 
    }
  }

  if (target) {
    return this.seek(target);
  } else { 
    return false;
  }

}

Body.prototype.gatherFood = function(m) {
  var steerV = new PVector();
  var desired = new PVector();
  var sep = this.r;
  var sum = new PVector();
  var count = 0;

  for (var i = 0; i < m.food.length; i++) {
    var food = m.food[i];
    var distance = food.location.dist(this.location); 
    if (distance < sep) {
      var diff;
      if (this.hungry) {
        diff = PVector.sub(food.location, this.location);
      }
      else {
        diff = PVector.sub(this.location, food.location);
      }
      diff.normalize();
      diff.div(distance); // Weight by distance
      sum.add(diff);
      count++;
    }

    if (this.hungry && distance < food.r / 2 + this.r/2 + 2) {
      this.eat(food);
    }
    //if (distance < food.r / 2 + this.r/2) {
      //this.velocity = this.velocity.mult(-1);
    //}
  }

  if (count > 0) {
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

Body.prototype.obstacleSeparation = function(m) {
  var steerV = new PVector();
  var desired = new PVector();
  var sep = this.r;
  var sum = new PVector();
  var count = 0;

  for (var x = parseInt(this.location.x - sep/2); x < this.location.x + sep/2; x ++) {
    for (var y = parseInt(this.location.y - sep/2); y < this.location.y + sep/2; y ++) {
      var food = m.blocked(x, y);
      if (dist(this.location.x, this.location.y, x, y) < sep/2 && food) {
        var tempV = new PVector(x,y);
        var d = PVector.dist(this.location, tempV);
        var diff;
        if (this.hungry) {
          diff = PVector.sub(tempV, this.location);
          //this.eat(food);
        }
        else {
          diff = PVector.sub(this.location, tempV);
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
