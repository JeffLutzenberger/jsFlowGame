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
    this.inColor = 'red';
    this.outColor = 'blue';
    this.isSource = isSource || false;
    this.isGoal = true;
    this.influenceType = 0;
    this.showInfluenceRing = true;
    this.influenceBound = false;
    this.maxFill = 100;
    this.caught = 0;
    this.flash = false;
    this.flashdt = 1e6;
    this.flashlength = 500;
    this.exploded = false;
    this.lockedIn = true;
    this.sparks = new ParticleSystem(0, 0);
    this.particleconfigs = SparksParticleConfigs;
    this.grabber = new Rectangle(x + Math.cos(this.theta) * this.r,
                                 y + Math.sin(this.theta) * this.r,
                                 20, 20, 0);
    this.grabberFadeLength = 1000;
    this.grabberFadeDt = 0;
    this.pulseRate = 5000; //milliseconds
    this.ringpulsedt = 0;
    this.ringpulselength = 2000;
    this.pulsedt = 0;
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
    hit = (d2 <= 2 * this.radius * this.radius);
    if (hit) {
        this.caught += 1;
    }
    return hit;
};

Sink.prototype.insideInfluenceRing = function (p) {
    var v2 = new Vector(this.x - p.x, this.y - p.y),
        d2 = v2.squaredLength();
    return (d2 <= 2 * this.influenceRadius * this.influenceRadius);
};

Sink.prototype.hitGrabber = function (p) {
    var r = new Rectangle(this.x + Math.cos(this.theta) * this.influenceRadius,
                          this.y + Math.sin(this.theta) * this.influenceRadius,
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
        r1 = this.influenceRadius,
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
        r1 = this.influenceRadius + 10,
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
  
    if (this.lockedIn) {
        //start grabber fade
        if (this.grabberFadeDt < this.grabberFadeLength) {
            this.grabberFadeDt += dt;
        } else {
            this.grabberFadeDt = this.grabberFadeLength;
        }
    }
       
    this.pulsedt += dt;
    
    if (this.pulsedt >= this.pulseRate) {
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

    this.sparks.update(dt);
};

Sink.prototype.recycleParticle = function (p) {
    var dt = Math.random() * 0.1 - 0.05;
    p.x = this.x + Math.cos(this.theta + dt) * (this.influenceRadius + 10);
    p.y = this.y + Math.sin(this.theta + dt) * (this.influenceRadius + 10);
    p.vel.x = Math.cos(this.theta) * this.speed;
    p.vel.y = Math.sin(this.theta) * this.speed;
    p.color = this.outColor;
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
        p1 = new Vector(this.x + Math.cos(this.theta + dt1) * this.influenceRadius,
                        this.y + Math.sin(this.theta + dt1) * this.influenceRadius),
        p2 = new Vector(this.x + Math.cos(this.theta - dt1) * this.influenceRadius,
                        this.y + Math.sin(this.theta - dt1) * this.influenceRadius);

    canvas.radialGradient(this.x + Math.cos(this.theta) * this.influenceRadius,
                          this.y + Math.sin(this.theta) * this.influenceRadius,
                          this.radius * 0.5,
                          this.radius * 2,
                          color,
                          color,
                          0.75 * alpha,
                          0);
    canvas.circle(this.x + Math.cos(this.theta) * this.influenceRadius,
                  this.y + Math.sin(this.theta) * this.influenceRadius,
                  this.radius, color, alpha);
    canvas.radialGradient(this.x + Math.cos(this.theta) * this.influenceRadius,
                          this.y + Math.sin(this.theta) * this.influenceRadius,
                          this.radius * 0.25,
                          this.radius * 2.25,
                          [255, 255, 255],
                          color,
                          alpha,
                          0.0);
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
                          this.radius,
                          this.radius * 4,
                          color,
                          color,
                          0.5,
                          0);
    canvas.circle(this.x, this.y, this.radius * 2, color, 0.25);
    canvas.radialGradient(this.x,
                          this.y,
                          this.radius * 0.5,
                          this.radius * 1.5,
                          [255, 255, 255],
                          color,
                          1.0,
                          0.0);

    if (this.showInfluenceRing) {

        canvas.circleOutline(this.x, this.y, this.influenceRadius - 5, 1, [255, 255, 255], 1);
        canvas.circleOutline(this.x, this.y, this.influenceRadius - 5, 3, color, 1);

        canvas.circleOutline(this.x, this.y, this.influenceRadius + 5, 1, [255, 255, 255], 1);
        canvas.circleOutline(this.x, this.y, this.influenceRadius + 5, 3, color, 1);

        //draw our "fill" marker
        if (!this.isSource) {
            f = this.caught / this.maxFill * 2 * Math.PI;
            canvas.arcOutline(this.x, this.y, this.influenceRadius, 0, f, 10, color, 0.5);
        }
    }

    if (this.lockedIn && this.isSource) {
        //draw a pulsing outer ring to indicate this sink has been locked in
        radius = this.radius;
        alpha = this.grabberFadeDt / this.grabberFadeLength;
        this.drawGrabber(canvas, ParticleWorldColors[this.outColor], alpha);
    } else if (!this.full()) {
        radius = (1 - this.ringpulsedt / this.ringpulselength) * this.radius;
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
        canvas.circleOutline(this.x, this.y, this.radius, 2, [0, 100, 255], 0.25);
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
    obj.influenceBound = this.influenceBound;
    obj.showInfluenceRing = this.showInfluenceRing;
    return obj;
};

var sinkFromJson = function (j) {
    var obj = new Sink(j.x, j.y, j.radius, j.force, j.isSource);
    $.extend(obj, j);
    return obj;
};
