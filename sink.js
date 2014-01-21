'use strict';
/* global Rectangle, Vector, Particle */

var Sink = function (x, y, r, influenceRadius, force) {
    var i, degtorad = Math.PI / 180;
    this.base = Rectangle;
    this.radius = r || 15;
    this.base(x, y, 2 * this.radius, 2 * this.radius, 0);
    this.force = force || 1;
    this.influenceRadius = influenceRadius || 100;
    this.hdrColor = [0, 0, 0];
    this.sizeFactor = 1;
    this.targetSizeFactor = 3;
    this.maxSizeFactor = 4;
    this.showInfluenceRing = true;
    this.hitsThisFrame = 0;
    this.growthFactor = 0.15;
    this.decayFactor = 0.05;
    this.maxOrbitals = 4;
    this.orbitals = [];
    this.energy = 0;
    this.maxEnergy = 100;
    this.energyPerOrbital = 10;
    this.energyMovingAverage = 0;
    this.sampleRate = 1; //every second
    this.sampleTotalTime = 0;
    this.flash = false;
    this.burstSize = 20;
    this.pulsar = new ParticleSystem(this.x, this.y);
    this.pulsar.init(this.x, this.y, 200, 10);
    this.continuousPulse = false; //when we hit 90% of max
    this.pulseRate = 2; //seconds
    this.pulsedt = 0;
    this.shells = [0,
                   90 * degtorad,
                   45 * degtorad,
                   (45 + 90) * degtorad,
                   22.5 * degtorad,
                   (22.5 + 90) * degtorad,
                   67.5 * degtorad,
                   (67.5 + 90) * degtorad];
    this.shellSin = this.shells.map(
        function (v) {
            return Math.sin(v);
        }
    );

    this.shellCos = this.shells.map(
        function (v) {
            return Math.cos(v);
        }
    );


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
    this.energy = Math.max(0, this.energy - this.energy * 0.0001 * dt);
    if (this.energy / this.maxEnergy >= 0.9) {
        this.continuousPulse = true;
        this.pulsedt += dt;
        if (this.pulsedt >= this.pulseRate) {
            this.pulsedt = 0;
            this.pulsar.burst(this.x, this.y, 0.1, this.burstSize);
        }
    } else {
        this.continuousPulse = false;
    }
    this.updateOrbitals(dt);
    this.pulsar.update(dt);
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
};

Sink.prototype.addOrbital = function () {
    var p, ps;
    p = new Particle(this.x + this.radius * 4 * this.sizeFactor, this.y);
    p.orbitalRadius = this.radius * 2;
    p.theta = 0;
    p.speed = 0.01;// * (1 + Math.random());
    p.a = 2;//Math.random() * 2 + 1;
    p.b = 1;//Math.random() * 2 + 1;
    this.orbitals.push(p);
    this.pulsar.burst(this.x, this.y, 0.1, this.burstSize);
};

Sink.prototype.updateOrbitals = function (dt) {
    var i, p, v, r, x, y;
    if (this.getOrbitalShell() < this.orbitals.length) {
        this.orbitals.pop();
    }
    for (i = 0; i < this.orbitals.length; i += 1) {
        p = this.orbitals[i];
        p.prevx = p.x;
        p.prevy = p.y;
        p.theta = p.theta + p.speed * dt;
        if (p.theta > Math.PI * 2) {
            p.theta = 0;
        }
        x = p.a * p.orbitalRadius * this.sizeFactor * Math.cos(p.theta);
        y = p.b * p.orbitalRadius * this.sizeFactor * Math.sin(p.theta);
        
        //now rotate this orbital
        p.x = this.x + (x * this.shellCos[i] + y * this.shellSin[i]);
        p.y = this.y + (y * this.shellCos[i] - x * this.shellSin[i]);
        p.trace();
    }
};


Sink.prototype.drawOrbitals = function (canvas, color) {
    var i;
    for (i = 0; i < this.orbitals.length; i += 1) {
        this.orbitals[i].draw(canvas, color);
    }
};

Sink.prototype.tonemap = function (n) {
    var exposure = 1.0;
    return (1 - Math.pow(2, -n * 0.005 * exposure)) * 255;
};

function contrastColor(color, contrast) {

    var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    color[0] = 1 + (factor * ((color[0] - 128) + 128));
    color[1] = 1 + (factor * ((color[1] - 128) + 128));
    color[2] = 1 + (factor * ((color[2] - 128) + 128));
    
    return color;
}

function brighten(color, factor) {
    var c = [0, 0, 0], intensity = 10;
    c[0] = color[0] + intensity * 0.2126 * factor;
    c[1] = color[1] + intensity * 0.7152 * factor;
    c[2] = color[2] + intensity * 0.0722 * factor;

    c[0] = Math.min(255, ~~c[0]);
    c[1] = Math.min(255, ~~c[1]);
    c[2] = Math.min(255, ~~c[2]);

    return c;
}

Sink.prototype.draw = function (canvas, color) {
    var maxHitAlpha = 0.15,
        hitFactor = 0.005,
        //c = brighten(color, 100),
        r = color[0],
        g = color[1],
        b = color[2],
        c = [r, g, b],
        intensity = 1000,
        i;
    this.sizeFactor = 1 + this.radius * this.energy / 1000;

    this.pulsar.draw(canvas, color);
   

    //console.log(c)
    
    //c[0] = r + this.tonemap(r * intensity * this.energy / this.maxEnergy);
    //c[1] = g + this.tonemap(g * intensity * this.energy / this.maxEnergy);
    //c[2] = b + this.tonemap(b * intensity * this.energy / this.maxEnergy);

    //console.log(c);
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
    //canvas.circle(this.x, this.y, this.radius * this.sizeFactor, c, 0.25);
    canvas.radialGradient(this.x,
                          this.y,
                          this.radius * this.sizeFactor * 0.5,
                          this.radius * 1.5 * this.sizeFactor,
                          [255, 255, 255],
                          color,
                          1.0,
                          0.0);

    if (this.showInfluenceRing) {
        canvas.circleOutline(this.x, this.y, this.influenceRadius * this.sizeFactor, 1, [255, 255, 255], 1);
        canvas.circleOutline(this.x, this.y, this.influenceRadius * this.sizeFactor, 3, c, 1);
    }
    if (this.selected) {
        canvas.circleOutline(this.x, this.y, this.radius * this.sizeFactor, 2, [0, 100, 255], 0.25);
    }

    this.drawOrbitals(canvas, c);
};


var sinkFromJson = function (j) {
    return new Sink(j.x, j.y, j.radius, j.influenceRadius, j.force);
};


