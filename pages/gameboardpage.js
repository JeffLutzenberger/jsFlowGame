'use strict';
/**
 * The gameboard controller is responsible for setting up a level and managing gameplay for
 * a level
 * */
var Gameboard = function (canvas) {
    this.canvas = canvas;
    this.camera = new Camera(canvas);
    this.waterfall = new ParticleWorld(canvas);
    this.editorui = new EditorUI(this.waterfall, this.camera);
    this.playButton = new UIButton(768 * 0.25, 1024 * 0.25, 110, 50, 'green', 32, 'neon-lights', 'PLAY');
    this.levels = [];
    this.level = 0;
    this.drawDt = 0;
    this.framerate = 30;
    this.currentDrawTime = 0;
    this.lastDrawTime = 0;
    this.selectedLevel = -1;
    this.hoverLevel = -1;
    this.clickLevel = -1;
    this.levelButtons = [];
    this.zoomTime = 0;
    this.startZoomFactor = 1;
    this.finalZoomFactor = 1;
    this.zoomTransition = false;
    this.camera.setExtents(768, 1024);
    this.camera.setCenter(768 * 0.5, 1025 * 0.5);
    this.startZoomCenter = new Vector(this.camera.center.x, this.camera.center.y);
    this.finalZoomCenter = new Vector(this.camera.center.x, this.camera.center.y);
    this.startZoomExtents = new Vector(this.camera.viewportWidth, this.camera.viewportHeight);
    this.finalZoomExtents = new Vector(this.camera.viewportWidth, this.camera.viewportHeight);
    this.editmode = true;
    this.loadLevels();
    this.loadLevel();
};

Gameboard.prototype = {

    setHandlers: function () {
        var i;
        this.hide();
        this.editorui.show();

        $("#gamecontroller-form").append('Edit Mode: <input id="edit-mode-input" type="checkbox" value="' + this.editmode + '"></span><br>');
        $("#edit-mode-input").change($.proxy(function () {
            this.editmode = $("#edit-mode-input").prop('checked');
            if (this.editmode) {
                this.editorui.show();
            } else {
                this.editorui.hide();
            }
        }, this));

        $("#edit-mode-input").prop('checked', true);

        $("#gamecontroller-form").append('Level: <select id="level-select"></select><br>');
        for (i = 0; i < this.levels.length; i += 1) {
            $("#level-select").append('<option value=' + i + '>' + parseInt(i + 1, 10) + '</option>');
        }
        
        $("#level-select").val(this.level);
        $("#level-select").change($.proxy(function () {
            var val = $("#level-select option:selected").text();
            this.levels[this.level].caught = this.waterfall.caught;
            this.levels[this.level].missed = this.waterfall.missed;
            this.levels[this.level].totalTime = this.waterfall.totalTime;
            this.waterfall.clear();
            this.level = parseInt(val, 10);
            this.loadLevel();
        }, this));

        $('canvas').bind('mousedown touchstart', $.proxy(function (e) {
            var x = Math.floor((e.pageX - $("#canvas").offset().left)),
                y = Math.floor((e.pageY - $("#canvas").offset().top)),
                p = this.camera.screenToWorld(x, y),
                overlayPoint = new Particle(x, y);
            if (this.playButton.hit(overlayPoint)) {
                console.log("play");
                this.waterfall.play();
                this.playButton.show = false;
                return;
            }
            this.waterfall.mouseDown = true;
            this.waterfall.hitInteractable(p.x, p.y, this.editmode);
            this.editorui.gameObjectForm.gameObject = this.waterfall.interactable;
            this.editorui.gameObjectForm.hide();
            if (this.waterfall.interactable) {
                this.editorui.gameObjectForm.show();
            } else {
                this.selectLevel(this.levelButtonHit(p.x, p.y));
            }
        }, this));

        $(document).bind('mouseup touchend', $.proxy(function (e) {
            this.waterfall.mouseDown = false;
            this.waterfall.interactable = null;
        }, this));

        $('canvas').bind('mousemove touchmove', $.proxy(function (e) {
            var n,
                i,
                obj,
                p1,
                p2,
                v,
                l,
                r,
                x = Math.floor((e.pageX - $("#canvas").offset().left)),
                y = Math.floor((e.pageY - $("#canvas").offset().top)),
                p = this.camera.screenToWorld(x, y),
                overlayPoint = new Particle(x, y);
            
            this.playButton.hover = this.playButton.hit(overlayPoint);
            if (this.waterfall.mouseDown === false) {
                return;
            }


            if (this.waterfall.interactable && this.waterfall.interactable.grabberSelected) {
                //move the sinks grabber...
                this.waterfall.interactable.moveGrabber(p);
            } else if (this.waterfall.interactable) {
                //if this object is an influencer we should make sure it does not
                //overlap other influencers
                if (this.waterfall.interactable.gameObjectType() === "Influencer") {
                    //for each influncer see if we overlap, if so, push this
                    //influencer away
                    for (i = 0; i < this.waterfall.influencers.length; i += 1) {
                        obj = this.waterfall.influencers[i];
                        if (this.waterfall.interactable !== obj) {
                            //if distance between the objects is less than the sum of their radii
                            p1 = new Particle(obj.x, obj.y, obj.influenceRadius);
                            p2 = new Particle(p.x, p.y, this.waterfall.interactable.influenceRadius);
                            v = new Vector(p2.x - p1.x, p2.y - p1.y);
                            l = VectorMath.length(v);
                            r = p1.radius + p2.radius;
                            if (l < r) {
                                v = VectorMath.normalize(v);
                                p.x = p1.x + v.x * (r + 2);
                                p.y = p1.y + v.y * (r + 2);
                                break;
                            }
                        }

                    }
                }
                this.waterfall.interactable.setxy(p.x, p.y);
                this.editorui.gameObjectForm.updateLocation();
            }
            this.hoverLevel = this.levelButtonHit(p.x, p.y);
        }, this));

        $(document).bind('keydown', $.proxy(function (e) {
            var obj, obj2;
            //console.log(e.keyCode);
            switch (e.keyCode) {
            case 39: //right arrow
                this.move(768, 0);
                break;
            case 37:
                this.move(-768, 0);
                break;
            case 38:
                this.move(0, -1024);
                break;
            case 40:
                this.move(0, 1024);
                break;
            default:
                break;
            }
        }, this));


        $(document).bind('keypress', $.proxy(function (e) {
            var obj, obj2;
            console.log(e.keyCode);
            switch (e.keyCode) {
            case 45: //minus
                //zoom out...
                this.zoom(1024);
                break;
            case 61: //equal/plus
                this.zoom(-1024);
                break;
            default:
                break;
            }
        }, this));

        $(document).bind('levelup', $.proxy(function (e) {
            this.home();
        }, this));

        $(document).bind('keyup', $.proxy(function (e) {
            if (e.keyCode === 27) { //esc
                this.waterfall.pause();
                this.playButton.show = true;
            } 
        }, this));
    },

    hide: function () {
        $("#editor-toggle").html('');
        $("#editor-toggle").off();
        this.editorui.hide();
    },


    update: function (dt) {
        if (this.zoomTransition) {
            this.onZoomTransition(dt);
        }
        this.waterfall.update(dt);
        this.draw(dt);
        //check to see if the level is complete
        //if so update the high score and save the current score
        if (this.waterfall.levelComplete) {
            this.levels[this.level].updateHiScore(this.waterfall.caught,
                                                  this.waterfall.missed,
                                                  this.waterfall.totalTime);
            //load next level
            if (this.levels.length > this.level + 1) {
                this.level += 1;
                this.loadLevel();
            }
        }
    },

    loadLevel: function () {
        //zoom way out
        this.camera.setExtents(768 * 2, 1024 * 2);
        //load the level
        LevelLoader.load(this.waterfall, this.levels[this.level].map);
        this.waterfall.reset();
        this.waterfall.pause();
        this.playButton.show = true;
        this.zoomTransition = true;
        this.startZoomCenter = new Vector(this.camera.center.x, this.camera.center.y);
        this.finalZoomCenter = new Vector(this.camera.center.x, this.camera.center.y);
        this.startZoomExtents = new Vector(768 * 2, 1024 * 2);
        this.finalZoomExtents = new Vector(this.waterfall.grid.extents().x, this.waterfall.grid.extents().y);
        this.zoomTime = 0;
    },

    loadLevels: function () {
        //read in our level json
        //initialize our level objects
        var i, l;
        for (i = 0; i < WorldLevels.length; i += 1) {
            l = new Level();
            l.map = WorldLevels[i];
            this.levels.push(l);
        }
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

    tweenLevel: function () {
        //zoom in on the new level
        //1. zoom way out
        //2. load the new level
        //3. zoom in on it
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
        this.zoomTransition = true;
        this.selectedLevel = 4;
        this.startZoomCenter = new Vector(this.camera.center.x, this.camera.center.y);
        this.finalZoomCenter = new Vector(768 * 1.5, 1024 * 1.5);
        this.startZoomExtents = new Vector(this.camera.viewportWidth, this.camera.viewportHeight);
        this.finalZoomExtents = new Vector(768 * 3, 1024 * 3);
        this.zoomTime = 0;
    },

    zoom: function (factor) {
        var aspect = this.camera.viewportWidth / this.camera.viewportHeight;
        this.zoomTransition = true;
        this.startZoomCenter = new Vector(this.camera.center.x, this.camera.center.y);
        this.finalZoomCenter = new Vector(this.camera.center.x, this.camera.center.y);
        this.startZoomExtents = new Vector(this.camera.viewportWidth, this.camera.viewportHeight);
        this.finalZoomExtents = new Vector(this.camera.viewportWidth  + factor * aspect, this.camera.viewportHeight + factor);
        this.zoomTime = 0;
    },
    
    move: function (dx, dy) {
        //zoom to level and enable interactabble object handlers
        this.zoomTransition = true;
        this.startZoomCenter = new Vector(this.camera.center.x, this.camera.center.y);
        this.finalZoomCenter = new Vector(this.camera.center.x + dx, this.camera.center.y + dy);
        this.startZoomExtents = new Vector(this.camera.viewportWidth, this.camera.viewportHeight);
        this.finalZoomExtents = new Vector(this.camera.viewportWidth, this.camera.viewportHeight);
        this.zoomTime = 0;
    },

    drawStartButton: function () {
        var x = 0, y = 0, w = 110, h = 50, color = [0, 255, 0];
        this.canvas.rectangleXY(x, y, w, h, 0, color, 0.25);
        this.canvas.rectangleOutlineXY(x, y, w, h, 0, 10, color, 0.25);
        this.canvas.rectangleOutlineXY(x, y, w, h, 0, 5, color, 0.5);
        this.canvas.rectangleOutlineXY(x, y, w, h, 0, 2, [255, 255, 255], 0.8);
        this.canvas.textWithAlpha(x - 38, y + 11, color, 1.0, "neon-lights", 32, "PLAY");
    },

    drawScoreAndTime: function () {
        var i, b, color = [0, 255, 0],
            fontFamily = 'neon-lights', fontSize = 24, str,
            caught = parseFloat(this.waterfall.caught),
            missed = parseFloat(this.waterfall.missed);
        //if (caught > 0) {
        //    caught = (caught / (missed + caught));
        //}
        str = "CAUGHT " + caught;
        this.canvas.text(10, 30, color, fontFamily, fontSize, str);
        str = (parseInt(this.waterfall.totalTime, 10) * 0.001).toFixed(0);
        this.canvas.text(180, 30, color, fontFamily, fontSize, str);
        str = "MISSED " + missed;
        this.canvas.text(250, 30, color, fontFamily, fontSize, str);
 
    },

    draw: function (dt) {
        this.drawDt += dt;
        if (this.drawDt > this.framerate) {
            
            this.currentDrawTime = new Date().getTime();
            
            this.lastDrawTime = this.currentDrawTime;

            this.camera.reset(this.waterfall.bgColor);

            this.camera.show();
           
            this.waterfall.draw(this.drawDt);
            
            //draw overlay
            
            this.camera.pop();

            if (this.waterfall.isPaused) {
                this.canvas.rectangleXY(384 * 0.5, 512 * 0.5, 384, 512, 0, [0, 0, 0], 0.5);
            }
            
            this.playButton.draw(this.canvas, false, false);

            this.drawScoreAndTime();
            
            this.drawDt = 0;
        }
    }
};
