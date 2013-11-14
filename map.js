function Map(w, h) {
  this.coords = [];
  this.cellsize = 60;
  this.bg = color(240);
  this.w = w;
  this.h = h;
  this.rows = width/this.cellsize;
  this.cols = width/this.cellsize;
  this.buffer = createGraphics(w, h);
  this.writeBuffer();
}

Map.prototype.blocked = function(x, y) {
  var future = y * width + x;
  if (future > 0 && future < this.buffer.pixels.length && brightness(this.buffer.pixels[future]) < 230) {
    return true;
  }
  else {
    return false;
  }
}

Map.prototype.clearPixel = function(x, y) {
  this.buffer.pixels[y * width + x] = this.bg;
}

Map.prototype.writeBuffer = function() {
  context(this.buffer);
  background(this.bg);
  noFill();
  stroke(0);
  rect(0, 0, width-1, height-1);

  noStroke();
  fill(0, 200, 0, 100);
  for (var x = 0; x < width; x+=this.cellsize) {
    for (var y = 0; y < height; y+=this.cellsize) {
      if (random(1) < .1) {
        ellipse(x, y, this.cellsize, this.cellsize);
      }
    }
  }
  loadPixels();
  context(canv);
}

Map.prototype.regrow = function(x, y) {
  context(this.buffer);
  noStroke();
  fill(0, 200, 0, 100);
  ellipse(x, y, this.cellsize, this.cellsize);
  loadPixels();
  context(canv);
}

Map.prototype.plant = function(x, y) {
  this.regrow(x, y);
}

Map.prototype.display = function() {
  context(this.buffer);
  updatePixels();
  context(canv);
  //image(this.buffer, 0, 0, this.w, this.h);
}
