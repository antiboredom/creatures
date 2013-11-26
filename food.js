var OWNER = 0;
var ENFORCER = 1;
var WORKER = 2;
var RIPE = 1000;

function Food(x, y, r) {
  this.location = new PVector(x, y);
  this.age = 0;
  if (typeof r != "undefined") this.r = r;
  else this.r = 1;
  //this.lastGrown = millis();
  this.growRate = Math.abs(noise.perlin2(x/500,y/500)) * 5 + 2;//random(2, 4));
  this.eatenBy = false;
  this.ownedBy = x < width/2 ? OWNER : WORKER;
  //this.coords = [];
  //this.setCoords();
}

Food.prototype.update = function(m) {
  if (this.age < RIPE) this.age += this.growRate;
};

Food.prototype.ripe = function() {
  return this.age >= RIPE ? true : false;
};

Food.prototype.run = function(m) {
  this.update(m);
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
      Log(body.name + " has stolen food from Master's land.", "theft");
      Log(body.name + " has been targeted by the Police.", "theft");
    }
  }
}

Food.prototype.display = function() {
  noStroke();
  fill(151, this.ownedBy == WORKER ? 180 : 231, 140);//0, 200, 0, 100);
  var r = p5.map(this.age, 0, RIPE, 1, this.r + 8);
  ellipse(this.location.x, this.location.y, r, r);
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

