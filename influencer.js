'use strict';

var Influencer = function (x, y) {
    this.x = x;
    this.y = y;
    this.force = 1;
};

Influencer.prototype = {

    draw: function (canvas) {
        var alpha = 1, color = 'rgba(0,153,255,' + alpha + ')';
        canvas.circle(this.x, this.y, 5, color);
    }
};
