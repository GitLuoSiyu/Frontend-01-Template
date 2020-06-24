// *** 指导地图 ***
// 需求：游戏指导主要包括背景的流动、视频列表、文章列表（带音效）。
function HelpMain(game){
  "use strict";

  var guideMap;
  var npcs = [];
  var npc;
  var player;

  var cursors;
  var mapLayer;
  var mapLayer2;
  var _rectLayer;
  var marker;
  var ctrlBar;
  var hero;
  var wolf;

  var iGroup; // 不可选中的建筑

  var textStyle = {fontSize:"12px", fill:"#333"};

  this.preload = function(){
    // 主游戏的背景音乐，需要另外加 开关
    game.load.audio("gameAudio","./img/game.ogg");

    this._iData = game.gameData;
  }

  this.create = function() {
    // 开启游戏音乐
    var gameMusic = game.add.audio("gameAudio");
    gameMusic.allowMultiple = true;
    gameMusic.play();

    // 标题
    var gameTitle = game.add.text((game.width)/2, 30, "音视频学习页", {fontSize:"16px", fill:"#fff"});
    gameTitle.anchor.setTo(0.8);
  }

  this.update = function() {

  }

  this.render = function() {
    
  }
}

