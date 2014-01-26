'use strict';

var GameboardPage = function (canvas) {
    this.canvas = canvas;
    this.camera = new Camera(canvas);
    this.waterfall = new Waterfall(canvas);
    this.gridDx = 768;
    this.gridDy = 1024;
    this.gridWidth = 768 * 3;
    this.gridHeight = 1024 * 3;
    this.drawDt = 0;
    this.framerate = 30;
    this.currentDrawTime = 0;
    this.lastDrawTime = 0;
    this.selectedLevel = -1;
    this.hoverLevel = -1;
    this.clickLevel = -1;
    this.levelButtons = [];
    this.zoomFactor = 0.333;
    this.playMode = false;
    this.zoomTime = 0;
    this.startZoomFactor = 1;
    this.finalZoomFactor = 1;
    this.zoomTransition = false;
    this.loadLevels();
    this.camera.setExtents(768, 1024);
    this.camera.setCenter(0, 0);
    this.startZoomCenter = new Vector(this.camera.center.x, this.camera.center.y);
    this.finalZoomCenter = new Vector(this.camera.center.x, this.camera.center.y);
    this.startZoomExtents = new Vector(this.camera.viewportWidth, this.camera.viewportHeight);
    this.finalZoomExtents = new Vector(this.camera.viewportWidth, this.camera.viewportHeight);
};

GameboardPage.prototype = {

    setLevelSelectHandlers: function () {
        $('canvas').unbind();
        $(document).unbind();
        
        $('canvas').bind('mousemove', $.proxy(function (e) {
            var x = Math.floor((e.pageX - $("#canvas").offset().left)),
                y = Math.floor((e.pageY - $("#canvas").offset().top)),
                p = this.camera.screenToWorld(x, y);
            this.hoverLevel = this.levelButtonHit(p.x, p.y);
        }, this));

        $('canvas').bind('mousedown touchstart', $.proxy(function (e) {
            var x = Math.floor((e.pageX - $("#canvas").offset().left)),
                y = Math.floor((e.pageY - $("#canvas").offset().top)),
                p = this.camera.screenToWorld(x, y);
            this.selectLevel(this.levelButtonHit(p.x, p.y));
        }, this));

        $(document).bind('keypress', $.proxy(function (e) {
            var obj, obj2;
            switch (e.keyCode) {
            case 45: //minus
                this.home();
                break;
            default:
                break;
            }
        }, this));

        $(document).bind('levelup', $.proxy(function (e) {
            this.home();
        }, this));

        this.waterfall.setHandlers();
         
    },

    setPlayHandlers: function () {
        $('canvas').unbind();
        $(document).unbind();

        $('canvas').bind('mousedown touchstart', $.proxy(function (e) {
            var x = Math.floor((e.pageX - $("#canvas").offset().left)),
                y = Math.floor((e.pageY - $("#canvas").offset().top)),
                p = this.camera.screenToWorld(x, y);
            this.waterfall.mouseDown = true;
            this.waterfall.hitInteractable(p.x, p.y);
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
                y = Math.floor((e.pageY - $("#canvas").offset().top)),
                p = this.camera.screenToWorld(x, y);
            
            if (this.waterfall.interactable.gameObjectType() === "Sink") {
                //move the sinks grabber...
                this.waterfall.interactable.moveGrabber(p);
            } else if (this.waterfall.interactable) {
                this.waterfall.interactable.x = p.x;
                this.waterfall.interactable.y = p.y;
            }

        }, this));

        $(document).bind('keypress', $.proxy(function (e) {
            var obj, obj2;
            switch (e.keyCode) {
            case 45: //minus
                this.home();
                break;
            default:
                break;
            }
        }, this));

        $(document).bind('levelup', $.proxy(function (e) {
            this.home();
        }, this));
        
        this.waterfall.setHandlers();

    },

    update: function (dt) {
        if (this.zoomTransition) {
            this.onZoomTransition(dt);
        }
        this.waterfall.update(dt);
        this.draw(dt);
    },

    loadLevels: function () {
        var w = 768, h = 1024, r, x, y, i, j;
        for (i = 0; i < 3; i += 1) {
            for (j = 0; j < 3; j += 1) {
                x = -w + w * i;
                y = -h + h * j;
                r = new Rectangle(x, y, w, h, 0);
                this.levelButtons.push(r);
            }
        }
        //level0
        this.waterfall.loadLevel(levels[0], -w * 0.5, -h * 0.5);
        /*x = 0;
        y = 0;
        r = new Rectangle(x, y, 768, 1024, 0);
        this.levelButtons.push(r);
        //level1
        //this.waterfall.addLevel(levels[1], 0, 1024);
        x = -768;
        y = -1024;
        r = new Rectangle(x, y, 768, 1024, 0);
        this.levelButtons.push(r);
        //level2
        //this.waterfall.addLevel(levels[2], 768 * 2, 1024);
        x = 768 * 2 + w * 0.5;
        y = 1024 + h * 0.5;
        r = new Rectangle(x, y, 768, 1024, 0);
        this.levelButtons.push(r);
        //level3
        //this.waterfall.addLevel(levels[3], 0, 0);
        x = w * 0.5;
        y = h * 0.5;
        r = new Rectangle(x, y, 768, 1024, 0);
        this.levelButtons.push(r);
        */
    },
     
    levelButtonHit: function (x, y) {
        var i = 0, p = new Particle(x, y), b;
        for (i = 0; i < this.levelButtons.length; i += 1) {
            b = this.levelButtons[i].bbHit(p);
            if (b) {
                return i;
            }
        }
        return -1;
    },
    
    selectLevel: function (i) {
        //zoom to level and enable interactabble object handlers
        var r = this.levelButtons[i];
        this.playMode = true;
        this.zoomTransition = true;
        this.startZoomCenter = new Vector(this.camera.center.x, this.camera.center.y);
        this.finalZoomCenter = new Vector(r.x, r.y);
        this.startZoomExtents = new Vector(this.camera.viewportWidth, this.camera.viewportHeight);
        this.finalZoomExtents = new Vector(r.w, r.h);
        this.zoomTime = 0;
        this.setPlayHandlers();
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

    home: function () {
        this.playMode = false;
        this.zoomTransition = true;
        this.startZoomCenter = new Vector(this.camera.center.x, this.camera.center.y);
        this.finalZoomCenter = new Vector(0, 0);
        this.startZoomExtents = new Vector(this.camera.viewportWidth, this.camera.viewportHeight);
        this.finalZoomExtents = new Vector(768 * 3, 1024 * 3);
        this.zoomTime = 0;
        this.setLevelSelectHandlers();
    },

    draw: function (dt) {
        this.drawDt += dt;
        if (this.drawDt > this.framerate) {
            
            this.currentDrawTime = new Date().getTime();
            
            this.lastDrawTime = this.currentDrawTime; 

            this.camera.reset(this.waterfall.bgColor);

            this.camera.show();
           
            /*if (!this.playMode) {
                this.canvas.grid(this.gridDx,
                             this.gridDy,
                             this.gridWidth,
                             this.gridHeight,
                             1,
                             'rgba(125,125,125,1)');
            }*/

            if (this.hoverLevel > -1) {
                var color = 'rgba(100,100,255,1)',
                    b = this.levelButtons[this.hoverLevel];
                this.canvas.rectangleOutline(b.p1, b.p2, b.p3, b.p4, 4, color);
            }
            
            this.waterfall.draw(this.drawDt);
            
            this.drawDt = 0;
        }
    }
};
