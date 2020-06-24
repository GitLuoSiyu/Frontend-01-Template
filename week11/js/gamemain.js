//*** 地图视图 ***
function GameMain(game){
  "use strict";
    var map;
    var mapLayer;
    var mapLayer2;
    var _rectLayer;
    var marker;
    var ctrlBar;
    var cursors;
    var hero;
    var wolf;
  
    var iGroup;  //所有地图上的物体放在一个组内（如、树木、人物、动物...）
  
    var textStyle = {fontSize: "12px", fill: "#333"};
  
    this.preload = function() {
      // 主游戏的背景音乐，需要另外加 开关
      game.load.audio("gameAudio","./img/game.ogg");

      // 旋转地图，实际是两张地图
      this._iData = game.gameData;
    };
    this.create = function(){
      // 开启游戏音乐
      var gameMusic = game.add.audio("gameAudio");
      gameMusic.allowMultiple = true;
      gameMusic.play();

      //game.physics.startSystem(Phaser.Physics.ARCADE); 
  
      //地图
      map = game.add.tilemap("worldmap");
      map = new XTilemap(this.game, "worldmap");
      map.addTilesetImage("maptiles");
      mapLayer = map.createXLayer(this._iData.maps[this._iData.currMap].name);
      mapLayer.resizeWorld();
      map.collideIndexes = [-1,0,17,18,19];
      mapLayer.inputEnabled = true;
      mapLayer.events.onInputDown.add(this.setMarker, this);
  
      // Tile选择框
      marker = map.createXTileMarker(mapLayer, 0, 0, 0xffffff);
  
      // 地图物体
      iGroup = game.add.group();
      map.createSpriteOnTiles( mapLayer, [17,18,19], "mapitems", [4,5,3], iGroup);
      iGroup.setAll("anchor.x",0.23);
      iGroup.setAll("anchor.y",0.42);
      game.camera.bounds = new Phaser.Rectangle(0, 0, game.world.width, game.world.height+32);
  
      var pos = map.getXTilePosInPixel(this._iData.currPos[0], this._iData.currPos[1] , mapLayer);
      hero = iGroup.addChild(new PhaserX.HeroSprite(this.game, pos.x, pos.y, "player"));
      hero.moveTween.onComplete.add(function(hero){
        var pos = map.getORGTilePos(mapLayer.getTileX(hero.goX), mapLayer.getTileY(hero.goY), mapLayer);
        for(var i=0; i<this._iData.maps[this._iData.currMap].entries.length; i++){
          var entryX =this._iData.maps[this._iData.currMap].entries[i][0]
          var entryY =this._iData.maps[this._iData.currMap].entries[i][1]
          if(pos.x==entryX && pos.y==entryY){
            hero.moving = true;
            var nextMap = this._iData.maps[this._iData.currMap].entries[i][2];
            var nextEntry = this._iData.maps[this._iData.currMap].entries[i][3];
            this._iData.currPos = [this._iData.maps[nextMap].entries[nextEntry][0],this._iData.maps[nextMap].entries[nextEntry][1]];
            this._iData.currMap = nextMap;
            this._iData.currFace = hero.currFace;
            PhaserEX.fadeAndPlay(game, "rgb(0,0,0)", 0.5, this.key);
          }
        }
      },this);
      hero.setFace(this._iData.currFace);
  
      pos = map.getXTilePosInPixel(4, 5, mapLayer);
      wolf = iGroup.addChild(new PhaserX.NPCSprite(this.game, pos.x, pos.y, "npc"));
  
      // 镜头跟随人物
      game.camera.follow(hero);
  
      // 关卡切换的时候淡入
      var fademask = game.add.sprite(0, 0, 'fadeMask');
      fademask.width = game.width;
      fademask.height = game.height;
      fademask.fixedToCamera = true;
      game.add.tween(fademask).to({alpha: 0}, 500, "Linear", true).onComplete.add(function(){fademask.kill();},this);
  
      // 方向键
      cursors = game.input.keyboard.createCursorKeys();
  
    };
    this.update = function(){
  
      this.heroMover();
      this.wolfMover();
      iGroup.sort('y', Phaser.Group.SORT_ASCENDING);
      
    };
    this.heroMover = function(){
      if(!hero.moving){
        // 键盘控制？
        if(cursors.right.isDown){ 
          this.spriteGo(mapLayer.getTileX(hero.goX)+1, mapLayer.getTileY(hero.goY)+1, hero);
        }else if(cursors.left.isDown){
          this.spriteGo(mapLayer.getTileX(hero.goX)-1, mapLayer.getTileY(hero.goY)-1, hero);
        }else if(cursors.up.isDown){
          this.spriteGo(mapLayer.getTileX(hero.goX)+1, mapLayer.getTileY(hero.goY)-1, hero);
        }else if(cursors.down.isDown){
          this.spriteGo(mapLayer.getTileX(hero.goX)-1, mapLayer.getTileY(hero.goY)+1, hero);
        }
        // 有下一步？
        if(hero.movePath.length>0){
          //if(hasFightTask){} //如果攻击目标
          var nextTile = hero.movePath.pop(); //这个Tile对象
          var pos = map.getXTilePosInPixel(nextTile.x, nextTile.y, mapLayer);
          hero.goX = pos.x;
          hero.goY = pos.y;
          hero.moving = true;
          hero.moveTween.timeline = []; // 清空之前的tween数据
          hero.moveTween.to({x : hero.goX, y : hero.goY}, 300, "Linear", true); //tween的重复利用
          hero.setFace();
        }else{
          hero.animations.stop();
          hero.frame = hero.frame - hero.frame % 8;
        }
      }
    };
    this.wolfMover = function(){
      if(!wolf.moving){
        // 随机方向移动
        var moveVal = game.rnd.between(0, 100);
        var moveDir = game.rnd.sign();
        if(moveVal==1){
          this.spriteGo(mapLayer.getTileX(wolf.goX) + moveDir, mapLayer.getTileY(wolf.goY) + moveDir, wolf);
        }else if(moveVal==2){
          this.spriteGo(mapLayer.getTileX(wolf.goX) + moveDir, mapLayer.getTileY(wolf.goY) - moveDir, wolf);
        }
        
        // 有下一步？
        if(wolf.movePath.length>0){
          var nextTile = wolf.movePath.pop();
          var pos = map.getXTilePosInPixel(nextTile.x, nextTile.y, mapLayer);
          wolf.goX = pos.x;
          wolf.goY = pos.y;
          wolf.moving = true;
          wolf.moveTween.timeline = [];
          wolf.moveTween.to({x : wolf.goX, y : wolf.goY}, 500, "Linear", true);
          if(wolf.goY > wolf.y){  // 往下
            if(wolf.goX < wolf.x){  // 左下
              wolf.animations.play("walk_dl");
            }else if(wolf.goX > wolf.x){  // 右下
              wolf.animations.play("walk_dr");
            }
          }else if(wolf.goY < wolf.y){  // 往上
            if(wolf.goX < wolf.x){  // 左上
              wolf.animations.play("walk_ul");
            }else if(wolf.goX > wolf.x){  // 右上
              wolf.animations.play("walk_ur");
            }
          }
        }else{
          wolf.animations.stop();
          wolf.frame = wolf.frame - wolf.frame % 4;
        }
      }
    };
  
    this.spriteGo = function(x, y, sprite){
      var x0 = mapLayer.getTileX(sprite.goX);
      var y0 = mapLayer.getTileY(sprite.goY);
      sprite.movePath = map.findPath(mapLayer, x0, y0, x, y, map.collideIndexes) || sprite.movePath;
    };
  
    this.setMarker = function(){
      var x = game.input.activePointer.worldX;
      var y = game.input.activePointer.worldY;
      var tile = map.getXTile(x, y, mapLayer);
      if(tile == null){return;}
      marker.x = tile.worldX;
      marker.y = tile.worldY;
      this.spriteGo(tile.x, tile.y, hero);
    };
  
    this.render = function(){
      var pos = map.getORGTilePos(mapLayer.getTileX(hero.goX), mapLayer.getTileY(hero.goY), mapLayer);
      game.debug.text("关卡地图:"+this._iData.maps[this._iData.currMap].name, 10, 20);
      game.debug.text("测试用的坐标:"+pos.x+","+pos.y, 10, 40);
    };
  
  }