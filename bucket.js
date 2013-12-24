'use strict';

var Bucket = function (x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.multiplier = 1;
};

var bucketFromJson = function (j) {
    return new Bucket(j.x, j.y, j.w, j.h);
};

Bucket.prototype = {
    draw: function (canvas, color) {
        canvas.rectangle(this.x, this.y, this.w, this.h, color);
    }
};
