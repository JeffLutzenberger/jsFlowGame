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
    }
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

Bucket.prototype = {
    draw: function (canvas, color) {
        canvas.rectangle(this.x, this.y, this.w, this.h, color);
    }
};

var Obstacle = function (x, y, w, h, theta, reaction) {
    this.base = Rectangle;
    this.base(x, y, w, h, theta);
    this.reaction = reaction;
};

var obstacleFromJson = function (j) {
    return new Obstacle(j.x, j.y, j.w, j.h, j.theta, j.reaction);
};


