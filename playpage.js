'use strict';

var PlayPage = function (canvas, waterfall) {
    this.canvas = canvas;
    this.waterfall = waterfall;
    //level set 1
    //random generation
    // - must get x pts
    // - sink grows and shrinks based on (flux)
    // - max size of sink based on waterfall.nParticles)
    // - min size == ~10
    //
};

PlayPage.prototype = {
    setHandlers: function () {
        $('canvas').unbind();

        $('canvas').bind('mousedown touchstart', $.proxy(function (e) {
            var x = Math.floor((e.pageX - $("#canvas").offset().left)),
                y = Math.floor((e.pageY - $("#canvas").offset().top));
            this.waterfall.mouseDown = true;
            this.waterfall.hitInteractable(x / this.canvas.m, y / this.canvas.m);
        }, this));

        $(document).bind('mouseup touchend', $.proxy(function (e) {
            this.waterfall.mouseDown = false;
            this.waterfall.interactable = null;
        }, this));

        $('canvas').bind('mousemove touchmove', $.proxy(function (e) {
            if (this.waterfall.mouseDown === false) {
                return;
            }
            var x = Math.floor((e.pageX - $("#canvas").offset().left)),
                y = Math.floor((e.pageY - $("#canvas").offset().top));
            if (this.waterfall.interactable) {
                this.waterfall.interactable.x = x / this.canvas.m;
                this.waterfall.interactable.y = y / this.canvas.m;
            }

        }, this));
    }
};


