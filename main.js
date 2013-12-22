'use strict';

$(function () {
    var canvas = new Canvas($('canvas')[0]),
        waterfall = new Waterfall(canvas),
        debug = false,
        mouseDown = false,
        influencer = -1,
        startPage = new StartPage(canvas);

    this.gameController = new GameController(canvas);

    /*
    if (debug) {
        waterfall.update();
    } else {
        setInterval(waterfall.update.bind(waterfall), waterfall.framerate);
    }

    function mouseClickEvent(e) {
        var x = Math.floor((e.pageX - $("#canvas").offset().left)),
            y = Math.floor((e.pageY - $("#canvas").offset().top));
        mouseDown = true;
        influencer = waterfall.hitInfluencer(x, y);
    }

    $('canvas').bind('mousedown touchstart', mouseClickEvent);

    canvas.canvas.addEventListener('mousedown', mouseClickEvent, false);
    canvas.canvas.addEventListener('touchstart', mouseClickEvent, false);

    $(document).bind('mouseup touchend', function (e) {
        mouseDown = false;
        influencer = -1;
    });

    function mouseMoveEvent(e) {
        if (mouseDown === false) {
            return;
        }
        var x = Math.floor((e.pageX - $("#canvas").offset().left)),
            y = Math.floor((e.pageY - $("#canvas").offset().top));
        if (influencer >= 0) {
            waterfall.influencers[influencer].x = x;
            waterfall.influencers[influencer].y = y;
        }
    }

    $('canvas').bind('mousemove touchmove', mouseMoveEvent);
    */
    /*
    $('canvas').bind('mousemove touchmove', function (e) {
    //$("#canvas").mousemove(function (e) {
        if (mouseDown === false) {
            return;
        }
        var x = Math.floor((e.pageX - $("#canvas").offset().left)),
            y = Math.floor((e.pageY - $("#canvas").offset().top));
        if (influencer >= 0) {
            waterfall.influencers[influencer].x = x;
            waterfall.influencers[influencer].y = y;
        }
    });
    */
    //canvas.canvas.addEventListener('mousemove', mouseMoveEvent, false);
    //canvas.canvas.addEventListener('touchmove', mouseMoveEvent, false);
    
});
