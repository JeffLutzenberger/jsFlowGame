'use strict';

function PointSource(x, y, r, theta, v) {
    this.base = Rectangle;
    this.base(x, y, r, r, theta);
    this.radius = r;
    this.v = v || 0.5;
}

PointSource.prototype = new Rectangle();

PointSource.prototype.gameObjectType = function () {
    return "PointSource";
};

function Source(x, y, w, h, theta, v) {
    this.base = Rectangle;
    this.base(x, y, w, h, theta);
    this.v = v || 0.5;
    this.pulsedt = 0;
    this.pulselength = 1000;
}

Source.prototype = new Rectangle();

Source.prototype.gameObjectType = function () {
    return "Source";
};

Source.prototype.update = function (dt) {
    this.pulsedt += dt;
    if (this.pulsedt > this.pulselength) {
        this.pulsedt = 0;
    }
};

Source.prototype.draw = function (canvas, color) {
    var alpha = Math.sin(this.pulsedt / this.pulselength * Math.PI);
    canvas.rectangle(this.p1, this.p2, this.p3, this.p4, color, 1.0);
    canvas.rectangleOutline(this.p1, this.p2, this.p3, this.p4, 1, color, 1.0);
    if (this.selected) {
        canvas.rectangleOutline(this.p1, this.p2, this.p3, this.p4, 2, color, 1.0);
    }

    //rectangle(this.p1, this.p2, this.p3, this.p4, [255, 255, 255], 1.0);
};

var sourceFromJson = function (j) {
    return new Source(j.x, j.y, j.w, j.h, j.theta, j.v);
};


