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
    this.buckets = [];
    this.particles = [];
    this.canvas = canvas;
    this.score = 0;
    this.missed = 0;
    this.level = 1;
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
            p = new Particle(this.sourceX + Math.random() * this.sourceWidth,
                             this.sourceY + Math.random() * this.canvas.height);
            p.vel.x = 0;
            p.vel.y = 5;
            this.particles[i] = p;
        }
    },

    update: function () {
        var i = 0, nearest, color;

        if (this.score >= 1000 && this.level === 1) {
            this.loadLevel(level2);
            this.score = 0;
            this.missed = 0;
        }
        this.canvas.clear();
        
        this.drawWayPoint();

        for (i = 0; i < this.nParticles; i += 1) {
            this.moveParticle(this.particles[i], nearest);
        }

        for (i = 0; i < this.nParticles; i += 1) {
            color = 'rgba(0,153,255,1)';
            this.drawParticle(this.particles[i], color);
        }

        this.drawBuckets();

        this.drawScore();
        
    },
    
    recycleParticle: function (p, vX, vY) {
        var i = 0;
        p.x = this.sourceX + Math.random() * this.sourceWidth;
        p.y = this.sourceY + Math.random() * 10;
        p.vel.x = vX;
        p.vel.y = vY;
        for (i = 0; i < p.numTracers; i += 1) {
            p.trail[i].x = p.x;
            p.trail[i].y = p.y;
        }
    
    },

    hitBuckets: function (p) {
        var i, b;
        for (i = 0; i < this.buckets.length; i += 1) {
            b = this.buckets[i];
            if (p.x < b.x + b.width && p.x > b.x && p.y > b.y) {
                this.score += 1;
                this.recycleParticle(p, 0, 5);
                //this.droplet.play();
                return true;
            }
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
        
        this.hitBuckets(particle);

        if (particle.y > this.canvas.height) {
            //this.droplet.play();
            this.missed += 1;
            this.recycleParticle(particle, 0, 5);
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
        var i, b, alpha = Math.min(this.score / 1000 + 0.25, 1),
            color = 'rgba(0,153,255,' + alpha + ')';
        for (i = 0; i < this.buckets.length; i += 1) {
            b = this.buckets[i];
            this.canvas.rectangle(b.x, b.y, b.width, 50, color);
        }
    },
    
    drawScore : function () {
        var i, b, alpha = 1.0, color = 'rgba(100,100,100,' + alpha + ')',
            fontFamily = 'arial', fontSize = 18, str;
        str = "caught " + this.score;
        //console.log(this.score);
        this.canvas.text(20, 20, color, fontFamily, fontSize, str);
        str = "missed " + this.missed;
        this.canvas.text(20, 50, color, fontFamily, fontSize, str);
    },

    hitInfluencer: function (x, y) {
        var i, influencer, hitSize = 50;
        for (i = 0; i < this.influencers.length; i += 1) {
            influencer = this.influencers[i];
            if (x < influencer.x + hitSize && x > influencer.x - hitSize && y < influencer.y + hitSize && y > influencer.y - hitSize) {
                return i;
            }
        }
        return -1;
    }
};
