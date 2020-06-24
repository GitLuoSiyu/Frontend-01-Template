// 不能丢
var PhaserEX = PhaserEX || {};
PhaserEX.fadeAndPlay = function (game, style, time, nextState) {
	var crossFadeBitmap = game.make.bitmapData(game.width, game.height);
	crossFadeBitmap.rect(0, 0, game.width, game.height, style);
	var overlay = game.add.sprite(0,0, crossFadeBitmap);
	overlay.alpha = 0;
	overlay.fixedToCamera = true;
	var fadeTween = game.add.tween(overlay).to({alpha:1},time*1000);
	fadeTween.onComplete.add(function(sprite,tween,nextState){
		this.state.start(nextState);
	},game,0,nextState);
	fadeTween.start();
};