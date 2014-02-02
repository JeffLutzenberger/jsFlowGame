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
    this.gameboard = new Gameboard(this.canvas, 3, 3);
    this.editorPage = new EditorPage(this.canvas, 3, 3);
    this.interval = setInterval(this.update.bind(this), this.clockrate);
    this.gameboard.setPlayHandlers();

    $("#main-menu-button").click($.proxy(function () {
        this.gameState = 'start';
        this.gameboard.setLevelSelectHandlers();
        this.editorPage.hideUI();
        $("#level-editor-button").toggleClass("active");
        $("#main-menu-button").toggleClass("active");

    }, this));

    $("#level-editor-button").click($.proxy(function () {
        this.gameState = 'editor';
        this.editorPage.hideUI();
        this.editorPage.showUI();
        this.editorPage.setHandlers();
        $("#level-editor-button").toggleClass("active");
        $("#main-menu-button").toggleClass("active");
    }, this));
};

GameController.prototype = {

    update: function () {
        this.currentTime = new Date().getTime();
        this.dt = this.currentTime - this.lastTime;
        this.lastTime = this.currentTime;
        if (this.gameState === 'start') {
            this.gameboard.update(this.dt);
        } else if (this.gameState === 'editor') {
            this.editorPage.update(this.dt);
        }
    }
};
