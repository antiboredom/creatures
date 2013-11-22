function Food(x, y, r) {
  this.location = new PVector(x, y);
  this.age = 0;
  if (typeof r != "undefined") this.r = r;
  else this.r = 1;
  this.lastEaten = 0;
  this.growRate = random(.3, 1);
}

Food.prototype.update = function() {
  this.age ++;
  this.grow();
};


Food.prototype.run = function() {
  this.update();
  this.display();
};

Food.prototype.display = function() {
  stroke(200, 200, 0, 60);
  //strokeWeight(25);
  fill(0, 200, 0, 100);
  ellipse(this.location.x, this.location.y, this.r, this.r);
  noStroke();
  strokeWeight(1);
};

Food.prototype.eat = function() {
  this.r -= .3;
  this.lastEaten = millis();
};

Food.prototype.grow = function() {
  if (this.r > 2 && millis() - this.lastEaten > 1000) {
    this.lastEaten = millis();
    this.r += this.growRate;
  }
};

Food.prototype.seed = function() {

};

if (typeof isServer != 'undefined' && isServer == true) {
  module.exports = Food;
}

