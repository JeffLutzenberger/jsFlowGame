'use strict';

var Waterfall = function (canvas) {
    this.canvas = canvas;
    this.stars = [];
    this.sources = [];
    this.sinks = [];
    this.influencers = [];
    this.portals = [];
    this.buckets = [];
    this.obstacles = [];
    this.particles = [];
    this.nParticles = 0;
    this.score = 0;
    this.flux = 0;
    this.sumFlux = 0;
    this.missed = 0;
    this.level = 1;
    this.framerate = 30; //fps (how often we draw)
    this.dt = 0;
    this.drawDt = 0;
    this.frame = 0;
    this.interactableObjects = [];
    this.interactable = null;
    this.mouseDown = false;
    this.showGrid = false;
    this.h = 1024;
    this.w = 768;
    this.gridx = 24;
    this.gridy = 16;
    this.forceMultiplier = 1e4;
    this.maxParticleSpeed = 2;
    this.maxParticleAge = 500;
    this.maxSizeFactor = 3;
    this.minDSquared = 1000;
    this.particleColor = [0, 153, 255];//'rgba(0,153,255,1)';
    this.bgColor = 'rbga(100, 0, 0, 1)';
    this.blueColor = [0, 153, 255];
    this.greenColor = [0, 153, 153];
    this.sourceColor = [0, 255, 153];//'rgba(0,255,153,1)';
    this.sinkColor =  [0, 255, 0];//'rgba(0,153,153,1)';
    this.influencerColor = [0, 153, 255];//'rgba(0,153,255,1)';
    this.obstacleColor = [100, 100, 100];//'rgba(100,100,100,1)';
    this.gridColor = [80, 80, 80];//'rgba(80,80,80,1)';
    this.portalColor = [255, 153, 0];//'rgba(255,153,0,1)';
    this.scoreTextColor = [100, 100, 100];//'rgba(100,100,100,1)';
    this.currentSizeFactor = 1;
    this.sizeFactor = 1;
    this.currentDrawTime = 0;
    this.lastDrawTime = 0;
};

Waterfall.prototype = {
   
    setHandlers: function () {
        $(document).bind('levelup', $.proxy(function (e) {
            this.levelUp();
        }, this));
    },

    clear: function () {
        this.stars.length = 0;
        this.sources.length = 0;
        this.sinks.length = 0;
        this.influencers.length = 0;
        this.portals.length = 0;
        this.buckets.length = 0;
        this.obstacles.length = 0;
        this.particles.length = 0;
        this.interactableObjects.length = 0;
    },

    loadLevel: function (level, x, y) {
        var i = 0,
            starList = level.stars,
            sourceList = level.sources,
            sinkList = level.sinks,
            influencerList = level.influencers,
            portalList = level.portals,
            bucketList = level.buckets,
            obstacleList = level.obstacles,
            width = 0,
            p;

        x = x || 0;
        y = y || 0;

        this.clear();
            
        this.nParticles = level.nParticles;

        for (i = 0; i < starList.length; i += 1) {
            this.stars[i] = starList[i];
        }

        for (i = 0; i < sourceList.length; i += 1) {
            this.sources[i] = sourceFromJson(sourceList[i]);
            this.sources[i].x += x;
            this.sources[i].y += y;
            this.sources[i].updatePoints();
        }

        for (i = 0; i < sinkList.length; i += 1) {
            this.sinks[i] = sinkFromJson(sinkList[i]);
            this.sinks[i].x += x;
            this.sinks[i].y += y;
            this.sinks[i].updatePoints();
            this.sinks[i].levelUpCallback = $.proxy(this.levelUp, this);
        }

        for (i = 0; i < influencerList.length; i += 1) {
            this.influencers[i] = influencerFromJson(influencerList[i]);
            this.influencers[i].x += x;
            this.influencers[i].y += y;
            this.influencers[i].updatePoints();
            this.interactableObjects[i] = this.influencers[i];
        }

        for (i = 0; i < portalList.length * 2; i += 2) {
            p = portalFromJson(portalList[i]);
            this.portals[i] = p[0];
            this.portals[i + 1] = p[1];
            this.portals[i].x += x;
            this.portals[i].y += y;
            this.portals[i].updatePoints();
            this.portals[i + 1].x += x;
            this.portals[i + 1].y += y;
            this.portals[i + 1].updatePoints();
        }

        for (i = 0; i < bucketList.length; i += 1) {
            this.buckets[i] = new bucketFromJson(bucketList[i], this.x, this.y);
            this.buckets[i].x += x;
            this.buckets[i].y += y;
            this.buckets[i].updatePoints();
        }

        for (i = 0; i < obstacleList.length; i += 1) {
            this.obstacles[i] = new obstacleFromJson(obstacleList[i], this.x, this.y);
            this.obstacles[i].x += x;
            this.obstacles[i].y += y;
            this.obstacles[i].updatePoints();
        }
    },
    
    addLevel: function (level, x, y) {
        var i = 0,
            starList = level.stars,
            sourceList = level.sources,
            sinkList = level.sinks,
            influencerList = level.influencers,
            portalList = level.portals,
            bucketList = level.buckets,
            obstacleList = level.obstacles,
            width = 0,
            p,
            o;

        x = x || 0;
        y = y || 0;

        for (i = 0; i < sourceList.length; i += 1) {
            o = sourceFromJson(sourceList[i]);
            o.x += x;
            o.y += y;
            o.updatePoints();
            this.sources.push(o);
        }

        for (i = 0; i < sinkList.length; i += 1) {
            o = sinkFromJson(sinkList[i]);
            o.x += x;
            o.y += y;
            o.updatePoints();
            o.levelUpCallback = $.proxy(this.levelUp, this);
            this.sinks.push(o);
        }

        for (i = 0; i < influencerList.length; i += 1) {
            o = influencerFromJson(influencerList[i]);
            o.x += x;
            o.y += y;
            o.updatePoints();
            this.influencers.push(o);
            this.interactableObjects.push(o);
        }

        for (i = 0; i < portalList.length * 2; i += 2) {
            p = portalFromJson(portalList[i]);
            o = p[0];
            o.x += x;
            o.y += y;
            o.updatePoints();
            this.portals.push(o);
            o = p[1];
            o.x += x;
            o.y += y;
            o.updatePoints();
            this.portals.push(o);
        }

        for (i = 0; i < bucketList.length; i += 1) {
            o = new bucketFromJson(bucketList[i]);
            o.x += x;
            o.y += y;
            o.updatePoints();
            this.buckets.push(o);
        }

        for (i = 0; i < obstacleList.length; i += 1) {
            o = new obstacleFromJson(obstacleList[i]);
            o.x += x;
            o.y += y;
            o.updatePoints();
            this.obstacles.push(o);
        }
    },

    levelUp: function () {
        //add a sink and a few influencers
        //influencers should be clustered near our sinks
        //
        var locs = [[-768 * 1.5, -1024 * 1.5],
                    [-768 * 0.5, -1024 * 1.5],
                    [768 * 0.5, -1024 * 1.5],
                    [768 * 0.5, -1024 * 0.5],
                    [768 * 0.5, 1024 * 0.5]],
            x,
            y,
            obj;

        if (this.level > locs.length) {
            return;
        }
        
        x = locs[this.level][0];
        y = locs[this.level][1];

        this.addLevel(levels[this.level], x, y);

        this.level += 1;

    },

    update: function (dt) {
        var i = 0, color, p;

        this.dt = dt;

        this.calculateFlux();

        for (i = 0; i < this.sinks.length; i += 1) {
            this.sinks[i].update(dt);
        }
        
        for (i = 0; i < this.influencers.length; i += 1) {
            this.influencers[i].update(dt);
        }

        if (this.sources.length > 0) {
            if (this.particles.length < this.nParticles) {
                this.addParticle();
            }
            this.moveParticles();
        }
    },
    
    calculateFlux : function () {
        var i, sizeFactor = 1;
        this.frame += 1;
        if (this.frame > 1e6) {
            this.frame = 1e6;
        }

        if (this.frame % this.framerate * 2 === 0) {
            this.flux = this.sumFlux;
            this.sumFlux = 0;
            this.sizeFactor = Math.min(1 + this.score / 1000 * 2, this.maxSizeFactor);
        }
    },

    addParticle : function () {
        var i = Math.floor(Math.random() * this.sources.length),
            p1 = this.sources[i].p3,
            p2 = this.sources[i].p4,
            v = new Vector(p2.x - p1.x, p2.y - p1.y),
            x = p1.x + Math.random() * v.x,
            y = p1.y + Math.random() * v.y,
            p = new Particle(x, y);
        p.vel.x = this.sources[i].v * this.sources[i].n3.x;
        p.vel.y = this.sources[i].v * this.sources[i].n3.y;
        this.particles[this.particles.length] = p;
    },

    recycleParticle: function (p) {
        var i = Math.floor(Math.random() * this.sources.length),
            p1 = this.sources[i].p3,
            p2 = this.sources[i].p4,
            v = new Vector(p2.x - p1.x, p2.y - p1.y),
            x = p1.x + Math.random() * v.x,
            y = p1.y + Math.random() * v.y,
            vx = this.sources[i].v * this.sources[i].n3.x,
            vy = this.sources[i].v * this.sources[i].n3.y;
        p.recycle(x, y, vx, vy);
    },

    moveParticles: function (particle) {
        var i = 0;
        for (i = 0; i < this.particles.length; i += 1) {
            this.moveParticle(this.particles[i]);
            //this.traileffect.update(this.particles[i]);
        }
    },

    moveParticle: function (particle) {
        var i = 0, v2, d2, res, influencer, sink, n, dot;
              
        particle.move();
        
        particle.trace();

        this.hitSinks(particle);

        this.hitInfluencers(particle);
 
        if (this.hitObstacles(particle)) {
            particle.move();
        }

        this.hitBuckets(particle);

        this.hitPortals(particle);

        if (particle.age > this.maxParticleAge) {
            this.missed += 1;
            this.recycleParticle(particle);
        }
    },

    hitObstacles: function (p) {
        var i, o, h, dot;
        for (i = 0; i < this.obstacles.length; i += 1) {
            o = this.obstacles[i];
            h = o.hit(p);
            if (h) {
                if (o.reaction > 0) {
                    p.bounce(h);
                } else {
                    this.recycleParticle(p);
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
                this.score += 1;
                this.sumFlux += 1;
                this.recycleParticle(p);
                return true;
            }
        }
        return false;
    },

    hitInfluencers: function (p) {
        var i, v2, d2, res, influencer;
        for (i = 0; i < this.influencers.length; i += 1) {
            influencer = this.influencers[i];
            v2 = new Vector(influencer.x - p.x, influencer.y - p.y);
            d2 = v2.squaredLength();
            d2 = Math.max(this.minDSquared, d2);
            res = influencer.force * this.forceMultiplier / d2;
            res = Math.min(res, this.maxParticleSpeed);
            v2 = v2.normalize();
            v2 = v2.scalarMultiply(res);
            p.vel.x -= v2.x;
            p.vel.y -= v2.y;
        }
        return false;
    },

    hitSinks: function (p) {
        var i, s, d2, v2, res, hit = false;
        for (i = 0; i < this.sinks.length; i += 1) {
            s = this.sinks[i];
            if (s.hit(p)) {
                if (s.leveledUp) {
                    p.x = s.x + Math.cos(s.theta) * s.radius * s.sizeFactor * 10;
                    p.y = s.y + Math.sin(s.theta) * s.radius * s.sizeFactor * 10;
                    p.vel.x = Math.cos(s.theta) * 10;
                    p.vel.y = Math.sin(s.theta) * 10;
                    p.brightness += 0.1;
                    p.age = 0;
                    return false;
                } else {
                    this.score += 1;
                    this.sumFlux += 1;
                    this.recycleParticle(p);
                    s.addEnergy();
                    return true;
                }
            }
            //s.update(this.dt, false);
            v2 = new Vector(s.x - p.x, s.y - p.y);
            d2 = v2.squaredLength();
            res = s.force * this.forceMultiplier * s.sizeFactor / d2;
            res = Math.min(res, this.maxParticleSpeed);
            v2 = v2.normalize();
            v2 = v2.scalarMultiply(-res);
            p.vel.x -= v2.x;
            p.vel.y -= v2.y;
        }
        return false;
    },

    hitInteractable: function (x, y) {
        var i, p = new Particle(x, y);
        if (this.interactable) {
            this.interactable.selected = false;
            this.interactable.grabberSelected = false;
            this.interactable = undefined;
        }
        for (i = 0; i < this.sinks.length; i += 1) {
            if (this.sinks[i].leveledUp && this.sinks[i].hitGrabber(p)) {
                this.interactable = this.sinks[i];
                this.interactable.grabberSelected = true;
                this.interactable.selected = true;
                return true;
            }
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

    drawBackground: function (dt) {
        //this.backgroundeffect.update(dt);
        //this.backgroundeffect.draw(this.canvas);
    },

    drawParticles : function () {
        var i = 0, color = this.particleColor;
        for (i = 0; i < this.particles.length; i += 1) {
            this.particles[i].draw(this.canvas, color);
        }
    },

    drawSources : function () {
        var i, o, color = this.sourceColor;
        for (i = 0; i < this.sources.length; i += 1) {
            this.sources[i].draw(this.canvas, color);
        }
    },

    drawSinks : function (dt) {
        var i = 0, color = this.sinkColor;
        for (i = 0; i < this.sinks.length; i += 1) {
            //this.sinks[i].sizeFactor = this.sizeFactor;
            this.sinks[i].draw(this.canvas, color, dt);

            //this.canvas.drawImage(this.smokeImage, this.sinks[i].x, this.sinks[i].y, 100, 100);
        }
    },

    drawInfluencers : function (dt) {
        var i = 0, color = this.influencerColor;
        for (i = 0; i < this.influencers.length; i += 1) {
            this.influencers[i].draw(this.canvas, color, dt);
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
        var i, o, color = this.obstacleColor;
        for (i = 0; i < this.obstacles.length; i += 1) {
            this.obstacles[i].draw(this.canvas, color);
        }
    },

    drawPortals : function () {
        var i, c, color = this.portalColor;
        for (i = 0; i < this.portals.length; i += 1) {
            this.portals[i].draw(this.canvas, color);
        }
    },
    
    drawScore : function () {
        var i, b, color = this.scoreTextColor,
            fontFamily = 'arial', fontSize = 16, str;
        str = "caught " + this.score;
        this.canvas.text(50, 50, color, fontFamily, fontSize, str);
        str = "missed " + this.missed;
        this.canvas.text(50, 100, color, fontFamily, fontSize, str);
        str = "flux " + parseInt(this.flux, 10);
        this.canvas.text(50, 150, color, fontFamily, fontSize, str);
    },

    draw: function (dt) {
        this.drawBackground(dt);

        if (this.showGrid) {
            this.drawGrid();
        }

        this.drawParticles();

        this.drawSources();

        this.drawSinks(dt);
    
        this.drawObstacles();
    
        this.drawPortals();
    
        this.drawInfluencers(dt);

        this.drawBuckets();

        //this.drawScore();
    },

    snapx: function (x) {
        return this.gridx * Math.round(x / this.gridx);
    },

    snapy: function (y) {
        return this.gridy * Math.round(y / this.gridy);
    },

    drawGrid: function () {
        var color = this.gridColor;
        this.canvas.grid(this.gridx, this.gridy, this.w, this.h, 1, color);
    },

    saveLevel: function () {
        var i, level = {};
        level.nParticles = this.nParticles;
        level.buckets = this.buckets;
        level.influencers = this.influencers;
        level.obstacles = this.obstacles;
        level.portals = this.portals;
        level.sinks = [];
        for (i = 0; i < this.sinks.length; i += 1) {
            console.log(this.sinks[i]);
            level.sinks.push(this.sinks[i].serialize());
        }
        level.sources = this.sources;
        level.stars = this.stars;
        return level;
    }
};
