
// RAF
var _RAF =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  window.mozRequestAnimationFrame;
var iGameBase = {
  _GameArray: [],
  _Main: function() {
    for (var i = 0; i < iGameBase._GameArray.length; i++) {
      iGameBase._GameArray[i]._controller();
    }
    _RAF(iGameBase._Main);
  },
};
_RAF(iGameBase._Main);

// Game对象原型
iGameBase.Game = function(width, height) {
  this.width = width;
  this.height = height;

  this.stage = new PIXI.Stage(0xffffff);
  this.stage_preload = new PIXI.Stage(0xffffff);
  this.renderer = PIXI.autoDetectRenderer(this.width, this.height);

  iGameBase._GameArray.push(this);
  document.body.appendChild(this.renderer.view);

  this._CTRLID = 0;
  this.state = {
    init: null,
    preload: null,
    create: null,
    update: null,
    render: null,
    debug: null,
  };
  this.cache = { data: null, count: 0, loaded: 0 };
};
// 控制函数（关键逻辑）
iGameBase.Game.prototype._controller = function() {
  // 这里模仿phaser实现preload、create、update等逻辑
  if (this._CTRLID == 0) {
    this._CTRLID++;
    if (typeof this.state.init == 'function') {
      this.state.init();
    }
  } else if (this._CTRLID == 1) {
    this._CTRLID++;
    if (typeof this.state.preload == 'function') {
      this.state.preload();
    }
    this.renderer.render(this.stage_preload);
  } else if (this._CTRLID == 2) {
    // 这里只模拟preload的效果，具体的实现另作详述...
    this.cache.loaded++;
    if (this.cache.loaded >= this.cache.count) {
      this._CTRLID++;
    }
    this.renderer.render(this.stage_preload);
  } else if (this._CTRLID == 3) {
    this._CTRLID++;
    if (typeof this.state.create == 'function') {
      this.state.create();
    }
    this.renderer.render(this.stage);
  } else if (this._CTRLID >= 4) {
    if (typeof this.state.update == 'function') {
      this.state.update();
    }
    this.renderer.render(this.stage);
  }
};
// 预加载资源函数
iGameBase.Game.prototype.addCache = function(key, img) {
  // 这里只模拟preload的效果，具体的实现另作详述...
  this.cache.count++;
};
// 创建精灵函数
iGameBase.Game.prototype.addSprite = function(x, y, key) {
  var sprite = new PIXI.Sprite.fromImage(key);
  sprite.position.set(x, y);
  sprite.game = this; // 增加一个game属性，方便通过sprite访问Game对象
  this.stage.addChild(sprite);
  return sprite;
};

// 下面开始制作...

var iGame = new iGameBase.Game(640, 480);

// 创建iGame的preload函数
iGame.state.preload = function() {
  // 这里只模拟preload的效果，具体的实现另作详述...
  iGame.addCache('aa', 'aa.png');
  iGame.addCache('bb', 'bb.png');
  iGame.addCache('cc', 'cc.png');
};
// 创建iGame的create函数
iGame.state.create = function() {
  // 创建精灵
  var sprite = iGame.addSprite(5, 5, 'pic.png');

  sprite.interactive = true;
  sprite.texture.baseTexture.on('loaded', function() {
    sprite.scale.set(
      (iGame.width - 10) / sprite.width,
      (iGame.width - 10) / sprite.width,
    );
  });
  sprite.mousedown = sprite.touchstart = function(e) {
    // stop the default event...
    e.data.originalEvent.preventDefault();
    this.data = e.data;
    this.dragging = true;
    var ePos = this.data.getLocalPosition(this.parent);
    this.offsetPos = {
      x: ePos.x - this.position.x,
      y: ePos.y - this.position.y,
    };
  };
  sprite.mouseup = sprite.mouseupoutside = sprite.touchend = function(e) {
    this.dragging = false;
    this.data = null;
  };
  sprite.mousemove = sprite.touchmove = function(e) {
    if (this.dragging) {
      var newPosition = this.data.getLocalPosition(this.parent);
      this.position.x = newPosition.x - this.offsetPos.x;
      this.position.y = newPosition.y - this.offsetPos.y;
      if (this.width < this.game.width - 10) {
        if (this.position.x > this.game.width - this.width - 5) {
          this.position.x = this.game.width - this.width - 5;
        }
        if (this.position.x < 5) {
          this.position.x = 5;
        }
      } else {
        if (this.position.x > 5) {
          this.position.x = 5;
        }
        if (this.position.x < this.game.width - this.width - 5) {
          this.position.x = this.game.width - this.width - 5;
        }
      }
      if (this.height < this.game.height - 10) {
        if (this.position.y > this.game.height - this.height - 5) {
          this.position.y = this.game.height - this.height - 5;
        }
        if (this.position.y < 5) {
          this.position.y = 5;
        }
      } else {
        if (this.position.y > 5) {
          this.position.y = 5;
        }
        if (this.position.y < this.game.height - this.height - 5) {
          this.position.y = this.game.height - this.height - 5;
        }
      }
    }
  };

  // button 1
  var button1 = iGame.addSprite(
    iGame.width - 80,
    iGame.height - 160,
    'button-1.png',
  );
  button1.interactive = true;
  button1.mousedown = button1.touchstart = function(e) {
    e.data.originalEvent.preventDefault();
    this.alpha = 0.9;
    sprite.scale.x *= 1.05;
    sprite.scale.y *= 1.05;
  };
  button1.mouseup = button1.mouseupoutside = button1.touchend = function(e) {
    this.alpha = 1;
  };

  // button 2
  var button2 = iGame.addSprite(
    iGame.width - 80,
    iGame.height - 80,
    'button-2.png',
  );
  button2.interactive = true;
  button2.mousedown = button2.touchstart = function(e) {
    e.data.originalEvent.preventDefault();
    this.alpha = 0.9;
    sprite.scale.x *= 0.95;
    sprite.scale.y *= 0.95;
  };
  button2.mouseup = button2.mouseupoutside = button2.touchend = function(e) {
    this.alpha = 1;
  };
};
