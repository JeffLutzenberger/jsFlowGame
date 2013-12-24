'use strict';

var Influencer = function (x, y) {
    this.x = x;
    this.y = y;
    this.force = 1;
};

Influencer.prototype = {
    draw: function (canvas, color) {
        canvas.circle(this.x, this.y, 5, color);
    }
};
