'use strict';

var EditorUI = function (waterfall, camera) {
    this.waterfall = waterfall;
    this.camera = camera;
    this.gameObjectForm = new GameObjectEditForm(waterfall);
    this.showGrid = false;
    this.showInfluenceRing = true;
};

EditorUI.prototype = {
    show: function () {
        var val, i = 0;
        $("#editor-form").html('');
        $("#editor-form").off();

        $("#editor-form").append('<input id="bucket-button" type="button" value="Bucket">').button();
        $("#bucket-button").click($.proxy(function () {
            this.addBucket();
        }, this));

        $("#editor-form").append('&nbsp;<input id="influencer-button" type="button" value="Influencer">').button();
        $("#influencer-button").click($.proxy(function () {
            this.addInfluencer();
        }, this));

        $("#editor-form").append('&nbsp;<input id="obstacle-button" type="button" value="Obstacle">').button();
        $("#obstacle-button").click($.proxy(function () {
            this.addObstacle();
        }, this));

        $("#editor-form").append('&nbsp;<input id="portal-button" type="button" value="Portal">').button();
        $("#portal-button").click($.proxy(function () {
            this.addPortal();
        }, this));

        $("#editor-form").append('&nbsp;<input id="source-button" type="button" value="Source"><br><br>').button();
        $("#source-button").click($.proxy(function () {
            this.addSource();
        }, this));

        $("#editor-form").append('&nbsp;<input id="sink-button" type="button" value="Sink">').button();
        $("#sink-button").click($.proxy(function () {
            this.addSink();
        }, this));

        $("#editor-form").append('&nbsp;<input id="star-button" type="button" value="Star">').button();
        $("#star-button").click($.proxy(function () {
            this.addStar();
        }, this));

        $("#editor-form").append('&nbsp;<input id="play-button" type="button" value="Play">').button();
        $("#play-button").click($.proxy(function () {
            this.togglePlay();
        }, this));
        
        $("#editor-form").append('&nbsp;<input id="save-button" type="button" value="Save">').button();
        $("#save-button").click($.proxy(function () {
            this.save();
        }, this));

        $("#editor-form").append('&nbsp;<input id="reset-button" type="button" value="Reset">').button();
        $("#reset-button").click($.proxy(function () {
            this.reset();
            this.waterfall.backgroundGrid.applyExplosiveForce(5, new Vector(768 * 0.5, 1025 * 0.5), 512);
        }, this));

        $("#editor-form").append('<br><br>Tile-based Influence: <input id="localize-influence-input" type="checkbox"' + (this.waterfall.localizeInfluence ? "checked" : "") + '></span><br>');
        $("#localize-influence-input").change($.proxy(function () {
            val = $("#localize-influence-input").prop('checked');
            this.waterfall.localizeInfluence = val;
        }, this));

        $("#editor-form").append('Number of Grid Columns: <input id="grid-cols-input" type="text" value="' + this.waterfall.grid.nCols() + '"></span><br>');
        $("#editor-form").append('Number of Grid Rows: <input id="grid-rows-input" type="text" value="' + this.waterfall.grid.nRows() + '"></span><br>');
        $("#grid-cols-input").change($.proxy(function () {
            val = $("#grid-cols-input").val();
            if (isPositiveNumber(val)) {
                console.log("ncols entered: " + val);
                this.waterfall.grid.setCols(parseInt(val, 10));
                this.camera.setExtents(this.waterfall.grid.extents().x,
                                       this.waterfall.grid.extents().y);
                this.camera.setCenter(this.waterfall.grid.center().x,
                                      this.waterfall.grid.center().y);
            }
        }, this));
        $("#grid-rows-input").change($.proxy(function () {
            val = $("#grid-rows-input").val();
            if (isPositiveNumber(val)) {
                console.log("nrows entered: " + val);
                this.waterfall.grid.setRows(parseInt(val, 10));
                this.camera.setExtents(this.waterfall.grid.extents().x,
                                       this.waterfall.grid.extents().y);
                this.camera.setCenter(this.waterfall.grid.center().x,
                                      this.waterfall.grid.center().y);
            }
        }, this));

        /*$("#grid-button").append('<input type="button" value="Grid">')
            .button()
            .click($.proxy(function () {
                this.toggleGrid();
            }, this));

        $("#influence-ring-button").append('<input type="button" value="Influence Rings">')
            .button()
            .click($.proxy(function () {
                this.toggleInfluenceRings();
            }, this));
        */
    },

    hide: function () {
        $("#editor-form").html('');
        $("#editor-form").off();
        $("#object-form").html('');
        $("#object-form").off();
        $("#json").html('');
    },

    addBucket: function () {
        var obj = new Bucket(300, 500, 100, 50, 0);
        this.waterfall.buckets.push(obj);
        this.waterfall.interactableObjects.push(obj);
        this.selectObject(obj);
    },

    addInfluencer: function () {
        var obj = new Influencer(400, 100, 15, 5);
        obj.showInfluenceRing = this.showInfluenceRing;
        this.waterfall.influencers.push(obj);
        this.waterfall.interactableObjects.push(obj);
        this.selectObject(obj);
    },

    addSink: function () {
        var obj = new Sink(400, 200, 15, 5);
        //obj.lockedIn = true;
        obj.showInfluenceRing = this.showInfluenceRing;
        this.waterfall.sinks.push(obj);
        this.waterfall.interactableObjects.push(obj);
        this.selectObject(obj);
    },

    addStar: function () {
        var obj = new Star(400, 200, 15, 1);
        obj.showInfluenceRing = this.showInfluenceRing;
        this.waterfall.stars.push(obj);
        this.waterfall.interactableObjects.push(obj);
        this.selectObject(obj);
    },

    addObstacle: function () {
        var obj = new Obstacle(100, 100, 100, 25, 0, 1);
        this.waterfall.obstacles.push(obj);
        this.waterfall.interactableObjects.push(obj);
        this.selectObject(obj);
    },

    addPortal: function () {
        var obj = new Portal(300, 400, 100, 25, 0),
            obj2 = new Portal(200, 300, 50, 25, 0, obj);
        this.waterfall.portals.push(obj);
        this.waterfall.portals.push(obj2);
        this.waterfall.interactableObjects.push(obj);
        this.waterfall.interactableObjects.push(obj2);
        this.selectObject(obj);
    },

    addSource: function () {
        var obj = new Source(200, 100, 25, 25, 0, 2);
        this.waterfall.sources.push(obj);
        this.waterfall.interactableObjects.push(obj);
        this.selectObject(obj);
    },

    togglePlay: function () {
        //toggle particles
        var i = 0;
        for (i = 0; i < this.waterfall.sources.length; i += 1) {
            if (this.waterfall.sources[i].particles.length > 0) {
                this.waterfall.sources[i].nparticles = 0;
                this.waterfall.sources[i].particles.length = 0;
            } else {
                this.waterfall.sources[i].nparticles = 50;
                this.waterfall.sources[i].particles.length = 0;
            }
        }
    },

    toggleGrid: function () {
        this.showGrid = !this.showGrid;
    },

    toggleInfluenceRings: function () {
        var i = 0, o;
        this.showInfluenceRing = !this.showInfluenceRing;
        for (i = 0; i < this.waterfall.influencers.length; i += 1) {
            o = this.waterfall.influencers[i];
            o.showInfluenceRing = this.showInfluenceRing;
        }
        for (i = 0; i < this.waterfall.sinks.length; i += 1) {
            o = this.waterfall.sinks[i];
            o.showInfluenceRing = this.showInfluenceRing;
        }
    },

    reset: function () {
        this.waterfall.reset();
    },

    save: function () {
        //var json = JSON.stringify(this.waterfall.saveLevel(), undefined, 2);
        //var json = JSON.stringify(this.waterfall.saveLevel());
        var json = JSON.stringify(LevelLoader.saveLevel(this.waterfall));
        $('#json').html('<pre>' + json + '</pre>');
    },

    selectObject: function (o) {
        if (this.waterfall.interactable) {
            this.waterfall.interactable.selected = false;
        }
        this.waterfall.interactable = o;
        o.selected = true;
        this.gameObjectForm.gameObject = this.waterfall.interactable;
        this.gameObjectForm.hide();
        if (this.waterfall.interactable) {
            this.gameObjectForm.show();
        }
    }
};

var GameObjectEditForm = function (waterfall) {
    this.waterfall = waterfall;
    this.gameObject = null;
};

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function isPositiveNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n) && n >= 0;
}

GameObjectEditForm.prototype = {

    show: function () {
        var val, i, goType = this.gameObject.gameObjectType();
        $("#object-form").html('');
        $("#object-form").off();
 
        $("#object-form").append('<span id="object-type">' + goType + '</span><br>');
        $("#object-form").append('<span id="location-display">x: ' + this.gameObject.x + ' y: ' + this.gameObject.y + '</span><br>');

        if (goType === "Influencer" || goType === "Sink" || goType === "Star") {
            $("#object-form").append('radius: <input id="radius-input" type="text" value="' + this.gameObject.radius + '"></span><br>');
            $("#radius-input").change($.proxy(function () {
                val = $("#radius-input").val();
                if (isPositiveNumber(val)) {
                    this.gameObject.setRadius(val);
                    //this.gameObject.radius = val;
                    //this.gameObject.w = val;
                    //this.gameObject.h = val;
                    this.gameObject.updatePoints();
                }
            }, this));
            $("#object-form").append('influence radius: <input id="influence-radius-input" type="text" value="' + this.gameObject.influenceRadius + '"></span><br>');
            $("#influence-radius-input").change($.proxy(function () {
                val = $("#influence-radius-input").val();
                if (isPositiveNumber(val)) {
                    this.gameObject.influenceRadius = val;
                }
            }, this));

            $("#object-form").append('force: <input id="force-input" type="text" value="' + this.gameObject.force + '"></span><br>');
            $("#force-input").change($.proxy(function () {
                val = $("#force-input").val();
                if (isNumber(val)) {
                    this.gameObject.force = val;
                    this.gameObject.updatePoints();
                }
            }, this));
        } else if (goType === "GridWall") {

            $("#object-form").append('Has Door: <input id="has-door-input" type="checkbox"' + (this.gameObject.hasDoor ? "checked" : "") + '></span><br>');
            $("#has-door-input").change($.proxy(function () {
                val = $("#has-door-input").prop('checked');
                this.gameObject.hasDoor = val;
            }, this));

            $("#object-form").append('Door s1: <input id="door-s1-input" type="text" value="' + this.gameObject.getS1() + '"></span><br>');
            $("#door-s1-input").change($.proxy(function () {
                val = $("#door-s1-input").val();
                if (isPositiveNumber(val)) {
                    this.gameObject.setS1(val);
                }
            }, this));

            $("#object-form").append('Door s2: <input id="door-s2-input" type="text" value="' + this.gameObject.getS2() + '"></span><br>');
            $("#door-s2-input").change($.proxy(function () {
                val = $("#door-s2-input").val();
                if (isPositiveNumber(val)) {
                    this.gameObject.setS2(val);
                }
            }, this));

        } else {
            $("#object-form").append('w: <input id="w-input" type="text" value="' + this.gameObject.w + '"><br>');
            $("#w-input").change($.proxy(function (e) {
                val = $("#w-input").val();
                if (isPositiveNumber(val)) {
                    this.gameObject.w = parseFloat(val);
                    this.gameObject.updatePoints();
                }
            }, this));

            $("#object-form").append('h: <input id="h-input" type="text" value="' + this.gameObject.h + '"></span><br>');
            $("#h-input").change($.proxy(function () {
                val = $("#h-input").val();
                if (isPositiveNumber(val)) {
                    this.gameObject.h = parseFloat(val);
                    this.gameObject.updatePoints();
                }
            }, this));

            $("#object-form").append('theta: <input id="theta-input" type="text" value="' + this.gameObject.theta + '"></span><br>');
            $("#theta-input").change($.proxy(function () {
                val = $("#theta-input").val();
                if (isNumber(val)) {
                    this.gameObject.theta = val;
                    this.gameObject.updatePoints();
                }
            }, this));
        }

        if (goType === "Bucket") {
            $("#object-form").append('Has Bottom: <input id="has-bottom-input" type="checkbox"' + (this.gameObject.hasBottom ? "checked" : "") + '></span><br>');
            $("#has-bottom-input").change($.proxy(function () {
                val = $("#has-bottom-input").prop('checked');
                this.gameObject.hasBottom = val;
            }, this));
        }

        if (goType === "Sink") {
            $("#object-form").append('Nozzle Speed: <input id="nozzle-speed-input" type="text" value="' + this.gameObject.speed + '"></span><br>');
            $("#nozzle-speed-input").change($.proxy(function () {
                val = $("#nozzle-speed-input").val();
                if (isPositiveNumber(val)) {
                    this.gameObject.speed = val;
                }
            }, this));

            $("#object-form").append('Is Goal: <input id="is-goal-input" type="checkbox"' + (this.gameObject.isGoal ? "checked" : "") + '></span><br>');
            $("#is-goal-input").change($.proxy(function () {
                val = $("#is-goal-input").prop('checked');
                this.gameObject.isGoal = val;
            }, this));

            $("#object-form").append('Is Source: <input id="is-source-input" type="checkbox"' + (this.gameObject.isSource ? "checked" : "") + '></span><br>');
            $("#is-source-input").change($.proxy(function () {
                val = $("#is-source-input").prop('checked');
                this.gameObject.isSource = val;
                this.gameObject.lockedIn = val;
            }, this));

            
            $("#object-form").append('Influence Bound: <input id="influence-bound-input" type="checkbox"' + (this.gameObject.influenceBound ? "checked" : "") + '></span><br>');
            $("#influence-bound-input").change($.proxy(function () {
                val = $("#influence-bound-input").prop('checked');
                this.gameObject.influenceBound = val;
            }, this));
        }

        if (goType === "Source") {
            $("#object-form").append('particle speed: <input id="speed-input" type="text" value="' + this.gameObject.speed + '"></span><br>');
            $("#speed-input").change($.proxy(function () {
                val = $("#speed-input").val();
                if (isNumber(val)) {
                    this.gameObject.speed = parseFloat(val);
                    this.gameObject.updatePoints();
                }
            }, this));
        }

        if (goType === "Star") {
            $("#object-form").append('Star Type: <select id="star-type-select"></select><br>');
            for (i = 0; i < StarTypes.length; i += 1) {
                $("#star-type-select").append('<option value=' + StarTypes[i] + '>' + StarTypes[i] + '</option>');
            }
            $("#star-type-select").val(this.gameObject.starType);
            $("#star-type-select").change($.proxy(function () {
                val = $("#star-type-select option:selected").text();
                this.gameObject.starType = val;
            }, this));
        }

        if (goType === "Source" || goType === "Star" || goType === "GridWall") {
            $("#object-form").append('Color: <select id="color-select"></select><br>');
            for (i in ParticleWorldColors) {
                $("#color-select").append('<option value=' + i + '>' + i + '</option>');
            }
            if (goType === "GridWall") {
                $("#color-select").val(this.gameObject.doorColor);
                $("#color-select").change($.proxy(function () {
                    val = $("#color-select option:selected").text();
                    this.gameObject.doorColor = val;
                }, this));
            } else {
                $("#color-select").val(this.gameObject.color);
                $("#color-select").change($.proxy(function () {
                    val = $("#color-select option:selected").text();
                    this.gameObject.color = val;
                }, this));
            }
        }

        if (goType === "Bucket" || goType === "Sink") {
            $("#object-form").append('In Color: <select id="in-color-select"></select><br>');
            for (i in ParticleWorldColors) {
                $("#in-color-select").append('<option value=' + i + '>' + i + '</option>');
            }
            $("#in-color-select").val(this.gameObject.inColor);
            $("#in-color-select").change($.proxy(function () {
                val = $("#in-color-select option:selected").text();
                this.gameObject.inColor = val;
            }, this));
            
            $("#object-form").append('Out Color: <select id="out-color-select"></select><br>');
            for (i in ParticleWorldColors) {
                $("#out-color-select").append('<option value=' + i + '>' + i + '</option>');
            }
            $("#out-color-select").val(this.gameObject.outColor);
            $("#out-color-select").change($.proxy(function () {
                val = $("#out-color-select option:selected").text();
                this.gameObject.outColor = val;
            }, this));
        }

        if (goType === "Influencer") {
            $("#object-form").append('Deflects Particles: <input id="deflect-particles-input" type="checkbox" value="' + this.gameObject.deflectParticles + '"></span><br>');
            $("#deflect-particles-input").change($.proxy(function () {
                val = $("#deflect-particles-input").prop('checked');
                this.gameObject.deflectParticles = val;
            }, this));
        }

        $("#object-form").append('Interactable: <input id="interactable-input" type="checkbox" value="' + this.gameObject.interactable + '"></span><br>');
        $("#interactable-input").change($.proxy(function () {
            val = $("#interactable-input").prop('checked');
            this.gameObject.interactable = val;
        }, this));

        $("#object-form").append('<br><input id="delete-button" type="button" value="Delete">');
        $("#delete-button").button().click($.proxy(function () {
            this.deleteObject();
        }, this));
    },

    hide: function () {
        var val;
        $("#object-form").html('');
        $("#object-form").off();
        //edit our grid
    },

    updateLocation: function () {
        //the object has moved so update the x and y coordinates
        $("#location-display").html('x: ' + this.gameObject.x + ' y: ' + this.gameObject.y);
    },

    deleteObject: function () {
        //console.log(this.waterfall.interactable);
        var o = this.gameObject,
            goType = o.gameObjectType(),
            index;
        if (goType === "Bucket") {
            index = this.waterfall.buckets.indexOf(o);
            this.waterfall.buckets.splice(index, 1);
        }
        if (goType === "Influencer") {
            index = this.waterfall.influencers.indexOf(o);
            this.waterfall.influencers.splice(index, 1);
        }
        if (goType === "Obstacle") {
            index = this.waterfall.obstacles.indexOf(o);
            this.waterfall.obstacles.splice(index, 1);
        }
        if (goType === "Portal") {
            index = this.waterfall.portals.indexOf(o);
            this.waterfall.portals.splice(index, 1);
        }
        if (goType === "Source") {
            index = this.waterfall.sources.indexOf(o);
            this.waterfall.sources.splice(index, 1);
        }
        if (goType === "Sink") {
            index = this.waterfall.sinks.indexOf(o);
            this.waterfall.sinks.splice(index, 1);
        }
        if (goType === "Star") {
            index = this.waterfall.stars.indexOf(o);
            this.waterfall.stars.splice(index, 1);
        }
    }
};
