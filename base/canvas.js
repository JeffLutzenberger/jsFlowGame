'use strict';

var Canvas = function (canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.fillStyle = this.ctx.strokeStyle = 'black';
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.degtorad = Math.PI / 180;
    this.m = 1;
};

Canvas.prototype = {

    clear: function (bgColor) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        if (bgColor) {
            //this.ctx.fillStyle = bgColor;
            //this.ctx.rect(0, 0, this.width, this.height);
            //this.ctx.fill();
        }
    },
   
    push: function () {
        this.ctx.save();
    },

    pop: function () {
        this.ctx.restore();
    },

    rgba: function (c, alpha) {
        var a = alpha;
        if (alpha === undefined) {
            a = 1.0;
        }
        return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
    },

    brighten: function (color, n) {
        var r = color[0] + Math.round(n * 255),
            g = color[1] + Math.round(n * 255),
            b = color[2] + Math.round(n * 255);
        return [Math.min(r, 255), Math.min(g, 255), Math.min(b, 255)];
    },

    rotatePoint : function (x, y, theta) {
        var x1 = Math.cos(theta) * x + Math.sin(theta) * y,
            y1 = -Math.sin(theta) * x + Math.cos(theta) * y;
        return new Vector(x1, y1);
    },

    circle: function (x, y, r, color, alpha) {
        this.ctx.fillStyle = this.rgba(color, alpha);
        this.ctx.beginPath();
        this.ctx.moveTo(x * this.m + r * this.m, y * this.m);
        this.ctx.arc(x * this.m, y * this.m, r * this.m, 0, Math.PI * 2, false);
        this.ctx.fill();
    },

    circleOutline: function (x, y, r, lineWidth, color, alpha) {
        this.ctx.strokeStyle = this.rgba(color, alpha);
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(x * this.m + r * this.m, y * this.m);
        this.ctx.arc(x * this.m, y * this.m, r * this.m, 0, Math.PI * 2, false);
        this.ctx.stroke();
    },

    radialGradient: function (x, y, rin, rout, cin, cout, ain, aout) {
        var gradient = this.ctx.createRadialGradient(x, y, rin, x, y, rout);
        gradient.addColorStop(0, this.rgba(cin, ain));
        gradient.addColorStop(1, this.rgba(cout, aout));
        this.ctx.arc(x, y, rout, 0, 2 * Math.PI);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    },

    line: function (p1, p2, w, color, alpha) {
        this.ctx.strokeStyle = this.rgba(color, alpha);
        this.ctx.beginPath();
        this.ctx.lineWidth = w;
        this.ctx.moveTo(p1.x * this.m, p1.y * this.m);
        this.ctx.lineTo(p2.x * this.m, p2.y * this.m);
        this.ctx.stroke();
    },
    
    linexy: function (x1, y1, x2, y2, w, color, alpha) {
        this.ctx.strokeStyle = this.rgba(color, alpha);
        this.ctx.beginPath();
        this.ctx.lineWidth = w;
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    },

    rectangle: function (p1, p2, p3, p4, color, alpha) {
        this.ctx.fillStyle = this.rgba(color, alpha);
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x * this.m, p1.y * this.m);
        this.ctx.lineTo(p2.x * this.m, p2.y * this.m);
        this.ctx.lineTo(p3.x * this.m, p3.y * this.m);
        this.ctx.lineTo(p4.x * this.m, p4.y * this.m);
        this.ctx.lineTo(p1.x * this.m, p1.y * this.m);
        this.ctx.fill();
    },

    rectangleOutline: function (p1, p2, p3, p4, lineWidth, color, alpha) {
        this.ctx.strokeStyle = this.rgba(color, alpha);
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x * this.m, p1.y * this.m);
        this.ctx.lineTo(p2.x * this.m, p2.y * this.m);
        this.ctx.lineTo(p3.x * this.m, p3.y * this.m);
        this.ctx.lineTo(p4.x * this.m, p4.y * this.m);
        this.ctx.lineTo(p1.x * this.m, p1.y * this.m);
        this.ctx.stroke();
    },

    triangle: function (p1, p2, p3, color, alpha) {
        this.ctx.fillStyle = this.rgba(color, alpha);
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x * this.m, p1.y * this.m);
        this.ctx.lineTo(p2.x * this.m, p2.y * this.m);
        this.ctx.lineTo(p3.x * this.m, p3.y * this.m);
        this.ctx.lineTo(p1.x * this.m, p1.y * this.m);
        this.ctx.fill();
    },

    triangleOutline: function (p1, p2, p3, lineWidth, color, alpha) {
        this.ctx.strokeStyle = this.rgba(color, alpha);
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x * this.m, p1.y * this.m);
        this.ctx.lineTo(p2.x * this.m, p2.y * this.m);
        this.ctx.lineTo(p3.x * this.m, p3.y * this.m);
        this.ctx.lineTo(p1.x * this.m, p1.y * this.m);
        this.ctx.fill();
    },

    arrowHead: function (center, size, theta, color, alpha) {
        var p1 = this.rotatePoint(0, size * 0.5, theta),
            p2 = this.rotatePoint(-size * 0.4, -size * 0.5, theta),
            p3 = this.rotatePoint(size * 0.4, -size * 0.5, theta);
        p1.x += center.x;
        p1.y += center.y;
        p2.x += center.x;
        p2.y += center.y;
        p3.x += center.x;
        p3.y += center.y;
        this.triangle(p1, p2, p3, color, alpha);
    },

    diamond: function (x, y, w, h, theta, lineWidth, color, alpha) {
        var p1 = this.rotatePoint(w * 0.5, 0, theta),
            p2 = this.rotatePoint(0, h * 0.5, theta),
            p3 = this.rotatePoint(-w * 0.5, 0, theta),
            p4 = this.rotatePoint(0, -h * 0.5, theta);
        p1.x += x;
        p1.y += y;
        p2.x += x;
        p2.y += y;
        p3.x += x;
        p3.y += y;
        p4.x += x;
        p4.y += y;
        this.ctx.strokeStyle = this.rgba(color, alpha);
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.lineTo(p3.x, p3.y);
        this.ctx.lineTo(p4.x, p4.y);
        this.ctx.lineTo(p1.x, p1.y);
        this.ctx.stroke();
    },

    text: function (x, y, color, fontFamily, fontSize, str) {
        this.ctx.fillStyle = color;
        this.ctx.font = fontSize + "px " + fontFamily;
        this.ctx.fillText(str, x * this.m, y * this.m);
    },

    grid: function (dx, dy, w, h, lineWeight, color, alpha) {
        var i, nx = w / dx, ny = h / dy;
        alpha = alpha || 1;
        this.ctx.strokeStyle = this.rgba(color, alpha);
        this.ctx.lineWidth = lineWeight;
        for (i = 0; i < nx + 1; i += 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(dx * i * this.m, 0);
            this.ctx.lineTo(dx * i * this.m, h * this.m);
            this.ctx.stroke();
        }
        for (i = 0; i < ny + 1; i += 1) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, dy * i * this.m);
            this.ctx.lineTo(w * this.m, dy * i * this.m);
            this.ctx.stroke();
        }

    },

    drawImage: function (image, x, y, w, h, theta) {
        //this.ctx.drawImage(image, x, y, w, h);
        this.push();
        this.ctx.translate(x, y);
        this.ctx.rotate(theta * this.degtorad);
        this.ctx.drawImage(image, -w * 0.5, -h * 0.5, w, h);
        this.pop();
    }
};

var Camera = function (canvas) {
    this.canvas = canvas;
    this.viewport = new Vector(canvas.width, canvas.height);
    this.center = new Vector(0, 0);
    this.scaleConstant = 1;
    this.zoomFactor = 1;
    this.transition = false;
    this.startTransitionCenter = new Vector(this.center.x, this.center.y);
    this.endTransitionCenter = new Vector(this.center.x, this.center.y);
    this.startViewportSize = new Vector(this.viewport.x, this.viewport.y);
    this.endViewportSize = new Vector(this.viewport.x, this.viewport.y);
    this.zoomTime = 0;
};

Camera.prototype = {

    push: function () {
        this.canvas.ctx.save();
    },

    pop: function () {
        this.canvas.ctx.restore();
    },

    setExtents: function (w, h) {
        this.viewportWidth = w;
        this.viewportHeight = h;
        this.zoomFactor = this.canvas.width / w;
    },

    setZoom: function (x) {
        this.zoomFactor = x;
        this.viewportWidth = this.zoomFactor / this.canvas.width;
        this.viewportHeight = this.zoomFactor / this.canvas.height;
    },

    setCenter: function (x, y) {
        this.center.x = x;
        this.center.y = y;
    },

    show: function () {
        this.canvas.ctx.scale(this.zoomFactor, this.zoomFactor);
        this.canvas.ctx.translate(-this.center.x, -this.center.y);
    },

    reset: function (bgColor) {
        this.pop();
        this.canvas.clear(bgColor);
        this.push();
        //move the viewport center to 0,0
        this.canvas.ctx.translate(this.canvas.width * 0.5,
                                  this.canvas.height * 0.5);
    },

    startTransition: function (toCenter, toViewportSize, transitionTime) {
        this.zoomTransition = true;
        this.startTransitionCenter = new Vector(this.center.x, this.center.y);
        this.endTransitionCenter = new Vector(toCenter.x, toCenter.y);
        this.startViewportSize = new Vector(this.viewportWidth, this.viewportHeight);
        this.endViewportSize = new Vector(toViewportSize.x, toViewportSize.y);
        this.zoomTime = 0;
    },

    onZoomTransition: function (dt) {
        var duration = 500,
            centerDeltaX = this.finalZoomCenter.x - this.startZoomCenter.x,
            centerDeltaY = this.finalZoomCenter.y - this.startZoomCenter.y,
            extentDeltaX = this.finalZoomExtents.x - this.startZoomExtents.x,
            extentDeltaY = this.finalZoomExtents.y - this.startZoomExtents.y,
            x,
            y;
        //when this.zoomTime = duration we should be fully transitioned
        if (this.zoomTime > duration) {
            this.zoomTime = duration;
            this.zoomTransition = false;
        }
        x = this.zoomTime / duration * centerDeltaX + this.startZoomCenter.x;
        y = this.zoomTime / duration * centerDeltaY + this.startZoomCenter.y;
        this.camera.setCenter(x, y);
        x = this.zoomTime / duration * extentDeltaX + this.startZoomExtents.x;
        y = this.zoomTime / duration * extentDeltaY + this.startZoomExtents.y;
        this.camera.setExtents(x, y);
        this.zoomTime += dt;
    },

    screenToWorld: function (x, y) {
        //screen for canvas is 0, 0 with y down
        //our world coords are also y down
        var upperleftx = this.center.x - this.viewportWidth * 0.5,
            upperlefty = this.center.y - this.viewportHeight * 0.5,
            x1 = x / this.canvas.width * this.viewportWidth + upperleftx,
            y1 = y / this.canvas.height * this.viewportHeight + upperlefty;
        return new Vector(x1, y1);
    }
};

