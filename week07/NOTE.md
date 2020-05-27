# 每周总结可以写在这里

最近的课程逐渐开始CSS部分了。到第七周了，老师至今还没介绍我们期末做的毕业作品是什么，与其寻找一个好产品，不如创建一个好产品。
比如说winter老师期末让我们每一个人做一个迷你的CSS适配器，或者AI智能象棋小程序。
如果让我们尽其所能实现一个CSS适配器，适配IE6，我们应该怎么实现。其实这个跟我们今天的作业也有一定关系，现在数一下，CSS的选择器引擎一共有哪些：

### 1.并联选择器 ，
### 2.简单选择器：ID、标签、类、属性、通配符
### 3.关系选择器：亲子、后代、相邻、兄长
### 4.伪类选择器：动作伪类、目标伪类、语言伪类、状态伪类、结构伪类、取反伪类
### 5.jQ额外封装的3种伪类：可见性伪类visible()、内容伪类content()、包含伪类has()

### css2.1中，属性选择器有以下4种状态
```javascript
+ [att]      : 选择设置了att属性的元素，不管设定的值是什么
+ [att=val]  : 选取了所有att属性的值完全等于val的元素
+ [att~=val] : 表示一个元素拥有属性att，值被一个空格隔开的多个字符串，如果其中一个字符串等于val就能匹配上
```

### CSS3中，属性选择器增加了3种状态
```javascript
+ [att ^= val]  : 选取了所有att属性的值以val开头的元素
+ [att $= val]  : 选取了所有att属性的值以val结尾的元素
+ [att *= val]  : 选择所有的att属性包含val字样的元素。以上3者都可以通过indexOf轻松实现
```
此外，大多数选择器引擎，还实现了一种[att!=val]的自定义属性选择器。意思很简单，选取所有att属性不等于val的元素，这正好与[att=val]相反。这个我们可以通过css3的取反伪类实现。


### 实现一个亲子选择器
```javascript
function getChildren(ele) {
    if (ele.childElementCount) {
        return [].slice.call(ele.children)
    } 
    var ret = []
    for (var node = ele.firstChild; node; node = node.nextSibling) {
        node.nodeType == 1 && ret.push(node)
    }
    return ret
}
```

### 实现一个相邻选择器
```javascript
function getNext(ele) {
    if ("nextElementSibling" in ele) {
        return ele.nextElementSibling
    }
    while (ele = ele.nextSibling) {
        if (ele.nodeType === 1) {
            return ele
        }
    }
    return null
}
```

### 实现兄长选择器
```javascript
function getPrev(ele) {
    if ("previousElementSibling" in ele) {
        return ele.previousElementSibling
    }
    while (ele = ele.previousSibling) {
        if (ele.nodeType === 1) {
            return ele
        }
    }
    return null
}
```

一个框架、库的css样式模块，一般分为两大块，精确获取样式值、设置样式。精确是用于修饰获取的，由于样式分为外部样式、内部样式、行内样式，再加个important对选择器权重的干扰，我们实际很难看到元素是应用了哪些样式规则，因此样式模块，80%的比重在于获取这一块，像offser、滚动条也归入这一块。未完待续~