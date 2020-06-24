// *** 社区地图 ***
// 需求：npc、人物都可以点击（鼠标、触屏），走动是自由走动不受控制，养成类社区
function GuideMain(game){
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
    // 标题
    var gameTitle = game.add.text((game.width)/2, 30, "极客时间寻路算法", {fontSize:"16px", fill:"#fff"});
    gameTitle.anchor.setTo(0.8);

    // 开启游戏音乐
    var gameMusic = game.add.audio("gameAudio");
    gameMusic.allowMultiple = true;
    gameMusic.play();
  }

  this.update = function() {

  }

  this.heroMover = function() {

  }

  this.wolfMover = function() {

  }

  this.spriteGo = function(x, y, sprite) {

  }

  this.setMarker = function() {

  }

  this.render = function() {
    
  }
}

