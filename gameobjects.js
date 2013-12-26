'use strict';

var Rectangle = function (x, y, w, h, theta) {
    this.x = x || 0;
    this.y = y || 0;
    this.w = w || 100;
    this.h = h || 100;
    this.theta = theta || 0;
};

Rectangle.prototype = {
    draw: function (canvas, color) {
        canvas.rectangle(this.x, this.y, this.w, this.h, this.theta, color);
    },

    hit: function (p) {
        if (p.x < this.x + this.w && p.x > this.x && p.y > this.y && p.y < this.y + this.h) {
            return true;
        
        return false;
    }
};

function Source(x, y, w, h, theta, vx, vy) {
    this.base = Rectangle;
    this.base(x, y, w, h, theta);
    this.vx = vx || 0;
    this.vy = vy || 0.5;
}

Source.prototype = new Rectangle();

var sourceFromJson = function (j) {
    return new Source(j.x, j.y, j.w, j.h, j.theta, j.vx, j.vy);
};

function Bucket(x, y, w, h, theta, multiplier) {
    this.base = Rectangle;
    this.base(x, y, w, h, theta);
    this.multiplier = multiplier || 1;
}

Bucket.prototype = new Rectangle();

var bucketFromJson = function (j) {
    return new Bucket(j.x, j.y, j.w, j.h, j.theta);
};

var Obstacle = function (x, y, w, h, theta, reaction) {
    this.base = Rectangle;
    this.base(x, y, w, h, theta);
    this.reaction = reaction;
};

Obstacle.prototype = new Rectangle();

var obstacleFromJson = function (j) {
    return new Obstacle(j.x, j.y, j.w, j.h, j.theta, j.reaction);
};


var Portal = function (x1, y1, w1, h1, theta1, x2, y2, w2, h2, theta2) {
    this.inlet = new Rectangle(x1, y1, w1, h1, theta1);
    this.outlet = new Rectangle(x2, y2, w2, h2, theta2);
    this.multiplier = 1;
};

var portalFromJson = function (j) {
    return new Portal(j.xin, j.yin, j.win, j.hin, j.thetain, j.xout, j.yout, j.wout, j.hout, j.thetaout);
};

Portal.prototype = {
    draw: function (canvas, color) {
        this.inlet.draw(canvas, color);
        this.outlet.draw(canvas, color);
    },

    hit: function (p) {
        var i = 0, r1 = this.inlet, r2 = this.outlet;
        if (p.x < r1.x + r1.w && p.x > r1.x && p.y > r1.y && p.y < r1.y + r1.h) {
            //move the particle to the channel outlet
            p.x = r2.x + Math.random() * r2.w;
            p.y = r2.y + r2.h;
            for (i = 0; i < p.numTracers; i += 1) {
                p.trail[i].x = p.x;
                p.trail[i].y = p.y;
            }
            return true;
        }
        return false;
    }
};
