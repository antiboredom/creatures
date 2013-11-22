function Map(w, h) {
  this.coords = [];
  this.cellsize = 60;
  this.bg = color(0);//color(240);
  this.w = w;
  this.h = h;
  this.rows = width/this.cellsize;
  this.cols = width/this.cellsize;
  this.buffer = createGraphics(this.w, this.h);
  this.buffer.id("buffer");
  this.writeBuffer();
  this.buffer.hide();
  this.domObject = document.getElementById('buffer');
  this.setImage();
}

Map.prototype.blocked = function(x, y) {
  context(this.buffer);
  var future = y * width + x;
  var p = pixels[future];
  var toReturn;
  if (future > 0 && future < pixels.length && brightness(pixels[future]) < 230) {
    toReturn = true;
  }
  else {
    toReturn = false;
  }
  context(canv);
  return toReturn;
}

Map.prototype.clearPixel = function(x, y) {
  context(this.buffer);
  pixels[y * width + x] = this.bg;
  context(canv);
  this.setImage();
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

Map.prototype.setImage = function() {
  this.img = loadImage(this.domObject.toDataURL());
}

Map.prototype.regrow = function(x, y) {
  context(this.buffer);
  noStroke();
  fill(0, 200, 0, 100);
  ellipse(x, y, this.cellsize, this.cellsize);
  loadPixels();
  context(canv);
  this.setImage();
}

Map.prototype.plant = function(x, y) {
  this.regrow(x, y);
}

Map.prototype.display = function() {
  context(this.buffer);
  updatePixels();
  setImage();
  context(canv);
  image(this.img, 0, 0, this.w, this.h);
  //context(this.buffer);
  //updatePixels();
  //context(canv);
  //var ctx = this.buffer.context;
  //var img = ctx.getImageData(0, 0, this.w, this.h);
  //console.log(ctx);
  //ctx = canv.elt.getContext('2d'); 
  //ctx.putImageData(img, 0, 0);
  //ctx.drawImage(img, 0, 0);
  //image(this.buffer, 0, 0, this.w, this.h);
}
