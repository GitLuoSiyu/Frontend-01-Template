## 根据winter老师动画改造的



## 调用示例
#### HTML部分

```html
<div id="demo"></div>
```

#### CSS部分

```css
#demo {
    width: 100px;
    height: 100px;
    background: url('foo.png');
}
```

#### JS部分

``` javascript
// 使用示例
var animation = require("frame-animation");

var ele = document.getElementById('demo');
var frameMap = ['0 0', '0 -100', '0 -200'];
    
var demoAnimation = animation().changePosition(ele, positions).repeat();
    demoAnimation.start(200);

```

## 本animation函数提供的功能接口

* loadImage(imagelist)  //预加载图片
* changePosition(ele,positions)  //通过改变元素的backgroud-position实现动画
* changeSrc(ele,imglist) //通过改变image元素的src实现动画(一般这种方式需要和loadImage配合使用)
* then(callback) //动画执行完成后的回调函数
* enterFrame(callback) //每一帧动画执行的函数，相当于用户可以自定义每一帧动画的callback
* repeat(times) //动画重复执行的次数，times为空时表示无限次
* repeatForever() //无限重复上一次动画, 相当于repeat()，更友好的一个接口吧
* wait(time) //每个动画执行完后等待的时间
* start(interval) //动画开始执行，interval表示动画执行的间隔
* pause() //动画暂停
* restart() //动画从上一次暂停处重新执行
* dispose() //释放资源
