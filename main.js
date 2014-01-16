'use strict';

$(function () {
    var canvas = new Canvas($('canvas')[0]);
    console.log(canvas);
    this.gameController = new GameController(canvas);
});
