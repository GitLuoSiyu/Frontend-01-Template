## 根据winter老师动画改造的

### npm 安装

```
$ npm install frame-animation
```

### 示例

#### HTML

```html
<div id="demo"></div>
```

#### CSS

```css
#demo {
    width: 100px;
    height: 100px;
    background: url('foo.png');
}
```

#### JavaScript

``` javascript
var animation = require("frame-animation");

var ele = document.getElementById('demo');
var frameMap = ['0 0', '0 -100', '0 -200'];
    
var demoAnimation = animation().changePosition(ele, positions).repeat();
    demoAnimation.start(200);

```
这种链式调用的语法，是不是很爽呢（妈妈再也不用担心我的动画）

## animation提供的接口

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

## 如何构建
animation的源码是基于webpack构建的

首先，clone项目源码
```bash
git clone https://github.com/ustbhuangyi/animation.git
```

安装依赖
```bash
cd animation
npm install
```
测试demo页

```bash
npm run dev
```
打开浏览器访问如下地址, 查看效果

> localhost:9090
