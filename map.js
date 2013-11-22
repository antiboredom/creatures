function Map(w, h, withFood) {
  this.w = w;
  this.h = h;
  this.cellsize = 60;
  this.rows = width/this.cellsize;
  this.cols = width/this.cellsize;

  this.bg = p5.color(240);
  this.food = [];
  if (withFood) {
    this.plantFood();
  }
}

Map.prototype.plantFood = function() {
  for (var x = 0; x < this.w; x+=this.cellsize) {
    for (var y = 0; y < this.h; y+=this.cellsize) {
      if (random() < .2) {
        this.food.push(new Food(x, y, this.cellsize));
      }
    }
  }
};

Map.prototype.plant = function(loc) {
  this.food.push(new Food(loc.x, loc.y, 3));
};

Map.prototype.run = function() {
  this.update();
  this.display();
};

Map.prototype.update = function() {
  for (var i = 0; i < this.food.length; i++) {
    this.food[i].update();
    if (this.food[i].r < 1) {
      this.food.splice(i, 1);
    }
  }
};

Map.prototype.display = function() {
  for (var i = 0; i < this.food.length; i++) {
    this.food[i].display();
  }
};

Map.prototype.blocked = function(x, y) {
  var toReturn = false;
  for (var i = 0; i < this.food.length; i++) {
    if (p5.dist(this.food[i].location.x, this.food[i].location.y, x, y) < this.food[i].r) {
      toReturn = this.food[i];
    }
  }
  return toReturn;
};

if (typeof isServer != 'undefined' && isServer == true) {
  module.exports = Map;
}
