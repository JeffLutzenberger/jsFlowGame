'use strict';

var Waterfall = function (canvas) {
    this.stars = [];
    this.sources = [];
    this.influencers = [];
    this.portals = [];
    this.buckets = [];
    this.obstacles = [];
    this.particles = [];
    this.nParticles = 0;
    this.canvas = canvas;
    this.score = 0;
    this.flux = 0;
    this.sumFlux = 0;
    this.missed = 0;
    this.level = 1;
    this.framerate = 60;
    this.frame = 0;
    this.interactableObjects = [];
    this.interactable = null;
    this.mouseDown = false;
    this.showGrid = false;
    this.h = 1024;
    this.w = 768;
    this.gridx = 24;
    this.gridy = 16;
};

Waterfall.prototype = {
    
    clear: function () {
        this.stars.length = 0;
        this.sources.length = 0;
        this.influencers.length = 0;
        this.portals.length = 0;
        this.buckets.length = 0;
        this.obstacles.length = 0;
        this.particles.length = 0;
        this.interactableObjects.length = 0;
    },

    loadLevel: function (level) {
        var i = 0,
            starList = level.stars,
            sourceList = level.sources,
            influencerList = level.influencers,
            portalList = level.portals,
            bucketList = level.buckets,
            obstacleList = level.obstacles,
            x = 0,
            y = 0,
            width = 0,
            p;
        this.nParticles = level.nParticles;
        
        for (i = 0; i < starList.length; i += 1) {
            this.stars[i] = starList[i];
        }
        for (i = 0; i < sourceList.length; i += 1) {
            this.sources[i] = sourceFromJson(sourceList[i]);
        }

        for (i = 0; i < influencerList.length; i += 1) {
            this.influencers[i] = influencerFromJson(influencerList[i]);
            //add influencers to interactables list
            //- for game play the player can only interact with influencers. 
            //- for level editor the player can interact will all game objects
            this.interactableObjects[i] = this.influencers[i];
        }

        for (i = 0; i < portalList.length * 2; i += 2) {
            p = portalFromJson(portalList[i]);
            this.portals[i] = p[0];
            this.portals[i + 1] = p[1];
        }

        for (i = 0; i < bucketList.length; i += 1) {
            this.buckets[i] = new bucketFromJson(bucketList[i]);
        }

        for (i = 0; i < obstacleList.length; i += 1) {
            this.obstacles[i] = new obstacleFromJson(obstacleList[i]);
        }
    },

    loadEditor: function () {
        var obj;
        this.clear();
        obj = new Source(300, 100, 100, 25, 0, 0, 0.5);
        this.sources.push(obj);
        this.interactableObjects.push(obj);
        obj = new Bucket(300, 600, 100, 50, 0);
        this.buckets.push(obj);
        this.interactableObjects.push(obj);
        //this.nParticles = 50;
    },

    update: function () {
        var i = 0, color, p;

        this.calculateFlux();

        if (this.sources.length > 0) {
            if (this.particles.length < this.nParticles) {
                this.addParticle();
            }
       
            this.moveParticles();
        }
        
        if (this.frame % this.framerate) {
            this.canvas.clear();

            if (this.showGrid) {
                this.drawGrid();
            }
        
            this.drawParticles();

            this.drawSources();
        
            this.drawObstacles();
        
            this.drawPortals();
        
            this.drawInfluencers();

            this.drawBuckets();

            this.drawScore();
        }
        
    },
    
    calculateFlux : function () {
        this.frame += 1;
        if (this.frame > 1e6) {
            this.frame = 1e6;
        }

        if (this.frame % (this.framerate * 3) === 0) {
            this.flux = this.sumFlux / 3;
            this.sumFlux = 0;
        }
    },

    addParticle : function () {
        var i = Math.floor(Math.random() * this.sources.length),
            p = new Particle(this.sources[i].x  - this.sources[i].w * 0.5 + Math.random() * this.sources[i].w, this.sources[i].y + this.sources[i].h * 0.5);
        p.vel.x = this.sources[i].vx;
        p.vel.y = this.sources[i].vy;
        this.particles[this.particles.length] = p;
    },

    recycleParticle: function (p, vX, vY) {
        var i = 0, j = Math.floor(Math.random() * this.sources.length);
        p.x = this.sources[j].x - this.sources[j].w * 0.5 + Math.random() * this.sources[j].w;
        p.y = this.sources[j].y + this.sources[i].h * 0.5;
        p.prevx = p.x;
        p.prevy = p.y;
        p.vel.x = vX;
        p.vel.y = vY;
        for (i = 0; i < p.numTracers; i += 1) {
            p.trail[i].x = p.x;
            p.trail[i].y = p.y;
        }
    },

    moveParticles: function (particle) {
        var i = 0;
        for (i = 0; i < this.particles.length; i += 1) {
            this.moveParticle(this.particles[i]);
        }
    },

    moveParticle: function (particle) {
        var i = 0, v2, d2, influencer;

        particle.vel.y += this.sources[0].vy;
       
        for (i = 0; i < this.influencers.length; i += 1) {
            influencer = this.influencers[i];
            v2 = new Vector(influencer.x - particle.x, influencer.y - particle.y);
            d2 = v2.squaredLength();
            d2 = 1e4 / d2;
            v2 = v2.normalize();
            v2 = v2.scalarMultiply(d2);
            particle.vel.x -= v2.x;
            particle.vel.y -= v2.y;
        }
        
        particle.move();
        
        particle.trace();
        
        if (this.hitObstacles(particle)) {
            particle.move();
            return;
        }

        if (this.hitBuckets(particle)) {
            return;
        }

        this.hitPortals(particle);

        if (particle.y > this.h) {
            this.missed += 1;
            this.recycleParticle(particle, 0, this.sources[0].vy);
        }
    },

    hitObstacles: function (p) {
        var i, o;
        for (i = 0; i < this.obstacles.length; i += 1) {
            o = this.obstacles[i];
            if (o.hit(p)) {
                if (o.reaction > 0) {
                    p.vel.y *= -o.reaction;
                } else {
                    this.recycleParticle(p, 0, this.sources[0].vy);
                }
                return true;
            }
        }
        return false;
    },

    hitBuckets: function (p) {
        var i, b;
        for (i = 0; i < this.buckets.length; i += 1) {
            b = this.buckets[i];
            if (b.hit(p)) {
                //console.log(p);
                //console.log(b);
                this.score += 1;
                this.sumFlux += p.vel.y;
                this.recycleParticle(p, 0, this.sources[0].vy);
                return true;
            }
        }
        return false;
    },

    hitInteractable: function (x, y) {
        var i, p = new Particle(x, y);
        if (this.interactable) {
            this.interactable.selected = false;
            this.interactable = undefined;
        }
        for (i = 0; i < this.interactableObjects.length; i += 1) {
            if (this.interactableObjects[i].bbHit(p)) {
                this.interactable = this.interactableObjects[i];
                this.interactable.selected = true;
                return true;
            }
        }
        return false;
    },

    hitPortals: function (p) {
        var i, c;
        for (i = 0; i < this.portals.length; i += 1) {
            if (this.portals[i].hit(p)) {
                return true;
            }
        }
        return false;
    },

    drawParticles : function () {
        var i = 0, color;
        for (i = 0; i < this.particles.length; i += 1) {
            color = 'rgba(0,153,255,1)';
            this.particles[i].draw(this.canvas, color);
        }
    },

    drawSources : function () {
        var i, o, alpha = 1,
            color = 'rgba(0,255,153,' + alpha + ')';
        for (i = 0; i < this.sources.length; i += 1) {
            this.sources[i].draw(this.canvas, color);
        }
    },

    drawInfluencers : function () {
        var i = 0, alpha = 1, color = 'rgba(0,153,255,' + alpha + ')';
        for (i = 0; i < this.influencers.length; i += 1) {
            this.influencers[i].draw(this.canvas, color);
        }
    },

    drawBuckets : function () {
        var i, b, alpha = Math.min(this.score / 1000 + 0.25, 1),
            color = 'rgba(0,153,255,' + alpha + ')';
        for (i = 0; i < this.buckets.length; i += 1) {
            this.buckets[i].draw(this.canvas, color);
        }
    },

    drawObstacles : function () {
        var i, o, alpha = 1,
            color = 'rgba(100,100,100,' + alpha + ')';
        for (i = 0; i < this.obstacles.length; i += 1) {
            this.obstacles[i].draw(this.canvas, color);
        }
    },

    drawPortals : function () {
        var i, c, alpha = 1,
            color = 'rgba(255,153,0,' + alpha + ')';
        for (i = 0; i < this.portals.length; i += 1) {
            this.portals[i].draw(this.canvas, color);
        }
    },
    
    drawScore : function () {
        var i, b, alpha = 1.0, color = 'rgba(100,100,100,' + alpha + ')',
            fontFamily = 'arial', fontSize = 16, str;
        str = "caught " + this.score;
        this.canvas.text(50, 50, color, fontFamily, fontSize, str);
        str = "missed " + this.missed;
        this.canvas.text(50, 100, color, fontFamily, fontSize, str);
        str = "flux " + parseInt(this.flux, 10);
        this.canvas.text(50, 150, color, fontFamily, fontSize, str);
    },

    snapx: function (x) {
        return this.gridx * Math.round(x / this.gridx);
    },

    snapy: function (y) {
        return this.gridy * Math.round(y / this.gridy);
    },

    drawGrid: function () {
        var color = 'rgba(200,200,200,1)';
        this.canvas.grid(this.gridx, this.gridy, this.w, this.h, 1, color);
    },

    saveLevel: function () {
        var level = {},
            i = 0,
            starList = level.stars,
            sourceList = level.sources,
            influencerList = level.influencers,
            portalList = level.portals,
            bucketList = level.buckets,
            obstacleList = level.obstacles,
            x = 0,
            y = 0,
            width = 0,
            p;

        level.nParticles = this.nParticles;
        level.buckets = this.buckets;
        level.influencers = this.influencers;
        level.obstacles = this.obstacles;
        level.portals = this.portals;
        level.sources = this.sources;
        level.stars = this.stars;
        return level;
    }
};
