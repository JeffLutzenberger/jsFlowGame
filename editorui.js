'use strict';
//our ui for editing game objects
//can edit the following:
//- obstacle
//- source
//- portal
//- influencers
//
//draw buttons to add game objects
//draw json/serialize box to print out a level

var EditorUI = function (waterfall) {
    this.waterfall = waterfall;
    this.gameObjectForm = new GameObjectEditForm($.proxy(this.deleteObject, this));
};

EditorUI.prototype = {
    show: function () {
        $("#bucket-button").append('<input type="button" value="Bucket">')
            .button()
            .click($.proxy(function () {
                this.addBucket();
            }, this));
        $("#influencer-button").append('<input type="button" value="Influencer">')
            .button()
            .click($.proxy(function () {
                this.addInfluencer();
            }, this));
        $("#obstacle-button").append('<input type="button" value="Obstacle">')
            .button()
            .click($.proxy(function () {
                this.addObstacle();
            }, this));
        $("#portal-button").append('<input type="button" value="Portal">')
            .button()
            .click($.proxy(function () {
                this.addPortal();
            }, this));

        $("#source-button").append('<input type="button" value="Source">')
            .button()
            .click($.proxy(function () {
                this.addSource();
            }, this));
        
        $("#play-button").append('<input type="button" value="Play">')
            .button()
            .click($.proxy(function () {
                this.togglePlay();
            }, this));
        
        $("#grid-button").append('<input type="button" value="Grid">')
            .button()
            .click($.proxy(function () {
                this.toggleGrid();
            }, this));

        $("#save-button").append('<input type="button" value="Save">')
            .button()
            .click($.proxy(function () {
                this.save();
            }, this));
    },
    
    hide: function () {
        $("#bucket-button").html('');
        $("#bucket-button").off('click');
        $("#influencer-button").html('');
        $("#influencer-button").off('click');
        $("#obstacle-button").html('');
        $("#obstacle-button").off('click');
        $("#portal-button").html('');
        $("#portal-button").off('click');
        $("#source-button").html('');
        $("#source-button").off('click');
        $("#play-button").html('');
        $("#play-button").off('click');
        $("#grid-button").html('');
        $("#grid-button").off('click');
        $("#save-button").html('');
        $("#save-button").off('click');
        $("#delete-button").html('');
        $("#delete-button").off('click');
        $("#json").html('');
    },

    addBucket: function () {
        var obj = new Bucket(100, 400, 100, 50, 0);
        this.waterfall.buckets.push(obj);
        this.waterfall.interactableObjects.push(obj);
    },
 
    addInfluencer: function () {
        var obj = new Influencer(400, 100);
        this.waterfall.influencers.push(obj);
        this.waterfall.interactableObjects.push(obj);
    },
   
    addObstacle: function () {
        var obj = new Obstacle(100, 100, 100, 25, 0, 1);
        this.waterfall.obstacles.push(obj);
        this.waterfall.interactableObjects.push(obj);
    },

    addPortal: function () {
        var obj = new Portal(300, 400, 100, 25, 0),
            obj2 = new Portal(200, 300, 100, 25, 0, obj);
        this.waterfall.portals.push(obj);
        this.waterfall.portals.push(obj2);
        this.waterfall.interactableObjects.push(obj);
        this.waterfall.interactableObjects.push(obj2);
    },

    addSource: function () {
        var obj = new Source(200, 100, 100, 25, 0, 0, 0.5);
        this.waterfall.sources.push(obj);
        this.waterfall.interactableObjects.push(obj);
    },

    togglePlay: function () {
        //toggle particles
        if (this.waterfall.nParticles <= 0 && this.waterfall.sources.length > 0) {
            this.waterfall.nParticles = 50;
        } else {
            this.waterfall.nParticles = 0;
            this.waterfall.particles.length = 0;
        }
    },

    toggleGrid: function () {
        //show the grid...
        this.waterfall.showGrid = !this.waterfall.showGrid;
    },

    save: function () {
        var json = JSON.stringify(this.waterfall.saveLevel(), undefined, 2);
        $('#json').html('<pre>' + json + '</pre>');
    },

    deleteObject: function () {
        console.log(this);
        if (this.waterfall.interactable) {
            //deselect the interactable and delete it
            //delete the interactable
            console.log("delete callback");
        }
    }

};

var GameObjectEditForm = function (deleteCallback) {
    this.deleteObject = deleteCallback;
    //source form consists of
    // - x, y coords
    // - h, w
    // - theta
    // - vx, vy 
    //this.gameObject = source;
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
        var val;
        $("#object-form").append('<span id="object-type">' + this.gameObject.constructor.name + '</span><br>');
        $("#object-form").append('<span id="location-display">x: ' + this.gameObject.x + ' y: ' + this.gameObject.y + '</span><br>');
        
        if (!this.gameObject.radius) {
            $("#object-form").append('w: <input id="w-input" type="text" value="' + this.gameObject.w + '"><br>');
            $("#w-input").change($.proxy(function (e) {
                val = $("#w-input").val();
                if (isPositiveNumber(val)) {
                    this.gameObject.w = val;
                    this.gameObject.updatePoints();
                    console.log("w changed...");
                }
            }, this));
        }
        
        if (!this.gameObject.radius) {
            $("#object-form").append('h: <input id="h-input" type="text" value="' + this.gameObject.h + '"></span><br>');
            $("#h-input").change($.proxy(function () {
                val = $("#h-input").val();
                if (isPositiveNumber(val)) {
                    this.gameObject.h = val;
                    this.gameObject.updatePoints();
                }
            }, this));
        }
        
        if (!this.gameObject.radius) {
            $("#object-form").append('theta: <input id="theta-input" type="text" value="' + this.gameObject.theta + '"></span><br>');
            $("#theta-input").change($.proxy(function () {
                val = $("#theta-input").val();
                if (isNumber(val)) {
                    this.gameObject.theta = val;
                    this.gameObject.updatePoints();
                }
            }, this));
        }

        if (this.gameObject.radius) {
            $("#object-form").append('radius: <input id="radius-input" type="text" value="' + this.gameObject.radius + '"></span><br>');
            $("#radius-input").change($.proxy(function () {
                val = $("#radius-input").val();
                if (isPositiveNumber(val)) {
                    this.gameObject.radius = val;
                    this.gameObject.w = val;
                    this.gameObject.h = val;
                    this.gameObject.updatePoints();
                }
            }, this));
        }

        if (this.gameObject.vx !== undefined) {
            $("#object-form").append('vx: <input id="vx-input" type="text" value="' + this.gameObject.vx + '"></span><br>');
            $("#vx-input").change($.proxy(function () {
                val = $("#vx-input").val();
                if (isNumber(val)) {
                    this.gameObject.vx = val;
                    this.gameObject.updatePoints();
                }
            }, this));
        }

        if (this.gameObject.vy !== undefined) {
            $("#object-form").append('vx: <input id="vy-input" type="text" value="' + this.gameObject.vy + '"></span><br>');
            $("#vy-input").change($.proxy(function () {
                val = $("#vy-input").val();
                if (isNumber(val)) {
                    this.gameObject.vx = val;
                    this.gameObject.updatePoints();
                }
            }, this));
        }

        if (this.gameObject.force !== undefined) {
            $("#object-form").append('force: <input id="force-input" type="text" value="' + this.gameObject.force + '"></span><br>');
            $("#force-input").change($.proxy(function () {
                val = $("#force-input").val();
                if (isNumber(val)) {
                    this.gameObject.force = val;
                    this.gameObject.updatePoints();
                }
            }, this));
        }

        $("#object-form").append('<br><input id="delete-button" type="button" value="Delete">');
        $("#delete-button").button().click($.proxy(function () {
            this.deleteObject();
        }, this));

    },

    hide: function () {
        $("#object-form").html('');
        $("#object-form").off();
    },

    updateLocation: function () {
        //the object has moved so update the x and y coordinates
        $("#location-display").html('x: ' + this.gameObject.x + ' y: ' + this.gameObject.y);
    },

    updateObject: function () {
        //values have been modified in the form, see if we can update the object
    }

};
