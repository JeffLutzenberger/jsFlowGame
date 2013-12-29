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
    this.gameState = 'start';    
    this.startPage = new StartPage(this.canvas);
    this.playPage = new PlayPage(this.canvas, this.waterfall);
    this.editorPage = new EditorPage(this.canvas, this.waterfall);
    this.interval = setInterval(this.update.bind(this), this.clockrate);
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
            this.waterfall.update();
        } else if (this.gameState === 'complete') {
            //do level complete
            alert('level complete');
        } else if (this.gameState === 'editor') {
            this.waterfall.update();
        }
    },

    levelSelected: function (level) {
        var levels = [level1, level2, level3, level4];
        if (level < levels.length) {
            this.playPage.setHandlers();
            this.gameState = 'play';
            this.waterfall.loadLevel(levels[level]);
        } else {
            this.editorPage.setHandlers();
            this.gameState = 'editor';
            this.waterfall.loadEditor();
        }
    }

    //game states:
    //1. start 
    //   - instructions)
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
        var i = 0, x = this.margin, y = this.margin + 50, color = 'rgba(100,100,100,1)', level = "",
            levels = [level1, level2, level3, level4];

        for (i = 0; i < levels.length; i += 1) {
            this.levels[i] = new Waterfall(this.canvas);
            this.levels[i].loadLevel(levels[i]);
        }
        for (i = 0; i < levels.length + 1; i += 1) {
            if (i > 0 && i % 3 === 0) {
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
            if (i < this.levelButtons.length - 1) {
                levelStr = "Level " + (i + 1);
                this.canvas.text(b.x + 10, b.y - 20, color, 'arial', 16, levelStr);
                //draw level
                if (i < this.levels.length) {
                    this.canvas.ctx.translate(b.x * this.canvas.m, b.y * this.canvas.m);
                    this.canvas.ctx.scale(b.w / this.canvas.width * this.canvas.m, b.h / this.canvas.height * this.canvas.m);
                    this.levels[i].drawObstacles();
                    this.levels[i].drawPortals();
                    this.levels[i].drawInfluencers();
                    this.levels[i].drawBuckets();
                    this.canvas.ctx.scale(this.canvas.width / b.w / this.canvas.m, this.canvas.height / b.h / this.canvas.m);
                    this.canvas.ctx.translate(-b.x / 2, -b.y / 2);
                }
            } else {
                levelStr = "Level Editor";
                this.canvas.text(b.x + 10, b.y - 20, color, 'arial', 16, levelStr);
            }
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
            this.waterfall.hitInteractable(x / this.canvas.m, y / this.canvas.m);
            //console.log(this.waterfall.interactable);
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


var EditorPage = function (canvas, waterfall) {
    this.canvas = canvas;
    this.waterfall = waterfall;
};

EditorPage.prototype = {
    setHandlers: function () {
        $('canvas').unbind();

        $('canvas').bind('mousedown touchstart', $.proxy(function (e) {
            var x = Math.floor((e.pageX - $("#canvas").offset().left)),
                y = Math.floor((e.pageY - $("#canvas").offset().top));
            this.waterfall.mouseDown = true;
            this.waterfall.hitInteractable(x / this.canvas.m, y / this.canvas.m);
            //this.waterfall.influencer = this.waterfall.hitInfluencer(x / this.canvas.m, y / this.canvas.m);
        }, this));

        $(document).bind('mouseup touchend', $.proxy(function (e) {
            this.waterfall.mouseDown = false;
            if (this.waterfall.hitObject) {
                this.waterfall.hitObject.selected = false;
            }
            this.waterfall.hitObject = null;
        }, this));

        $('canvas').bind('mousemove touchmove', $.proxy(function (e) {
            if (this.waterfall.mouseDown === false) {
                return;
            }
            var x = Math.floor((e.pageX - $("#canvas").offset().left)),
                y = Math.floor((e.pageY - $("#canvas").offset().top));
            if (this.waterfall.interactable) {
                this.waterfall.interactable.setxy(x / this.canvas.m, y / this.canvas.m);
            }
        }, this));

        $(document).bind('keypress', $.proxy(function (e) {
            var obj, obj2;
            console.log(e.keyCode);
            switch (e.keyCode) {
            case 32: //space
                //toggle particles
                if (this.waterfall.nParticles <= 0 && this.waterfall.sources.length > 0) {
                    this.waterfall.nParticles = 50;
                } else {
                    this.waterfall.nParticles = 0;
                    this.waterfall.particles = [];
                }
                break;
            case 98: //b
                obj = new Bucket(100, 400, 100, 50, 0);
                this.waterfall.buckets.push(obj);
                this.waterfall.interactableObjects.push(obj);
                break;
            case 105: //i
                obj = new Influencer(400, 100);
                this.waterfall.influencers.push(obj);
                this.waterfall.interactableObjects.push(obj);
                break;
             case 111: //o
                //add an obstacle
                obj = new Obstacle(100, 100, 100, 25, 0, 1);
                this.waterfall.obstacles.push(obj);
                this.waterfall.interactableObjects.push(obj);
                break;
            case 112: //p
                //add an obstacle
                obj = new Portal(300, 400, 100, 25, 0);
                obj2 = new Portal(200, 300, 100, 25, 0, obj);
                this.waterfall.portals.push(obj);
                this.waterfall.portals.push(obj2);
                this.waterfall.interactableObjects.push(obj);
                this.waterfall.interactableObjects.push(obj2);
                break;
            case 115: //s
                obj = new Source(200, 100, 100, 25, 0, 0, 0.5);
                this.waterfall.sources.push(obj);
                this.waterfall.interactableObjects.push(obj);
                break;
            default:
                break;
            }
        }, this));
    }
};
