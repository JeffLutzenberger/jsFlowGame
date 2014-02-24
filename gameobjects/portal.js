'use strict';

var Portal = function (x, y, w, h, theta, outlet) {
    this.base = Rectangle;
    this.base(x, y, w, h, theta);
    this.outlet = outlet || null;
};

Portal.prototype = new Rectangle();

Portal.prototype.gameObjectType = function () {
    return "Portal";
};

Portal.prototype.hit = function (p) {
    var i = 0, r = 10, s;
    if (this.outlet) {
        if (p.lineCollision(this.p1, this.p2, r)) {
            //move the particle to the channel outlet
            p.x = this.outlet.x - this.outlet.w * 0.5 + Math.random() * this.outlet.w;
            p.y = this.outlet.y + this.outlet.h * 0.5;
            s = VectorMath.length(p.vel);
            p.vel.x = s * this.outlet.n3.x;
            p.vel.y = s * this.outlet.n3.y;
            for (i = 0; i < p.numTracers; i += 1) {
                p.trail[i].x = p.x;
                p.trail[i].y = p.y;
            }
            return true;
        }
    }
    return false;
};

Portal.prototype.draw = function (canvas, color) {
    var alpha = 1.0;
    canvas.rectangleOutline(this.p1, this.p2, this.p3, this.p4, 20, color, 0.25);
    canvas.rectangleOutline(this.p1, this.p2, this.p3, this.p4, 10, color, 0.5);
    canvas.rectangleOutline(this.p1, this.p2, this.p3, this.p4, 5, [255, 255, 255], 0.9);
    canvas.rectangleOutline(this.p1, this.p2, this.p3, this.p4, 30, color, 0.15);
};

Portal.prototype.serialize = function () {
    var obj = this.base.serialize();
    obj.outlet = this.outlet.serialize();
    return obj;
};

var portalFromJson = function (j) {
    var inlet = new Portal(j.x, j.y, j.w, j.h, j.theta),
        outlet = new Portal(j.outlet.x, j.outlet.y, j.outlet.w, j.outlet.h, j.outlet.theta);
    inlet.outlet = outlet;
    return [inlet, outlet];
};
