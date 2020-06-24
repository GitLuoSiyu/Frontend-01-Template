# 每周总结可以写在这里

## 寻路算法





## 核心代码
```javascript
function findPath(layer, x0, y0, x1, y1, collideIndexes, limit) {
	if(!limit){ limit = 100; }
	var _layer = layer.layer;
	var excepts = []; 
	var roundTilesAll = [];
	var isFound = false;

	// （获取外围的Tiles，返回 Array<Tile>
	var _getRoundTiles = function(roundTiles, exceptTiles){
		var newRoundArray = [];
		var x;
		var y;
		var tmpTile;
		for (var i = 0; i < roundTiles.length; i++){
			x = roundTiles[i].x;
			y = roundTiles[i].y;
			if(x > 0){
				tmpTile = _layer.data[y][x - 1];
				if(collideIndexes.indexOf(tmpTile.index) == -1 && exceptTiles.indexOf(tmpTile) == -1){
					newRoundArray.push(tmpTile);
					exceptTiles.push(tmpTile);
				}
			}
			if(x<_layer.width - 1){
				tmpTile = _layer.data[y][x + 1];
				if(collideIndexes.indexOf(tmpTile.index) == -1 && exceptTiles.indexOf(tmpTile) == -1){
					newRoundArray.push(tmpTile);
					exceptTiles.push(tmpTile);
				}
			}
			if(y>0){
				tmpTile = _layer.data[y - 1][x];
				if(collideIndexes.indexOf(tmpTile.index) == -1 && exceptTiles.indexOf(tmpTile) == -1){
					newRoundArray.push(tmpTile);
					exceptTiles.push(tmpTile);
				}
			}
			if(y<_layer.height - 1){
				tmpTile = _layer.data[y + 1][x];
				if(collideIndexes.indexOf(tmpTile.index) == -1 && exceptTiles.indexOf(tmpTile) == -1){
					newRoundArray.push(tmpTile);
					exceptTiles.push(tmpTile);
				}
			}
		}
		return newRoundArray;
	};

	if(_layer.data[y1] === undefined || _layer.data[y1][x1] === undefined){ // 目标不存在
		return false;
	}
	var curTile = _layer.data[y0][x0];
	var tarTile = _layer.data[y1][x1];
	if(collideIndexes.indexOf(tarTile.index) > -1){ // 目标不可及
		return false;
	}
	roundTilesAll.push([curTile]);
	excepts.push(curTile);
	var step = 0;
	var rounds = _getRoundTiles(roundTilesAll[0], excepts);
	while(rounds.length > 0){
		step ++;
		if(step > limit){
			break;
		}
		if(rounds.indexOf(tarTile) > -1){
			isFound = true;
			break;
		}
		excepts = roundTilesAll[roundTilesAll.length - 1].concat();
		roundTilesAll.push(rounds);
		rounds = _getRoundTiles(rounds, excepts);
	}
	if(isFound){
		var tmpTile;
		var path = [];
		path.push(tarTile);
		while(roundTilesAll.length > 1){
			rounds = roundTilesAll.pop();
			if(tarTile.x > 0){
				tmpTile = _layer.data[tarTile.y][tarTile.x - 1];
				if(rounds.indexOf(tmpTile) != -1){
					path.push(tmpTile);
					tarTile = tmpTile;
					continue;
				}
			}
			if(tarTile.x < _layer.width-1){
				tmpTile = _layer.data[tarTile.y][tarTile.x + 1];
				if(rounds.indexOf(tmpTile) != -1){
					path.push(tmpTile);
					tarTile = tmpTile;
					continue;
				}
			}
			if(tarTile.y > 0){
				tmpTile = _layer.data[tarTile.y - 1][tarTile.x];
				if(rounds.indexOf(tmpTile) != -1){
					path.push(tmpTile);
					tarTile = tmpTile;
					continue;
				}
			}
			if(tarTile.y < _layer.height - 1){
				tmpTile = _layer.data[tarTile.y + 1][tarTile.x];
				if(rounds.indexOf(tmpTile) != -1){
					path.push(tmpTile);
					tarTile = tmpTile;
					continue;
				}
			}
		}
		return path;
	}else{  
		return false;
	}
};
```