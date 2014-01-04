'use strict';

var Vector = function (x, y) {
    this.x = x;
    this.y = y;
};

Vector.prototype = {

    squaredLength: function () {
        return (this.x * this.x) + (this.y * this.y);
    },

    length: function () {
        return Math.sqrt(this.squaredLength());
    },

    scalarMultiply: function (num) {
        this.x *= num;
        this.y *= num;
        return this;
    },

    normalize: function () {
        var l = this.length();
        this.x /= l;
        this.y /= l;
        return this;
    },

    dot: function (v) {
        return this.x * v.x + this.y * v.y;
    },

    toString: function () {
        return "[" + this.x + "," + this.y + "]";
    }
};

var VectorMath = {
    squaredLength: function (v) {
        return v.x * v.x + v.y *v.y;
    },

    length: function (v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    },
    
    normalize: function (v) {
        var l = 1/this.length();
        v.x *= l;
        v.y *= l;
        return new Vector(v.x, v.y);
    },

    dot: function (v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
};
