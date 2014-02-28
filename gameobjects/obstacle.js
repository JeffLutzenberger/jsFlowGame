'use strict';

var Obstacle = function (x, y, w, h, theta, reaction) {
    this.base = Rectangle;
    this.base(x, y, w, h, theta);
    this.reaction = reaction || 1;
};

Obstacle.prototype = new Rectangle();

Obstacle.prototype.gameObjectType = function () {
    return "Obstacle";
};

Obstacle.prototype.draw = function (canvas, color) {
    var alpha = 1.0;
    canvas.rectangleOutline(this.p1, this.p2, this.p3, this.p4, 20, color, 0.25);
    canvas.rectangleOutline(this.p1, this.p2, this.p3, this.p4, 10, color, 0.5);
    canvas.rectangleOutline(this.p1, this.p2, this.p3, this.p4, 5, [255, 255, 255], 0.9);
    canvas.rectangleOutline(this.p1, this.p2, this.p3, this.p4, 30, color, 0.15);
};

Obstacle.prototype.serialize = function () {
    var obj = this.baseSerialize();
    obj.reaction = this.reaction;
    return obj;
};

var obstacleFromJson = function (j) {
    var obj = new Obstacle(j.x, j.y, j.w, j.h, j.theta, j.reaction);
    return obj;
};


var obstacleFromJson = function (j) {
    return new Obstacle(j.x, j.y, j.w, j.h, j.theta, j.reaction);
};


