'use strict';

var GridWall = function (p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
    this.openings = [];
    this.walls = [];
};

GridWall.prototype = {
    addOpening: function (l1, l2) {
        this.openings.push([l1, l2]);
        //from l1 to l2 (parameterized) add an opening
        //for
        
    },

    hit: function (p) {

        //if (p.lineCollision(p1, p2, r)) {
       //         n = new Vector(-(p2.y - p1.y), p2.x - p1.x).normalize();
       //         return n;
 
    }
 
};

var Grid = function (w, h, gridx, gridy) {
    var i, j, p1, p2, n;
    this.w = w;
    this.h = h;
    this.gridx = gridx;
    this.gridy = gridy;
    this.lines = [];
    //console.log(this.w);
    //console.log(this.h);
    //console.log(this.gridx);
    //console.log(this.gridy);
    for (i = 0; i < Math.round(this.h / this.gridy); i += 1) {
        p1 = new Vector(0, this.gridy * i);
        p2 = new Vector(this.w, this.gridy * i);
        this.lines.push([p1, p2]);
    }
    for (i = 0; i < Math.round(this.w / this.gridx); i += 1) {
        p1 = new Vector(this.gridx * i, 0);
        p2 = new Vector(this.gridx * i, this.h);
        this.lines.push([p1, p2]);
    }
    //console.log(this.lines);
};

Grid.prototype = {
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
        canvas.grid(this.gridx, this.gridy, this.w, this.h, 30, color, 0.25);
        canvas.grid(this.gridx, this.gridy, this.w, this.h, 15, color, 0.75);
        canvas.grid(this.gridx, this.gridy, this.w, this.h, 10, color, 1.0);
        canvas.grid(this.gridx, this.gridy, this.w, this.h, 5, [255, 255, 255], 0.8);
    },

    hit : function (p) {
        var r = 10, i, n, p1, p2;
        //console.log(p);
        for (i = 0; i < this.lines.length; i += 1) {
            //console.log(this.lines);
            p1 = this.lines[i][0];
            p2 = this.lines[i][1];
            if (p.lineCollision(p1, p2, r)) {
                n = new Vector(-(p2.y - p1.y), p2.x - p1.x).normalize();
                return n;
            }
        }
        return undefined;
    }
};
