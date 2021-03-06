'use strict';

var Rectangle = function (x, y, w, h, theta) {
    this.x = x || 0; // centroid
    this.y = y || 0; // centroid
    this.w = w || 100;
    this.h = h || 100;
    this.theta = theta || 0;
    this.selected = false;
    this.updatePoints();
};

Rectangle.prototype = {

    gameObjectType : function () {
        return Rectangle;
    },

    rotatePoint : function (x, y, theta) {
        var degtorad = Math.PI / 180,
            x1 = Math.cos(theta * degtorad) * x + Math.sin(theta * degtorad) * y,
            y1 = -Math.sin(theta * degtorad) * x + Math.cos(theta * degtorad) * y;
        return new Vector(x1, y1);
    },

    updatePoints : function () {
        var xl1 = -this.w * 0.5,
            xl2 = this.w * 0.5,
            yl1 = -this.h * 0.5,
            yl2 = this.h * 0.5,
            theta = Math.PI / 180 * this.theta,
            pl1 = this.rotatePoint(xl1, yl1, this.theta),
            pl2 = this.rotatePoint(xl2, yl1, this.theta),
            pl3 = this.rotatePoint(xl2, yl2, this.theta),
            pl4 = this.rotatePoint(xl1, yl2, this.theta);

        this.p1 = new Vector(this.x + pl1.x, this.y + pl1.y);
        this.p2 = new Vector(this.x + pl2.x, this.y + pl2.y);
        this.p3 = new Vector(this.x + pl3.x, this.y + pl3.y);
        this.p4 = new Vector(this.x + pl4.x, this.y + pl4.y);
        this.n1 = new Vector(this.p1.x - this.p4.x, this.p1.y - this.p4.y).normalize();
        this.n2 = new Vector(this.p2.x - this.p1.x, this.p2.y - this.p1.y).normalize();
        this.n3 = new Vector(this.p3.x - this.p2.x, this.p3.y - this.p2.y).normalize();
        this.n4 = new Vector(this.p4.x - this.p3.x, this.p4.y - this.p3.y).normalize();
    },

    setxy: function (x, y) {
        this.x = x;
        this.y = y;
        this.updatePoints();
    },

    draw: function (canvas, color) {
        canvas.rectangle(this.p1, this.p2, this.p3, this.p4, color);
        canvas.rectangleOutline(this.p1, this.p2, this.p3, this.p4, 1, 'rgba(100,100,100,1)');
        if (this.selected) {
            canvas.rectangleOutline(this.p1, this.p2, this.p3, this.p4, 2, 'rgba(0,100,255,1)');
        }
    },
    
    bbHit : function (p) {
        return (p.x >= this.x - this.w * 0.5 &&
                p.x <= this.x + this.w * 0.5 &&
                p.y >= this.y - this.h * 0.5 &&
                p.y <= this.y + this.h * 0.5);
    },

    hit : function (p) {
        var r = 10;
        if (p.lineCollision(this.p1, this.p2, r)) {
            return this.n1;
        }
        if (p.lineCollision(this.p2, this.p3, r)) {
            return this.n2;
        }
        if (p.lineCollision(this.p3, this.p4, r)) {
            return this.n3;
        }
        if (p.lineCollision(this.p4, this.p1, r)) {
            return this.n4;
        }
        return undefined;
    },

    circleHit : function (p) {
        return (p.circleCollision(this.p1, this.p2) ||
                p.circleCollision(this.p2, this.p3) ||
                p.circleCollision(this.p3, this.p4) ||
                p.circleCollision(this.p4, this.p1));
    }
};

var Influencer = function (x, y, r, influenceRadius, force) {
    this.base = Rectangle;
    this.radius = r || 15;
    this.base(x, y, 2 * this.radius, 2 * this.radius, 0);
    this.force = force || 1;
    this.influenceRadius = influenceRadius || 100;
    this.showInfluenceRing = false;
};

Influencer.prototype = new Rectangle();

Influencer.prototype.gameObjectType = function () {
    return "Influencer";
};

Influencer.prototype.draw = function (canvas, color) {
    canvas.circle(this.x, this.y, this.radius * 2, 'rgba(0,153,255,0.25)');
    canvas.circle(this.x, this.y, this.radius, color);
    //canvas.circleGradient(this.x, this.y, this.influenceRadius, color);
    if (this.showInfluenceRing) {
        canvas.circleOutline(this.x, this.y, this.influenceRadius, 1, color);
    }
    if (this.selected) {
        canvas.circleOutline(this.x, this.y, this.radius, 2, 'rgba(0,100,255,0.25)');
    }
};

var influencerFromJson = function (j) {
    return new Influencer(j.x, j.y, j.radius, j.influenceRadius, j.force);
};

var Sink = function (x, y, r, influenceRadius, force) {
    this.base = Influencer;
    this.base(x, y, r, influenceRadius, force);
};

Sink.prototype = new Influencer();

Sink.prototype.gameObjectType = function () {
    return "Sink";
};

Sink.prototype.hit = function (p) {
    var v2 = new Vector(this.x - p.x, this.y - p.y),
        d2 = v2.squaredLength();
    return (d2 <= 2 * this.radius * this.radius);
};

Sink.prototype.contain = function (p) {
    var v = new Vector(p.vel.x, p.vel.y),
        c1 = new Particle(p.x, p.y, p.radius),
        p1 = new Vector(p.prevx, p.prevy),
        p2 = new Vector(p.x, p.y),
        d1 = new Vector(p1.x - this.x, p2.y - this.y).length(),
        d2 = new Vector(p2.x - this.x, p2.y - this.y).length(),
        hitPoint;
    if (d1 < d2) {
        hitPoint = c1.circleCircleCollision(this.x, this.y, this.influenceRadius);
        if (hitPoint) {
            v = new Vector(this.x - hitPoint.x, this.y - hitPoint.y);
            d1 = v.length() + 20;
            //this algorithm returns true if the particle is inside the influence radius
            //there should only be a collision if the particle circle overlaps the edge
            //of the influence radius
            if (d1 >= this.influenceRadius) {
                return v.normalize();
            }
        }
    }
};

var sinkFromJson = function (j) {
    return new Sink(j.x, j.y, j.radius, j.influenceRadius, j.force);
};

function Source(x, y, w, h, theta, v) {
    this.base = Rectangle;
    this.base(x, y, w, h, theta);
    this.v = v || 0.5;
}

Source.prototype = new Rectangle();

Source.prototype.gameObjectType = function () {
    return "Source";
};

var sourceFromJson = function (j) {
    return new Source(j.x, j.y, j.w, j.h, j.theta, j.v);
};

function Bucket(x, y, w, h, theta, multiplier) {
    this.base = Rectangle;
    this.base(x, y, w, h, theta);
    this.multiplier = multiplier || 1;
}

Bucket.prototype = new Rectangle();

Bucket.prototype.gameObjectType = function () {
    return "Bucket";
};

var bucketFromJson = function (j) {
    return new Bucket(j.x, j.y, j.w, j.h, j.theta);
};

var Obstacle = function (x, y, w, h, theta, reaction) {
    this.base = Rectangle;
    this.base(x, y, w, h, theta);
    this.reaction = reaction || 1;
};

Obstacle.prototype = new Rectangle();

Obstacle.prototype.gameObjectType = function () {
    return "Obstacle";
};

var obstacleFromJson = function (j) {
    return new Obstacle(j.x, j.y, j.w, j.h, j.theta, j.reaction);
};

var Portal = function (x, y, w, h, theta, outlet) {
    this.base = Rectangle;
    this.base(x, y, w, h, theta);
    this.outlet = outlet || null;
};

Portal.prototype = new Rectangle();

Portal.prototype.gameObjectType = function () {
    return "Portal";
};

var portalFromJson = function (j) {
    var outlet = new Portal(j.xout, j.yout, j.wout, j.hout, j.thetaout),
        inlet = new Portal(j.xin, j.yin, j.win, j.hin, j.thetain, outlet);
    return [inlet, outlet];
};

Portal.prototype.hit = function (p) {
    var i = 0, r = 10;
    if (this.outlet) {
        if (p.lineCollision(this.p1, this.p2, r)) {
            //move the particle to the channel outlet
            p.x = this.outlet.x - this.outlet.w * 0.5 + Math.random() * this.outlet.w;
            p.y = this.outlet.y + this.outlet.h * 0.5;
            for (i = 0; i < p.numTracers; i += 1) {
                p.trail[i].x = p.x;
                p.trail[i].y = p.y;
            }
            return true;
        }
    }
    return false;
};

