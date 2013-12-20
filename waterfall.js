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
        setInterval(waterfall.update.bind(waterfall), 24);
    }

    $("#canvas").click(function (e) {
        var x = Math.floor((e.pageX - $("#canvas").offset().left)),
            y = Math.floor((e.pageY - $("#canvas").offset().top));
        //waterfall.wayPoint = new Vector(x, y);
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
    
    var i, p, waterfallWidth = 200;
    this.originX = canvas.width / 2 - waterfallWidth / 2;
    this.originY = 0;
    this.sourceWidth = 100;
    this.influencers = [];
    this.buckets = [];
    this.particles = [];
    this.canvas = canvas;
    this.loadLevel(level1);
};

Waterfall.prototype = {
    loadLevel: function (level) {
        var i = 0,
            influencerList = level.influencers,
            bucketList = level.buckets,
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

        for (i = 0; i < bucketList.length; i += 1) {
            x = bucketList[i].x;
            y = bucketList[i].y;
            width = bucketList[i].width;
            this.buckets[i] = new Bucket(x, y, width);
        }
        for (i = 0; i < this.nParticles; i += 1) {
            p = new Particle(this.originX + Math.random() * this.sourceWidth,
                             this.originY + Math.random() * this.canvas.height);
            p.vel.x = 0;
            p.vel.y = 5;
            this.particles[i] = p;
        }
    },

    update: function () {
        var i = 0, nearest, color;

        this.canvas.clear();
        
        this.drawWayPoint();

        for (i = 0; i < this.nParticles; i += 1) {
            nearest = this.nearestNeighbor(i);
            this.moveParticle(this.particles[i], nearest);
        }

        for (i = 0; i < this.nParticles; i += 1) {
            color = 'rgba(0,153,255,1)';
            this.drawParticle(this.particles[i], color);
        }

        this.drawBuckets();
        
    },

    nearestNeighbor: function (index) {
        /**
         * Find the particle closest to the particle at this index
         * @param {integer} index of particle to test against
         * @return {Particle} closest neighboring particle
         * */
        var i = 0,
            minD = 1e6,
            nearest,
            p = this.particles[index],
            d = minD;

        for (i = 0; i < this.nParticles; i += 1) {
            if (i !== index) {
                d = p.distanceSquared(this.particles[i]);
                if (d < minD) {
                    minD = d;
                    nearest = this.particles[i];
                }
            }
        }
        return nearest;
    },

    moveParticle: function (particle, nearestNeighbor) {
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

        if (particle.y > this.canvas.height) {
            //this.droplet.play();
            particle.x = this.originX + Math.random() * this.sourceWidth;
            particle.y = this.originY + Math.random() * 10;
            particle.vel.x = 0;
            particle.vel.y = 5;
            for (i = 0; i < particle.numTracers; i += 1) {
                particle.trail[i].x = particle.x;
                particle.trail[i].y = particle.y;
            }
        }
    },

    drawParticle: function (p, color) {
        if (p.y > this.canvas.height) {
            return;
        }
        var i = 0, alpha = 1.0, t1, t2;
        this.canvas.circle(p.x, p.y, p.radius, color);
        for (i = 1; i < p.numTracers; i += 1) {
            t1 = p.trail[i - 1];
            t2 = p.trail[i];
            alpha = (p.numTracers - p.trail[i].age) / p.numTracers;
            color = 'rgba(0,153,255,' + alpha + ')';
            this.canvas.line(t1, t2, color);
        }
    },

    drawWayPoint: function () {
        var i, alpha = 1, color = 'rgba(0,153,255,' + alpha + ')';
        for (i = 0; i < this.influencers.length; i += 1) {
            this.canvas.circle(this.influencers[i].x, this.influencers[i].y, 5, color);
        }
    },

    drawBuckets : function () {
        var i, b, alpha = 1, color = 'rgba(0,153,255,' + alpha + ')';
        for (i = 0; i < this.buckets.length; i += 1) {
            b = this.buckets[i];
            this.canvas.rectangle(b.x, b.y, b.width, 50, color);
        }
    },
    
    hitInfluencer: function (x, y) {
        var i, influencer, hitSize = 50;
        for (i = 0; i < this.influencers.length; i += 1) {
            influencer = this.influencers[i];
            console.log("click at :" + x + ", " + y);
            console.log("influencer at :" + influencer.x + ", " + influencer.y);
            if (x < influencer.x + hitSize && x > influencer.x - hitSize && y < influencer.y + hitSize && y > influencer.y - hitSize) {
                console.log("hit influencer");
                return i;
            }
        }
        return -1;
    }
};
