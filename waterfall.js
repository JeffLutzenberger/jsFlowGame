'use strict';

var Waterfall = function (canvas) {
    this.sources = [];
    this.influencers = [];
    this.portals = [];
    this.buckets = [];
    this.obstacles = [];
    this.particles = [];
    this.canvas = canvas;
    this.score = 0;
    this.flux = 0;
    this.sumFlux = 0;
    this.missed = 0;
    this.level = 1;
    this.framerate = 24;
    this.frame = 0;
    this.influcencer = -1;
    this.mouseDown = false;
    this.h = 1024;
    this.w = 768;
};

Waterfall.prototype = {
    loadLevel: function (level) {
        var i = 0,
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
        
        for (i = 0; i < sourceList.length; i += 1) {
            this.sources[i] = sourceFromJson(sourceList[i]);
        }

        for (i = 0; i < influencerList.length; i += 1) {
            this.influencers[i] = influencerFromJson(influencerList[i]);
        }

        for (i = 0; i < portalList.length; i += 1) {
            this.portals[i] = portalFromJson(portalList[i]);
        }

        for (i = 0; i < bucketList.length; i += 1) {
            this.buckets[i] = new bucketFromJson(bucketList[i]);
        }

        for (i = 0; i < obstacleList.length; i += 1) {
            this.obstacles[i] = new obstacleFromJson(obstacleList[i]);
        }
    },

    update: function () {
        var i = 0, color, p;

        this.calculateFlux();

        if (this.particles.length < this.nParticles) {
            this.addParticle();
        }
   
        this.moveParticles();
        
        this.canvas.clear();
        
        this.drawParticles();
        
        this.drawObstacles();
        
        this.drawPortals();
        
        this.drawInfluencers();

        this.drawBuckets();

        this.drawScore();
        
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
        var p = new Particle(this.sources[0].x + Math.random() * this.sources[0].w, this.sources[0].y);
        p.vel.x = this.sources[0].vx;
        p.vel.y = this.sources[0].vy;
        this.particles[this.particles.length] = p;
    },

    recycleParticle: function (p, vX, vY) {
        var i = 0;
        p.x = this.sources[0].x + Math.random() * this.sources[0].w;
        p.y = this.sources[0].y;
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

        particle.trace();

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
        particle.x += particle.vel.x;
        particle.y += particle.vel.y;
        
        if (this.hitObstacles(particle)) {
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
                this.score += 1;
                this.sumFlux += p.vel.y;
                this.recycleParticle(p, 0, this.sources[0].vy);
                return true;
            }
        }
        return false;
    },

    hitInfluencer: function (x, y) {
        var i, influencer, hitSize = 10;
        for (i = 0; i < this.influencers.length; i += 1) {
            influencer = this.influencers[i];
            if (x < influencer.x + hitSize && x > influencer.x - hitSize && y < influencer.y + hitSize && y > influencer.y - hitSize) {
                return i;
            }
        }
        return -1;
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
    }
};
