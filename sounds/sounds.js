'use strict';
//http://www.soundgator.com/
var SoundPool = function (file, maxSize) {
    this.maxSize = maxSize;
	this.pool = [];
    this.currSound = 0;
    this.init(file);
};

SoundPool.prototype = {
    
    init : function (file) {
        var i = 0, sound;
        for (i = 0; i < this.maxSize; i += 1) {
            // Initalize the sound
            sound = new Audio(file);
            sound.volume = 0.12;
            sound.load();
            this.pool[i] = sound;
		}
    },
	
    play : function () {
        if (this.pool[this.currSound].currentTime === 0 || this.pool[this.currSound].ended) {
			this.pool[this.currSound].play();
		}
		this.currSound = (this.currSound + 1) % this.maxSize;
	}
};
