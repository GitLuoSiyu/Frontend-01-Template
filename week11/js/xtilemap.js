//***********************************
//  XTilemap类 （继承Phaser.Tilemap）
//***********************************
// 思路：创建两个地图层，一个原始层（隐藏），一个显示层（斜角，命名为原始层名称+"-x"）
// 通过增加额外的tile（上下左右四角），中心的tile才是有效的tile，所以一个显示层将会是原始层的四倍尺寸

var XTilemap = function(game, key, tileWidth, tileHeight, width, height){
	Phaser.Tilemap.call(this, game, key, tileWidth, tileHeight, width, height);
}
XTilemap.prototype = Object.create(Phaser.Tilemap.prototype);
XTilemap.prototype.constructor = XTilemap;

// 获取原始层Tile坐标
// x,y为显示层的Tile坐标
XTilemap.prototype.getORGTilePos = function(x, y, xLeayer){
	var x0 = x - (xLeayer.orgLayer.layer.width - 1) - 1;
	var xx = x0 + (y - x0 - 1) / 2;
	var yy = (y - x0 - 1) / 2;
	return {x:xx,y:yy};
};

// getXTilePos :
// x,y为原始层的Tile的下标值
XTilemap.prototype.getXTilePos = function(x, y, xLeayer){
	var xx = xLeayer.orgLayer.layer.height + x - y;
	var yy = x + y + 1;
	return {x:xx,y:yy};
};
// getXTilePosInPixel :
XTilemap.prototype.getXTilePosInPixel = function(x, y, xLeayer){
	var pos = this.getXTilePos(x, y, xLeayer);
	return {x : pos.x * this.tileWidth, y : pos.y * this.tileHeight};
};

// 获取显示层的有效Tile（即忽略角块）
// x,y为world坐标（in pixel）
// ***需完善：适应不同比例的Tile
XTilemap.prototype.getXTile = function(x, y, xLayer){
	var tx = xLayer.getTileX(x);
	var ty = xLayer.getTileY(y);
	var ww = this.tileWidth;
	var hh = this.tileHeight;
	var tile;
	if((tx + ty) % 2 == 1){
		tile = this.getTile(tx, ty, xLayer); // 中心块，直接getTile
	}else{
		var xx = x - tx * ww; // x偏移
		var yy = y - ty * hh; // y偏移
		if(yy/hh > xx/ww){
			if(yy < hh*(ww-xx)/ww){
				tx --;
			}else{
				ty ++;
			}
		}else{
			if(yy < hh*(ww-xx)/ww){
				ty --;
			}else{
				tx ++;
			}
		}
		tile = this.getTile(tx, ty, xLayer);
	}
	return tile;
};

// 生成显示层
XTilemap.prototype.createXLayer = function(key){
	var orgLayer = this.createLayer(key);
	orgLayer.visible = false;
	var xWidth = orgLayer.layer.width + orgLayer.layer.height - 1 + 2;
	var xLayer = this.createBlankLayer(key + "-x", xWidth, xWidth, this.tileWidth, this.tileHeight);
	xLayer.orgLayer = orgLayer; // 将原始层挂到显示层，方便访问

	var pos;
	var tile;
	for (var i=0; i < orgLayer.layer.width; i++){
		for (var j=0; j < orgLayer.layer.height; j++){
			pos = this.getXTilePos(i, j, xLayer);
			this.putTile(orgLayer.layer.data[j][i], pos.x , pos.y, xLayer);
			if(orgLayer.layer.data[j][i].index>0){
				// 下面构建上下左右方向的tile，补上角块
				// 这里要求tilesetImage有作为角块的地图块，且按规律排列（是否可以考虑动态构建）
				tile = this.getTileAbove(xLayer.index, pos.x, pos.y);
				if(tile.index == -1){
					tile.index = 9;
				}else{
					tile.index += 8;
				}
				tile = this.getTileBelow(xLayer.index, pos.x, pos.y);
				if(tile.index == -1){
					tile.index = 2;
				}else{
					tile.index += 1;
				}
				tile = this.getTileLeft(xLayer.index, pos.x, pos.y);
				if(tile.index == -1){
					tile.index = 5;
				}else{
					tile.index += 4;
				}
				tile = this.getTileRight(xLayer.index, pos.x, pos.y);
				if(tile.index == -1){
					tile.index = 3;
				}else{
					tile.index += 2;
				}
			}
		}
	}
	return xLayer;
};

// 在对应的Tile坐标(给定索引值)上面建立精灵，所有精灵在一个组里面（可以创建一些树木等）
XTilemap.prototype.createSpriteOnTiles = function(xLayer, indexes, key, frames, group){
	var _layer = xLayer.orgLayer.layer;
	for (var i=0; i<_layer.width; i++){
		for (var j=0; j<_layer.height; j++){
			var pos = this.getXTilePos(i, j, xLayer);
			var idx = indexes.indexOf(_layer.data[j][i].index);
			if( idx > -1){
				if(frames.length > idx){
					group.create(pos.x * this.tileWidth, pos.y * this.tileHeight, key, frames[idx]);
				}else{
					group.create(pos.x * this.tileWidth, pos.y * this.tileHeight, key, frames[0]);
				}
			}
		}
	}
};

// 创建XTile选择框
XTilemap.prototype.createXTileMarker = function(xLayer, x, y, color){
	var pos = this.getXTilePosInPixel(x, y, xLayer);
	var marker = this.game.add.sprite(pos.x, pos.y);
	marker_box = marker.addChild(this.game.make.graphics(-this.tileWidth/2, -this.tileHeight/2));
	marker_box.lineStyle(2, color || 0xff6633, 0.8);
	marker_box.drawPolygon([
		0, this.tileHeight-1,
		this.tileWidth-1, 0,
		this.tileWidth, 0,
		this.tileWidth*2-1,this.tileHeight-1,
		this.tileWidth*2-1,this.tileHeight,
		this.tileWidth,this.tileHeight*2-1,
		this.tileWidth-1,this.tileHeight*2-1,
		0,this.tileHeight,
		0,this.tileHeight-1
	]);
	return marker;
};

// *****************************
// findPath （集成PhaserEX.findPath）
// *****************************
// 返回 Array<Tile> 或 false
// 数组第一个元素为目标Tile，依次到初始Tile，但最后不包含初始Tile
// 走路时，可用Array.pop()读取下一步位置
XTilemap.prototype.findPath = function (layer, curX, curY, tarX, tarY, collideIndexes, limit) {
	try{  
		if(typeof PhaserEX.findPath != "function") {
			console.warn("Require PhaserEX.findPath !");
			return false;  
		}  
	}catch(e){ } 
	// 转换成原始图层坐标
	var pos1 = this.getORGTilePos(curX, curY, layer);
	var pos2 = this.getORGTilePos(tarX, tarY, layer);
	return PhaserEX.findPath(layer.orgLayer, pos1.x, pos1.y, pos2.x, pos2.y, collideIndexes, limit);
};
