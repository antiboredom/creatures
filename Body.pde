class Body {
  PVector location, velocity, acceleration;
  PVector wanderVector, seekVector, obstacleVector;
  float r, maxforce, maxspeed;
  float obstacleWeight = 1.3, seekWeight = .1, wanderWeight = .1, mateWeight = 0;
  float wandertheta = 0;
  String name;
  boolean hungry = true;
  float hunger = random(0, 2);
  float mateTheta = 0;
  int age = 0;
  int bornAt = millis();
  boolean alive = true;
  boolean pregnant = false;
  int lastPregnant = 0;

  Body(float x, float y, String _name) {
    r = 10;
    location = new PVector(x, y);
    maxspeed = random(1, 2);
    maxforce = .1;
    acceleration = new PVector(0, 0);
    velocity = new PVector(0, 0);
    name = _name;
  }

  void update() {
    age ++;
    if ((age > 4800 || hunger > 10) && random(1) > .5 && toFollow != this) { 
      alive = false;
    }


    velocity.add(acceleration);
    velocity.limit(maxspeed);
    location.add(velocity);
    borders();
    acceleration.mult(0);
  }

  void display() {
    pushMatrix();
    translate(location.x, location.y);
    rotate(velocity.heading2D());

    //body
    noStroke();
    //fill(100, map(age, 0, 4800, 100, 130), 100);
    fill(100);
    ellipse(0, 0, r, r);

    //tail
    fill(255, 0, 0);
    float vel = velocity.mag() * 10;
    ellipse(-vel, 0, 2, 2);
    stroke(100);
    line(-r/2, 0, -vel, 0);

    //eyes
    fill(255);
    ellipse(2, -3, 4, 4);
    ellipse(2, 3, 4, 4);

    if (hunger > 5) { 
      fill(200, 0, 0, 100); 
      noStroke();
      ellipse(0, 0, r+3, r+3);
    }

    if (this == toFollow) {
      noStroke();
      fill(0, 150, 255, 100);
      if (hunger > 5) { 
        fill(255, 0, 0, 100);
      }
      ellipse(0, 0, r+6, r+6);
    }

    popMatrix();

    if (this == toFollow || showAllLabels) {
      fill(50);
      textSize(10);
      //text(name + "\n" + hungerToS() + " " + ageToS(), location.x + r, location.y);
      text(name, location.x + r, location.y);
      textSize(9);
      text(hungerToS() + " " + ageToS(), location.x + r, location.y + 12);
    }
  }

  void run() {
    applyBehaviors();
    update();
    display();
  }

  void eat(int x, int y) {
    r += .005;
    m.clearPixel(x, y);
    hunger -= .01;
  }

  void applyForce(PVector force) {
    // We could add mass here if we want A = F / M
    acceleration.add(force);
  }

  void applyBehaviors() {

    mateWeight = 2.5 - hunger;
    if (mateWeight < 0) { 
      mateWeight = 0;
    }
    PVector mateDance = matingDance();
    mateDance.mult(mateWeight);
    applyForce(mateDance);

    mate();

    hunger += .005;

    if (hunger < 1) {
      mateWeight = 1;
      hungry = false;
    } 
    else {
      mateWeight = 0;
      hungry = true;
    }


    obstacleVector = obstacleSeparation();
    obstacleVector.mult(hungry ? hunger : 3);
    applyForce(obstacleVector);

    wanderVector = wander();
    wanderVector.mult(wanderWeight);
    applyForce(wanderVector);

    PVector sep = separate();
    sep.mult(2.5 - mateWeight);
    applyForce(sep);
  }

  PVector steer(PVector desired) {

    desired.normalize();
    desired.mult(maxspeed);
    PVector steerV = PVector.sub(desired, velocity);
    steerV.limit(maxforce);
    return steerV;
  }

  String hungerToS() {
    String toReturn = "satisfied";
    if (hunger > 1 && hunger < 2) {
      return "peckish";
    } 
    else if (hunger > 2 && hunger < 3) {
      return "hungry";
    } 
    else if (hunger > 3 && hunger < 4) {
      return "famished";
    }
    else if (hunger > 4) {
      toReturn = "starving";
    }

    return toReturn;
  }

  String ageToS() {
    String toReturn = "new born";
    if (age > 0 && age < 400) {
      return "infant";
    } 

    else if (age > 400 && age < 800) {
      return "toddler";
    }
    else if (age > 800 && age < 1200) {
      return "child";
    }
    else if (age > 1200 && age < 1600) {
      return "adolescent";
    }
    else if (age > 1600 && age < 2000) {
      return "young adult";
    }
    else if (age > 2000 && age < 3000) {
      return "adult";
    }
    else if (age > 3000 && age < 3800) {
      return "middle-aged";
    }
    else if (age > 3800 && age < 4400) {
      return "senior citizen";
    }
    else if (age > 4400 && age < 4600) {
      return "rapidly degenerating";
    }
    else if (age > 4600) {
      return "ready to die";
    }


    return toReturn;
  }

  void go(String dir) {
    if (dir == "up") {
      applyForce(new PVector(0, -10));
    }
    if (dir == "down") {
      applyForce(new PVector(0, 10));
    }
    if (dir == "left") {
      applyForce(new PVector(-10, 0));
    }
    if (dir == "right") {
      applyForce(new PVector(10, 0));
    }
  }

  void mate() {
    for (Body b : bodies) {
      if (millis() - lastPregnant > 1000 && millis() - bornAt > 10000 && b != this && location.dist(b.location) < 10 && random(1) > .5) {
        println(name + " and " + b.name + " have mated!");
        pregnant = true;
        lastPregnant = millis();
      }
    }
  }


  PVector matingDance() {
    PVector target = new PVector(width/2 + cos(r + mateTheta) * (width/4 + mateTheta*10), height/2 + sin(r + mateTheta) * (height/4 + mateTheta*10));
    mateTheta += .01;
    return seek(target);
  }

  PVector seekFarthest() {
    float longestDistance = 0;
    Body target = bodies.get(0);
    for (Body b : bodies) {
      if (b != this) {
        float d = location.dist(b.location);
        if (d > longestDistance) { 
          longestDistance = d;
          target = b;
        }
      }
    }
    return seek(target.location);
  }

  PVector seekFatest() {
    PVector target = new PVector();
    float largestBody = 0;
    for (Body b : bodies) {
      if (b != this && b.r > largestBody && location.dist(b.location) < 100) {
        target = b.location;
        largestBody = b.r;
      }
    }
    return seek(target);
  }


  PVector seek(PVector target) {
    PVector desired = PVector.sub(target, location);
    return steer(desired);
  }

  PVector wander() {
    float wanderR = 30;         // Radius for our "wander circle"
    float wanderD = 80;         // Distance for our "wander circle"
    float change = 0.3;
    wandertheta += random(-change, change); // Randomly change wander theta

    // Now we have to calculate the new location to steer towards on the wander circle
    PVector circleloc = velocity.get();    // Start with velocity
    circleloc.normalize();                 // Normalize to get heading
    circleloc.mult(wanderD);               // Multiply by distance
    circleloc.add(location);               // Make it relative to boid's location
    float h = velocity.heading2D();        // We need to know the heading to offset wandertheta

    PVector circleOffSet = new PVector(wanderR * cos(wandertheta + h), wanderR * sin(wandertheta + h));
    PVector target = PVector.add(circleloc, circleOffSet);
    return seek(target);
  }

  PVector obstacles() {
    PVector steerV = new PVector();
    PVector target = PVector.add(location, velocity);//velocity.get();

    if (m.blocked(target)) {
      PVector desired = PVector.sub(location, target);
      steerV = PVector.sub(desired, velocity);
      steerV.limit(maxforce);
    }    
    return steerV;
  }

  PVector obstacleSeparation() {
    PVector steerV = new PVector();
    PVector desired = new PVector();
    float sep = r;
    PVector sum = new PVector();
    int count = 0;

    for (int x = int(location.x - sep/2); x < location.x + sep/2; x ++) {
      for (int y = int(location.y - sep/2); y < location.y + sep/2; y ++) {
        if (dist(location.x, location.y, x, y) < sep/2 && m.blocked(x, y)) {
          float d = PVector.dist(location, new PVector(x, y));
          PVector diff;
          if (hungry) {
            diff = PVector.sub(new PVector(x, y), location);
            eat(x, y);
          } 
          else {
            diff = PVector.sub(location, new PVector(x, y));
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
      sum.mult(maxspeed);
      steerV = PVector.sub(sum, velocity);
      steerV.limit(maxforce);
      //obstacleWeight = 3;
      //wanderWeight = 1;
    } 
    else {
      //obstacleWeight = 0.0;
      //wanderWeight = .1;
    }

    return steerV;
  }

  //  PVector avoid() {
  //    PVector steer  = new PVector();    
  //    float sep = r*2;
  //
  //    for (int x = int(location.x - sep); x < location.x + sep; x ++) {
  //      for (int y = int(location.y - sep); y < location.y + sep; y ++) {
  //        if (m.blocked(x, y)) {
  //          // Distance between object and avoidance sphere
  //          float distance = PVector.dist(location, new PVector(x, y));
  //          if (distance < 1) {
  //            obstacleWeight = 10.0;
  //            wanderWeight = 0.1;
  //            if (distance < collision*collision) {
  //              steer = PVector.sub(pos, obj.pos);
  //              steer.mult(maxforce*0.1);
  //              return steer;
  //            }
  //            else {
  //              float direction = dist2(obj.pos, PVector.add(pos, vel));
  //              // If is heading toward obstacle
  //              if (direction < distance) {
  //                // If steering in the verticle direction
  //                if (abs(vel.x) <= abs(vel.y)) {   
  //                  steer = new PVector((pos.x - obj.pos.x), vel.y);
  //                  steer.mult(maxforce*((bound*bound)/distance)*0.001);
  //                }
  //                // If steering in the horizontal direction
  //                else {
  //                  steer = new PVector(vel.x, (pos.y - obj.pos.y));
  //                  steer.mult(maxforce*((bound*bound)/distance)*0.001);
  //                }
  //              }
  //            }
  //          }
  //        }
  //      }
  //    }
  //    return steer;
  //  }



  void flock() {
    PVector sep = separate();   // Separation
    PVector ali = align();      // Alignment
    PVector coh = cohesion();   // Cohesion
    // Arbitrarily weight these forces
    sep.mult(1.5);
    ali.mult(1.0);
    coh.mult(1.0);
    // Add the force vectors to acceleration
    applyForce(sep);
    applyForce(ali);
    applyForce(coh);
  }


  // Separation
  // Method checks for nearby boids and steers away
  PVector separate () {
    float desiredseparation = 25.0f;
    PVector steerV = new PVector(0, 0, 0);
    int count = 0;
    // For every boid in the system, check if it's too close
    for (Body other : bodies) {
      float d = PVector.dist(location, other.location);
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if ((d > 0) && (d < desiredseparation)) {
        // Calculate vector pointing away from neighbor
        PVector diff = PVector.sub(location, other.location);
        diff.normalize();
        diff.div(d);        // Weight by distance
        steerV.add(diff);
        count++;            // Keep track of how many
      }
    }
    // Average -- divide by how many
    if (count > 0) {
      steerV.div((float)count);
    }

    // As long as the vector is greater than 0
    if (steerV.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steerV.normalize();
      steerV.mult(maxspeed);
      steerV.sub(velocity);
      steerV.limit(maxforce);
    }
    return steerV;
  }

  // Alignment
  // For every nearby boid in the system, calculate the average velocity
  PVector align () {
    float neighbordist = 50;
    PVector sum = new PVector(0, 0);
    int count = 0;
    for (Body other : bodies) {
      float d = PVector.dist(location, other.location);
      if ((d > 0) && (d < neighbordist)) {
        sum.add(other.velocity);
        count++;
      }
    }
    if (count > 0) {
      sum.div((float)count);
      sum.normalize();
      sum.mult(maxspeed);
      PVector steerV = PVector.sub(sum, velocity);
      steerV.limit(maxforce);
      return steerV;
    } 
    else {
      return new PVector(0, 0);
    }
  }

  // Cohesion
  // For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
  PVector cohesion () {
    float neighbordist = 50;
    PVector sum = new PVector(0, 0);   // Start with empty vector to accumulate all locations
    int count = 0;
    for (Body other : bodies) {
      float d = PVector.dist(location, other.location);
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


  void borders() {
    if (location.x < -r) location.x = width+r;
    if (location.y < -r) location.y = height+r;
    if (location.x > width+r) location.x = -r;
    if (location.y > height+r) location.y = -r;
  }
}

//class Food extends Body {
//
//  Food(float x, float y) {
//    super(x, y);
//  }
//
//  void applyBehaviors() {
//  }
//}

