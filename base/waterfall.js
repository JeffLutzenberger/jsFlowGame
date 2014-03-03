'use strict';
       
var ParticleWorld = function (canvas) {
    this.canvas = canvas;
    //this.grid = grid;
    this.grid = new GameGrid(768, 1024, 768, 1024);
    this.stars = [];
    this.sources = [];
    this.sinks = [];
    this.stars = [];
    this.influencers = [];
    this.portals = [];
    this.buckets = [];
    this.obstacles = [];
    this.sinkIsSource = false;
    this.localizeInfluence = true;
    this.isPaused = false;
    this.score = 0;
    this.flux = 0;
    this.sumFlux = 0;
    this.missed = 0;
    this.caught = 0;
    this.totalTime = 0;
    this.levelComplete = false;
    this.framerate = 30; //fps (how often we draw)
    this.frame = 0;
    this.interactableObjects = [];
    this.interactable = null;
    this.mouseDown = false;
    this.showGrid = false;
    this.gridx = 24;
    this.gridy = 16;
    this.forceMultiplier = 1e4;
    this.maxParticleSpeed = 1;
    this.maxParticleAge = 10;
    this.minDSquared = 1000;
    this.particleColor = ParticleWorldColors.blue;
    this.sourceColor = ParticleWorldColors.blue;
    this.sinkColor =  ParticleWorldColors.green;
    this.starColor =  [255, 150, 200];
    this.influencerColor = ParticleWorldColors.blue;
    this.obstacleColor = ParticleWorldColors.gray1;
    this.bucketColor = [0, 153, 255];
    this.gridColor = [200, 50, 255];
    this.portalColor = [255, 153, 0];
    this.scoreTextColor = [100, 100, 100];
    this.backgroundGrid = new BackgroundGrid(768, 1024, 768 / 16, 1024 / 16);
    this.particleCaughtSound = new SoundPool('sounds/hit.mp3', 10);
    //this.traileffect = new TrailEffect(canvas);
    //canvas.electricityLine(new Vector(100, 100), new Vector(100, 500), 30, 10, [100, 100, 255], 1.0);
};

ParticleWorld.prototype = {
   
    clear: function () {
        this.stars.length = 0;
        this.sources.length = 0;
        this.sinks.length = 0;
        this.stars.length = 0;
        this.influencers.length = 0;
        this.portals.length = 0;
        this.buckets.length = 0;
        this.obstacles.length = 0;
        this.interactableObjects.length = 0;
    },

    reset : function () {
        var i = 0;
        for (i = 0; i < this.buckets.length; i += 1) {
            this.buckets[i].reset();
        }
        //reset sources
        for (i = 0; i < this.sources.length; i += 1) {
            if (this.sources[i].particles.length > 0) {
                this.sources[i].nparticles = 0;
                this.sources[i].particles.length = 0;
                this.sources[i].nparticles = 50;
            }
        }
        this.caught = 0;
        this.missed = 0;
        this.totalTime = 0;
        this.levelComplete = false;
    },

    pause: function () {
        var i = 0;
        this.isPaused = true;
        //reset sources
        for (i = 0; i < this.sources.length; i += 1) {
            this.sources[i].nparticles = 0;
            this.sources[i].particles.length = 0;
        }
    },

    play: function () {
        var i = 0;
        this.isPaused = false;
        //reset sources
        for (i = 0; i < this.sources.length; i += 1) {
            this.sources[i].nparticles = 50;
        }
    },

    update: function (dt) {
        var i = 0, color, p, f = 1, o;

        this.calculateFlux();

        this.backgroundGrid.update(dt);

        this.grid.update(dt);

        for (i = 0; i < this.sources.length; i += 1) {
            o = this.sources[i];
            o.update(dt);
        }

        for (i = 0; i < this.sinks.length; i += 1) {
            o = this.sinks[i];
            o.update(dt);
            f = -o.force;
            f = f < 0 ? f * 0.25 : f;
            this.backgroundGrid.applyExplosiveForce(f * 5, new Vector(o.x, o.y), o.radius * 10);

        }

        for (i = 0; i < this.stars.length; i += 1) {
            o = this.stars[i];
            o.update(dt);
            f = -o.force;
            f = f < 0 ? f * 0.25 : f;
            this.backgroundGrid.applyExplosiveForce(f * 5, new Vector(o.x, o.y), o.radius * 10);

        }
        
        for (i = 0; i < this.influencers.length; i += 1) {
            o = this.influencers[i];
            o.update(dt);
            f = -o.force;
            f = f < 0 ? f * 0.25 : f;
            this.backgroundGrid.applyExplosiveForce(f * 6, new Vector(o.x, o.y), o.radius * 10);
        }

        for (i = 0; i < this.buckets.length; i += 1) {
            o = this.buckets[i];
            o.update(dt);
        }
 
        if (!this.isPaused && this.buckets.length > 0 && !this.buckets[0].explode) {
            this.totalTime += dt;
            this.moveParticles(dt);
        } else if (this.buckets.length > 0 && this.buckets[0].explode) {
            this.levelComplete = true;
        }
    },

    
    calculateFlux : function () {
        var i;
        this.frame += 1;
        if (this.frame > 1e6) {
            this.frame = 1e6;
        }

        if (this.frame % this.framerate * 2 === 0) {
            this.flux = this.sumFlux;
            this.sumFlux = 0;
        }
    },

    moveParticles: function (dt) {
        var i = 0, j = 0;
        for (i = 0; i < this.sources.length; i += 1) {
            for (j = 0; j < this.sources[i].particles.length; j += 1) {
                this.moveParticle(this.sources[i].particles[j], dt);
            }
        }
    },

    moveParticle: function (particle, dt) {
             
        particle.move(dt);
        
        particle.trace();

        this.hitSinks(particle, dt);

        this.hitStars(particle);

        this.hitInfluencers(particle, dt);
 
        this.hitObstacles(particle, dt);

        this.hitBuckets(particle, dt);

        this.hitPortals(particle);

        this.hitGridWall(particle, dt);

        if (particle.age > this.maxParticleAge) {
            this.missed += 1;
            particle.source.recycleParticle(particle);
        }
    },

    hitObstacles: function (p, dt) {
        var i, o, h, dot;
        for (i = 0; i < this.obstacles.length; i += 1) {
            o = this.obstacles[i];
            h = o.hit(p);
            if (h) {
                if (o.reaction > 0) {
                    p.bounce(h);
                } else {
                    p.source.recycleParticle(p);
                }
                p.move(dt);
            }
        }
    },

    hitBuckets: function (p, dt) {
        var i, b, h;
        for (i = 0; i < this.buckets.length; i += 1) {
            b = this.buckets[i];
            h = b.hit(p);
            if (h === 'caught') {
                this.caught += 1;
            } else if (h) {
                //if (h.hasBottom) {
                //    p.bounce(h);
                //} else {
                //    p.redirect(h);
                //}
                p.move(dt);
            }
        }
    },

    hitInfluencers: function (p, dt) {
        var i, n, influencer;
        for (i = 0; i < this.influencers.length; i += 1) {
            influencer = this.influencers[i];
            if (this.localizeInfluence && !this.grid.sameTile(influencer, p)) {
                continue;
            }
            if (influencer.deflectParticles) {
                n = influencer.bounce(p);
                if (n) {
                    //move the particle outside the circle...
                    p.bounce(n);
                    p.move(dt);
                    return true;
                }
            }
            influencer.influence(p, dt, this.maxParticleSpeed);
        }
    },

    hitSinks: function (p, dt) {
        var i, s, n, d2, v2, res, hit = false, dtheta = Math.random() * 0.4 - 0.2;
        for (i = 0; i < this.sinks.length; i += 1) {
            s = this.sinks[i];
            if (this.localizeInfluence && !this.grid.sameTile(s, p)) {
                continue;
            }

            if (s.influenceBound && !s.insideInfluenceRing(p)) {
                continue;
            }

            //this is where we would check the color of the particle            
            if (p.color !== s.inColor) {
                n = s.bounce(p);
                if (n) {
                    //move the particle outside the circle...
                    p.bounce(n);
                    p.move(dt);
                    return true;
                }
            }

            if (s.hit(p)) {
                if (s.lockedIn && s.isSource) {
                    s.recycleParticle(p);
                    p.brightness += 0.1;
                    p.age = 0;
                    return false;
                } else {
                    p.source.recycleParticle(p);
                    s.addEnergy();
                    return true;
                }
            }
            s.influence(p, dt, this.maxParticleSpeed);
        }
    },

    hitStars: function (p) {
        var i, s, d2, v2, res, hit = false, dt = Math.random() * 0.4 - 0.2;
        for (i = 0; i < this.stars.length; i += 1) {
            s = this.stars[i];
            if (this.localizeInfluence) {
                //check that particle and object are in the same tile piece
                if (!this.grid.sameTile(s, p)) {
                    continue;
                }
            }

            if (!s.exploded && s.hit(p)) {
                //flash and increment energy
                s.addEnergy();
                p.source.recycleParticle(p);
                return true;
            }
            if (s.insideInfluenceRing(p)) {
                //add door energy
                s.addDoorEnergy();
            }
            v2 = new Vector(s.x - p.x, s.y - p.y);
            d2 = v2.squaredLength();
            res = s.force * this.forceMultiplier * s.sizeFactor * s.energy / s.maxEnergy / d2;
            res = Math.min(res, this.maxParticleSpeed);
            v2 = v2.normalize();
            v2 = v2.scalarMultiply(res);
            p.vel.x += v2.x;
            p.vel.y += v2.y;
        }
        return false;
    },

    hitInteractable: function (x, y, checkall) {
        var i, p = new Particle(x, y);
        p.radius = 50;
        if (this.interactable) {
            this.interactable.selected = false;
            this.interactable.grabberSelected = false;
            this.interactable = undefined;
        }
        
        for (i = 0; i < this.sinks.length; i += 1) {
            this.sinks[i].grabberSelected = false;
        }

        for (i = 0; i < this.sinks.length; i += 1) {
            if (this.sinks[i].lockedIn && this.sinks[i].hitGrabber(p)) {
                this.interactable = this.sinks[i];
                this.interactable.grabberSelected = true;
                this.interactable.selected = true;
                return true;
            }
        }

        //checkall means we're in edit mode and we should check all objects...
        if (checkall) {
            for (i = 0; i < this.sinks.length; i += 1) {
                if (this.sinks[i].bbHit(p)) {
                    this.interactable = this.sinks[i];
                    this.interactable.selected = true;
                    return true;
                }
            }
            
            for (i = 0; i < this.obstacles.length; i += 1) {
                if (this.obstacles[i].bbHit(p)) {
                    this.interactable = this.obstacles[i];
                    this.interactable.selected = true;
                    return true;
                }
            }

            for (i = 0; i < this.stars.length; i += 1) {
                if (this.stars[i].bbHit(p)) {
                    this.interactable = this.stars[i];
                    this.interactable.selected = true;
                    return true;
                }
            }
            for (i = 0; i < this.influencers.length; i += 1) {
                if (this.influencers[i].bbHit(p)) {
                    this.interactable = this.influencers[i];
                    this.interactable.selected = true;
                    return true;
                }
            }

            for (i = 0; i < this.sources.length; i += 1) {
                if (this.sources[i].bbHit(p)) {
                    this.interactable = this.sources[i];
                    this.interactable.selected = true;
                    return true;
                }
            }

            for (i = 0; i < this.buckets.length; i += 1) {
                if (this.buckets[i].bbHit(p)) {
                    this.interactable = this.buckets[i];
                    this.interactable.selected = true;
                    return true;
                }
            }

            for (i = 0; i < this.portals.length; i += 1) {
                if (this.portals[i].bbHit(p)) {
                    this.interactable = this.portals[i];
                    this.interactable.selected = true;
                    return true;
                }
            }

            for (i = 0; i < this.grid.lines.length; i += 1) {
                if (this.grid.lines[i].circleHit(p)) {
                    this.interactable = this.grid.lines[i];
                    this.interactable.selected = true;
                    console.log(this.interactable);
                    return true;
                }
            }
        } else {
            for (i = 0; i < this.interactableObjects.length; i += 1) {
                if (this.interactableObjects[i].bbHit(p)) {
                    this.interactable = this.interactableObjects[i];
                    this.interactable.selected = true;
                    return true;
                }
            }
        }
        return false;
    },

    hitPortals: function (p) {
        var i, c;
        for (i = 0; i < this.portals.length; i += 1) {
            if (this.portals[i].hit(p)) {
                p.morphSound.play();
                return true;
            }
        }
        return false;
    },

    hitGridWall: function (p, dt) {
        //where is the particle...
        //i.e. get the grid rect that the particle is in
        var h = this.grid.hit(p);
        if (h) {
            p.bounce(h);
            p.move(dt);
            return true;
        }
        return false;
    },

    drawBackground: function (dt) {
        //this.backgroundeffect.update(dt);
        //this.backgroundeffect.draw(this.canvas);
        //this.canvas.ctx.drawImage(this.traileffect.getCanvas(), -768 * 3 * 0.5, -1024 * 3 * 0.5, 768 * 3, 1024 * 3);
    },

    drawParticles : function () {
        var i = 0, j = 0, color = this.particleColor;
        for (i = 0; i < this.sources.length; i += 1) {
            for (j = 0; j < this.sources[i].particles.length; j += 1) {
                this.sources[i].particles[j].draw(this.canvas, color);
            }
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
            this.sinks[i].draw(this.canvas, color, dt);
        }
    },

    drawStars : function (dt) {
        var i = 0, color = this.starColor;
        for (i = 0; i < this.stars.length; i += 1) {
            this.stars[i].draw(this.canvas, color, dt);
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
            color = this.bucketColor;
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

    drawGridWalls : function () {
        var color = this.gridColor;
        this.grid.draw(this.canvas, color);
    },
   
    drawBackgroundGrid : function () {
        var color = this.gridColor;
        this.backgroundGrid.draw(this.canvas, color);
    },
    
    drawScore : function () {
        var i, b, color = [255, 255, 255],
            fontFamily = 'arial', fontSize = 24, str;
        str = "caught " + this.caught;
        this.canvas.text(50, 50, color, fontFamily, fontSize, str);
        str = "missed " + this.missed;
        this.canvas.text(50, 100, color, fontFamily, fontSize, str);
        str = "time " + (parseInt(this.totalTime, 10) * 0.001).toFixed(0);
        this.canvas.text(50, 150, color, fontFamily, fontSize, str);
    },

    draw: function (dt) {
        this.drawBackground(dt);

        //this.drawBackgroundGrid();

        this.drawParticles();

        this.drawSources();

        this.drawSinks(dt);
        
        this.drawStars(dt);
    
        this.drawObstacles();
    
        this.drawPortals();
    
        this.drawInfluencers(dt);

        this.drawBuckets();

        this.drawGridWalls();

        this.drawScore();
    }
};
