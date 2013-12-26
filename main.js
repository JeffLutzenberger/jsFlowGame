'use strict';

$(function () {
    var canvas = new Canvas($('canvas')[0]),
        waterfall = new Waterfall(canvas),
        startPage = new StartPage(canvas);
    this.gameController = new GameController(canvas);
   
});
