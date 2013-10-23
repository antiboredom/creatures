ArrayList<Body> bodies = new ArrayList<Body>();
Map m;
float sc = 2;
boolean follow = false, flocking = false;
int follower = 0;
Body toFollow;
String names[];

void setup() {
  size(1280, 720, P3D);
  //size(900, 500, P3D);
  

  names = loadStrings("names.txt");
  for (int i = 0; i < 30; i ++) {
    Body b = new Body(random(width), random(height), names[int(random(0, names.length-1))]);
    b.r = random(10, 20);
    b.age = int(random(0, 1000));
    bodies.add(b);
  }
  m = new Map(width, height);
}


void draw() {
  if (follower > bodies.size() - 1) { 
    follower = 0;
  }
  toFollow = bodies.get(follower);
  if (follow) {
    scale(sc);
    translate((toFollow.location.x - width/(2*sc))*-1, (toFollow.location.y - height/(2*sc))*-1);
  }
  //rotate(bodies.get(0).velocity.heading2D()*-1);
  //translate(bodies.get(0).location.x * -1, bodies.get(0).location.y * -1);
  //translate(width/2, height/2);

  background(200);
  
  m.display();
  for (int i = bodies.size() - 1; i >= 0; i--) {
    Body b = bodies.get(i);
    b.run();

    if (b.pregnant) {
      Body baby = new Body(b.location.x, b.location.y, names[int(random(0, names.length-1))]);
      println(baby.name + " is born");

      bodies.add(baby);
      b.pregnant = false;
    }
    
    if (toFollow != b && !b.alive && bodies.size() > i) {
      
      println(b.name + " has died of " + (b.age > 4800 ? "old age" : "hunger. RIP."));
      m.regrow(b.location.x, b.location.y);      
      bodies.remove(i);
    }
    
  }
  
  if (bodies.size() > 100) {
    Body b = bodies.get(100);
    println(b.name + " has died. RIP");
    m.regrow(b.location.x, b.location.y);      
    bodies.remove(100);
  }
}

void mouseWheel(MouseEvent event) {
  float e = event.getAmount();
  sc += e / 20;
  if (sc > 10) { 
    sc = 10;
  }
  if (sc < 1) { 
    sc = 1;
  }
}

void keyReleased() {
  if (keyCode == 32) { 
    follow = !follow;
  }
  if (keyCode == 76) {
    follower ++;
  }
  if (keyCode == 75) {
    follower --;
  }
  if (follower >= bodies.size()) { 
    follower = 0;
  }
  if (follower < 0) { 
    follower = bodies.size() -1;
  }

  if (keyCode == 78) {
    m = new Map(width, height);
  }
}

void keyPressed() {



  if (keyCode == 38) {
    toFollow.go("up");
  }

  if (keyCode == 40) {
    toFollow.go("down");
  }

  if (keyCode == 37) {
    toFollow.go("left");
  }

  if (keyCode == 39) {
    toFollow.go("right");
  }
}


void mouseDragged() {
  m.plant(mouseX, mouseY);
}

