'use strict';

var Grid = function (w, h, gridx, gridy) {
    var i, j, p1, p2, x1, y1, x2, y2,
        ncols = Math.round(this.w / this.gridx),
        nrows = Math.round(this.h / this.gridy);
    this.w = w;
    this.h = h;
    this.gridx = gridx;
    this.gridy = gridy;
};

Grid.prototype = {
    snapx: function (x) {
        return this.gridx * Math.round(x / this.gridx);
    },

    snapy: function (y) {
        return this.gridy * Math.round(y / this.gridy);
    },

    draw: function (canvas, color) {
        canvas.grid(this.gridx, this.gridy, this.w, this.h, 30, color, 0.25);
        canvas.grid(this.gridx, this.gridy, this.w, this.h, 15, color, 0.75);
        canvas.grid(this.gridx, this.gridy, this.w, this.h, 10, color, 1.0);
        canvas.grid(this.gridx, this.gridy, this.w, this.h, 5, [255, 255, 255], 0.8);
    }
};

var GridWall = function (p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
};

GridWall.prototype = {
    gameObjectType: function () {
        return "GridWall";
    },

    hit : function (p) {
        var r = 100, n;
        //if (p.lineCollision(this.p1, this.p2, r)) {
        p.radius = 50;
        if (p.circleCollision(this.p1, this.p2)) {
            n = new Vector(-(this.p2.y - this.p1.y), this.p2.x - this.p1.x).normalize();
            return n;
        }
        return undefined;
    }
};

var GameGrid =  function (w, h, gridx, gridy) {
    var i, j, p1, p2, x1, y1, x2, y2,
        ncols = Math.round(w / gridx),
        nrows = Math.round(h / gridy);
    this.w = w;
    this.h = h;
    this.gridx = gridx;
    this.gridy = gridy;
    this.lines = [];
    for (i = 0; i < nrows + 1; i += 1) {
        for (j = 0; j < ncols; j += 1) {
            p1 = new Vector(gridx * j, this.gridy * i);
            p2 = new Vector(gridx * (j + 1), this.gridy * i);
            this.lines.push(new GridWall(p1, p2));
        }
    }
    for (i = 0; i < ncols + 1; i += 1) {
        for (j = 0; j < nrows; j += 1) {
            p1 = new Vector(this.gridx * i, gridy * j);
            p2 = new Vector(this.gridx * i, gridy * (j + 1));
            this.lines.push(new GridWall(p1, p2));
        }
    }
};

GameGrid.prototype = {
    nCols: function () {
        return Math.round(this.w / this.gridx);
    },

    nRows: function () {
        return Math.round(this.h / this.gridy);
    },

    snapx: function (x) {
        return this.gridx * Math.round(x / this.gridx);
    },

    snapy: function (y) {
        return this.gridy * Math.round(y / this.gridy);
    },

    draw: function (canvas, color) {
        var i = 0;
        for (i = 0; i < this.lines.length; i += 1) {
            canvas.line(this.lines[i].p1, this.lines[i].p2, 30, color, 0.25);
            canvas.line(this.lines[i].p1, this.lines[i].p2, 15, color, 0.75);
            canvas.line(this.lines[i].p1, this.lines[i].p2, 10, color, 1.0);
            canvas.line(this.lines[i].p1, this.lines[i].p2, 5, [255, 255, 255], 0.8);
        }
    },

    hit : function (p) {
        var r = 10, i, n, p1, p2;
        for (i = 0; i < this.lines.length; i += 1) {
            p1 = this.lines[i].p1;
            p2 = this.lines[i].p2;
            if (p.lineCollision(p1, p2, r)) {
                n = new Vector(-(p2.y - p1.y), p2.x - p1.x).normalize();
                return n;
            }
        }
        return undefined;
    }
};


