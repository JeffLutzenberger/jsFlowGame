'use strict';

var Vector = function (x, y) {
    this.x = x;
    this.y = y;
};

Vector.prototype = {

    addNew: function (v) {
        var nx, ny;
        nx = this.x + v.x;
        ny = this.y + v.y;
        return new Vector(nx, ny);
    },

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

    toString: function () {
        return "[" + this.x + "," + this.y + "]";
    }

};

var ParticleLineCollision = function (p1, p2, particle) {
    var LocalP1 = p1 - particle,
        LocalP2 = p2 - particle,
        P2MinusP1 = LocalP1 - LocalP2,
        Radius = particle.r,
        a = (P2MinusP1.x) * (P2MinusP1.x) + (P2MinusP1.y) * (P2MinusP1.y),
	    b = 2 * ((P2MinusP1.x * LocalP1.x) + (P2MinusP1.y * LocalP1.y)),
        c = (LocalP1.x * LocalP1.x) + (LocalP1.y * LocalP1.y) – (Radius * Radius),
	    delta = b * b – (4 * a * c);

    if (delta < 0) {
        // No intersection
        return false;
    } else if (delta === 0) {
        return true;
        // One intersection
        //u = -b / (2 * a);
        //return LineP1 + (u * P2MinusP1);
        //Use LineP1 instead of LocalP1 because we want our answer in global
        //space, not the circle's local space
    } else if (delta > 0) {
        return true;
        // Two intersections
        //SquareRootDelta = Math.sqrt(delta);

        //u1 = (-b + SquareRootDelta) / (2 * a);
        //u2 = (-b - SquareRootDelta) / (2 * a);

        //return (LineP1 + (u1 * P2MinusP1) ; LineP1 + (u2 * P2MinusP1));
    }
}

