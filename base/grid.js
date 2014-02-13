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
    this.p3 = p1;
    this.p4 = p2;
    this.hasDoor = false;
    this.doorIsOpen = false;
    this.randomSeed = 100;
    this.doorPoints = [];

    $(document).bind('opendoor', $.proxy(function (e) {
        console.log("open door message");
        this.doorIsOpen = true;
        console.log(this);
    }, this));

    $(document).bind('closedoor', $.proxy(function (e) {
        console.log("close door message");
        this.doorIsOpen = false;
    }, this));

};

GridWall.prototype = {
    gameObjectType: function () {
        return "GridWall";
    },

    hit : function (p) {
        var n;
        if (this.hasDoor && this.doorIsOpen) {
            if (p.circleCollision(this.p1, this.p2)) {
                n = new Vector(-(this.p2.y - this.p1.y), this.p2.x - this.p1.x).normalize();
                return n;
            }
            if (p.circleCollision(this.p3, this.p4)) {
                n = new Vector(-(this.p4.y - this.p3.y), this.p4.x - this.p3.x).normalize();
                return n;
            }
        } else {
            if (p.circleCollision(this.p1, this.p4)) {
                n = new Vector(-(this.p4.y - this.p1.y), this.p4.x - this.p1.x).normalize();
                return n;
            }
        }
        return undefined;
    },

    setDoor : function (s1, s2) {
        this.hasDoor = true;
        this.setS1(s1);
        this.setS2(s2);
    },

    setS1 : function (s1) {
        var doorjam = 20,
            v = new Vector(this.p4.x - this.p1.x, this.p4.y - this.p1.y),
            n = new Vector(-(this.p2.y - this.p1.y), this.p2.x - this.p1.x).normalize();
        this.hasDoor = true;
        this.p2 = new Vector(this.p1.x + v.x * s1, this.p1.y + v.y * s1);
        this.p5 = new Vector(this.p2.x + n.x * doorjam, this.p2.y + n.y * doorjam);
        this.p6 = new Vector(this.p2.x - n.x * doorjam, this.p2.y - n.y * doorjam);
        this.makeElectricity();
         
    },

    setS2 : function (s2) {
        var doorjam = 20,
            v = new Vector(this.p4.x - this.p1.x, this.p4.y - this.p1.y),
            n = new Vector(-(this.p2.y - this.p1.y), this.p2.x - this.p1.x).normalize();
        this.hasDoor = true;
        this.p3 = new Vector(this.p1.x + v.x * s2, this.p1.y + v.y * s2);
        this.p7 = new Vector(this.p3.x + n.x * doorjam, this.p3.y + n.y * doorjam);
        this.p8 = new Vector(this.p3.x - n.x * doorjam, this.p3.y - n.y * doorjam);
        this.makeElectricity();
    },
     
    getS1 : function () {
        var l1 = VectorMath.length(new Vector(this.p4.x - this.p1.x, this.p4.y - this.p1.y)),
            l2 = VectorMath.length(new Vector(this.p2.x - this.p1.x, this.p2.y - this.p1.y));
        return l2 / l1;
    },

    getS2 : function () {
        var l1 = VectorMath.length(new Vector(this.p4.x - this.p1.x, this.p4.y - this.p1.y)),
            l2 = VectorMath.length(new Vector(this.p3.x - this.p1.x, this.p3.y - this.p1.y));
        return l2 / l1;
    },

    drawDoor: function (canvas, color, alpha) {
        var i, p1, p2, doorjam = 100;
        
        for (i = 1; i < this.doorPoints.length; i += 1) {
            canvas.linexy(this.doorPoints[i - 1][0],
                        this.doorPoints[i - 1][1],
                        this.doorPoints[i][0],
                        this.doorPoints[i][1], 20, color, alpha * 0.5);
        }
        for (i = 1; i < this.doorPoints.length; i += 1) {
            canvas.linexy(this.doorPoints[i - 1][0],
                        this.doorPoints[i - 1][1],
                        this.doorPoints[i][0],
                        this.doorPoints[i][1], 10, color, alpha * 0.75);
        }
        for (i = 1; i < this.doorPoints.length; i += 1) {
            canvas.linexy(this.doorPoints[i - 1][0],
                        this.doorPoints[i - 1][1],
                        this.doorPoints[i][0],
                        this.doorPoints[i][1], 5, [255, 255, 255], alpha * 0.5);
        }
        for (i = 1; i < this.doorPoints.length; i += 1) {
            canvas.linexy(this.doorPoints[i - 1][0],
                        this.doorPoints[i - 1][1],
                        this.doorPoints[i][0],
                        this.doorPoints[i][1], 30, color, 0.25);
        }

    },

    draw : function (canvas, color) {
        var p1, p2, n, doorjam = 50;
        if (this.hasDoor) {
            canvas.line(this.p1, this.p2, 30, color, 0.25);
            canvas.line(this.p1, this.p2, 15, color, 0.75);
            canvas.line(this.p1, this.p2, 10, color, 1.0);
            canvas.line(this.p1, this.p2, 5, [255, 255, 255], 0.8);
            canvas.line(this.p3, this.p4, 30, color, 0.25);
            canvas.line(this.p3, this.p4, 15, color, 0.75);
            canvas.line(this.p3, this.p4, 10, color, 1.0);
            canvas.line(this.p3, this.p4, 5, [255, 255, 255], 0.8);
            //doorjam
            canvas.line(this.p5, this.p6, 30, color, 0.25);
            canvas.line(this.p5, this.p6, 15, color, 0.75);
            canvas.line(this.p5, this.p6, 10, color, 1.0);
            canvas.line(this.p7, this.p8, 30, color, 0.25);
            canvas.line(this.p7, this.p8, 15, color, 0.75);
            canvas.line(this.p7, this.p8, 10, color, 1.0);

            if (!this.doorIsOpen) {
                //darw some electricity
                this.drawDoor(canvas, [100, 100, 255], 1.0);
                //canvas.electricityLine(this.p2, this.p3, 5, 2, [100, 100, 255], 1.0);
            }
        } else {
            canvas.line(this.p1, this.p4, 30, color, 0.25);
            canvas.line(this.p1, this.p4, 15, color, 0.75);
            canvas.line(this.p1, this.p4, 10, color, 1.0);
            canvas.line(this.p1, this.p4, 5, [255, 255, 255], 0.8);
        }
    },

    makeElectricity: function () {
        var i, shockiness = 3, npoints = shockiness * 3,
            v = new Vector(this.p3.x - this.p2.x, this.p3.y - this.p2.y),
            n = VectorMath.normalize(new Vector(-v.y, v.x)), l = VectorMath.length(v), dl;
        this.doorPoints.length = 0;
        this.doorPoints[0] = [this.p2.x, this.p2.y];
        this.doorPoints[npoints - 1] = [this.p3.x, this.p3.y];
        for (i = 1; i < npoints - 1; i += 1) {
            this.doorPoints[i] = [this.p2.x + i / npoints * v.x, this.p2.y + i / npoints * v.y];
            dl = (Math.random()) * shockiness * 2;
            this.doorPoints[i][0] += n.x * dl;
            this.doorPoints[i][1] += n.y * dl;
            //this.linexy(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1], lineWidth, color, alpha);
        }
        //this.linexy(points[npoints - 2][0], points[npoints - 2][1], points[npoints - 1][0], points[npoints - 1][1], lineWidth, color, alpha);
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
    this.rows = [];
    this.cols = [];
    for (i = 0; i < nrows + 1; i += 1) {
        this.rows[i] = i * gridy;
        for (j = 0; j < ncols; j += 1) {
            p1 = new Vector(gridx * j, this.gridy * i);
            p2 = new Vector(gridx * (j + 1), this.gridy * i);
            this.lines.push(new GridWall(p1, p2));
        }
    }
    for (i = 0; i < ncols + 1; i += 1) {
        this.cols[i] = i * gridx;
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

    sameTile: function (o1, o2) {
        return this.tileNumber(o1.x, o1.y) === this.tileNumber(o2.x, o2.y);
    },

    tileNumber: function (x, y) {
        var i, tile = -1;
        for (i = 0; i < this.cols.length - 1; i += 1) {
            if (x > this.cols[i] && x < this.cols[i + 1]) {
                tile = i + 1;
                break;
            }
        }
        for (i = 0; i < this.rows.length - 1; i += 1) {
            if (y > this.rows[i] && y < this.rows[i + 1]) {
                tile *= i + 1;
                break;
            }
        }
        return tile;
    },

    draw: function (canvas, color) {
        var i = 0;
        for (i = 0; i < this.lines.length; i += 1) {
            this.lines[i].draw(canvas, color);
            canvas.line(this.lines[i].p1, this.lines[i].p2, 30, color, 0.25);
            canvas.line(this.lines[i].p1, this.lines[i].p2, 15, color, 0.75);
            canvas.line(this.lines[i].p1, this.lines[i].p2, 10, color, 1.0);
            canvas.line(this.lines[i].p1, this.lines[i].p2, 5, [255, 255, 255], 0.8);
        }
    },

    hit : function (p) {
        var i, n;
        for (i = 0; i < this.lines.length; i += 1) {
            n = this.lines[i].hit(p);
            if (n) {
                return n;
            }
        }
        return undefined;
    }
};


