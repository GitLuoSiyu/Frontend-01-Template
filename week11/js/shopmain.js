// *** 商城地图 ***
// 需求：左侧商城商品，右侧是背包，物品选中状态，操作栏才可以实现物理点击：删除、购买、建造。
function ShopMain(game){
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

  var shopMusic;

  var iGroup; // 不可选中的建筑

  var textStyle = {fontSize:"12px", fill:"#333"};

  this.preload = function(){
    // 加载shop背景音乐
    game.load.audio("shopAudio", "./img/shop.ogg")

    // 返回菜单
    game.load.image("gomenu", "./img/play.png")

    // 加载游戏数据
    this._iData = game.gameData;
  }

  this.create = function() {
    // 标题
    var gameTitle = game.add.text((game.width)/2, 30, "游戏商城", {fontSize:"16px", fill:"#fff"});
    gameTitle.anchor.setTo(0.8);

    // 开启背景音乐
    shopMusic = game.add.audio("shopAudio")
    shopMusic.allowMultiple = true;
    shopMusic.play();

    // shop舞台背景

    // 返回主菜单
    this.goMenu = game.add.button(0,0,"gomenu",this.goMenu);
    this.goMenu.scale.setTo(0.6);
    this.goMenu.x = (game.width - this.goMenu.width)/2;
    this.goMenu.y = this.goMenu.height * 5;

  }

  this.update = function() {

  }

  this.render = function() {
    
  }

  this.goMenu = function() {
    // 返回主菜单
    shopMusic.stop();
    game.state.start("boot");
  }
}

