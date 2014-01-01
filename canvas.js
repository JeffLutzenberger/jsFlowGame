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

    circleOutline: function (x, y, r, lineWidth, color) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(x * this.m + r * this.m, y * this.m);
        this.ctx.arc(x * this.m, y * this.m, r * this.m, 0, Math.PI * 2, false);
        this.ctx.stroke();
    },

    line: function (p1, p2, w, color) {
        this.ctx.strokeStyle = color;
        this.ctx.beginPath();
        this.ctx.lineWidth = w;
        this.ctx.moveTo(p1.x * this.m, p1.y * this.m);
        this.ctx.lineTo(p2.x * this.m, p2.y * this.m);
        this.ctx.stroke();
    },

    rectangle: function (p1, p2, p3, p4, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x * this.m, p1.y * this.m);
        this.ctx.lineTo(p2.x * this.m, p2.y * this.m);
        this.ctx.lineTo(p3.x * this.m, p3.y * this.m);
        this.ctx.lineTo(p4.x * this.m, p4.y * this.m);
        this.ctx.lineTo(p1.x * this.m, p1.y * this.m);
        this.ctx.fill();
    },

    rectangleOutline: function (p1, p2, p3, p4, lineWidth, color) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x * this.m, p1.y * this.m);
        this.ctx.lineTo(p2.x * this.m, p2.y * this.m);
        this.ctx.lineTo(p3.x * this.m, p3.y * this.m);
        this.ctx.lineTo(p4.x * this.m, p4.y * this.m);
        this.ctx.lineTo(p1.x * this.m, p1.y * this.m);
        this.ctx.stroke();
    },

    text: function (x, y, color, fontFamily, fontSize, str) {
        this.ctx.fillStyle = color;
        this.ctx.font = fontSize + "px " + fontFamily;
        this.ctx.fillText(str, x * this.m, y * this.m);
    },

    grid: function (dx, dy, w, h, lineWeight, color) {
        var i, nx = w / dx, ny = h / dy;
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWeight;
        for (i = 0; i < nx; i += 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(dx * i * this.m, 0);
            this.ctx.lineTo(dx * i * this.m, h * this.m);
            this.ctx.stroke();
        }
        for (i = 0; i < ny; i += 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, dy * i * this.m);
            this.ctx.lineTo(w * this.m, dy * i * this.m);
            this.ctx.stroke();
        }

    }
};
