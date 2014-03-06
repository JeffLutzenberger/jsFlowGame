'use strict';
/* global Rectangle, Vector, Particle */

var Sink = function (x, y, r, force, isSource) {
    var i, degtorad = Math.PI / 180;
    this.base = Rectangle;
    this.radius = r || 15;
    this.base(x, y, 2 * this.radius, 2 * this.radius, 0);
    this.force = force || 1;
    this.influenceRadius = this.radius * 5;
    this.speed = 5;
    this.inColor = 'green';
    this.outColor = 'blue';
    this.isSource = isSource || false;
    this.isGoal = true;
    this.influenceType = 0;
    this.sizeFactor = 1;
    this.maxSizeFactor = 0.5;
    this.showInfluenceRing = true;
    this.influenceBound = false;
    this.maxFill = 100;
    this.fillLevels = [50, 100, 150, 200];
    this.caught = 0;
    this.orbitals = [];
    this.lockedInEnergyFactor = 0.25;
    this.flash = false;
    this.flashdt = 1e6;
    this.flashlength = 500;
    this.exploded = false;
    this.lockedIn = true;
    this.explodeFlash = new Flash(500, 20);
    this.sparks = new ParticleSystem(0, 0);
    this.particleconfigs = SparksParticleConfigs;

    this.grabber = new Rectangle(x + Math.cos(this.theta) * this.r,
                                 y + Math.sin(this.theta) * this.r,
                                 20, 20, 0);
    this.grabberFadeLength = 1000;
    this.grabberFadeDt = 0;
    this.pulseRates = [5000, 4000, 3000, 2000, 1000, 500, 250, 100]; //milliseconds
    this.ringpulsedt = 0;
    this.ringpulselength = 2000;
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

Sink.prototype.setRadius = function (val) {
    this.radius = val;
    this.influenceRadius = val * 5;
    this.w = val;
    this.h = val;
};

Sink.prototype.full = function () {
    return (this.caught >= this.maxFill);
};

Sink.prototype.influence = function (p, dt, maxSpeed) {
    var v2 = new Vector(this.x - p.x, this.y - p.y),
        r2 = Math.max(v2.squaredLength(), this.radius * this.radius),
        res;
    if (this.influenceType === 0) {
        // 1/r^2 
        res = this.force * 100 / r2;
    } else if (this.influenceType === 1) {
        // 1/r smooths out influence
        res = this.force / Math.sqrt(r2);
    } else if (this.influenceType === 2) {
        res = maxSpeed - Math.sqrt(r2) * maxSpeed / 1000;
        res = Math.max(0, res);
    } else if (this.influenceType === 3) {
        if (r2 < this.influenceRadius * this.influenceRadius) {
            res = maxSpeed;
        }
    }
    res *= dt * 0.08;
    res = Math.min(res, maxSpeed);
    v2 = VectorMath.normalize(v2);
    v2.x *= res;
    v2.y *= res;
    p.vel.x += v2.x;
    p.vel.y += v2.y;
};

Sink.prototype.hit = function (p) {
    var v2 = new Vector(this.x - p.x, this.y - p.y),
        d2 = v2.squaredLength(),
        hit = false;
    hit = (d2 <= 2 * this.radius * this.radius * this.sizeFactor * this.sizeFactor);
    if (hit) {
        this.caught += 1;
    }
    return hit;
};

Sink.prototype.insideInfluenceRing = function (p) {
    var v2 = new Vector(this.x - p.x, this.y - p.y),
        d2 = v2.squaredLength();
    return (d2 <= 2 * this.influenceRadius * this.influenceRadius * this.sizeFactor * this.sizeFactor);
};

Sink.prototype.hitGrabber = function (p) {
    var r = new Rectangle(this.x + Math.cos(this.theta) * this.influenceRadius * this.sizeFactor,
                          this.y + Math.sin(this.theta) * this.influenceRadius * this.sizeFactor,
                          20, 20, 0);
    return r.bbHit(p);
};

Sink.prototype.moveGrabber = function (p) {
    var v = new Vector(p.x - this.x, p.y - this.y),
        d = v.length();
    this.theta = Math.atan(v.y / v.x);
    if (v.x < 0) {
        this.theta -= Math.PI;
    }
};

Sink.prototype.trap = function (p) {
    var d1 = new Vector(p.x - this.x, p.y - this.y).length(),
        r1 = this.influenceRadius * this.sizeFactor,
        r2 = r1 - 5,
        n;
    if (d1 > r1) {
        //get the normal vector at this point
        n = new Vector(p.x - this.x, p.y - this.y);
        n = VectorMath.normalize(n);
        p.x = this.x + r2 * n.x;
        p.y = this.y + r2 * n.y;
        return n;
    }
};

Sink.prototype.bounce = function (p) {
    var d1 = new Vector(p.x - this.x, p.y - this.y).length(),
        r1 = this.influenceRadius * this.sizeFactor + 10,
        r2 = r1 + 10,
        n;
    if (d1 < r1) {
        //get the normal vector at this point
        n = new Vector(p.x - this.x, p.y - this.y);
        n = VectorMath.normalize(n);
        p.x = this.x + r2 * n.x;
        p.y = this.y + r2 * n.y;
        this.spark(p.x, p.y);
        return n;
    }
};

Sink.prototype.spark = function (x, y) {
    this.sparks.init(x,
                     y,
                     this.particleconfigs.particleradius,
                     this.particleconfigs.particlelength,
                     this.particleconfigs.ntracers,
                     this.particleconfigs.nparticles);

    this.sparks.burst(x,
                      y,
                      this.particleconfigs.burstradius,
                      this.particleconfigs.speed,
                      this.particleconfigs.accel,
                      this.particleconfigs.nburstparticles,
                      this.particleconfigs.lifetime);
};

Sink.prototype.explode = function () {
    this.sparks.init(this.x,
                     this.y,
                     this.particleconfigs.particleradius,
                     this.particleconfigs.particlelength,
                     this.particleconfigs.ntracers,
                     this.particleconfigs.nparticles);

    this.sparks.burst(this.x,
                      this.y,
                      this.particleconfigs.burstradius,
                      this.particleconfigs.speed,
                      this.particleconfigs.accel,
                      this.particleconfigs.nburstparticles,
                      this.particleconfigs.lifetime);

};

Sink.prototype.update = function (dt, hit) {
    var i;
    this.brightness = Math.min(this.brightness, 1.0);
    if (!this.full()) {
        this.sizeFactor = 1 + this.maxSizeFactor * this.caught / this.maxFill;
        this.sizeFactor = Math.min(this.sizeFactor, 1 + this.maxSizeFactor);
    } else {
        //big flash...
        this.explodeFlash.play();
        this.sizeFactor -= 0.005 * dt;
        this.sizeFactor = Math.max(0.001, this.sizeFactor);
        if (this.sizeFactor < 0.01 && !this.exploded) {
            //explode
            this.exploded = true;
            this.explode();
            console.log("explode");
        }
    }
   
    if (this.lockedIn) {
        //start grabber fade
        if (this.grabberFadeDt < this.grabberFadeLength) {
            this.grabberFadeDt += dt;
        } else {
            this.grabberFadeDt = this.grabberFadeLength;
        }
    }
       
    this.pulsedt += dt;
    
    if (this.pulsedt >= this.pulseRates[0]) {
        this.pulsedt = 0;
        this.flashdt = 0;
    }
    
    if (this.flashdt >= 0 && this.flashdt < this.flashlength) {
        this.flashdt += dt;
    }

    this.ringpulsedt += dt;
    if (this.ringpulsedt > this.ringpulselength) {
        this.ringpulsedt = 0;
    }

    this.updateOrbitals(dt);
    this.explodeFlash.update(dt);
    this.sparks.update(dt);
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
};

Sink.prototype.updateOrbitals = function (dt) {
    var i, p, v, r, x, y;
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

Sink.prototype.recycleParticle = function (p) {
    var dt = Math.random() * 0.1 - 0.05;
    p.x = this.x + Math.cos(this.theta + dt) * this.influenceRadius * this.sizeFactor;
    p.y = this.y + Math.sin(this.theta + dt) * this.influenceRadius * this.sizeFactor;
    p.vel.x = Math.cos(this.theta) * this.speed;
    p.vel.y = Math.sin(this.theta) * this.speed;
    p.color = this.outColor;
};

Sink.prototype.drawOrbitals = function (canvas, color) {
    var i;
    for (i = 0; i < this.orbitals.length; i += 1) {
        this.orbitals[i].draw(canvas, color);
    }
};

Sink.prototype.drawPulseRing = function (canvas, color) {
    var r = this.ringpulsedt * this.radius * 0.05,
        alpha = 1 - this.ringpulsedt / this.ringpulselength;
    canvas.circleOutline(this.x, this.y, r, 10, [255, 255, 255], alpha * 0.15);
    canvas.circleOutline(this.x, this.y, r, 20, color, alpha * 0.25);
};

Sink.prototype.drawGrabber = function (canvas, color, alpha) {
    var size = this.radius,
        dt1 = 0.3,
        p1 = new Vector(this.x + Math.cos(this.theta + dt1) * this.influenceRadius * this.sizeFactor,
                        this.y + Math.sin(this.theta + dt1) * this.influenceRadius * this.sizeFactor),
        p2 = new Vector(this.x + Math.cos(this.theta - dt1) * this.influenceRadius * this.sizeFactor,
                        this.y + Math.sin(this.theta - dt1) * this.influenceRadius * this.sizeFactor);

    canvas.radialGradient(this.x + Math.cos(this.theta) * this.influenceRadius * this.sizeFactor,
                          this.y + Math.sin(this.theta) * this.influenceRadius * this.sizeFactor,
                          this.radius * 0.5,
                          this.radius * 2,
                          color,
                          color,
                          0.5 * alpha,
                          0);
    canvas.circle(this.x + Math.cos(this.theta) * this.influenceRadius * this.sizeFactor,
                  this.y + Math.sin(this.theta) * this.influenceRadius * this.sizeFactor,
                  this.radius, color, alpha);
    canvas.radialGradient(this.x + Math.cos(this.theta) * this.influenceRadius * this.sizeFactor,
                          this.y + Math.sin(this.theta) * this.influenceRadius * this.sizeFactor,
                          this.radius * 0.25,
                          this.radius * 2.25,
                          [255, 255, 255],
                          color,
                          alpha,
                          0.0);
    color = ParticleWorldColors[this.inColor];
    canvas.arrowHead(p1, 50, -this.theta - dt1, color, alpha * 0.25);
    canvas.arrowHead(p1, 30, -this.theta - dt1, color, alpha * 0.5);
    canvas.arrowHead(p1, 20, -this.theta - dt1, [255, 255, 255], alpha * 0.5);
    canvas.arrowHead(p2, 50, -this.theta + dt1 + Math.PI, color, alpha * 0.25);
    canvas.arrowHead(p2, 30, -this.theta + dt1 + Math.PI, color, alpha * 0.5);
    canvas.arrowHead(p2, 20, -this.theta + dt1 + Math.PI, [255, 255, 255], alpha * 0.5);
};

Sink.prototype.draw = function (canvas) {
    var maxHitAlpha = 0.15,
        hitFactor = 0.005,
        intensity = 1000,
        i,
        radius,
        alpha,
        grabberAlpha,
        f,
        color = ParticleWorldColors[this.inColor];

    this.sparks.draw(canvas, color);
    canvas.radialGradient(this.x,
                          this.y,
                          this.radius * this.sizeFactor,
                          this.radius * 4 * this.sizeFactor,
                          color,
                          color,
                          0.5,
                          0);
    canvas.circle(this.x, this.y, this.radius * 2 * this.sizeFactor, color, 0.25);
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
        canvas.circleOutline(this.x, this.y, this.influenceRadius * this.sizeFactor, 3, color, 1);
    }

    if (this.lockedIn && this.isSource) {
        //draw a pulsing outer ring to indicate this sink has been locked in
        radius = this.radius * this.sizeFactor;
        alpha = this.grabberFadeDt / this.grabberFadeLength;
        this.drawGrabber(canvas, ParticleWorldColors[this.outColor], alpha);
    } else {
        radius = (1 - this.ringpulsedt / this.ringpulselength) * this.radius * this.sizeFactor;
        alpha = this.ringpulsedt / this.ringpulselength;
        alpha = Math.sin(alpha * Math.PI);
        if (alpha < 0.001) {
            alpha = 0.001;
        }
        canvas.radialGradient(this.x,
                              this.y,
                              radius,
                              radius * 10,
                              [255, 255, 255],
                              color,
                              0.5 * alpha,
                              0.0);
        
        canvas.circleOutline(this.x, this.y, radius * 7, 10, [255, 255, 255], 0.3 * alpha);
        canvas.circleOutline(this.x, this.y, radius * 7, 3, color, 0.5 * alpha);
    }

    if (this.selected) {
        canvas.circleOutline(this.x, this.y, this.radius * this.sizeFactor, 2, [0, 100, 255], 0.25);
    }

    if (this.caught >= this.maxFill) {
        f = this.explodeFlash.factor * this.explodeFlash.magnitude;
        canvas.radialGradient(this.x,
                              this.y,
                              this.radius * (1 + f),
                              this.radius * 1.5 * this.sizeFactor * (1 + f),
                              [255, 255, 255],
                              color,
                              1.0,
                              0.0);
    }

};

Sink.prototype.serialize = function () {
    var obj = this.baseSerialize();
    obj.radius = this.radius;
    obj.force = this.force;
    obj.isSource = this.isSource;
    obj.speed = this.speed;
    obj.inColor = this.inColor;
    obj.outColor = this.outColor;
    obj.influenceRadius = this.influenceRadius;
    obj.influenceType = this.influenceType;
    obj.maxSizeFactor = this.maxSizeFactor;
    obj.influenceBound = this.influenceBound;
    obj.showInfluenceRing = this.showInfluenceRing;
    return obj;
};

var sinkFromJson = function (j) {
    var obj = new Sink(j.x, j.y, j.radius, j.force, j.isSource);
    $.extend(obj, j);
    return obj;
};
