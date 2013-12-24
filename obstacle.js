'use strict';

var Obstacle = function (x, y, w, h, reaction) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.theta = 0;
    this.reaction = reaction;
};

var obstacleFromJson = function (j) {
    return new Obstacle(j.x, j.y, j.w, j.h, j.reaction);
};

Obstacle.prototype = {
    draw: function (canvas, color) {
        canvas.rotatedRect(this.x, this.y, this.w, this.h, this.theta, color);
        //canvas.rectangle(this.x, this.y, this.w, this.h, color);
    }
};
