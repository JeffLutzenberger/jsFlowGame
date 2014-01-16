'use strict';
/*
 * This effect draws translucent, slowly moving blobs onto the a background image
 *
 */
var BackgroundEffect = function (w, h, nParticles, bgcolor) {
    this.particles = [];
    this.nParticles = nParticles;
    this.radius = 50;
    this.speed = 0.5;
    this.color = [255, 255, 255];
    this.alpha = 0.05;
    this.composite = 'lighter';
    this.width = w;
    this.height = h;
    this.bgcolor = bgcolor;
    this.buffercanvas = document.createElement('canvas');
    this.buffercanvas.width = w;
    this.buffercanvas.height = h;
    this.ctx = this.buffercanvas.getContext('2d');
    this.ctx.fillStyle = bgcolor;
    this.ctx.rect(0, 0, w, h);
    this.ctx.fill();
    this.init();
};

BackgroundEffect.prototype = {

    init: function () {
        var i, p, vx, vy;
        for (i = 0; i < this.nParticles; i += 1) {
            p = new Particle(Math.random() * this.width,
                             Math.random() * this.height,
                             this.radius);
            console.log(this.width);
            console.log(this.height);
            p.vel.x = Math.random() * this.speed * ((Math.random() < 0.5) ? -1 : 1);
            p.vel.y = Math.random() * this.speed * ((Math.random() < 0.5) ? -1 : 1);
            console.log(p);
            this.particles.push(p);
        }
    },

    update: function (dt) {
        var i;
        for (i = 0; i < this.nParticles; i += 1) {
            this.checkBounds(this.particles[i]);
            this.particles[i].move();
            //console.log(this.particles[i]);
        }
    },

    draw: function (canvas) {
        var drawtomaincanvas = true;
        var i, radius = 50;
        if (!drawtomaincanvas) {
            this.ctx.fillStyle = 'black';//this.bgcolor;
            this.ctx.rect(0, 0, this.width, this.height);
            this.ctx.fill();
        }

        for (i = 0; i < this.nParticles; i += 1) {
            /*canvas.radialGradient(this.x,
                                  this.y,
                                  this.radius,
                                  this.radius * 4,
                                  this.color,
                                  this.color,
                                  0.5,
                                  0);*/
            if (drawtomaincanvas) {
                /*canvas.circle(this.particles[i].x,
                              this.particles[i].y,
                              this.radius,
                              this.color,
                              this.alpha);*/
                canvas.radialGradient(this.particles[i].x,
                                      this.particles[i].y,
                                      this.radius,
                                      this.radius * 5,
                                      this.color,
                                      this.color,
                                      0.05,
                                      0.0);
 
            } else {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                this.ctx.beginPath();
                this.ctx.moveTo(this.particles[i].x + this.radius, this.particles[i].y);
                this.ctx.arc(this.particles[i].x, this.particles[i].y, this.radius, 0, Math.PI * 2, false);
                this.ctx.fill();
            }

            //console.log(this.x, this.y);
            
        }

        //stackBlurCanvasRGBA( this.ctx, 0, 0, this.width, this.height, radius);
        //this.ctx.putImageData(this.imgdata, 0, 0);
        //return this.buffercanvas;
        //canvas.ctx.drawImage(this.buffercanvas, -this.width * 0.25, -this.height * 0.25);
        //canvas.ctx.drawImage(this.buffercanvas, -this.width * 0.5, -this.height * 0.5);
    },

    checkBounds: function (p) {
        if (p.x < -this.radius) {
            p.x = this.width + this.radius;
        } else if (p.x > this.width + this.radius) {
            p.x = -this.radius;
        }
        if (p.y < -this.radius) {
            p.y = this.height + this.radius;
        } else if (p.y > this.height + this.radius) {
            p.y = -this.radius;
        }
    }

};


