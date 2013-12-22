'use strict';

var Channel = function (xin, yin, win, rotin, xout, yout, wout, rotout) {
    this.xin = xin;
    this.yin = yin;
    this.win = win;
    this.rotin = rotin;
    this.xout = xout;
    this.yout = yout;
    this.wout = wout;
    this.rotout = rotout;
    this.velocityMultiplier = 1;
};

var channelFromJson = function (j) {
    return new Channel(j.xin, j.yin, j.win, j.rotin, j.xout, j.yout, j.wout, j.rotout);
}
