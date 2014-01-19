'use strict';
/* global Rectangle, Vector, Particle */

var SinkPulse = function (x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.age = 0;
    this.maxAge = 1000000;
    this.alpha = 1;
    this.speed = 0.01;
};

SinkPulse.prototype = {

    update: function (dt) {
        this.radius += this.speed * dt;
        this.age += dt;
    },

    draw: function (canvas, color, dt) {
        canvas.circleOutline(this.x, this.y, this.radius, 10, color, 1.0);
    },

    dead: function () {
        return this.age >= this.maxAge;
    }
};

var Sink = function (x, y, r, influenceRadius, force) {
    var i;
    this.base = Rectangle;
    this.radius = r || 15;
    this.base(x, y, 2 * this.radius, 2 * this.radius, 0);
    this.force = force || 1;
    this.influenceRadius = influenceRadius || 100;
    this.sizeFactor = 1;
    this.targetSizeFactor = 3;
    this.maxSizeFactor = 4;
    this.showInfluenceRing = true;
    this.hitsThisFrame = 0;
    this.growthFactor = 0.25;
    this.decayFactor = 0.0005;
    this.maxOrbitals = 5;
    this.orbitals = [];
    this.energy = 0;
    this.maxEnergy = 100;
    this.energyPerOrbital = 10;
    this.energyMovingAverage = 0;
    this.sampleRate = 1; //every second
    this.sampleTotalTime = 0;
    this.flash = false;
    this.pulses = [];
    //for (i = 0; i < this.maxOrbitals; i += 1) {
    //    this.pulses[i] = new SinkPulse(this.x, this.y, this.radius);
    //}
};

Sink.prototype = new Rectangle();

Sink.prototype.gameObjectType = function () {
    return "Sink";
};

Sink.prototype.hit = function (p) {
    var v2 = new Vector(this.x - p.x, this.y - p.y),
        d2 = v2.squaredLength();
    return (d2 <= 2 * this.radius * this.radius * this.sizeFactor * this.sizeFactor);
};

Sink.prototype.contain = function (p) {
    var v = new Vector(p.vel.x, p.vel.y),
        c1 = new Particle(p.x, p.y, p.radius),
        p1 = new Vector(p.prevx, p.prevy),
        p2 = new Vector(p.x, p.y),
        d1 = new Vector(p1.x - this.x, p2.y - this.y).length(),
        d2 = new Vector(p2.x - this.x, p2.y - this.y).length(),
        hitPoint;
    if (d1 < d2) {
        hitPoint = c1.circleCircleCollision(this.x, this.y, this.influenceRadius);
        if (hitPoint) {
            v = new Vector(this.x - hitPoint.x, this.y - hitPoint.y);
            d1 = v.length() + 20;
            //there should only be a collision if the particle circle overlaps the edge
            //of the influence radius
            if (d1 >= this.influenceRadius) {
                return v.normalize();
            }
        }
    }
};

Sink.prototype.update = function (dt, hit) {
    
    var i;
    this.energy = Math.max(0, this.energy - this.energy * 0.000005 * dt);
    for (i = 0; i < this.pulses.length; i += 1) {
        this.pulses[i].update(dt);
    }
    if (this.pulses.length > 0 && this.pulses[this.pulses.length - 1].dead()) {
        this.pulses.pop();
        //console.log(this.pulses[this.pulses.length-1].age);
    }
    //this.energyMovingAverage = this.energyMovingAverage - 
    /*
    if (hit) {
        this.sizeFactor = Math.min(this.maxSizeFactor, this.sizeFactor + this.growthFactor);
        this.hitAlpha = Math.min(this.maxHitAlpha, this.hitAlpha + this.growthFactor);
    }
    this.hitAlpha = Math.max(0.0, this.hitAlpha - this.decayFactor);
    this.sizeFactor = Math.max(1.0, this.sizeFactor - this.decayFactor);
    */
};

Sink.prototype.getOrbitalShell = function () {
    return Math.min(this.maxOrbitals, Math.round(this.energy / this.energyPerOrbital));
};

Sink.prototype.addEnergy = function () {
    this.energy += this.growthFactor;
    this.flash = true;
    if (this.energy > this.maxEnergy) {
        this.energy = this.maxEnergy;
    }
    if (this.getOrbitalShell() > this.orbitals.length) {
        this.addOrbital();
    }
    //if (this.energy > this.energyPerOrbital * (1 + this.orbitals.length) && this.orbitals.length < this.maxOrbitals) {
    //    this.addOrbital();
    //}
};

Sink.prototype.addOrbital = function () {
    var p, n = Math.random(), radius = this.radius * (this.orbitals.length + 1);
    p = new Particle(this.x + radius * 2 * this.sizeFactor, this.y);
    p.orbitalRadius = radius;
    p.theta = 0;
    p.speed = 0.0025 * (1 + Math.random());
    p.a = 2;//Math.random() * 2 + 1;
    p.b = 1;//Math.random() * 2 + 1;
    this.orbitals.push(p);
    this.pulses.push(new SinkPulse(this.x, this.y, this.radius));
};

Sink.prototype.updateOrbitals = function (dt) {
    var speed = 0.005, i, o, v, r;
    if (this.getOrbitalShell() < this.orbitals.length) {
        this.orbitals.pop();
    }
    for (i = 0; i < this.orbitals.length; i += 1) {
        o = this.orbitals[i];
        //o.x = v.x * o.orbitalRadius;
        //o.y = v.y * o.orbitalRadius;
        o.prevx = o.x;
        o.prevy = o.y;
        o.theta = o.theta + o.speed * dt;
        if (o.theta > Math.PI * 2) {
            o.theta = 0;
        }
        o.x = this.x + o.a * o.orbitalRadius * this.sizeFactor * Math.cos(o.theta);
        o.y = this.y + o.b * o.orbitalRadius * this.sizeFactor * Math.sin(o.theta);
        //v = new Vector(o.x - this.x, o.y - this.y).normalize();
        //console.log(o.orbitalRadius); 
        o.trace();
    }
};


Sink.prototype.drawOrbitals = function (canvas, color, dt) {
    var i;
    for (i = 0; i < this.orbitals.length; i += 1) {
        this.orbitals[i].draw(canvas, color);
    }
};

Sink.prototype.tonemap = function (n) {
    var exposure = 1.0;
    return (1 - Math.pow(2, -n * 0.005 * exposure)) * 255;
};

Sink.prototype.draw = function (canvas, color, dt) {
    var decayFactor = 0.001,
        maxHitAlpha = 0.15,
        hitFactor = 0.005,
        c = color,
        intensity = 1.0,
        i;
    this.sizeFactor = 1 + this.radius * this.energy / 1000;

    for (i = 0; i < this.pulses.length; i += 1) {
        this.pulses[i].draw(canvas, color, dt);
    }
    /*if (this.flash) {
        c = [255, 255, 255];
        if (this.energy < this.maxEnergy * 0.9) {
            this.flash = false;
        }
    }*/

    //c[0] = this.tonemap(c[0] + c[0] * intensity);
    //c[1] = this.tonemap(c[1] + c[1] * intensity);
    //c[2] = this.tonemap(c[2] + c[2] * intensity);

    /*canvas.circle(
        this.x,
        this.y,
        this.radius * 4 * this.sizeFactor,
        [255, 255, 255],
        this.hitAlpha
    );*/
    canvas.radialGradient(this.x,
                          this.y,
                          this.radius * this.sizeFactor,
                          this.radius * 4 * this.sizeFactor,
                          color,
                          color,
                          0.5,
                          0);
    canvas.circle(this.x, this.y, this.radius * 2 * this.sizeFactor, c, 0.25);
    canvas.circle(this.x, this.y, this.radius * this.sizeFactor, c, 0.25);
    if (this.showInfluenceRing) {
        canvas.circleOutline(this.x, this.y, this.influenceRadius * this.sizeFactor, 1, c, 1);
    }
    if (this.selected) {
        canvas.circleOutline(this.x, this.y, this.radius * this.sizeFactor, 2, [0, 100, 255], 0.25);
    }

    this.drawOrbitals(canvas, color, dt);
};


var sinkFromJson = function (j) {
    return new Sink(j.x, j.y, j.radius, j.influenceRadius, j.force);
};


