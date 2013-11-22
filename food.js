function Food(x, y, r) {
  this.location = new PVector(x, y);
  this.age = 1000;
  if (typeof r != "undefined") this.r = r;
  else this.r = 1;
  this.lastEaten = 0;
  this.growRate = random(.3, 1);
  //this.coords = [];
  //this.setCoords();
}

Food.prototype.update = function() {
  this.age ++;
  this.grow();
};


Food.prototype.run = function() {
  this.update();
  this.display();
};

Food.prototype.setCoords = function() {
  for (var x = 0; x < this.r; x+=10) {
    for (var y = 0; y < this.r; y+=10) {
      if (random() < .5) this.coords.push([x, y]);
    }
  }
};

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


  stroke(200, 200, 0, 60);
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
  if (this.r > 2 && millis() - this.lastEaten > 500) {
    this.lastEaten = millis();
    this.r += this.growRate;
  }
};

Food.prototype.seed = function() {

};

if (typeof isServer != 'undefined' && isServer == true) {
  module.exports = Food;
}

