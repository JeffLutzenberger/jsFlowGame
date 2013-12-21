'use strict';

var Channel = function (xin, yin, win, xout, yout, wout) {
    this.xin = xin;
    this.yin = yin;
    this.win = win;
    this.xout = xout;
    this.yout = yout;
    this.wout = wout;
    this.velocityMultiplier = 1;
};

var channelFromJson = function (j) {
    return new Channel(j.xin, j.yin, j.win, j.xout, j.yout, j.wout);
}
