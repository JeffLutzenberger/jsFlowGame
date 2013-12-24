'use strict';

var Channel = function (xin, yin, win, rotin, xout, yout, wout, rotout) {
    this.xin = xin;
    this.yin = yin;
    this.win = win;
    this.hin = 10;
    this.rotin = rotin;
    this.xout = xout;
    this.yout = yout;
    this.wout = wout;
    this.hout = 10;
    this.rotout = rotout;
    this.velocityMultiplier = 1;
};

var channelFromJson = function (j) {
    return new Channel(j.xin, j.yin, j.win, j.rotin, j.xout, j.yout, j.wout, j.rotout);
};

Channel.prototype = {
    draw: function (canvas, color) {
        canvas.rectangle(this.xin, this.yin, this.win, this.hin, color);
        canvas.rectangle(this.xout, this.yout, this.wout, this.hout, color);
    }
};
