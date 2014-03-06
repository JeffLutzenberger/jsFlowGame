'use strict';

function Source(x, y, w, h, theta, speed, color) {
    this.base = Rectangle;
    this.base(x, y, w, h, theta);
    this.speed = speed || 1;
    this.color = color || 'red';
    this.nparticles = 50;
    this.lastAddTime = 0;
    this.addPeriod = 100; //ms per particle
    this.particles = [];
    this.particlePool = [];
}

Source.prototype = new Rectangle();

Source.prototype.gameObjectType = function () {
    return "Source";
};

Source.prototype.addParticles = function () {
    var i, p, p1 = this.p3, p2 = this.p4,
        v = new Vector(p2.x - p1.x, p2.y - p1.y),
        x = p1.x + Math.random() * v.x,
        y = p1.y + Math.random() * v.y,
        vx = this.speed * this.n3.x,
        vy = this.speed * this.n3.y;
    for (i = 0; i < this.nparticles; i += 1) {
        x = p1.x + Math.random() * v.x;
        y = p1.y + Math.random() * v.y;
        p = new Particle(x, y, 4, this.color);
        p.source = this;
        p.recycle(p.x, p.y, vx, vy, this.color);
        this.particles.push(p);
    }
};

Source.prototype.recycleParticle = function (p) {
    var p1 = this.p3, p2 = this.p4,
        v = new Vector(p2.x - p1.x, p2.y - p1.y),
        x = p1.x + Math.random() * v.x,
        y = p1.y + Math.random() * v.y,
        vx = this.speed * this.n3.x,
        vy = this.speed * this.n3.y;
    p.recycle(x, y, vx, vy, this.color);
};

Source.prototype.update = function (dt) {
    //add a particle every n seconds...
    var i, p, p1, p2, v, x, y, vx, vy;
    this.lastAddTime += dt;
    if (this.particles.length < this.nparticles && this.lastAddTime > this.addPeriod) {
        this.lastAddTime = 0;
        p1 = this.p3;
        p2 = this.p4;
        v = new Vector(p2.x - p1.x, p2.y - p1.y);
        x = p1.x + Math.random() * v.x;
        y = p1.y + Math.random() * v.y;
        vx = this.speed * this.n3.x;
        vy = this.speed * this.n3.y;
        x = p1.x + Math.random() * v.x;
        y = p1.y + Math.random() * v.y;
        p = new Particle(x, y, 4, this.color);
        p.source = this;
        p.recycle(p.x, p.y, vx, vy, this.color);
        this.particles.push(p);
    }
};

Source.prototype.draw = function (canvas) {
    var alpha = 1.0, color = ParticleWorldColors[this.color];
    canvas.rectangleOutline(this.p1, this.p2, this.p3, this.p4, 20, color, 0.25);
    canvas.rectangleOutline(this.p1, this.p2, this.p3, this.p4, 10, color, 0.5);
    canvas.rectangleOutline(this.p1, this.p2, this.p3, this.p4, 5, [255, 255, 255], 0.9);
    canvas.rectangleOutline(this.p1, this.p2, this.p3, this.p4, 30, color, 0.15);
};

Source.prototype.serialize = function () {
    var obj = this.baseSerialize();
    obj.speed = this.speed;
    obj.nparticles = this.nparticles;
    return obj;
};

var sourceFromJson = function (j) {
    var obj = new Source(j.x, j.y, j.w, j.h, j.theta, j.speed);
    $.extend(obj, j);
    return obj;
};


