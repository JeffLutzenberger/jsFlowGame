'use strict';

var Transition = function (duration, finalFactor) {
    this.isPlaying = false;
    this.duration = duration;
    this.isForward = true;
    this.transitionType = "bulge";
    this.dt = 0;
    this.factor = 0;
    this.finalFactor = finalFactor;
};

Transition.prototype = {
    forward : function () {
        this.isPlaying = true;
        this.isForward = true;
        this.dt = 0;
        this.factor = 0;
    },

    reverse : function () {
        this.isPlaying = true;
        this.isForward = false;
        this.dt = 0;
        this.factor = 0;
    },

    update : function (dt) {
        if (this.isPlaying) {
            this.dt += dt;
            if (this.isForward) {
                this.factor = this.finalFactor * (2 * Math.sin(this.dt / this.duration * Math.PI) + this.dt / this.duration);
            } else {
                this.factor = this.finalFactor - this.finalFactor * this.dt / this.duration;
            }
            if (this.duration < this.dt) {
                this.isPlaying = false;
            }
        }
    }
};

var Flash = function (duration, magnitude) {
    this.duration = duration;
    this.magnitude = magnitude;
    this.isPlaying = false;
    this.dt = 0;
    this.factor = 0;
};

Flash.prototype = {
    play : function () {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.factor = 0;
        }
        this.dt = 0;
    },

    stop : function () {
        this.isPlaying = false;
        this.dt = 0;
        this.factor = 0;
    },

    update : function (dt) {
        if (this.isPlaying) {
            this.dt += dt;
            if (this.dt < this.duration) {
                if (this.factor < 1.0) {
                    this.factor += dt / this.duration * 4;
                }
            } else if (this.dt > this.duration) {
                this.factor -= dt / this.duration * 4;
                if (this.factor < 0.001) {
                    this.stop();
                }
            }
        }
    }
};

