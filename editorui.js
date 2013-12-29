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
    }
};
