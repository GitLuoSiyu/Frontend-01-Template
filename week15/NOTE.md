# 每周总结可以写在这里

## 前言
正值本周winter老师授课内容是动画，随便复习一下我以前在做页游的时候对于DOM帧动画的一些总结。

在做前端页游，或者做PC端网页特效的时候，大家会经常用到一些JS库来实现一些酷炫丝滑的效果，比如熟知的 three.js，echart.js 等等，PC 端和 native 端常见的动画方式有AlphaAnimation(透明度动画)、ScaleAnimation(缩放动画)、RotateAnimation(旋转动画)、TranslateAnimation(位移动画)、FrameAnimation(帧动画)等等。

## 前端动画实现方式

前端动画
常见的帧动画方式有：

- GIF
- CSS3 animation
- JavaScript

传统的动画实现方式缺点：
- 1.不能灵活的控制动画的暂停和播放（GIF、CSS3）
- 2.不能捕捉到动画完成的事件（GIF）
- 3.不能对帧动画做出更灵活的拓展。
- 4.跟UI同学的沟通成本增加（很重要）

无论是GIF还是CSS3，都很难在动画中间添加事件，如果强行用setTimeout很难准确地达到目的，至少在游戏逻辑方面很不准确。

## 帧动画
听说过或者涉及过 Flash 软件的同学对帧一定不陌生，帧动画，就是在连续的关键帧中分解动画动作，在时间轴的每一帧上逐帧绘制不同的内容，使其连续播放从而完成动画。同时由于动画是由一帧一帧组成的，所以帧动画具有非常大的灵活性，几乎可以表现程任何想表现的内容。

JS帧动画实现原理：

- 1.如果有多张帧动画，可以用 image 标签去承载图片，定时改变 image 的 src 属性（极不推荐）；

- 2.把所有动画的关键帧绘制在一张图里，把图片作为元素的background-image，定时改变元素的 background-position 属性（推荐）。


针对第一种方式，除非你项目中采用了HTTTP2的多路复用，否则不推荐，过多UI资源的加载，终究会将项目压垮；

针对第二种方式，我推荐一款软件（TextureMerger），你可以导入图片资源，它会自动打包整理成一张精灵图，并且附带一个json文件，里面有每个子资源的坐标；当然你也可以用PS、FW软件手动去做图。这款软件可以制作瓦片地图、Egret MovieClip、Sprite Sheet、Bitmap Font，可以设置资源之间的固定间隙、图片压缩等等功能，实测打包后的资源，仅是原资源包的 1/4 左右，打包效果非常好，备注此软件免费。

下面是平常在写DOM运动时的小栗子，当不同页面有多个DOM实现不同的帧动画时，有必要封装一个帧动画库。
```javascript
// 小栗子
// HTML 
<div id="rabbit"></div>

// JS
var imgUrl = "rabbit.png";
var positions = ["0 -854", "-174 -852", "-349 -852", "-524 -852", "-698 -852", "-873 -848"];

var ele = document.getElementById("rabbit");

animation(ele, positions, imgUrl);

function animation(ele, positions, imgUrl) {
    ele.style.backgroundImage = "url(" + imgUrl + ")";
    ele.style.backgroundRepeat = "no-repeat"; 

    function run() {

        var postion = positions[index].split(" ");
        // 每帧的 X Y 坐标,这里没有引入 行,列,单元的概念,还是以坐标为主
        ele.style.backgroundPosition = position[0] + "px " + position[1] + "px";
        index++;
        if(index >= positions.length) {
            index = 0;
        }
        setTimeout(run, 80);
    }
    run()
}
```
设计帧动画库
正在最近在用原生写游戏模块，今天就直播封装一个简单的通用帧动画库。

### ①.需求分析
- 支持图片预加载
因为图片的加载是一个异步过程，如果事件已经调起，但是图片还没渲染出来，那就非常不好了，所以有必要图片预加载。

- 支持2种动画播放方式，以及自定义每帧动画
在改变图片每帧位置的同时，可以自定义增加回调函数，或者更改其他属性，使之更加灵活地控制帧动画。

- 支持单组动画控制循环次数
需要支持自定义动画播放的次数以及无限播放。

- 支持一组动画完成，进行下一组动画

- 支持每个动画完成后可以有等待时间

- 支持动画暂停和继续播放

- 支持动画完成后执行回调函数

### ②.编程接口
loadImage(imglist)     // 预加载图片

changePosition(ele, positions, imageUrl)    // 通过改变元素的 background-position 实现动画

changeSrc(ele, imglist)  // 通过改变 image 元素的src

enterFrame(callback)  // 每一帧动画执行的函数，相当于用户可以自定义每一帧动画的callback

repeat(times)  // 动画重复执行的次数，times 为空时表示无限次

repeatForever()  // 无限重复上一次动画，相当于 repeat()

wait(time)  // 每个动画执行完后需要等待的时间

then(callback) // 动画执行完成后的回调函数

start(interval) // 动画开始的主接口，动画开始执行，interval 表示动画执行的间隔

pause()  // 动画暂停

restart() // 动画从上一次暂停处 重新执行

dispose()  // 释放资源


### ③.调用方式
JS库设计出来，最终目的还是解放双手，拒绝重复造轮子，一个好的轮子在调用方式上一定要简洁方便，才能活得更久。所以这个帧动画库需要满足几个功能：比如链式调用。
```javascript
// 链式调用的栗子
var animation = require("animation")
var testAnimation = animation().loadImage(images).changePosition(ele, positions).repeat(2).then(function(){
    // 动画执行完成后 调用此函数
})

testAnimation.start(80)
```
### ④.代码设计
1.创建任务链

我们可以把"图片预加载 -> 动画执行 -> 动画结束" 等一系列操作看做一条任务链（数组形式），其中任务链中有两种类型的任务：同步的、异步的。

2.记录当前任务链的索引

3.每个任务执行完毕后，通过调用 next 方法，执行下一个任务，同时更新任务链索引值。



#### 任务链的工作过程：

首先我们把 loadImage、changePosition这些个任务都添加到任务链上，然后调用start方法开始的时候，这个索引会从第一个任务开始，start方法执行之后，每个任务会执行自己该做的事情，当这个任务做完，它会通过 next 方法去改变它的索引值，随即跳到下一个任务，下个任务就会执行，不论它是同步的任务或异步定时任务。

前方警告:下面是大量代码块,不想看代码的同志可以翻页了。
```javascript
// animation.js
"use strict"

// CMD的写法
var loadImage = require("./imageloader");
var Timeline = require("./timeline");

var STATE_INITIAL = 0;  // 初始化状态
var STATE_START = 1;    // 开始状态
var STATE_STOP = 2;     // 停止状态
var STATE_SYNC = 0;     // 同步任务
var STATE_ASYNC = 1;    // 异步任务

/**
 * @说明:执行callback
 * @param  callback  执行的函数
 */
function next(callback) {
    callback && callback()
}

/**
 * @类名：帧动画
 * @constructor
 */
function Animation() {
    this.taskQueue = [];
    this.index = 0;
    this.state = STATE_INITIAL;

    this.timeline = new Timeline();

}

/**
 * @接口说明:添加一个同步任务,预加载图片
 * @param  imglist  图片数组
 */
Animation.prototype.loadImage = function(imglist) {
    var taskFn = function(next) {
        loadImage(imglist.slice(), next);
    };
    var type = TASK_SYNC;

    return this._add(taskFn, type);
}

/**
 * @接口说明:添加一个异步定时任务,通过改变图片背景位置实现帧动画
 * @param  ele  DOM对象
 */
Animation.prototype.changePosition = function(ele, positions, imageUrl) {
    var len = positions.length;
    var taskFn;
    var type;

    if(len){
        taskFn = function(next, time) {
            if(imageUrl) {
                ele.style.backgroundImage = "url(" + imageUrl + ")";
            }
            // 获得当前背景图片位置索引
            var index = Math.min(time / _this.interval | 0, len - 1);
            var position = positions[index].split(" ");
            // 改变DOM对象的背景图片位置
            ele.style.backgroundPosition = position[0] + "px " +  position[1] + "px";
        };
        type = TASK_ASYNC;
    } else {
        taskFn = next;
        type = TASK_SYNC;
    }
    return this._add(taskFn, type);
}

/**
 * @接口说明: 添加一个异步定时任务，通过定时改变image标签的src属性，实现帧动画
 * @param ele       image标签
 * @param imglist   图片数组
 */
Animation.prototype.changeSrc = function(ele, imglist) {
    var len = imglist.length;
    var taskFn;
    var type;
    if(len) {
        var _this = this;
        taskFn = function(next, time) {
            // 获得当前图片的索引
            var index = Math.min(time / _this.interval | 0, len - 1);
            // 改变image对象的图片地址
            ele.src = imglist[index];
            if(index === len-1) {
                next();
            }
        }
        type = TASK_ASYNC;
    } else {
        taskFn = next;
        type = TASK_SYNC;
    }
    return this._add(taskFn, type);
}


/**
 * @接口说明:添加一个异步定时执行的任务,该任务自定义动画每帧执行的任务函数
 * @param taskFn  自定义每帧执行的任务函数
 */
Animation.prototype.enterFrame = function(taskFn) {
    return this._add(taskFn, TASK_ASYNC);
}

/**
 * @接口说明:添加一个同步任务，可以在上一个任务完成后执行回调函数
 * @param callback  回调函数
 */
Animation.prototype.then = function(callback) {
    var taskFn = function(next) {
        callback;
        next();
    }

    var type = TASK_SYNC;
    return this._add(taskFn, type);
}

/**
 * @接口说明:开始执行函数， 异步定义任务执行的间隔
 * @param  interval
 */
Animation.prototype.start = function(interval) {
    if(this.state === STATE_START) {
        return this;
    }

    // 如果任务链为空,没有任务则返回
    if(!this.taskQueue.length) {
        return this;
    }

    this.state = STATE_START;
    this.interval = interval;
    this._runTask();
    return this;
}

/**
 * @接口说明:添加一个同步任务,回退到上一个任务中,实现重复上一个任务的效果，可以自定义次数
 * @param times  重复次数
 */
Animation.prototype.repeat = function(times) {
    // 实际只是索引的改变
    var _this = this;
    var taskFn = function() {
        if(typeof times === "underfined") {
            // 无限回退到上一个任务
            _this.index--;
            _this._runTask();
            return;
        }
        if(times) {
            times--;
            // 回退
            _this.index--;
            _this._runTask()
        } else {
            // 达到重复次数，跳转到下一个任务
            var task = _this.taskQueue[_this.index];
            _this._next(task);
        }
    }

    var type = TASK_SYNC;
    return this.__add(taskFn, type);
}


/**
 * @接口说明:添加一个同步任务，相当于repeat()更友好的接口,无限循环上一次任务
 *
 */
Animation.prototype.repeatForever = function() {
    return this.repeat()
}

/**
 * @接口说明:设置当前任务执行结束后,到下个任务开始前的等待时间
 * @param  time  等待时长
 */
Animation.prototype.wait = function(time) {
    if(this.taskQueue && this.taskQueue.length > 0){
        this.taskQueue[this.taskQueue.length - 1] = time;
    }
    return this;
}

/**
 * @接口说明:暂停当前异步定时任务
 */
Animation.prototype.pause = function(time) {
    if(this.state === STATE_START) {
        this.state = STATE_STOP;
        this.timeline.stop();
    }
    return this;
}

/**
 * @接口说明:重新执行上一次暂停的异步任务
 */
Animation.prototype.restart = function() {
    if(this.state === STATE_STOP) {
        this.state = STATE_START;
        this.timeline.restart();
        return this;
    }
    return this;
}

/**
 * @接口说明:释放资源
 */
Animation.prototype.dispose = function() {
    if(this.state !== STATE_INITIAL) {
        this.state = STATE_INITIAL;
        this.taskQueue = null;
        this.timeline.stop();
        this.timeline = null;
        return this;
    }
    return this;
}

/**
 * @接口说明:添加一个任务到队列中
 * @param  taskFn  任务方法
 * @param  type  任务类型
 * @private
 */
Animation.prototype._add = function(taskFn, type) {
    this.taskQueue.push({
        taskFn: taskFn,
        type: type
    })
}

/**
 * @接口说明:执行任务
 * @private
 */
Animation.prototype._runTask = function() {
    if(!this.taskQueue || this.state !== STATE_START) {
        return;
    }
    // 任务执行完毕
    if(this.index === this.taskQueue.length) {
        this.dispose()
        return;
    }
    // 获取任务链上的当前任务
    var task = this.taskQueue[this.index];
    if(task.type === TASK_SYNC){
        this._syncTask(task);
    } else {
        this._asyncTask(task);
    }
}

/**
 * @接口说明:同步任务
 * @param  task  执行的任务对象
 * @private
 */
Animation.prototype._syncTask = function(task) {
    var _this = this;
    var next = function() {
        // 目的是切换到下一个任务
        _this._next(task)

    };

    var taskFn = task.taskFn;
    taskFn(next);
}

/**
 * @接口说明:异步任务
 * @param  task  执行的任务对象
 * @private
 */
Animation.prototype._asyncTask = function(task) {
    var _this = this;
    // 定义每一帧执行的回调函数
    var enterFrame = function(time) {
        var taskFn = task.taskFn;
        var next = function() {
            // 停止当前任务
            _this.timeline.stop()
            // 执行下一个任务
            _this._next(task)
        }
        taskFn(next, time);
    }

    this.timeline.onenterframe = enterFrame;
    this.timeline.start(this.interval);

}


/**
 * @接口说明:切换到下一个任务,支持如果当前任务需要等待,则延时执行
 * @param  task  当前任务
 * @private
 */
Animation.prototype._next = function() {
    this.index++;
    var _this = this;
    task.wait ? setTimeout(function() {
        _this._runTask();
    }, task.wait) : this._runTask();
}

module.exports = function() {
    return new Animation();
}
// 第二个依赖 imageloader.js
// 图片预加载
"use strict";

/**
 * 预加载图片函数
 * @param  images  加载图片的数组或对象
 * @param  callback  全部资源加载完成后的回调
 * @param  timeout  加载超时的时长
 */
function loadImage(images, callback, timeout) {
    // 记载完成图片的计数器
    var count = 0;
    // 全部图片加载成功的一个标志位
    var success = true;
    // 超时timer的ID
    var timeoutId = 0;
    // 是否加载超时的标志位
    var isTimeout = false;

    // 对图片数组(或对象)进行遍历
    for(var key in images) {
        // 过滤prototype上的属性
        if(!images.hasOwnProperty(key)) {
            continue;
        }
        // 获得每个图片元素
        // 期望格式是 object:{src:xxx}
        var item = images[key];

        if(typeof item === "string") {
            item = images[key] = {
                src:item
            };
        }

        // 如果格式不满足期望,则丢弃该数据并进行下次遍历
        if(!item || !item.src) {
            continue;
        }

        // 计数+1
        count++;
        // 设置图片元素的id
        item.id = "__img__" + key + getId();
        // 设置图片元素的 img,它是一个 image 对象
        iten.img = window[item.id] = new Image();

        doLoad(item);
    }

    // 遍历完成,如果计数为0,则直接调用callback
    if(!count){
        callback(success);
    } else if(timeout){
        timeoutId = setTimeou(onTimeout, timeout);
    }

    /**
     * @接口说明:真正进行图片加载的函数
     * @param  item  图片元素对象
     */
    function doLoad(item) {
        item.status = "loading";
        var img = item.img;
        id = item.id

        // 定义图片加载成功的回调函数
        img.onload = function() {
            success = success & true;
            item.status = "loaded";
            done();
        }
        // 定义图片加载失败的回调函数
        img.onerror = function() {
            success = false;
            item.status = "error";
            done();
        }
        // 发起一个http请求
        img.src = item.src;

        /**
         * 每张图片加载成功的回调函数
         */
        function done() {
            img.onload = img.onerror = null;

            try{
                delete window[item.id];
            } catch (e) {
                // 
            }

            // 每张图片加载完成,计数器-1，当所有图片加载完成
            // 并且没有超时,清楚定时器,并且执行回调函数
            if(!--count && !isTimeout) {
                clearTimeout(timeoutId);
                callback(success);
            }
        }
    }
    function onTimeout() {
        isTimeout = true;
        callback(false);
    }
}

var __id = 0;
function getId() {
    return ++__id;
}

module.exports = loadImage;
// timeline.js
"use strict"

var DEFAULT_INTERVAL = 1000 / 60;

var STATE_INITIAL = 0;
var STATE_START = 1;
var STATE_STOP = 2;

var requestAnimationFrame = (function() {
    return window.requestAnimationFrame || 
           window.mozRequestAnimationFrame ||
           window.oRequestAnimationFrame ||
           function (callback) {
               return window.setTimeout(callback, callback.interval || DEFAULT_INTERVAL)
           }
})();

var cancelAnimationFrame = (function() {
    return window.cancelAnimationFrame ||
           window.webkitCancelRequestAnimationFrame ||
           window.mozCancelRequestAnimationFrame ||
           window.oCancelRequestAnimationFrame ||
           function(id) {
               return window.clearTimeout(id);
           }
})();

/**
 * @类名:Timeline  时间轴类
 * @contructor
 */
function Timeline() {
    this.animationHandler = 0;
    this.state = STATE_INITIAL;

}

/**
 * @接口说明:时间轴上每一次回调执行的函数
 * @param  time  从动画开始到当前执行的时间
 */
Timeline.prototype.onenterframe = function(item) {


};


/**
 * @接口说明:动画开始
 * @param  interval  每一次回调的间隔时间
 */
Timeline.prototype.start = function() {
    if(this.state === STATE_START) {
        return;
    }
    this.state = STATE_START;

    this.interval  = interval || DEFAULT_INTERVAL;
    startTime(this, +new Date());
};


/**
 * @接口说明:动画停止
 */
Timeline.prototype.stop = function() {
    if(this.state !== STATE_STOP) {
        return;
    }
    this.state = STATE_STOP;

    // 如果动画开始过,则记录动画从开始到现在所经历的时间
    if(this.startTime) {
        this.dur = +new Date() - this.startTime;
    }
    cancelAnimationFrame(this.animationHandler);

}

/**
 * @接口说明:重新开始动画
 */
Timeline.prototype.restart = function() {
    if(this.state === STATE_START) {
        return;
    }
    if(!this.dur || !this.interval) {
        return;
    }
    this.state = STATE_START;

    // 无缝链接动画
    startTimeline(this, +new Date() - this.dur);
}

/**
 * @接口说明:时间轴动画启动函数
 * @param  timeline  时间轴的实例
 * @param  startTime  动画开始时间戳
 */
function startTimeline(timeline, startTime) {

    timeline.startTime = startTime;
    nextTick.interval = timeline.interval;

    // 记录上一次回调的时间戳
    var lastTick = +new Date();
    nextTick();

    /**
     * @说明:每一帧执行的函数
     */
    function nextTick() {
        var now = +new Date();

        timeline.animationHandler = requestAnimationFrame(nextTick);

        // 如果当前时间与上一次回调的时间戳 > 设置的时间间隔,表示本次可以执行回调函数
        if(now - lastTick >= timeline.interval) {
            timeline.onenterFrame(now - startTime);
            lastTick = now;
        }
    }
}
真正使用的时候，将animation.js中require其他两个文件imageloader.js和timeline.js。

// HTML
<div id="test"></div>

// JS
var animation = require("frame-animation");

var ele = document.getElementById('test');
var frameMap = ['0 0', '0 -100', '0 -200'];

var demoAnimation = animation().changePosition(ele, positions).repeat();
    demoAnimation.start(200);
// 链式调用的方式
```
### 总结
在winter老师的基础上，二次封装了animation，最大的缺点就是没有引入，行、列、单元大小这些概念，还是原始的输入background-position坐标，如果更加优化的可以从这方面入手。针对这个问题，大家如果熟悉了TextureMerger这款软件（搜白鹭时代），也是没有太大问题的。







