'use strict';

var LevelStats = function () {
    this.level = null;
    this.stars = 0;
};

var GameController = function (canvas) {    
    this.canvas = canvas;
    this.waterfall = new Waterfall(canvas);
    this.debug = false;
    this.influencer = -1;
    this.levelstats = [];
    this.levels = [];
    this.clockrate = 10; //ms
    this.numLevels = 8;
    this.gameState = 'start';    
    this.startPage = new StartPage(this.canvas);
    this.playPage = new PlayPage(this.canvas, this.waterfall);
    this.debug = false;
    if (this.debug) {
        this.update();
    } else {
        setInterval(this.update.bind(this), this.clockrate);
    }
    this.startPage.setHandlers();
};

GameController.prototype = {

    update: function () {
        if (this.gameState === 'start') {
            //do start
            if (this.startPage.selectedLevel > -1) {
                this.levelSelected(this.startPage.selectedLevel);
            } else {
                this.startPage.update();
            }
        } else if (this.gameState === 'play') {
            //do play
            //alert('play the game');
            this.waterfall.update();
        } else if (this.gameState === 'complete') {
            //do level complete
            alert('level complete');
        }
    },

    levelSelected: function (level) {
        var levels = [level1, level2, level3, level4];
        this.playPage.setHandlers();
        this.gameState = 'play';
        this.waterfall.loadLevel(levels[level]);
    }

    //game states:
    //1. start 
    //   - instructions
    //   - choose level
    //2. next level screen
    //   - choose star level (1, 2 or 3)
    //3. play
    //   - quit: go back to stat screen
    //4. level complete
    //   - stars and stats 
    //   - once start level is achieved go back to start screen
    //5. end 
    //   - if all levels are completed with 3 stars then show this screen
    //
};

var StartPage = function (canvas) {
    var i = 0;
    this.canvas = canvas;
    this.numLevels = 8;
    this.selectedLevel = -1;
    this.levelButtons = [];
    this.hoverLevel = -1;
    this.clickLevel = -1;
    this.margin = 50;
    this.buttonw = 120;
    this.buttonh = this.buttonw * 1024 / 768;
    this.createLevelButtons();
};

StartPage.prototype = {

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

    levelSelected: function () {
    },

    createLevelButtons: function () {
        var i = 0, x = this.margin, y = this.margin + 50, color = 'rgba(100,100,100,1)', level = "";
        for (i = 0; i < this.numLevels; i += 1) {
            if (i > 0 && i % 4 === 0) {
                x = this.margin;
                y += this.margin;
                y +=  this.buttonh;
            }
            this.levelButtons[i] = {'x' : x, 'y' : y, 'w' : this.buttonw, 'h' : this.buttonh};
            x += this.margin;
            x += this.buttonw;
        }

    },

    drawInstructions: function () {
        //draw instructions and level selector buttons
        var str = "Select a level to play";
        this.canvas.text(20, 50, 'rgba(100,100,100,1)', 'arial', 16, str);
    },

    drawLevels: function () {
        var i = 0, b, color = 'rgba(100,100,100,1)', levelStr = "";
        for (i = 0; i < this.levelButtons.length; i += 1) {
            b = this.levelButtons[i];
            this.canvas.rectangleOutline(b.x, b.y, b.w, b.h, color);
            levelStr = "Level " + (i + 1);
            this.canvas.text(b.x + 10, b.y + 40, color, 'arial', 16, levelStr);
        }
        if (this.hoverLevel > -1) {
            color = 'rgba(0,0,255,1)';
            b = this.levelButtons[this.hoverLevel];
            this.canvas.rectangleOutline(b.x, b.y, b.w, b.h, color);
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

var PlayPage = function (canvas, waterfall) {
    this.canvas = canvas;
    this.waterfall = waterfall;
};

PlayPage.prototype = {
    setHandlers: function () {
        $('canvas').unbind();

        $('canvas').bind('mousedown touchstart', $.proxy(function (e) {
            var x = Math.floor((e.pageX - $("#canvas").offset().left)),
                y = Math.floor((e.pageY - $("#canvas").offset().top));
            this.waterfall.mouseDown = true;
            this.waterfall.influencer = this.waterfall.hitInfluencer(x / this.canvas.m, y / this.canvas.m);
        }, this));

        $(document).bind('mouseup touchend', $.proxy(function (e) {
            this.waterfall.mouseDown = false;
            this.waterfall.influencer = -1;
        }, this));

        $('canvas').bind('mousemove touchmove', $.proxy(function (e) {
            if (this.waterfall.mouseDown === false) {
                return;
            }
            var x = Math.floor((e.pageX - $("#canvas").offset().left)),
                y = Math.floor((e.pageY - $("#canvas").offset().top));
            if (this.waterfall.influencer >= 0) {
                this.waterfall.influencers[this.waterfall.influencer].x = x / this.canvas.m;
                this.waterfall.influencers[this.waterfall.influencer].y = y / this.canvas.m;
            }
        }, this));
    }
};
