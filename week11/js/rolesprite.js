//  RoleSprite (角色精灵)
var PhaserX = PhaserX || {};
PhaserX.RoleSprite = function(game, x, y, key, frame){
	Phaser.Sprite.call(this, game, x, y, key, frame);

	this.goX = this.x;
	this.goY = this.y;
	this.moving = false;
	this.movePath = [];
	this.moveTween = game.add.tween(this);
	this.moveTween.onComplete.add(function(){this.moving = false;},this);
}
PhaserX.RoleSprite.prototype = Object.create(Phaser.Sprite.prototype);
PhaserX.RoleSprite.prototype.constructor = PhaserX.RoleSprite;

//  HeroSprite
PhaserX.HeroSprite = function(game, x, y, key, frame){
	PhaserX.RoleSprite.call(this, game, x, y, key, frame);

	this.animations.add("walk1", [1,2,3,4,5] , 8, true);
	this.animations.add("walk2", [17,18,19,20,21] , 8, true);

	this.currFace = "RIGHT";
	this.setFace = function(face){
		this.currFace = face;
		if(face=="LEFT"){
			this.animations.play("walk2");
			this.anchor.setTo(0.09,0.5);
			this.scale.x = 1;
		}else if(face=="UP"){
			this.animations.play("walk2");
			this.anchor.setTo(0.9,0.5);
			this.scale.x = -1;
		}else if(face=="RIGHT"){
			this.animations.play("walk1");
			this.anchor.setTo(0.09, 0.5);
			this.scale.x = 1;
		}else if(face=="DOWN"){
			this.animations.play("walk1");
			this.anchor.setTo(0.9, 0.5);
			this.scale.x = -1;
		}else{
			if(this.goY > this.y){  // 往下
				this.animations.play("walk1");
				if(this.goX < this.x){  // 左下
					this.anchor.setTo(0.9, 0.5);
					this.scale.x = -1;
					this.currFace = "DOWN";
				}else if(this.goX > this.x){  // 右下
					this.anchor.setTo(0.09, 0.5);
					this.scale.x = 1;
					this.currFace = "RIGHT";
				}
			}else if(this.goY < this.y){  // 往上
				this.animations.play("walk2");
				if(this.goX < this.x){  // 左上
					this.anchor.setTo(0.09,0.5);
					this.scale.x = 1;
					this.currFace = "LEFT";
				}else if(this.goX > this.x){  // 右上
					this.anchor.setTo(0.9,0.5);
					this.scale.x = -1;
					this.currFace = "UP";
				}
			}
		}
	};
}
PhaserX.HeroSprite.prototype = Object.create(PhaserX.RoleSprite.prototype);
PhaserX.HeroSprite.prototype.constructor = PhaserX.HeroSprite;

//  NpcSprite
PhaserX.NPCSprite = function(game, x, y, key, frame){
	PhaserX.RoleSprite.call(this, game, x, y, key, frame);

	this.animations.add("walk_dl", [0,1,2,3] , 8, true);
	this.animations.add("walk_dr", [4,5,6,7] , 8, true);
	this.animations.add("walk_ur", [8,9,10,11] , 8, true);
	this.animations.add("walk_ul", [12,13,14,15] , 8, true);
	this.scale.setTo(0.625,0.625);
	this.anchor.setTo(0.125,0.5);


}
PhaserX.NPCSprite.prototype = Object.create(PhaserX.RoleSprite.prototype);
PhaserX.NPCSprite.prototype.constructor = PhaserX.NPCSprite;


