'use strict';

function Bucket(x, y, w, h, theta) {
    this.base = Rectangle;
    this.base(x, y, w, h, theta);
    this.hasBottom = false;
    this.inColor = 'red';
    this.outColor = 'green';
}

Bucket.prototype = new Rectangle();

Bucket.prototype.gameObjectType = function () {
    return "Bucket";
};

Bucket.prototype.hit = function (p) {
    var r = 10;
    
    if (this.hasBottom) {
        if (p.lineCollision(this.p1, this.p2, r)) {
            //count this as being caught
            //add score and recycle the particle
            if (p.color === this.inColor) {
                p.source.recycleParticle(p);
                return undefined;
            } else {
                return this.n1;
            }
        }
        if (p.lineCollision(this.p2, this.p3, r)) {
            p.bounce(this.n2);
            return this.n2;
        }
        if (this.hasBottom && p.lineCollision(this.p3, this.p4, r)) {
            p.bounce(this.n3);
            return this.n3;
        }
        if (p.lineCollision(this.p4, this.p1, r)) {
            p.bounce(this.n4);
            return this.n4;
        }
    } else if (p.lineCollision(this.p5, this.p6, r)) {
        if (VectorMath.dot(p.vel, this.n1) > 0) {
            //going from out color to in color...
            if (p.color !== this.outColor) {
                //colors don't match so don't let the particle through
                p.bounce(this.n3);
                return this.n3;
            } else {  
                p.color = this.inColor;
                p.redirect(this.n1);
                return this.n1;
            }
        } else {
            if (p.color !== this.inColor) {
                //colors don't match so don't let the particle through
                p.bounce(this.n1);
                return this.n1;
            } else {  
                p.color = this.outColor;
                p.redirect(this.n3);
                return this.n3;
            }
        }
    }
    return undefined;
};


Bucket.prototype.draw = function (canvas, inColor, outColor) {
    var alpha = 1.0, theta = Math.PI / 180 * this.theta;
    inColor = ParticleWorldColors[this.inColor];
    outColor = ParticleWorldColors[this.outColor];
    if (this.hasBottom) {
        canvas.bucket(this.x, this.y, this.w, this.h, theta, 20, inColor, 0.25);
        canvas.bucket(this.x, this.y, this.w, this.h, theta, 10, inColor, 0.5);
        canvas.bucket(this.x, this.y, this.w, this.h, theta, 5, [255, 255, 255], 0.9);
        canvas.bucket(this.x, this.y, this.w, this.h, theta, 30, inColor, 0.15);
    } else {
        canvas.funnel(this.x, this.y, this.w, this.h, theta, 20, inColor, outColor, 0.25);
        canvas.funnel(this.x, this.y, this.w, this.h, theta, 10, inColor, outColor, 0.5);
        canvas.funnel(this.x, this.y, this.w, this.h, theta, 5, [255, 255, 255], [255, 255, 255], 0.9);
        canvas.funnel(this.x, this.y, this.w, this.h, theta, 30, inColor, outColor, 0.15);
    }
};

Bucket.prototype.serialize = function () {
    var obj = this.baseSerialize();
    obj.hasBottom = this.hasBottom;
    obj.inColor = this.inColor;
    obj.outColor = this.outColor;
    return obj;
};

var bucketFromJson = function (j) {
    var obj = new Bucket(j.x, j.y, j.w, j.h, j.theta);
    $.extend(obj, j);
    return obj;
};


