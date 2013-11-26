function Map(w, h, withFood) {
  this.w = w;
  this.h = h;
  this.cellsize = 70;
  this.foodSize = this.cellsize/5;
  this.rows = width/this.cellsize;
  this.cols = width/this.cellsize;

  this.bg = p5.color(240);
  this.food = [];
  if (withFood) {
    this.plantFood();
  }
}

Map.prototype.plantFood = function() {
  var foodSize = this.foodSize;
  for (var x = 0; x < this.w; x+=this.cellsize) {
    for (var y = 0; y < this.h; y+=this.cellsize) {
      if (random() < .1) {
        for (var x1 = x; x1 < this.cellsize + x; x1+=foodSize) {
          for (var y1 = y; y1 < this.cellsize + y; y1+=foodSize) {
            var f = new Food(x1, y1, foodSize);// + random(1, 5));
            f.age = 1000;
            this.food.push(f);
          }
        }
      }
    }
  }
};

Map.prototype.plant = function(loc) {
  this.food.push(new Food(loc.x, loc.y, this.foodSize));
};

Map.prototype.run = function() {
  this.update();
  this.display();
};

Map.prototype.update = function() {
  for (var i = 0; i < this.food.length; i++) {
    this.food[i].update(this);
    if (this.food[i].eatenBy) {
      this.food[i].checkPermissions(this.food[i].eatenBy);
      //if (this.food[i].r < 1) {
      this.food.splice(i, 1);
    }
  }

  //if (random(1) < .03) {
    //var i = Math.floor(random(this.food.length)) - 1;
    //var f = this.food[i];

    ////this.food.push(new Food(random(width), random(height), this.foodSize));
    //var dir = Math.floor(random(1, 4));
    //var growX = f.location.x - f.r;
    //var growY = f.location.y;
    //if (dir == 1) {
      //growX = f.location.x;
      //growY = f.location.y - f.r;
    //} else if (dir == 2) {
      //growX = f.location.x + f.r;
      //growY = f.location.y;
    //} else if (dir == 3) {
      //growX = f.location.x;
      //growY = f.location.y + f.r;
    //}
    //this.food.push(new Food(growX, growY, this.foodSize));// + random(1, 5)));
  //}
};

Map.prototype.bodiesEatFood = function(bodies) {

}

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
