'use strict';

var Influencer = function (x, y, r, force) {
    this.base = Rectangle;
    this.radius = r || 15;
    this.base(x, y, 2 * this.radius, 2 * this.radius, 0);
    this.force = force || 1;
    this.influenceRadius = this.radius * 5;
    this.influenceType = 1;
    this.deflectParticles = false;
    this.sizeFactor = 1;
    this.maxSizeFactor = 3;
    this.showInfluenceRing = true;
    this.hitsThisFrame = 0;
    this.hitsToDecay = 0;
    this.hitAlpha = 0;
    this.maxHitAlpha = 0.15;
    this.growthFactor = 0.005;
    this.decayFactor = 0.0001;
    this.pulsedt = 0;
    this.pulselength = 2000;
};

Influencer.prototype = new Rectangle();

Influencer.prototype.gameObjectType = function () {
    return "Influencer";
};

Influencer.prototype.setRadius = function (val) {
    this.radius = val;
    this.influenceRadius = val * 5;
    this.w = val;
    this.h = val;
};

Influencer.prototype.influence = function (p, dt, maxSpeed) {
    var v2 = new Vector(this.x - p.x, this.y - p.y),
        r2 = Math.max(v2.squaredLength(), this.radius * this.radius),
        res;
    if (this.influenceType === 0) {
        // 1/r^2 
        res = this.force / r2;
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
    //res = Math.min(res * dt * 0.08, 0.001);
    v2 = VectorMath.normalize(v2);
    v2.x *= res;
    v2.y *= res;
    p.vel.x += v2.x;
    p.vel.y += v2.y;
};

Influencer.prototype.bounce = function (p) {
    var d1 = new Vector(p.x - this.x, p.y - this.y).length(),
        r1 = this.influenceRadius * this.sizeFactor + p.radius,
        r2 = r1 + 10,
        n;
    if (d1 < r1) {
        //get the normal vector at this point
        n = new Vector(p.x - this.x, p.y - this.y);
        n = VectorMath.normalize(n);
        p.x = this.x + r2 * n.x;
        p.y = this.y + r2 * n.y;
        return n;
    }
};

Influencer.prototype.update = function (dt, hit) {
    this.pulsedt += dt;
    if (this.pulsedt > this.pulselength) {
        this.pulsedt = 0;
    }
};

Influencer.prototype.drawGrabber = function (canvas, color, alpha) {
    var size = 20,
        dt1 = 0.3,
        theta = this.force > 0 ? Math.PI : 0,
        l = new Vector(this.x + this.radius * this.sizeFactor * 2, this.y),
        r = new Vector(this.x - this.radius * this.sizeFactor * 2, this.y),
        t = new Vector(this.x, this.y - this.radius * this.sizeFactor * 2),
        b = new Vector(this.x, this.y + this.radius * this.sizeFactor * 2);

    //right arrow
    canvas.arrowHead(l, 50, Math.PI * 0.5 + theta, color, alpha * 0.25);
    canvas.arrowHead(l, 30, Math.PI * 0.5 + theta, color, alpha * 0.5);
    canvas.arrowHead(l, 20, Math.PI * 0.5 + theta, [255, 255, 255], alpha * 0.5);
    //left arrow
    canvas.arrowHead(r, 50, 1.5 * Math.PI + theta, color, alpha * 0.25);
    canvas.arrowHead(r, 30, 1.5 * Math.PI + theta, color, alpha * 0.5);
    canvas.arrowHead(r, 20, 1.5 * Math.PI + theta, [255, 255, 255], alpha * 0.5);
    //top arrow
    canvas.arrowHead(t, 50, Math.PI + theta, color, alpha * 0.25);
    canvas.arrowHead(t, 30, Math.PI + theta, color, alpha * 0.5);
    canvas.arrowHead(t, 20, Math.PI + theta, [255, 255, 255], alpha * 0.5);
    //bottom arrow
    canvas.arrowHead(b, 50, theta, color, alpha * 0.25);
    canvas.arrowHead(b, 30, theta, color, alpha * 0.5);
    canvas.arrowHead(b, 20, theta, [255, 255, 255], alpha * 0.5);

};


Influencer.prototype.draw = function (canvas, color, dt) {
    var decayFactor = 0.001,
        maxHitAlpha = 0.15,
        hitFactor = 0.005,
        radius = this.radius,
        alpha;

    this.drawGrabber(canvas, color, 1.0);
    
    canvas.radialGradient(this.x,
                          this.y,
                          this.radius,
                          this.radius * 4,
                          color,
                          color,
                          0.5,
                          0);
    canvas.circle(this.x, this.y, this.radius * 2 * this.sizeFactor, color, 0.25);
    canvas.circle(this.x, this.y, this.radius * this.sizeFactor, color, 0.25);
    canvas.radialGradient(this.x,
                          this.y,
                          this.radius * this.sizeFactor * 0.25,
                          this.radius * 1.5 * this.sizeFactor,
                          [255, 255, 255],
                          color,
                          0.9,
                          0.0);
    if (this.showInfluenceRing) {
        canvas.circleOutline(this.x, this.y, this.influenceRadius * this.sizeFactor, 3, [255, 255, 255], 0.5);
        canvas.circleOutline(this.x, this.y, this.influenceRadius * this.sizeFactor, 1, color, 0.75);
    }
    if (this.force < 0) {
        radius = this.pulsedt / this.pulselength * this.radius * this.sizeFactor;
    } else {
        radius = (1 - this.pulsedt / this.pulselength) * this.radius * this.sizeFactor;
    }
    alpha = this.pulsedt / this.pulselength;
    alpha = Math.sin(alpha * Math.PI);
    if (alpha < 0.001) {
        alpha = 0.001;
    }
    /*
    alpha = 1.0;
    radius = this.influenceRadius;

    //radius = Math.min(0.01, radius);
    
    canvas.radialGradient(this.x,
                          this.y,
                          this.radius,
                          radius * 1.25,
                          [255, 255, 255],
                          color,
                          0.25 * alpha,
                          0.0);
    canvas.circleOutline(this.x, this.y, radius, 10, [255, 255, 255], 0.5 * alpha);
    canvas.circleOutline(this.x, this.y, radius, 3, color, 0.7 * alpha);
    */
    if (this.selected) {
        canvas.circleOutline(this.x, this.y, this.radius * this.sizeFactor, 2, [0, 100, 255], 0.25);
    }
   
};

Influencer.prototype.serialize = function () {
    var obj = this.baseSerialize();
    obj.radius = this.radius;
    obj.force = this.force;
    obj.influenceRadius = this.influenceRadius;
    obj.influenceType = this.influenceType;
    obj.maxSizeFactor = this.maxSizeFactor;
    obj.showInfluenceRing = this.showInfluenceRing;
    return obj;
};


var influencerFromJson = function (j) {
    var obj = new Influencer(j.x, j.y, j.radius, j.force);
    $.extend(obj, j);
    return obj;
};
