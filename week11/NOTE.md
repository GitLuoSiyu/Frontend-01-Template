# 每周总结可以写在这里

本周winter老师在讲解寻路算法时，插播了一些异步的知识，以红绿灯为例，方法有promise 、async  await、setTimeout等。

### 异步之-setTimeout 、setInterval
这两个 API 的特点如下
（1）如果回调的执行时间大于间隔间隔，那么浏览器会继续执行它们，导致真正的间隔时间
比原来的大一点。
（2）它们存在一个最小的时钟间隔，在 IE6～IE8 中为 15.6ms 6 ，后来精准到 10ms，IE10 为
4ms，其他浏览器相仿。可以通过以下函数大致求得此值。

```javascript
function test(count, ms) {
    var c = 1;
    var time = [new Date() * 1];
    var id = setTimeout(function () {
        time.push(new Date() * 1);
        c += 1;
        if (c <= count) {
            setTimeout(arguments.callee, ms);
        } else {
            clearTimeout(id);
            var tl = time.length;
            var av = 0;
            for (var i = 1; i < tl; i++) {
                var n = time[i] - time[i - 1]; //收集每次与上一次相差的时间数
                av += n;
            }
            alert(av / count); // 求取平均值
        }
    }, ms);
}
winod.onload = function () {
    var id = setTimeout(function () {
        test(100, 1);
        clearTimeout(id);
    }, 3000);
}
```
如果嫌旧版本 IE 的最短时钟间隔太大，可以通过改造 setTimeout，利用 image
死链时立即执行 onerror 回调的情况进行改造。
```javascript
var orig_setTimeout = window.setTimeout;
window.setTimeout = function (fun, wait) {
    if (wait < 15) {
        orig_setTimeout(fun, wait);
    } else {
        var img = new Image();
        img.onload = img.onerror = function () {
            fun();
        };
        img.src = "data:,foo";
    }
};
```

（3）有关零秒延迟，此回调将会放到一个能立即执行的时段进行触发。JavaScript 代码大体
上是自顶向下执行，但中间穿插着有关 DOM 渲染、事件回应等异步代码，它们将组成一个队列，
零秒延迟将会实现插队操作。

（4）不写第二参数，浏览器自动配时间，在 IE、Firefox 中，第一次配可能给个很大数字，
100ms 上下，往后会缩小到最小时钟间隔，Safari、Chrome、Opera 则多为 10ms 上下。Firefox
中，setInterval 不写第二参数，会当作 setTimeout 处理，只执行一次。

```javascript
window.onload = function () {
    var a = new Date - 0;
    setTimeout(function () {
        alert(new Date - a);
    });
    var flag = 0;
    var b = new Date,
        text = ""
    var id = setInterval(function () {
        flag++;
        if (flag > 4) {
            clearInterval(id)
            console.log(text)
        }
        text += (new Date - b + " ");
        b = new Date
    })
}
```
（5）标准浏览器与 IE10，都支持额外参数，从第三个参数起，作为回调的传参传入。
```javascript
setTimeout(function () {
    alert([].slice.call(arguments));
}, 10, 1, 2, 4);
```
IE6～IE9 可以用以下代码模拟。

```javascript
if (window.VBArray && !(document.documentMode > 9)) {
    (function (overrideFun) {
        window.setTimeout = overrideFun(window.setTimeout);
        window.setInterval = overrideFun(window.setInterval);
    })(function (originalFun) {
        return function (code, delay) {
            var args = [].slice.call(arguments, 2);
            return originalFun(function () {
                if (typeof code == 'string') {
                    eval(code);
                } else {
                    code.apply(this, args);
                }
            }, delay);
        }
    }
    );
}
```
（6）setTimeout 方法的时间参数若为极端值（如负数、0、或者极大的正数），则各浏览器的
处理会出现较大差异，某些浏览器会立即执行。幸好最近所有最新的浏览器都立即执行了。

### 寻路算法
一、广度优先遍历

广度优先算法是最简单也是最直观的寻路算法，顾名思义，尽可能广地寻找终点，与其说是寻路算法，不如说只是从起点开始遍历地图来找到终点。

首先我们需要做的是把上面代表迷宫的数据解析为一个图结构。每一个格子代表一个节点，这个图提供一个方法getNeighbors，用来获取指定格子周围的邻居，邻居代表可以移动的格子，所以不会返回墙。

可以通过维护一个队列frontier，来存放将要进行探索的节点。从起点开始，如果他的邻居有还没有探索过的节点，就将该邻居放进队列，直到所有可达的节点探索完。由此迷宫的所有可达的格子都会被遍历一遍，只要终点可达，那么一定会存放在visited字典里。那么怎么求出起点到终点的路线呢？既然我们能从起点到达终点，那我们当然能存放中间经过的节点了。这里利用链表或者字典都可以，这里使用了字典来存放，comeFrom字典的key -> value代表key节点是从value节点到达的。所以我们只需要在往frontier中入列的时候，顺便把节点间的关系存放一下就行了。


至此路线也能求出来了，但是有个小问题，当我们找到终点的时候，遍历还在继续，剩余的地方实际上没有必要继续探索了，因为我们已经拿到了最短路径。需要判断一下，当当前节点为终点时终止循环。广度优先算法虽然简单，但是局限性也比较大，特别是它假定了路和路之间的代价是相同的。但在游戏中我们一般会有很多种地形，比如在石板路上走路是最快的，在草地上可能慢一点，在山地、沼泽里最慢。那么这里不能简单实用 BFS 来寻路了，我们需要引入权重来代表每一种地形的代价。

另外我们需要走得快的格子要先走，如果还是简单地把所有邻居同时推到队列里，那么有山地的地方可能提前到达终点，反而让代价少的路没有走到。所以我们需要引入优先队列的数据结构。优先队列在普通队列的先进先出的基础上增加了优先级的概念，优先级高的元素会先出列。优先队列的实现是另外一个话题，在此不详细阐述。因为我们希望代价低的路先走，所以我们可以使用最小堆来实现优先队列。

二、深度优先遍历


### 寻路算法-核心代码
```javascript
function findPath(layer, x0, y0, x1, y1, collideIndexes, limit) {
	if(!limit){ limit = 100; }
	var _layer = layer.layer;
	var excepts = []; 
	var roundTilesAll = [];
	var isFound = false;

	// 获取外围的Tiles，返回 Array<Tile>
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

    // 鼠标点击的区域 目标不存在   
	if(_layer.data[y1] === undefined || _layer.data[y1][x1] === undefined){ 
		return false;
	}
	var curTile = _layer.data[y0][x0];
    var tarTile = _layer.data[y1][x1];
    // 鼠标点击的区域  目标不可及
	if(collideIndexes.indexOf(tarTile.index) > -1){ 
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




### 小总结(何为异步)
浏览器环境与后端的 nodejs 存在着各种消耗巨大或堵塞线程的行为，对于 JavaScript 这样单线程的东西唯一的解耦方法就提供异步 API。简单来说，它是不会立即执行的方法。比方说，一个长度为 1000 的数组，在 for 循环内，可能不到几毫秒就执行完毕，若在后端的其他语言，则耗时更少。但有时候，我们不需要这么快的操作，我们想在页面上能用肉眼看到它执行的每一步，那就需要异步 API。还有些操作，如加载资源，你想快也快不了，它不可能一下子提供给你，你必须等待，但你也不能一直干等下去什么也不干，得允许我们跳过这些加载资源的逻辑，执行下面的代码。于是浏览器首先搞出的两个异步 API，就是 setTimeout与 setInterval。后面开始出现各种事件回调，它只有用户执行了某种操作后才触发。再之后，就更多，XMLHttpRequest、postMessage、WebWorkor、setImmediate、requestAnimationFrame 等。这些东西都有一个共同的特点，就是拥有一个回调函数，描述一会儿要干什么。有的异步API 还 提 供 了 对 应 的 中 断 API ， 比 如 clearTimeout 、 clearInterval 、clearImmediate 、cancelAnimationFrame。早些年，我们就是通过 setIimeout 或 setInterval 在网页上实现动画的。这种动画其实就是通过这些异步 API 不断反复调用同一个回调实现的，回调里面是对元素节点的某些样式进行很小范围的改动。

随着 iframe 的挖掘与 XMLHttpRequest 的出现，无缝刷新让用户驻留在同一个页面上的时间越来越长，许多功能都集成在同一个页面。为实现这些功能，我们就得从后端加载数据与模板，来拼装这些新区域。这些加载数据与模板的请求可能是并行的，可能是存在依赖的。只有在所有数据与模板都就绪时，我们才能顺利拼接出 HTML 子页面插入到正确的位置上。面对这些复杂的流程，人们不得不发明一些新模式来应对它们。最早被发明出来的是“回调地狱（callbackhell）”，这应该是一个技能。事实上，几乎 javaScript 中的所有异步函数都用到了回调，连续执行几个异步函数的结果就是层层嵌套的回调函数，以及随之而来的复杂代码。因此有人说，回调就是程序员的 goto 语句。


