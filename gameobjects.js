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

    updatePoints : function () {
        var x = this.w * 0.5,
            y = this.h * 0.5,
            theta = Math.PI / 180 * this.theta,
            x1 = Math.cos(theta) * x + Math.sin(theta) * y,
            y1 = -Math.sin(theta) * x + Math.cos(theta) * y;

        this.p1 = new Vector(this.x - x1, this.y - y1);
        this.p2 = new Vector(this.x + x1, this.y - y1);
        this.p3 = new Vector(this.x + x1, this.y + y1);
        this.p4 = new Vector(this.x - x1, this.y + y1);
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
        canvas.rectangle(this.x - this.w * 0.5, this.y - this.h * 0.5, this.w, this.h, this.theta, color);
        canvas.rectangleOutline(this.x - this.w * 0.5, this.y - this.h * 0.5, this.w, this.h, 1, 'rgba(100,100,100,1)');
        if (this.selected) {
            //console.log("selected");
            canvas.rectangleOutline(this.x - this.w * 0.5, this.y - this.h * 0.5, this.w, this.h, 2, 'rgba(0,100,255,1)');
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

var Influencer = function (x, y) {
    var radius = 15;
    this.base = Rectangle;
    this.base(x, y, 2 * radius, 2 * radius, 0);
    this.force = 1;
    this.radius = radius;
};

Influencer.prototype = new Rectangle();

Influencer.prototype.gameObjectType = function () {
    return "Influencer";
}

Influencer.prototype.draw = function (canvas, color) {
    canvas.circle(this.x, this.y, this.radius, color);
    if (this.selected) {
        canvas.circleOutline(this.x, this.y, this.radius, 'rgba(0,100,255,1)');
    }
};

var influencerFromJson = function (j) {
    return new Influencer(j.x, j.y);
};

function Source(x, y, w, h, theta, vx, vy) {
    this.base = Rectangle;
    this.base(x, y, w, h, theta);
    this.vx = vx || 0;
    this.vy = vy || 0.5;
}

Source.prototype = new Rectangle();

Source.prototype.gameObjectType = function () {
    return "Source";
}

var sourceFromJson = function (j) {
    return new Source(j.x, j.y, j.w, j.h, j.theta, j.vx, j.vy);
};

function Bucket(x, y, w, h, theta, multiplier) {
    this.base = Rectangle;
    this.base(x, y, w, h, theta);
    this.multiplier = multiplier || 1;
}

Bucket.prototype = new Rectangle();

Bucket.prototype.gameObjectType = function () {
    return "Bucket";
}

var bucketFromJson = function (j) {
    return new Bucket(j.x, j.y, j.w, j.h, j.theta);
};

var Obstacle = function (x, y, w, h, theta, reaction) {
    this.base = Rectangle;
    this.base(x, y, w, h, theta);
    this.reaction = reaction;
};

Obstacle.prototype = new Rectangle();

Obstacle.prototype.gameObjectType = function () {
    return "Obstacle";
}


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
}


//var Portal = function (x1, y1, w1, h1, theta1, x2, y2, w2, h2, theta2) {
//    this.inlet = new Rectangle(x1, y1, w1, h1, theta1);
//    this.outlet = new Rectangle(x2, y2, w2, h2, theta2);
//    this.multiplier = 1;
//};

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

