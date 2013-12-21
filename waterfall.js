'use strict';

$(function () {
    var canvas = new Canvas($('canvas')[0]),
        waterfall = new Waterfall(canvas),
        debug = false,
        mouseDown = false,
        influencer = -1;
    if (debug) {
        waterfall.update();
    } else {
        setInterval(waterfall.update.bind(waterfall), waterfall.framerate);
    }

    $("#canvas").click(function (e) {
        var x = Math.floor((e.pageX - $("#canvas").offset().left)),
            y = Math.floor((e.pageY - $("#canvas").offset().top));
    });
   
    $("#canvas").mousedown(function (e) {
         var x = Math.floor((e.pageX - $("#canvas").offset().left)),
             y = Math.floor((e.pageY - $("#canvas").offset().top));
        mouseDown = true;
        influencer = waterfall.hitInfluencer(x, y);
    });

    $(document).mouseup(function () {
        mouseDown = false;
        influencer = -1;
    });

    $("#canvas").mousemove(function (e) {
        if (mouseDown === false) {
            return;
        }
        var x = Math.floor((e.pageX - $("#canvas").offset().left)),
            y = Math.floor((e.pageY - $("#canvas").offset().top));
        if (influencer >= 0) {
            waterfall.influencers[influencer].x = x;
            waterfall.influencers[influencer].y = y;
        }
    });
});

var Waterfall = function (canvas) {
    
    var i, p;
    this.sourceX = 0;
    this.sourceY = 0;
    this.sourceWidth = 100;
    this.influencers = [];
    this.channels = [];
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
    this.loadLevel(level1);
};

Waterfall.prototype = {
    loadLevel: function (level) {
        var i = 0,
            influencerList = level.influencers,
            channelList = level.channels,
            bucketList = level.buckets,
            obstacleList = level.obstacles,
            x = 0,
            y = 0,
            width = 0,
            p;
        this.sourceWidth = level.sourceWidth;
        this.sourceX = level.sourceX;
        this.sourceY = level.sourceY;
        this.nParticles = level.nParticles;
        for (i = 0; i < influencerList.length; i += 1) {
            x = influencerList[i].x;
            y = influencerList[i].y;
            this.influencers[i] = new Influencer(x, y);
        }

        for (i = 0; i < channelList.length; i += 1) {
            this.channels[i] = channelFromJson(channelList[i]);
        }

        for (i = 0; i < bucketList.length; i += 1) {
            this.buckets[i] = new bucketFromJson(bucketList[i]);
        }

        for (i = 0; i < obstacleList.length; i += 1) {
            this.obstacles[i] = new obstacleFromJson(obstacleList[i]);
        }

        /*
        for (i = 0; i < this.nParticles; i += 1) {
            p = new Particle(this.sourceX + Math.random() * this.sourceWidth,
                             this.sourceY + Math.random() * this.canvas.height);
            p.vel.x = 0;
            p.vel.y = 5;
            this.particles[i] = p;
        }
        */
    },

    update: function () {
        var i = 0, nearest, color, p;
        this.frame += 1;
        if (this.frame > 1e6) {
            this.frame = 1e6;
        }

        if (this.frame % (this.framerate * 3) === 0) {
            this.flux = this.sumFlux / 3;
            this.sumFlux = 0;
        }

        if (this.particles.length < this.nParticles) {
             p = new Particle(this.sourceX + Math.random() * this.sourceWidth,
                             this.sourceY);
            p.vel.x = 0;
            p.vel.y = 5;
            this.particles[this.particles.length] = p;
        }
        this.canvas.clear();
        
        this.drawParticles();
        
        this.drawObstacles();
        
        this.drawChannels();
        
        this.drawInfluencers();

        for (i = 0; i < this.particles.length; i += 1) {
            this.moveParticle(this.particles[i], nearest);
        }

        this.drawBuckets();

        this.drawScore();
        
    },
    
    recycleParticle: function (p, vX, vY) {
        var i = 0;
        p.x = this.sourceX + Math.random() * this.sourceWidth;
        p.y = this.sourceY;// + Math.random() * 5;
        p.vel.x = vX;
        p.vel.y = vY;
        for (i = 0; i < p.numTracers; i += 1) {
            p.trail[i].x = p.x;
            p.trail[i].y = p.y;
        }
    
    },

    moveParticle: function (particle) {
        /**
         * move our particle
         * @param {Particle} the particle to move
         * @param {Particle} nearest particle 
         * */
        var i = 0, v2, d2, influencer;

        particle.trace();

        particle.vel.y += 0.1;
       
        for (i = 0; i < this.influencers.length; i += 1) {
            influencer = this.influencers[i];
            v2 = new Vector(influencer.x - particle.x, influencer.y - particle.y);
            d2 = v2.squaredLength();
            d2 = 1000 / d2;
            if (d2 > 0.2) {
                d2 = 0.2;
            }
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

        this.hitChannels(particle);

        if (particle.y > this.canvas.height) {
            //this.droplet.play();
            this.missed += 1;
            this.recycleParticle(particle, 0, 5);
        }
    },

    hitObstacles: function (p) {
        var i, o;
        for (i = 0; i < this.obstacles.length; i += 1) {
            o = this.obstacles[i];
            if (p.x < o.x + o.w && p.x > o.x && p.y > o.y && p.y < o.y + o.h) {
                if (o.reaction > 0) {
                    p.vel.y *= -o.reaction;
                } else {
                    this.recycleParticle(p, 0, 5);
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
            if (p.x < b.x + b.width && p.x > b.x && p.y > b.y) {
                this.score += 1;
                this.sumFlux += p.vel.y;
                this.recycleParticle(p, 0, 5);
                //this.droplet.play();
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

    hitChannels: function (p) {
        var i, c;
        for (i = 0; i < this.channels.length; i += 1) {
            c = this.channels[i];
            if (p.x < c.xin + c.win && p.x > c.xin && p.y > c.yin && p.y < c.yin + 50) {
                //move the particle to the channel outlet
                p.x = c.xout + Math.random() * c.wout;
                p.y = c.yout + 25;
                //p.vel.x = 0;
                //p.vel.y = 5;
                for (i = 0; i < p.numTracers; i += 1) {
                    p.trail[i].x = p.x;
                    p.trail[i].y = p.y;
                }
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
            this.influencers[i].draw(this.canvas);
        }
    },

    drawBuckets : function () {
        var i, b, alpha = Math.min(this.score / 1000 + 0.25, 1),
            color = 'rgba(0,153,255,' + alpha + ')';
        for (i = 0; i < this.buckets.length; i += 1) {
            b = this.buckets[i];
            this.canvas.rectangle(b.x, b.y, b.width, 50, color);
        }
    },

    drawObstacles : function () {
        var i, o, alpha = 1,
            color = 'rgba(100,100,100,' + alpha + ')';
        for (i = 0; i < this.obstacles.length; i += 1) {
            o = this.obstacles[i];
            this.canvas.rectangle(o.x, o.y, o.w, o.h, color);
        }
    },

    drawChannels : function () {
        var i, c, alpha = 1,
            color = 'rgba(255,153,0,' + alpha + ')';
        for (i = 0; i < this.channels.length; i += 1) {
            c = this.channels[i];
            this.canvas.rectangle(c.xin, c.yin, c.win, 25, color);
            this.canvas.rectangle(c.xout, c.yout, c.wout, 25, color);
        }
    },
    
    drawScore : function () {
        var i, b, alpha = 1.0, color = 'rgba(100,100,100,' + alpha + ')',
            fontFamily = 'arial', fontSize = 16, str;
        str = "caught " + this.score;
        this.canvas.text(20, 20, color, fontFamily, fontSize, str);
        str = "missed " + this.missed;
        this.canvas.text(20, 50, color, fontFamily, fontSize, str);
        str = "flux " + parseInt(this.flux, 10);
        this.canvas.text(20, 80, color, fontFamily, fontSize, str);
    }

};
