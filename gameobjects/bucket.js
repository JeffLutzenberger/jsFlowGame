'use strict';

function Bucket(x, y, w, h, theta) {
    this.base = Rectangle;
    this.base(x, y, w, h, theta);
    this.t1 = 0;
    this.fill = 0;
    this.fillSamplePeriod = 1000; //how long to wait to sample the fill
    this.fillRate = 0.0;
    this.targetFillRate = 0.1; //particles per ms
    this.hasBottom = false;
    this.inColor = 'red';
    this.outColor = 'green';
    this.level = 0;
    this.fillLevels = [0.0, 0.005, 0.01, 0.02];
    this.transition1 = new Transition(500, 0.1);
    this.transition2 = new Transition(500, 0.1);
    this.wobbleTheta = 0;
    this.wobbleTime = 0;
    this.explosion = new ParticleSystem(x, y);
    this.explosion.init(x, y, 100, 10);
    this.explode = false;
    this.particleconfigs = bucketParticleConfigs;
    this.fillSound = new Audio("sounds/bucketfill.mp3");
    this.fillSound.volume = 0.5;
    this.fillSound.load();

}

Bucket.prototype = new Rectangle();

Bucket.prototype.gameObjectType = function () {
    return "Bucket";
};

Bucket.prototype.update = function (dt) {
    var s = 0;
    this.t1 += dt;
    if (this.t1 > this.fillSamplePeriod) {
        this.fillRate = this.fill / this.t1;
        this.fill = 0;
        this.t1 = 0;
    }
   
    //note: the order is important here 
    //go up to level 1
    if (this.fillRate > this.fillLevels[1] && this.level === 0) {
        this.level = 1;
        this.transition1.forward();
    }
    //go up to level 2
    if (this.fillRate > this.fillLevels[2] && this.level === 1) {
        this.level = 2;
        this.transition2.forward();
    }
    //go up to level 3
    if (this.fillRate > this.fillLevels[3] && this.explode === false) {
        this.explode = true;
        this.fillSound.play();
        this.explosion.init(this.x,
                            this.y,
                            this.particleconfigs.particleradius,
                            this.particleconfigs.particlelength,
                            this.particleconfigs.ntracers,
                            this.particleconfigs.nparticles);

        this.explosion.burst(this.x,
                             this.y,
                             this.particleconfigs.burstradius,
                             this.particleconfigs.speed,
                             this.particleconfigs.accel,
                             this.particleconfigs.nburstparticles,
                             this.particleconfigs.lifetime);
    }
    /*
    //go down to level 1
    if (this.fillRate < this.fillLevels[2] && this.level === 2) {
        this.level = 1;
        this.explode = false;
        this.transition2.reverse();
    }
    //go down to level 0
    if (this.fillRate < this.fillLevels[1] && this.level === 1) {
        this.level = 0;
        this.transition1.reverse();
    }
    */

    this.transition1.update(dt);
    this.transition2.update(dt);

    if (this.explode === true) {
        this.explosion.update(dt);
    }

    //wobble: for buckets without bottoms
    this.wobbleTime += dt;
    if (this.fillRate > 0) {
        s = this.wobbleTime * 0.0005;
        this.wobbleTheta = Math.sin(s * Math.PI * 2) * 0.025;
        if (s > 1) {
            this.wobbleTime = 0;
        }
        this.wobbleTheta = this.wobbleTheta > 2 * Math.PI ? 0 : this.wobbleTheta;
    } else if (this.wobbleTheta > 0.001 || this.wobbleTheta < 0.001) {
        //settle back to 0
        this.wobbleTheta -= dt * 0.0005 * this.wobbleTheta;
    }

};

Bucket.prototype.hit = function (p) {
    var r = 10;
    
    if (this.hasBottom) {
        if (p.lineCollision(this.p1, this.p2, r)) {
            //count this as being caught
            //add score and recycle the particle
            if (p.color === this.inColor) {
                p.caughtSound.play();
                p.source.recycleParticle(p);
                this.fill += 1;
                return 'caught';
            } else {
                return this.n1;
            }
        }
        if (p.lineCollision(this.p2, this.p3, r)) {
            p.bounce(this.n2);
            return this.n2;
        }
        if (this.hasBottom && p.lineCollision(this.p3, this.p4, r)) {
            p.bounce(this.n3);
            return this.n3;
        }
        if (p.lineCollision(this.p4, this.p1, r)) {
            p.bounce(this.n4);
            return this.n4;
        }
    } else if (p.lineCollision(this.p5, this.p6, r)) {
        if (VectorMath.dot(p.vel, this.n1) > 0) {
            //going from out color to in color...
            if (p.color !== this.outColor) {
                //colors don't match so don't let the particle through
                p.bounce(this.n3);
                return this.n3;
            } else {  
                p.color = this.inColor;
                p.redirect(this.n1);
                this.fill += 1;
                return this.n1;
            }
        } else {
            if (p.color !== this.inColor) {
                //colors don't match so don't let the particle through
                p.bounce(this.n1);
                return this.n1;
            } else {  
                p.color = this.outColor;
                p.redirect(this.n3);
                this.fill += 1;
                return this.n3;
            }
        }
    }
    return undefined;
};

Bucket.prototype.reset = function () {
    this.explode = false;
    this.fillRate = 0;
    this.fill = 0;
    this.t1 = 0;
    this.level = 0;
};

Bucket.prototype.draw = function (canvas, inColor, outColor) {
    var alpha = 1.0, theta = Math.PI / 180 * this.theta,
        filled = (this.fillRate > 0.001), fontSize = 32, textWidth = 1,
        f = 1 + this.transition1.factor + this.transition2.factor;
    inColor = ParticleWorldColors[this.inColor];
    outColor = ParticleWorldColors[this.outColor];
    if (this.hasBottom) {
        if (this.explode === true) {
            this.explosion.draw(canvas, inColor);
        }
        //f += this.wobbleTheta;
        canvas.rectangleXY(this.x, this.y, this.w * f, this.h * f, theta, inColor, 0.5);
        canvas.bucket(this.x, this.y, this.w * f, this.h * f, theta, 20, inColor, 0.25);
        canvas.bucket(this.x, this.y, this.w * f, this.h * f, theta, 10, inColor, 0.5);
        canvas.bucket(this.x, this.y, this.w * f, this.h * f, theta, 5, [255, 255, 255], 0.9);
        canvas.bucket(this.x, this.y, this.w * f, this.h * f, theta, 30, inColor, 0.15);
        //canvas.rectangleXY(this.x, this.y, this.w * 0.5 * f, this.h * 0.5 * f, theta, 20, inColor, 0.25);
        //canvas.rectangleXY(this.x, this.y, this.w * 0.5 * f, this.h * 0.5 * f, theta, 5, [255, 255, 255], 0.9);
        //canvas.rectangleXY(this.x, this.y, this.w * 0.5 * f, this.h * 0.5 * f, theta, 30, inColor, 0.15);

        if (this.level > 0) {
            canvas.bucket(this.x, this.y, this.w * 0.75 * f, this.h * 0.75 * f, theta, 20, inColor, 0.25);
            canvas.bucket(this.x, this.y, this.w * 0.75 * f, this.h * 0.75 * f, theta, 10, inColor, 0.5);
            canvas.bucket(this.x, this.y, this.w * 0.75 * f, this.h * 0.75 * f, theta, 5, [255, 255, 255], 0.9);
            canvas.bucket(this.x, this.y, this.w * 0.75 * f, this.h * 0.75 * f, theta, 30, inColor, 0.15);
        }
        if (this.level > 1) {
            canvas.bucket(this.x, this.y, this.w * 0.5 * f, this.h * 0.5 * f, theta, 20, inColor, 0.25);
            canvas.bucket(this.x, this.y, this.w * 0.5 * f, this.h * 0.5 * f, theta, 10, inColor, 0.5);
            canvas.bucket(this.x, this.y, this.w * 0.5 * f, this.h * 0.5 * f, theta, 5, [255, 255, 255], 0.9);
            canvas.bucket(this.x, this.y, this.w * 0.5 * f, this.h * 0.5 * f, theta, 30, inColor, 0.15);
        }
        //canvas.ctx.font = fontSize + "pt Arial";
        textWidth = 50;//parseFloat(canvas.ctx.measureText(this.fillRate).width) * 0.5;
        //console.log(textWidth)
        canvas.text(this.x - textWidth, this.y + this.h * 0.5 + 40, [255, 255, 255], "Arial", fontSize, this.fillRate.toFixed(4));
        //canvas.text(this.x - textWidth, this.y + this.h * 0.5 + 80, [255, 255, 255], "Arial", fontSize, this.continuousFillRate.toFixed(4));

    } else {
        //console.log(this.wobbleTheta);
        //theta += this.wobbleTheta;
        f = 1 + this.wobbleTheta;
        canvas.funnel(this.x, this.y, this.w * f, this.h * f, theta, 20, inColor, outColor, 0.25);
        canvas.funnel(this.x, this.y, this.w * f, this.h * f, theta, 10, inColor, outColor, 0.5);
        canvas.funnel(this.x, this.y, this.w * f, this.h * f, theta, 5, [255, 255, 255], [255, 255, 255], 0.9);
        canvas.funnel(this.x, this.y, this.w * f, this.h * f, theta, 30, inColor, outColor, 0.15);
    }
};

Bucket.prototype.serialize = function () {
    var obj = this.baseSerialize();
    obj.hasBottom = this.hasBottom;
    obj.inColor = this.inColor;
    obj.outColor = this.outColor;
    return obj;
};

var bucketFromJson = function (j) {
    var obj = new Bucket(j.x, j.y, j.w, j.h, j.theta);
    $.extend(obj, j);
    return obj;
};


