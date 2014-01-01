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

    $("#main-menu-button").click($.proxy(function () {
        //console.log(this);
        this.waterfall.clear();
        this.startPage.selectedLevel = -1;
        this.gameState = 'start';
        this.startPage.setHandlers();
        this.editorPage.hideUI();
        $("#level-editor-button").toggleClass("active");
        $("#main-menu-button").toggleClass("active");

    }, this));
    $("#level-editor-button").click($.proxy(function () {
        //console.log(this);
        this.waterfall.clear();
        this.startPage.selectedLevel = -1;
        this.gameState = 'editor';
        this.editorPage.hideUI();
        this.editorPage.showUI();
        this.editorPage.setHandlers();
        this.waterfall.loadEditor();
        $("#level-editor-button").toggleClass("active");
        $("#main-menu-button").toggleClass("active");
    }, this));

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
        //from levels.js
        this.playPage.setHandlers();
        this.editorPage.hideUI();
        this.gameState = 'play';
        this.waterfall.loadLevel(levels[level]);
    }

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
            this.canvas.ctx.translate(b.x * this.canvas.m, b.y * this.canvas.m);
            this.canvas.ctx.scale(b.w / this.canvas.width * this.canvas.m,
                                  b.h / this.canvas.height * this.canvas.m);
            this.levels[i].drawObstacles();
            this.levels[i].drawPortals();
            this.levels[i].drawInfluencers();
            this.levels[i].drawBuckets();
            this.levels[i].drawSinks();
            this.levels[i].drawSources();
            this.canvas.ctx.scale(this.canvas.width / b.w / this.canvas.m,
                                  this.canvas.height / b.h / this.canvas.m);
            this.canvas.ctx.translate(-b.x / 2, -b.y / 2);
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
    this.editorui = new EditorUI(waterfall);
};

EditorPage.prototype = {
    hideUI: function () {
        this.editorui.hide();
    },
    
    showUI: function () {
        this.editorui.show();
    },

    setHandlers: function () {
        $('canvas').unbind();

        $('canvas').bind('mousedown touchstart', $.proxy(function (e) {
            var x = Math.floor((e.pageX - $("#canvas").offset().left)),
                y = Math.floor((e.pageY - $("#canvas").offset().top));
            this.waterfall.mouseDown = true;
            this.waterfall.hitInteractable(x / this.canvas.m, y / this.canvas.m);
            this.editorui.gameObjectForm.gameObject = this.waterfall.interactable;
            this.editorui.gameObjectForm.hide();
            if (this.waterfall.interactable) {
                this.editorui.gameObjectForm.show();
            }
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
            x = this.waterfall.snapx(x);
            y = this.waterfall.snapy(y);

            if (this.waterfall.interactable) {
                this.waterfall.interactable.setxy(x / this.canvas.m, y / this.canvas.m);
                this.editorui.gameObjectForm.updateLocation();
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
                    this.waterfall.particles.length = 0;
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
