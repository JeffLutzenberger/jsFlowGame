'use strict';

var GameboardPage = function (canvas) {
    this.canvas = canvas;
};

GameboardPage.prototype = {

    setHandlers: function () {
        $('canvas').unbind();
        
    },

    draw: function () {
        //draw a 3 x 3 grid with level 0 in the middle
        //level 0 is the nucleus of the game
        //the game board can expand from 3x3 to 5x5 7x7 etc
        //for now we do 3x3 to work through this new game
        //mechanic
        
        this.canvas.drawGrid()

    }
}
