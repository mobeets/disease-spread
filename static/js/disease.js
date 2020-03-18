var canvas;
var canvasWidth = 600;
var canvasHeight = 400;
var neighborhoodSize = 50;
var transmissionProb = 1;
var maxDaysInfected = 300; // # of frames
var maxDaysImmune = 180; // # of frames
var daysBeforeContagious = 1;
var numberOfPeople = canvasWidth/10;
var showInfectionRadius = true;
let particles = []; // for containing particles
let history = []; // for tracking # infected over time

class Particle {
  constructor(){
    this.x = random(0,width);
    this.y = random(0,height-numberOfPeople);
    this.r = 8;
    this.xSpeed = random(-1,1);
    this.ySpeed = random(-1,1);
    this.isSick = false;
    this.daysSinceInfected = 0;
    this.daysImmune = 0;
  }

// creation of a particle.
  createParticle() {
    noStroke();
    // strokeWeight(1);
    
    if(this.isSick) {
      fill(color(200,0,0));
    } else {
      if(this.daysImmune > 0) {
        fill(200);
      } else {
        fill(100);
        // stroke(255);
        // fill(255);
      }
    }
    circle(this.x,this.y,this.r);

    // show radius of influence
    if(showInfectionRadius && this.isSick) {
      strokeWeight(1);
      stroke(150,20,20);
      noFill();
      circle(this.x,this.y,neighborhoodSize);
    }
  }

// setting the particle in motion.
  moveParticle() {
    if(this.x < 0 || this.x > width)
      this.xSpeed*=-1;
    if(this.y < 0 || this.y > height-numberOfPeople)
      this.ySpeed*=-1;
    this.x+=this.xSpeed;
    this.y+=this.ySpeed;
  }

  makeUnsick() {
    this.isSick = false;
    this.daysSinceInfected = 0;
    this.daysImmune = 1;
  }

  updateImmunity() {
    if (this.daysImmune > 0) {
      // update immunity
      this.daysImmune++;
      if (this.daysImmune > maxDaysImmune) {
        this.daysImmune = 0;
      }
    }
  }

  // this function updates the disease state of every particle
  joinParticles(particles) {
    if (!this.isSick) {
      this.updateImmunity();
      return;
    }

    // check if recovered
    this.daysSinceInfected++;
    if (this.daysSinceInfected > maxDaysInfected) {
      this.makeUnsick();
      return;
    }

    // cannot spread until contagious
    if (this.daysSinceInfected < daysBeforeContagious) {
      return;
    }

    // spread to neighbors
    particles.forEach(element =>{
      let dis = dist(this.x,this.y,element.x,element.y);
      if(element.daysImmune < 1 && dis < neighborhoodSize && random() < transmissionProb) {
        element.isSick = true;
      }
    });
  }
}

function plotSickCount(particles) {
  stroke(0,0,0);
  strokeWeight(2);
  fill(color(255,255,255));
  rect(0, canvasHeight-numberOfPeople-1, canvasWidth, numberOfPeople-1);

  let count = 0;
  for(let i = 0;i<particles.length;i++) {
    if (particles[i].isSick) { count += 1; }
  }
  history.push(count);

  beginShape(LINES);
  stroke(color(200,0,0));
  strokeWeight(2);
  
  var j = 0;
  if (history.length < canvasWidth) {
    j = 0; 
  } else {
    j = history.length-canvasWidth;
  }
  for(let i = 0; i<canvasWidth;i++) {
    if (history.length < i) { continue; }
    vertex(i, canvasHeight-history[j+i]);
  }
  endShape();

  // label plot
  strokeWeight(0);
  fill(color(200,0,0));
  textAlign(LEFT);
  textSize(12);
  translate(10, canvasHeight-numberOfPeople/4);
  rotate(-PI/2);
  text("# sick", 0,0);
}

function setup() {
  canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('sketch-holder');
  for(let i = 0;i<numberOfPeople;i++){
    particles.push(new Particle());
  }
  // only one person is sick initially
  particles[0].isSick = true;
}

function draw() {
  background('white');
  for(let i = 0;i<particles.length;i++) {
    particles[i].createParticle();
    particles[i].moveParticle();
    particles[i].joinParticles(particles);//particles.slice(i));
  }
  plotSickCount(particles);
}
