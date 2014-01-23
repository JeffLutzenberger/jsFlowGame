'use strict';

var MenuPage = function (canvas) {
    this.canvas = canvas;
    this.selectedLevel = -1;
    this.levelButtons = [];
    this.levels = [];
    this.hoverLevel = -1;
    this.clickLevel = -1;
    this.margin = 70;
    this.buttonw = 150;
    this.buttonh = this.buttonw * 1024 / 768;
    this.createLevelButtons();
};


MenuPage.prototype = {

    setHandlers: function () {
        $('canvas').unbind();

        $('canvas').bind('mousemove', $.proxy(function (e) {
            var x = Math.floor((e.pageX - $("#canvas").offset().left)),
                y = Math.floor((e.pageY - $("#canvas").offset().top));
            this.hoverLevel = this.levelButtonHit(x / this.canvas.m, y / this.canvas.m);
        }, this));

        $('canvas').bind('mousedown touchstart', $.proxy(function (e) {
            var x = Math.floor((e.pageX - $("#canvas").offset().left)),
                y = Math.floor((e.pageY - $("#canvas").offset().top));
            this.selectedLevel = this.levelButtonHit(x / this.canvas.m, y / this.canvas.m);
        }, this));
    },

    update: function () {
        this.canvas.clear();
        this.drawInstructions();
        this.drawLevels();
    },

    createLevelButtons: function () {
        var i = 0,
            x = this.margin,
            y = this.margin + 50,
            color = 'rgba(100,100,100,1)',
            level = "";

        for (i = 0; i < levels.length; i += 1) {
            this.levels[i] = new Waterfall(this.canvas);
            this.levels[i].loadLevel(levels[i]);
        }
        for (i = 0; i < levels.length; i += 1) {
            if (i > 0 && i % 3 === 0) {
                x = this.margin;
                y += this.margin;
                y +=  this.buttonh;
            }
            this.levelButtons[i] = {'x' : x,
                                    'y' : y,
                                    'w' : this.buttonw,
                                    'h' : this.buttonh};
            x += this.margin;
            x += this.buttonw;
        }
    },

    drawInstructions: function () {
        //draw instructions and level selector buttons
        //var str = "Select a level to play";
        //this.canvas.text(20, 50, 'rgba(100,100,100,1)', 'arial', 16, str);
    },

    drawLevels: function () {
        var i = 0, b, color = 'rgba(100,100,100,1)', levelStr = "",
            p1, p2, p3, p4;
        for (i = 0; i < this.levelButtons.length; i += 1) {
            b = this.levelButtons[i];
            p1 = new Vector(b.x, b.y);
            p2 = new Vector(b.x + b.w, b.y);
            p3 = new Vector(b.x + b.w, b.y + b.h);
            p4 = new Vector(b.x, b.y + b.h);
            this.canvas.rectangleOutline(p1, p2, p3, p4, 1, color);
            levelStr = "Level " + (i + 1);
            this.canvas.text(b.x + 10, b.y - 20, color, 'arial', 16, levelStr);
            //draw level
            //this.canvas.ctx.translate(b.x * this.canvas.m, b.y * this.canvas.m);
            //this.canvas.ctx.scale(b.w / this.canvas.width * this.canvas.m,
            //                      b.h / this.canvas.height * this.canvas.m);
            this.levels[i].drawObstacles();
            this.levels[i].drawPortals();
            this.levels[i].drawInfluencers();
            this.levels[i].drawBuckets();
            this.levels[i].drawSinks();
            this.levels[i].drawSources();
            //this.canvas.ctx.scale(this.canvas.width / b.w / this.canvas.m,
            //                      this.canvas.height / b.h / this.canvas.m);
            //this.canvas.ctx.translate(-b.x / 2, -b.y / 2);
        }
        if (this.hoverLevel > -1) {
            color = 'rgba(0,0,255,1)';
            b = this.levelButtons[this.hoverLevel];
            p1 = new Vector(b.x, b.y);
            p2 = new Vector(b.x + b.w, b.y);
            p3 = new Vector(b.x + b.w, b.y + b.h);
            p4 = new Vector(b.x, b.y + b.h);
            this.canvas.rectangleOutline(p1, p2, p3, p4, 1, color);
        }
    },

    levelButtonHit: function (x, y) {
        var i = 0, b;
        for (i = 0; i < this.levelButtons.length; i += 1) {
            b = this.levelButtons[i];
            if (x > b.x && x < b.x + b.w && y > b.y && y < b.y + b.h) {
                return i;
            }
        }
        return -1;
    }
};

