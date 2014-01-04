'use strict';

var GameController = function (canvas) {    
    this.canvas = canvas;
    this.debug = false;
    this.influencer = -1;
    this.levelstats = [];
    this.levels = [];
    this.clockrate = 10; //ms
    this.dt = 0;
    this.currentTime = 0;
    this.lastTime = 0;
    this.gameState = 'start';
    this.waterfall = new Waterfall(canvas);
    this.menuPage = new MenuPage(this.canvas);
    this.playPage = new PlayPage(this.canvas, this.waterfall);
    this.editorPage = new EditorPage(this.canvas, this.waterfall);
    this.interval = setInterval(this.update.bind(this), this.clockrate);
    this.menuPage.setHandlers();

    $("#main-menu-button").click($.proxy(function () {
        //console.log(this);
        this.waterfall.clear();
        this.menuPage.selectedLevel = -1;
        this.gameState = 'start';
        this.menuPage.setHandlers();
        this.editorPage.hideUI();
        $("#level-editor-button").toggleClass("active");
        $("#main-menu-button").toggleClass("active");

    }, this));
    $("#level-editor-button").click($.proxy(function () {
        //console.log(this);
        this.waterfall.clear();
        this.menuPage.selectedLevel = -1;
        this.gameState = 'editor';
        this.editorPage.hideUI();
        this.editorPage.showUI();
        this.editorPage.setHandlers();
        this.waterfall.loadEditor();
        $("#level-editor-button").toggleClass("active");
        $("#main-menu-button").toggleClass("active");
    }, this));

};

GameController.prototype = {

    update: function () {
        //console.log(this.timer.getTime());
        //console.log(this.lastTime);
        this.currentTime = new Date().getTime();
        this.dt = this.currentTime - this.lastTime;
        this.lastTime = this.currentTime;
        //console.log(this.dt);
        if (this.gameState === 'start') {
            if (this.menuPage.selectedLevel > -1) {
                this.levelSelected(this.menuPage.selectedLevel);
            } else {
                this.menuPage.update();
            }
        } else if (this.gameState === 'play') {
            this.waterfall.update(this.dt);
        } else if (this.gameState === 'complete') {
            //do level complete
            alert('level complete');
        } else if (this.gameState === 'editor') {
            this.waterfall.update(this.dt);
        }
    },

    levelSelected: function (level) {
        //levels currently stored in levels.js
        this.playPage.setHandlers();
        this.editorPage.hideUI();
        this.gameState = 'play';
        this.waterfall.loadLevel(levels[level]);
    }
};
