'use strict';

var Particle = function (x, y) {
    this.x = x;
    this.y = y;
    this.dir = new Vector(1, 0);
    this.vel = new Vector(1, 0);
    this.mass = this.inv_mass = 1;
    this.radius = 5;
    this.trail = [];
    this.numTracers = 20;
    this.tracerradius = 0.075;
    var i = 0, t;
    for (i = 0; i < this.numTracers; i += 1) {
        t = new Tracer(this.x, this.y);
        this.trail.push(t);
    }
};

Particle.prototype = {

    distanceSquared: function (p) {
        var dx = this.x - p.x,
            dy = this.y - p.y;
        return dx * dx + dy * dy;
    },

    trace: function () {
        var i = 0;
        for (i = 0; i < this.numTracers; i += 1) {
            this.trail[i].age += 1;
        }
        this.trail.unshift(this.trail.pop());
        this.trail[0].x = this.x;
        this.trail[0].y = this.y;
        this.trail[0].age = 0;
    },
    
    draw: function (canvas, color) {
        var i = 0, alpha = 1.0, t1, t2;
        canvas.circle(this.x, this.y, this.radius, color);
        for (i = 1; i < this.numTracers; i += 1) {
            t1 = this.trail[i - 1];
            t2 = this.trail[i];
            alpha = (this.numTracers - this.trail[i].age) / this.numTracers;
            color = 'rgba(0,153,255,' + alpha + ')';
            canvas.line(t1, t2, color);
        }
    }
};

var Tracer = function (x, y) {
    this.x = x;
    this.y = y;
    this.age = 0;
};

var Influencer = function (x, y) {
    this.x = x;
    this.y = y;
    this.force = 1;
    this.radius = 10;
};

Influencer.prototype = {
    draw: function (canvas, color) {
        canvas.circle(this.x, this.y, this.radius, color);
    }
};

var influencerFromJson = function (j) {
    return new Influencer(j.x, j.y);
};
