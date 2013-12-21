'use strict';

var Bucket = function (x, y, width) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.multiplier = 1;
};

var bucketFromJson = function (j) {
    return new Bucket(j.x, j.y, j.width);
}
