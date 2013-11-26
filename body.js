if (typeof isServer != 'undefined' && isServer == true) {
  random = p5.random;
  PVector = p5.PVector;
  millis = p5.millis;
  cos = p5.cos;
  sin = p5.sin;
  println = p5.println;
  dist = p5.dist;
  color = p5.color;
} else {
  var roleColors = [color(43, 255, 0), color(255, 0, 0), color(217, 217, 217)];
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

var OWNER = 0;
var ENFORCER = 1;
var WORKER = 2;

var roles = ["owner", "enforcer", "worker"];

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
  var classRoll = random();
  if (classRoll <= .1) this.type = OWNER;
  else if (classRoll > .1 && classRoll < .2) this.type = ENFORCER;
  else this.type = WORKER;

  this.r = 10;
  this.location = new PVector(x, y);
  this.maxspeed = this.type == ENFORCER ? 2 : 1;//p5.random(1, 2);
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
  this.emotion = 0;//Math.floor(random(0, 30));
  this.health = 0;
  this.targetedIndividual = false;
  this.matedWith = false;
  this.carrying = false;
  this.gender = random() < .5 ? -1 : 1;
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
  //if (this.type == WORKER && this.age < CHILD && Math.floor(this.location.x % m.foodSize) == 0 && Math.floor(this.location.y % m.foodSize) == 0) {
  //if (this.type == WORKER && this.age < CHILD && m.shouldPlant(this.location)) {
  if (m.shouldPlant(this.location)) {
    m.plant(this.location);
  }

  this.hunger += .003;

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
  this.mateWeight = 0;
  if (this.age > CHILD) {
    if (this.type == OWNER) {
      var mateDance = this.seekFatest(bodies);
    } else {
      var mateDance = this.matingDance();
    }
    if (mateDance) {
      this.mateWeight = p5.map(bodies.length, 0, 40, 3, 0);// - this.hunger/2;
      //if (this.type == WORKER) this.mateWeight = 3;
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

  this.farmWeight = 0;
  var farmWeight = Math.abs(3 - this.hunger) * p5.map(m.food.length, 0, 350, 3, .5);
  if (this.type == WORKER && farmWeight > 2) {
    var farmVector = this.seekClosestSeed(m);
    if (farmVector) {
      farmVector.mult(farmWeight);
      this.applyForce(farmVector);
      this.farmWeight = farmWeight;
    }
  }

  var seekFoodVector = this.seekClosestFood(m);
  this.seekFoodWeight = 0;
  if (seekFoodVector) {
    this.seekFoodWeight = this.hunger > 2 ? this.hunger : 0;
    seekFoodVector.mult(this.seekFoodWeight);
    this.applyForce(seekFoodVector);
  }

  var gatherVector = this.gatherFood(m);
  this.gatherWeight = this.hungry ? this.hunger : 3; 
  gatherVector.mult(this.gatherWeight);
  this.applyForce(gatherVector);

  this.wanderVector = this.wander();
  this.wanderVector.mult(this.wanderWeight);
  this.applyForce(this.wanderVector);

  var sep = this.separate(bodies);
  this.sepWeight = Math.max(2.5 - this.mateWeight, 0);
  sep.mult(this.sepWeight);
  this.applyForce(sep);

  this.attackWeight = 0;
  if (this.type == ENFORCER) {
    var attackVector = this.bloodLust(bodies);
    if (attackVector) {
      this.emotion = HOSTILE;
      this.attackWeight = 2.5;
      attackVector.mult(this.attackWeight);
      this.applyForce(attackVector);
    } else {
      this.attackWeight = 0;
      this.emotion = 0;
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
  //role color
  //strokeWeight(1);
  noStroke();
  fill(roleColors[this.type]);
  ellipse(0, 0, this.r+3, this.r+3);

  //base
  fill(100);
  ellipse(0, 0, this.r, this.r);

  //tail
  noStroke();
  //fill(rollColors[this.type]);
  fill(255, 0, 0);
  var vel = this.velocity.mag() * 10;
  ellipse(-vel, 0, 3, 3);
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
    text(this.name + " the " + this.role(), this.location.x + this.r, this.location.y);
    textSize(9);
    text(this.hungerToS() + " " + this.ageToS(), this.location.x + this.r, this.location.y + 12);
    text("wants to " + this.desireToS(), this.location.x + this.r, this.location.y + 24);
  }
}


Body.prototype.eat = function(food) {
  this.r += .05;
  food.eat(this);
  this.hunger -= 1;
}


Body.prototype.steer = function(desired) {
  desired.normalize();
  desired.mult(this.maxspeed);
  var steerV = PVector.sub(desired, this.velocity);
  steerV.limit(this.maxforce);
  return steerV;
}

Body.prototype.role = function() {
  return roles[this.type];
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

Body.prototype.desireToS = function() {
  var desireNames = ["mate", "eat", "farm", "attack", "wander"];
  var desires = [[this.mateWeight, "mate"], [this.seekFoodWeight, "eat"], [this.farmWeight, "farm"], [this.attackWeight, "kill"], [this.wanderWeight, "wander"]].sort(function(a,b) { return b[0] - a[0] }); 
  return desires[0][1] + " and " + desires[1][1];
  //return "mate: " + this.mateWeight + " eat " + this.seekFoodWeight +  " farm: " + this.farmWeight + " kill " + this.attackWeight + " wander " + this.wanderWeight
};

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
      if (this.emotion == HOSTILE && b.type == WORKER) {
        //Log(this.name + " has viciously attacked and murdered " + b.name);
        this.hunger --;
        b.r --;
        if (b.r < 1) {
          b.alive = false;
          b.causeOfDeath = "vermecide";
          Log(this.name + " has viciously attacked and murdered " + b.name, "murder");
        }
      }
      if (b.type == this.type && this.emotion != HOSTILE && b.emotion != HOSTILE && millis() - this.lastPregnant > 1000 && this.age > ADOLESCENT && this.age < MIDDLEAGE && random(1) > .5) {
        Log(this.name + " and " + b.name + " have mated!", "sex");
        this.pregnant = true;
        this.matedWith = b;
        this.lastPregnant = millis();
      }
    }
  }
}


Body.prototype.matingDance = function() {
  var target = new PVector(width/2 + cos(this.r + this.mateTheta) * (width/4 + this.mateTheta*10), height/2 + sin(this.r + this.mateTheta) * (height/4 + this.mateTheta*10));
  this.mateTheta += .01 * this.gender;
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
    if (b != this && b.targetedIndividual && dist < 100) {
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
    if (b.emotion != HOSTILE && b.age > CHILD && b.age < SENIOR && b != this && b.r > largestBody && this.location.dist(b.location) < 200 && b.type == this.type) {
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
  //this.wandertheta += random(-change, change); // Randomly change wander theta
  this.wandertheta += noise.perlin2((this.location.x + this.r)/1000, (this.location.y + this.age/1000)/1000) * 10;
  //this.wandertheta += .2;

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


Body.prototype.seekClosestSeed = function(m) {
  var target = false;
  var sep = 300;
  var closest = 10000;

  for (var x = 0; x < m.grid.length; x++) {
    for (var y = 0; y < m.grid[0].length; y++) {
      if (m.grid[x][y] == true) {
        var tempV = new PVector(x*m.foodSize, y*m.foodSize);
        var distance = this.location.dist(tempV);
        if (distance < sep && distance < closest) {
          closest = distance;
          target = tempV;
        }
        if (distance < this.r) {
          var food = new Food(x*m.foodSize, y*m.foodSize, m.foodSize);
          m.grid[x][y] = food;
          m.food.push(food);
          //Log(this.name + " plants a seed.", "farm");
        }
      }
    }
  }

  if (target) {
    return this.seek(target);
  } else { 
    return false;
  }

}

Body.prototype.seekClosestFood = function(m) {
  var target = false;
  var sep = 200;
  var closest = 10000;

  for (var i = 0; i < m.food.length; i++) {
    var food = m.food[i];
    if (food.ripe()) {
      var distance = food.location.dist(this.location); 
      if (distance < sep && distance < closest) {
        closest = distance;
        target = food.location; 
      }
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
    if (distance < sep && food.ripe()) {
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

    if (food.ripe() && distance < food.r / 2 + this.r/2 + 2) {
      if (this.hungry) { this.eat(food); }
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
