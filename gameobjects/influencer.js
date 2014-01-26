'use strict';

var Influencer = function (x, y, r, influenceRadius, force) {
    this.base = Rectangle;
    this.radius = r || 15;
    this.base(x, y, 2 * this.radius, 2 * this.radius, 0);
    this.force = force || 1;
    this.influenceRadius = influenceRadius || 100;
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

Influencer.prototype.update = function (dt, hit) {
    /*if (hit) {
        this.sizeFactor = Math.min(this.maxSizeFactor, this.sizeFactor + this.growthFactor);
        this.hitAlpha = Math.min(this.maxHitAlpha, this.hitAlpha + this.growthFactor);
    }
    this.hitAlpha = Math.max(0.0, this.hitAlpha - this.decayFactor);
    this.sizeFactor = Math.max(1.0, this.sizeFactor - this.decayFactor);
    */
    this.pulsedt += dt;
    //console.log(this.pulsedt);
    if (this.pulsedt > this.pulselength) {
        this.pulsedt = 0;
    }
};

Influencer.prototype.draw = function (canvas, color, dt) {
    var decayFactor = 0.001,
        maxHitAlpha = 0.15,
        hitFactor = 0.005,
        radius = this.radius,
        alpha;

    /*canvas.circle(
        this.x,
        this.y,
        this.radius * 4 * this.sizeFactor,
        [255, 255, 255],
        this.hitAlpha
    );*/
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
        canvas.circleOutline(this.x, this.y, this.influenceRadius * this.sizeFactor, 3, [255, 255, 255], 0.9);
        canvas.circleOutline(this.x, this.y, this.influenceRadius * this.sizeFactor, 1, color, 1);
    }
    if (this.force > 0 ) {
        radius = this.pulsedt / this.pulselength * this.radius * this.sizeFactor;
    } else {
        radius = (1 - this.pulsedt / this.pulselength) * this.radius * this.sizeFactor;
    }
    alpha = Math.sin(this.pulsedt / this.pulselength * Math.PI);
    alpha = Math.max(0, alpha);
    alpha = Math.min(1, alpha);
    canvas.radialGradient(this.x,
                          this.y,
                          radius,
                          radius * 10,
                          [255, 255, 255],
                          color,
                          0.5 * alpha,
                          0.0);
    
    canvas.circleOutline(this.x, this.y, radius * 7, 10, [255, 255, 255], 0.5 * alpha);
    canvas.circleOutline(this.x, this.y, radius * 7, 3, color, 0.7 * alpha);
 

    if (this.selected) {
        canvas.circleOutline(this.x, this.y, this.radius * this.sizeFactor, 2, [0, 100, 255], 0.25);
    }
};

var influencerFromJson = function (j) {
    return new Influencer(j.x, j.y, j.radius, j.influenceRadius, j.force);
};


