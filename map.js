function Map(w, h, withFood) {
  this.w = w;
  this.h = h;
  this.cellsize = 70;
  this.foodSize = Math.floor(this.cellsize/5);
  this.rows = width/this.cellsize;
  this.cols = width/this.cellsize;
  this.food = [];
  this.grid = [];
  if (withFood) {
    this.plantFood();
  }
}

Map.prototype.plantFood = function() {
  var foodSize = this.foodSize;

  for (var x = 0; x < this.w; x+=this.cellsize) {
    for (var y = 0; y < this.h; y+=this.cellsize) {
      var rand = random();
      for (var x1 = x; x1 < this.cellsize + x; x1+=foodSize) {
        for (var y1 = y; y1 < this.cellsize + y; y1+=foodSize) {
          if (typeof this.grid[x1/foodSize] == "undefined") this.grid[x1/foodSize] = [];
          var plantable = Math.abs(noise.perlin2(x1/500, y1/500)) < .07;
          this.grid[x1/foodSize][y1/foodSize] = plantable;
          if (rand < .1 && plantable === true) {
          //if (plantable === true) {
            var f = new Food(x1, y1, foodSize);
            f.age = 800;
            //f.ownedBy = Math.abs(noise.perlin2(x1/500, y1/500)) < .05 ? 0 : 2;
            this.grid[x1/foodSize][y1/foodSize] = f;
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

Map.prototype.shouldPlant = function(loc) {
  return false;
  var x = Math.floor(loc.x/this.foodSize);
  var y = Math.floor(loc.y/this.foodSize);
  //if (typeof this.grid[x] != "undefined") Log(this.grid[x][y]);
  if (this.grid[x] && this.grid[x][y]) {
    for (var i = 0; i < this.food.length; i++) {
      if (this.food[i].location.x == x && this.food[i].location.y == y) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
};

Map.prototype.grow = function(food) {
  var l = food.location;
  var x = l.x / this.foodSize;
  var y = l.y / this.foodSize
  if (this.grid[x] && this.grid[x+1][y]) {
    this.plant((x+1) * this.foodSize, y * this.foodSize, this.foodSize);
  }
}

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
      this.grid[Math.floor(this.food[i].location.x / this.foodSize)][Math.floor(this.food[i].location.y / this.foodSize)] = true;
      this.food.splice(i, 1);
    }
  }
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
