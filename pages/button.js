'use strict';

var UIButton = function (x, y, w, h, color, fontSize, fontFamily, text) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.color = color;
    this.text = text;
    this.textXOffset = -42;
    this.textYOffset = 12;
    this.fontSize = fontSize;
    this.fontFamily = fontFamily;
    this.text = text;
    this.hover = false;
    this.show = false;
};

UIButton.prototype = {
    hit : function (p) {
        return (p.x >= this.x - this.w * 0.5 &&
                p.x <= this.x + this.w * 0.5 &&
                p.y >= this.y - this.h * 0.5 &&
                p.y <= this.y + this.h * 0.5);
    },

    update : function (dt) {

    },

    onClick : function () {

    },
    
    draw : function (canvas, over, pressed) {
        if (this.show) {
            var x = this.x, y = this.y, w = this.w, h = this.h, color = ParticleWorldColors[this.color];
            canvas.rectangleXY(x, y, w, h, 0, color, 0.25);
            canvas.rectangleOutlineXY(x, y, w, h, 0, 10, color, 0.25);
            canvas.rectangleOutlineXY(x, y, w, h, 0, 5, color, 0.5);
            canvas.rectangleOutlineXY(x, y, w, h, 0, 2, [255, 255, 255], 0.8);
            if (this.hover) {
                canvas.rectangleOutlineXY(x, y, w + 5, h + 5, 0, 2, [255, 255, 255], 0.7);
            }
            canvas.textWithAlpha(x + this.textXOffset,
                                 y + this.textYOffset,
                                 color,
                                 1.0,
                                 this.fontFamily,
                                 this.fontSize,
                                 this.text);
        }
    }
}
