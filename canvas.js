'use strict';

var Canvas = function (canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.fillStyle = this.ctx.strokeStyle = 'black';
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.degtorad = Math.PI / 180;
    this.m = this.canvas.width / 768;
};

Canvas.prototype = {

    clear: function () {
        this.ctx.clearRect(0, 0, this.width, this.height);
    },
    
    circle: function (x, y, r, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x * this.m + r * this.m, y * this.m);
        this.ctx.arc(x * this.m, y * this.m, r * this.m, 0, Math.PI * 2, false);
        this.ctx.fill();
    },
    
    line: function (p1, p2, color) {
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x * this.m, p1.y * this.m);
        this.ctx.lineTo(p2.x * this.m, p2.y * this.m);
        this.ctx.stroke();
    },

    rectangle: function (x1, y1, w, h, theta, color) {
        this.ctx.fillStyle = color;
        this.ctx.rotate(theta * this.degtorad);
        this.ctx.beginPath();
        this.ctx.rect(x1 * this.m, y1 * this.m, w * this.m, h * this.m);
        this.ctx.fill();
    },

    rectangleOutline: function (x1, y1, w, h, color) {
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.rect(x1 * this.m, y1 * this.m, w * this.m, h * this.m);
        this.ctx.stroke();
    },

    text: function (x, y, color, fontFamily, fontSize, str) {
        this.ctx.fillStyle = color;
        this.ctx.font = fontSize + "px " + fontFamily;
        this.ctx.fillText(str, x * this.m, y * this.m);
    }
};
