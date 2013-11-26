var OWNER = 0;
var ENFORCER = 1;
var WORKER = 2;

function Food(x, y, r) {
  this.location = new PVector(x, y);
  //this.age = 1000;
  if (typeof r != "undefined") this.r = r;
  else this.r = 1;
  //this.lastGrown = millis();
  //this.growRate = random(.1, .3);
  this.eatenBy = false;
  this.ownedBy = x < width/2 ? OWNER : WORKER;
  //this.coords = [];
  //this.setCoords();
}

Food.prototype.update = function(m) {
  //this.age ++;
  //this.grow(m);
};


Food.prototype.run = function(m) {
  //this.update(m);
  this.display();
};

Food.prototype.setCoords = function() {
  for (var x = 0; x < this.r; x+=10) {
    for (var y = 0; y < this.r; y+=10) {
      if (random() < .5) this.coords.push([x, y]);
    }
  }
};

Food.prototype.checkPermissions = function(body) {
  if (body.type == WORKER && this.ownedBy != WORKER) {
    if (!body.targetedIndividual) {
      body.targetedIndividual = true;
      Log(body.name + " has stolen food from Master's land.");
      Log(body.name + " has been targeted by the Police.");
    }
  }
}

Food.prototype.display = function() {
  //noStroke();
  //fill(0, 200, 0, 100);
  //rectMode(CENTER);
  ////rect(this.location.x, this.location.y, this.r, this.r);
  //pushMatrix();
  //translate(this.location.x, this.location.y);
  ////rect(this.location.x, this.location.y, this.r, this.r);
  ////for (var x = 0; x < this.r; x+=10) {
    ////for (var y = 0; y < this.r; y+=10) {
      ////rect(x,y,10,10);
    ////}
  ////}
  //beginShape();
  //for (var i = 0; i < this.coords.length; i++) {
    ////vertex(this.coords[i][0], this.coords[i][1]);
    //rect(this.coords[i][0], this.coords[i][1], 10, 10);
  //}
  //endShape(CLOSE);
  //popMatrix();


  //strokeWeight(1);
  //fill(0, 200, 0, 100);
  //rectMode(CENTER);
  noStroke();
  fill(151, this.ownedBy == WORKER ? 180 : 231, 140);//0, 200, 0, 100);
  ellipse(this.location.x, this.location.y, this.r + 8, this.r + 8);
  //ellipse(this.location.x, this.location.y, this.r/3, this.r/3);
  //if (this.eatenBy) {
    //strokeWeight(3);
    //stroke(0);
    //line(this.location.x, this.location.y, this.eatenBy.location.x, this.eatenBy.location.y);
    //this.eatenBy = false;
  //}
};

Food.prototype.eat = function(body) {
  this.eatenBy = body;
  //this.r -= .5;
  //this.lastEaten = millis();
};

Food.prototype.grow = function(m) {
  if (m.food.length < 300) {
  //if (millis() - this.lastGrown > 6000 && random(1) < .001) {
    //this.lastGrown = millis();

    var dir = Math.floor(random(1, 4));
    var growX = this.location.x - this.r;
    var growY = this.location.y;
    if (dir == 1) {
      growX = this.location.x;
      growY = this.location.y - this.r;
    } else if (dir == 2) {
      growX = this.location.x + this.r;
      growY = this.location.y;
    } else if (dir == 3) {
      growX = this.location.x;
      growY = this.location.y + this.r;
    }
    m.food.push(new Food(growX, growY, m.foodSize));// + random(1, 5)));
  }
  //var growX = this.location.x + random(1) > .5 ? this.r : this.r * -1;
  //var growY = this.location.y + random(1) > .5 ? this.r : this.r * -1;
  //m.food.push(new Food(growX, growY, this.r));
};

Food.prototype.seed = function() {

};

if (typeof isServer != 'undefined' && isServer == true) {
  module.exports = Food;
}

