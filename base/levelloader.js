'use strict';

var Level = function () {
    this.map = undefined;
    this.caught = 0;
    this.missed = 0;
    this.totalTime = 0;
    this.bestCaught = undefined;
    this.bestMissed = undefined;
    this.bestTotalTime = undefined;
    this.levelHash = undefined;
};

Level.prototype = {
    updateHiScore : function (caught, missed, totalTime) {
        this.caught = caught;
        this.missed = missed;
        this.totalTime = totalTime;
        if (this.bestCaught && this.caught < this.bestCaught) {
            this.bestCaught = this.caught;
        }
        if (this.bestMissed && this.missed < this.bestMissed) {
            this.bestMissed = this.missed;
        }
        if (this.totalTime && this.totalTime < this.bestTotalTime) {
            this.bestTotalTime = this.totalTime;
        }
    }
};

var LevelLoader = {
    load: function (world, level) {
        var i = 0, x = 0, y = 0, portals,
            bucketList = level.buckets,
            influencerList = level.influencers,
            obstacleList = level.obstacles,
            portalList = level.portals,
            sinkList = level.sinks,
            sourceList = level.sources,
            starList = level.stars;
        
        world.clear();
        
        for (i = 0; i < bucketList.length; i += 1) {
            world.buckets[i] = new bucketFromJson(bucketList[i]);
            world.buckets[i].updatePoints();
        }

        for (i = 0; i < influencerList.length; i += 1) {
            world.influencers[i] = influencerFromJson(influencerList[i]);
            world.influencers[i].updatePoints();
            world.interactableObjects[i] = world.influencers[i];
        }

        for (i = 0; i < obstacleList.length; i += 1) {
            world.obstacles[i] = new obstacleFromJson(obstacleList[i]);
            world.obstacles[i].updatePoints();
        }

        for (i = 0; i < portalList.length; i += 1) {
            portals = portalFromJson(portalList[i]);
            portals[0].updatePoints();
            portals[1].updatePoints();
            world.portals.push(portals[0]);
            world.portals.push(portals[1]);
        }

        for (i = 0; i < sinkList.length; i += 1) {
            world.sinks[i] = new sinkFromJson(sinkList[i]);
            world.sinks[i].updatePoints();
        }

        for (i = 0; i < sourceList.length; i += 1) {
            world.sources[i] = new sourceFromJson(sourceList[i]);
            world.sources[i].updatePoints();
        }

        for (i = 0; i < starList.length; i += 1) {
            world.stars[i] = new starFromJson(starList[i]);
            world.stars[i].updatePoints();
        }
    },
    
    saveLevel: function (waterfall) {
        var i, level = {};
       
        //save grid size and camera information... 
        level.buckets = [];
        for (i = 0; i < waterfall.buckets.length; i += 1) {
            level.buckets.push(waterfall.buckets[i].serialize());
        }

        level.influencers = [];
        for (i = 0; i < waterfall.influencers.length; i += 1) {
            level.influencers.push(waterfall.influencers[i].serialize());
        }
        
        level.obstacles = [];
        for (i = 0; i < waterfall.obstacles.length; i += 1) {
            level.obstacles.push(waterfall.influencers[i].serialize());
        }
        
        level.portals = [];
        for (i = 0; i < waterfall.portals.length; i += 1) {
            if (waterfall.portals[i].outlet) {
                level.portals.push(waterfall.portals[i].serialize());
            }
        }
        
        level.sinks = [];
        for (i = 0; i < waterfall.sinks.length; i += 1) {
            level.sinks.push(waterfall.sinks[i].serialize());
        }
        
        level.sources = [];
        for (i = 0; i < waterfall.sources.length; i += 1) {
            level.sources.push(waterfall.sources[i].serialize());
        }

        level.stars = [];
        for (i = 0; i < waterfall.stars.length; i += 1) {
            level.stars.push(waterfall.stars[i].serialize());
        }
       
        level.gameGrid = waterfall.grid.serialize();

        return level;
    }
};
