class Map {
  int w, h;
  ArrayList<PVector> coords = new ArrayList<PVector>();
  PGraphics buffer;
  int rows, cols;
  int cellsize = 60;
  color bg = color(240);

  Map(int _w, int _h) {
    w = _w;
    h = _h;
    rows = width/cellsize;
    cols = width/cellsize;
    buffer = createGraphics(w, h);
    writeBuffer();
  }

  boolean blocked(int x, int y) {
    int future = int(y * width + x);
    if (future > 0 && future < buffer.pixels.length && brightness(buffer.pixels[future]) < 230) {
      return true;
    } 
    else {
      return false;
    }
  }

  boolean blocked(PVector location) {
    int future = int(location.y * width + location.x);
    if (future > 0 && future < buffer.pixels.length && brightness(buffer.pixels[future]) == 0.0) {
      return true;
    } 
    else {
      return false;
    }
  }

  void clearPixel(int x, int y) {
    buffer.pixels[y * width + x] = bg;
  }

  void writeBuffer() {
    buffer.beginDraw();
    buffer.background(bg);
    
    buffer.noFill();
    buffer.stroke(0);
    buffer.rect(0, 0, width-1, height-1);
    
    buffer.noStroke();
    buffer.fill(0, 200, 0, 100);
    for (int x = 0; x < width; x+=cellsize) {
      for (int y = 0; y < height; y+=cellsize) {
        if (random(1) < .1) {
          buffer.ellipse(x, y, cellsize, cellsize);
          
        }
      }
    }
    buffer.endDraw();
  }

  void regrow(float x, float y) {
    buffer.beginDraw();
    buffer.noStroke();
    buffer.fill(0, 200, 0, 100);
    buffer.ellipse(x, y, cellsize, cellsize);
    buffer.endDraw();
  }

  void plant(float x, float y) {
    buffer.beginDraw();
    buffer.noStroke();
    buffer.fill(0, 200, 0, 100);
    buffer.ellipse(x, y, cellsize, cellsize);
    buffer.endDraw();
  }

  void display() {
    buffer.updatePixels();
    image(buffer, 0, 0, w, h);
  }
}

