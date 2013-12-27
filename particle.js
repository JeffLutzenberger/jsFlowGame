'use strict';

var Particle = function (x, y) {
    this.x = x;
    this.y = y;
    this.prevx = x;
    this.prevy = y;
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

    move : function (p) {
        this.prevx = this.x;
        this.prevy = this.y;
        this.x += this.vel.x;
        this.y += this.vel.y;
    },

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
    },

    lineCollision : function (p1, p2) {
        var LineA1 = new Vector(this.prevx, this.prevy),
            LineA2 = new Vector(this.x, this.y),
            LineB1 = new Vector(p1.x, p1.y),
            LineB2 = new Vector(p2.x, p2.y),
            denom = (LineB2.y - LineB1.y) * (LineA2.x - LineA1.x) - (LineB2.x - LineB1.x) * (LineA2.y - LineA1.y),
            ua,
            ub;
            
        if (denom === 0) {
            return false;
        } else {
            ua = ((LineB2.x - LineB1.x) * (LineA1.y - LineB1.y) - (LineB2.y - LineB1.y) * (LineA1.x - LineB1.x)) / denom;
            /* The following lines are only necessary if we are checking line segments instead of infinite-length lines */
		    ub = ((LineA2.x - LineA1.x) * (LineA1.y - LineB1.y) - (LineA2.y - LineA1.y) * (LineA1.x - LineB1.x)) / denom;
		    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
			    return null;
            }
            this.x = LineA1.x + ua * (LineA2.x - LineA1.x);
            this.y = LineA1.y + ua * (LineA2.y - LineA1.y);
            this.prevx = this.x;
            this.prevy = this.y;
		    return true; //LineA1 + ua * (LineA2 – LineA1)
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
