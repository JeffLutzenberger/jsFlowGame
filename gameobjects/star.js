'use strict';

/* a wormhole is just a hole in a grid wall...
 * it allows particles to flow through it
 *
 * */
var Wormhole = function (x, y, size, oneway) {
    this.base = Rectangle;
    base(x, y, l, 10, 0);
};

Wormhole.prototype = new Rectangle();

var Star = function (x, y, r, force) {
    this.base = Rectangle;
    this.radius = r || 50;
    this.base(x, y, 2 * this.radius, 2 * this.radius, 0);
    this.force = force || 1;
    this.influenceRadius = this.radius * 5;
    this.sizeFactor = 1;
    this.maxSizeFactor = 1.5;
    this.showInfluenceRing = true;
    this.hitsThisFrame = 0;
    this.hitsToDecay = 0;
    this.hitAlpha = 0;
    this.maxHitAlpha = 0.15;
    this.growthFactor = 0.005;
    this.decayFactor = 0.0001;
    this.pulsedt = 0;
    this.pulselength = 2000;
    this.energy = 0;
    this.maxEnergy = 100;
    this.explode = false;
    this.inactive = false;
    this.explodedt = 0;
    this.growthFactor = 0.15;
    this.explosion = new ParticleSystem(x, y);
    this.explosion.init(x, y, 100, 10);
    this.animationTheta = 0;

    //allow some stars to put down a doorway between grid walls...
    this.wormhole = undefined;//new Wormhole(x, y, size);

};

Star.prototype = new Rectangle();

Star.prototype.gameObjectType = function () {
    return "Star";
};

Star.prototype.setRadius = function (val) {
    this.radius = val;
    this.influenceRadius = val * 5;
    this.w = val;
    this.h = val;
};

Star.prototype.hit = function (p) {
    var v2 = new Vector(this.x - p.x, this.y - p.y),
        d2 = v2.squaredLength();
    return (d2 <= 2 * this.radius * this.radius * this.sizeFactor * this.sizeFactor);
};


Star.prototype.update = function (dt, hit) {
    //this.energy = Math.max(0, this.energy - this.energy * 0.0001 * dt);
    this.brightness = Math.min(this.brightness, 1.0);
    this.animationTheta += 0.001 * dt;
    
    if (this.animationTheta > Math.PI * 2) {
        this.animationTheta = 0.0;
    }
    
    if (this.energy >= this.maxEnergy * 0.9 && this.explode === false) {
        console.log("explode");
        this.explode = true;
        this.inactive = true;
        this.explosion.burst(this.x, this.y, 0.1, 50);
    }

    if (this.explode === true) {
        this.explodedt += dt;
        this.explosion.update(dt);
    }

    this.pulsedt += dt;
    if (this.pulsedt > this.pulselength) {
        this.pulsedt = 0;
    }
};

Star.prototype.addEnergy = function () {
    this.energy += this.growthFactor;
    //this.flash = true;
    if (this.energy > this.maxEnergy) {
        this.energy = this.maxEnergy;
    }
    //if (this.getOrbitalShell() > this.orbitals.length) {
    //    this.addOrbital();
    //}

};

Star.prototype.drawStar = function (canvas, color, alpha) {
    var size = 20,
        dt1 = 0.3,
        size = this.radius * 5,
        theta = this.force < 0 ? Math.PI : 0,
        theta2 = theta,
        //l = new Vector(this.x + this.radius * this.sizeFactor * 2, this.y),
        //r = new Vector(this.x - this.radius * this.sizeFactor * 2, this.y),
        //t = new Vector(this.x, this.y - this.radius * this.sizeFactor * 2),
        //b = new Vector(this.x, this.y + this.radius * this.sizeFactor * 2);

        l = new Vector(this.radius * this.sizeFactor * 2, 0),
        r = new Vector(-this.radius * this.sizeFactor * 2,0),
        t = new Vector(0, -this.radius * this.sizeFactor * 2),
        b = new Vector(0, this.radius * this.sizeFactor * 2),
        l2, r2, t2, b2;

    //if (!this.inactive) {
    //    theta2 += this.animationTheta;
    //}
    l2 = VectorMath.rotatePoint(l, theta2);
    r2 = VectorMath.rotatePoint(r, theta2);
    t2 = VectorMath.rotatePoint(t, theta2);
    b2 = VectorMath.rotatePoint(b, theta2);

    l.x += this.x;
    l.y += this.y;
    r.x += this.x;
    r.y += this.y;
    t.x += this.x;
    t.y += this.y;
    b.x += this.x;
    b.y += this.y;
    l2.x += this.x;
    l2.y += this.y;
    r2.x += this.x;
    r2.y += this.y;
    t2.x += this.x;
    t2.y += this.y;
    b2.x += this.x;
    b2.y += this.y;
    //right arrow
    canvas.arrowHead(l2, size, Math.PI * 0.5 + theta2, color, alpha * 0.25);
    canvas.arrowHead(l, size * 0.5, Math.PI * 0.5 + theta, color, alpha * 0.5);
    canvas.arrowHead(l, size * 0.3, Math.PI * 0.5 + theta, [255, 255, 255], alpha * 0.5);
    //left arrow
    canvas.arrowHead(r2, size, 1.5 * Math.PI + theta2, color, alpha * 0.25);
    canvas.arrowHead(r, size * 0.5, 1.5 * Math.PI + theta, color, alpha * 0.5);
    canvas.arrowHead(r, size * 0.3, 1.5 * Math.PI + theta, [255, 255, 255], alpha * 0.5);
    //top arrow
    canvas.arrowHead(t2, size, Math.PI + theta2, color, alpha * 0.25);
    canvas.arrowHead(t, size * 0.5, Math.PI + theta, color, alpha * 0.5);
    canvas.arrowHead(t, size * 0.3, Math.PI + theta, [255, 255, 255], alpha * 0.5);
    //bottom arrow
    canvas.arrowHead(b2, size, theta2, color, alpha * 0.25);
    canvas.arrowHead(b, size * 0.5, theta, color, alpha * 0.5);
    canvas.arrowHead(b, size * 0.3, theta, [255, 255, 255], alpha * 0.5);

};

Star.prototype.draw = function (canvas, color, dt) {
    var decayFactor = 0.001,
        maxHitAlpha = 0.15,
        hitFactor = 0.005,
        radius = this.radius,
        alpha = 1.0,
        w = this.radius,
        h = this.radius * 1.2;

    this.sizeFactor = 1 + this.energy / this.maxEnergy * this.maxSizeFactor;
   
    if (this.inactive) {
        //alpha = 0.70;
        this.sizeFactor = 1 + this.maxSizeFactor;
    } else {
        alpha = 0.75;
    }

    if (this.explode === true) {
        this.explosion.draw(canvas, color);
    }
    
    canvas.diamond(this.x, this.y, w, h, 0, 10, color, 0.5);
    canvas.diamond(this.x, this.y, w, h, 0, 5, color, 1.0);
    canvas.diamond(this.x, this.y, w, h, 0, 2, [255, 255, 255], 0.9);
}
/*Star.prototype.draw = function (canvas, color, dt) {
    var decayFactor = 0.001,
        maxHitAlpha = 0.15,
        hitFactor = 0.005,
        radius = this.radius,
        alpha = 1.0;

    this.sizeFactor = 1 + this.energy / this.maxEnergy * this.maxSizeFactor;
   
    if (this.inactive) {
        //alpha = 0.70;
        this.sizeFactor = 1 + this.maxSizeFactor;
    } else {
        alpha = 0.75;
    }

    if (this.explode === true) {
        this.explosion.draw(canvas, color);
    }

    this.drawStar(canvas, color, alpha);
    
    canvas.radialGradient(this.x,
                          this.y,
                          this.radius * this.sizeFactor,
                          this.radius * 4 * this.sizeFactor,
                          color,
                          color,
                          alpha * 0.5,
                          0);
    canvas.circle(this.x, this.y, this.radius * 1.5 * this.sizeFactor, color, 0.25);
    canvas.circle(this.x, this.y, this.radius * this.sizeFactor, color, 0.25);
    canvas.radialGradient(this.x,
                          this.y,
                          this.radius * this.sizeFactor * 0.25,
                          this.radius * 1.5 * this.sizeFactor,
                          [255, 255, 255],
                          color,
                          alpha * 0.9,
                          0.0);
    //if (this.showInfluenceRing) {
    //    canvas.circleOutline(this.x, this.y, this.influenceRadius * this.sizeFactor, 3, [255, 255, 255], 0.5);
    //    canvas.circleOutline(this.x, this.y, this.influenceRadius * this.sizeFactor, 1, color, 0.75);
    //}
    if (this.selected) {
        canvas.circleOutline(this.x, this.y, this.radius * this.sizeFactor, 2, [0, 100, 255], 0.25);
    }
};
*/
Star.prototype.serialize = function () {
    var obj = {};
    obj.x = this.x;
    obj.y = this.y;
    obj.radius = this.radius;
    obj.influenceRadius = this.influenceRadius;
    obj.force = this.force;
    return obj;
};

var starFromJson = function (j) {
    return new Star(j.x, j.y, j.radius, j.force);
};


