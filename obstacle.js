'use strict';

var Obstacle = function (x, y, w, reaction) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = 50;
    this.reaction = reaction;
};

var obstacleFromJson = function (j) {
    return new Obstacle(j.x, j.y, j.width, j.reaction);
}
