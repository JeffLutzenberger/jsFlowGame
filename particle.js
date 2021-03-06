'use strict';

var Particle = function (x, y, r) {
    this.x = x;
    this.y = y;
    this.prevx = x;
    this.prevy = y;
    this.dir = new Vector(1, 0);
    this.vel = new Vector(1, 0);
    this.mass = this.inv_mass = 1;
    this.radius = r || 4;
    this.trail = [];
    this.numTracers = 20;
    this.traceWidth = 1;
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
        canvas.circle(this.x, this.y, this.radius * 2, 'rgba(0,153,255,0.25)');
        canvas.circle(this.x, this.y, this.radius, 'rgba(0,153,255,1)');
        //canvas.circle(this.x, this.y, this.radius, color);
        for (i = 1; i < this.numTracers; i += 1) {
            t1 = this.trail[i - 1];
            t2 = this.trail[i];
            alpha = (this.numTracers - this.trail[i].age) / this.numTracers;
            //color = 'rgba(0,153,255,' + alpha * 0.25 + ')';
            //canvas.line(t1, t2, this.traceWidth * 2, color);
            color = 'rgba(0,153,255,' + alpha + ')';
            canvas.line(t1, t2, this.traceWidth, color);
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
            
        if (denom !== 0) {
            ua = ((LineB2.x - LineB1.x) * (LineA1.y - LineB1.y) - (LineB2.y - LineB1.y) * (LineA1.x - LineB1.x)) / denom;
		    ub = ((LineA2.x - LineA1.x) * (LineA1.y - LineB1.y) - (LineA2.y - LineA1.y) * (LineA1.x - LineB1.x)) / denom;
		    if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
			    return null;
            }
            this.x = LineA1.x + ua * (LineA2.x - LineA1.x);
            this.y = LineA1.y + ua * (LineA2.y - LineA1.y);
            this.prevx = this.x;
            this.prevy = this.y;
		    return true;
        }
        return false;
    },

    circleCollision: function (p1, p2) {
        var LocalP1 = new Vector(p1.x - this.x, p1.y - this.y),
            LocalP2 = new Vector(p2.x - this.x, p2.y - this.y),
            P2MinusP1 = new Vector(LocalP2.x - LocalP1.x, LocalP2.y - LocalP1.y),
            a = (P2MinusP1.x * P2MinusP1.x) + (P2MinusP1.y * P2MinusP1.y),
            b = 2 * (P2MinusP1.x * LocalP1.x + P2MinusP1.y * LocalP1.y),
            c = LocalP1.x * LocalP1.x + LocalP1.y * LocalP1.y - this.radius * this.radius,
            delta = b * b - (4 * a * c),
            u1,
            u2,
            SquareRootDelta;

        if (delta === 0) {
            u1 = -b / (2 * a);
            if (u1 >= 0.0 && u1 <= 1.0) {
                return true;
            }
        } else if (delta > 0) {
            SquareRootDelta = Math.sqrt(delta);
            u1 = (-b + SquareRootDelta) / (2 * a);
            u2 = (-b - SquareRootDelta) / (2 * a);
            if (u1 >= 0 && u1 <= 1.0 && u2 >= 0 && u2 <= 1.0) {
                return true;
            }
        }
        return false;
    },

    circleCircleCollision: function (x1, y1, r1) {
        var x2 = this.x,
            y2 = this.y,
            r2 = this.radius,
            d = r1 + r2,
            v12 = new Vector(x2 - x1, y2 - y1),
            d12 = v12.length();
        //console.log(d12);
        //console.log(d);
        if (d12 < d) {
            return new Vector((x1 * r2 + x2 * r1) / (r1 + r2), (y1 * r2 + y2 * r1) / (r1 + r2));
        }
    }
};

var Tracer = function (x, y) {
    this.x = x;
    this.y = y;
    this.age = 0;
};


