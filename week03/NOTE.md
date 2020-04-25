# 每周总结可以写在这里
```javascript
// prototypes.js

/**
* 定义一个全局对象, 属性 Version 在发布的时候会替换为当前版本号
*/
var Prototype = {
  Version: '1.0.0'
}

/**
* 创建一种类型，注意其属性 create 是一个方法，返回一个构造函数。
* 一般使用如下 
*     var X = Class.create();  返回一个类型，类似于 java 的一个Class实例。
* 要使用 X 类型，需继续用 new X()来获取一个实例，如同 java 的 Class.newInstance()方法。
*
* 返回的构造函数会执行名为 initialize 的方法， initialize 是 Ruby 对象的构造器方法名字。
* 此时initialize方法还没有定义，其后的代码中创建新类型时会建立相应的同名方法。
*
* 如果一定要从java上去理解。你可以理解为用Class.create()创建一个继承java.lang.Class类的类。当然java不允许这样做，因为Class类是final的
*
*/
var Class = {
  create: function() {
    return function() {
      this.initialize.apply(this, arguments);
    }
  }
}

/**
* 创建一个对象，从变量名来思考，本意也许是定义一个抽象类，以后创建新对象都 extend 它。
* 但从其后代码的应用来看， Abstract 更多是为了保持命名空间清晰的考虑。
* 也就是说，我们可以给 Abstract 这个对象实例添加新的对象定义。
*
* 从java去理解，就是动态给一个对象创建内部类。
*/
var Abstract = new Object();

/**
* 获取参数对象的所有属性和方法，有点象多重继承。但是这种继承是动态获得的。
* 如：
*     var a = new ObjectA(), b = new ObjectB();
*     var c = a.extend(b);
* 此时 c 对象同时拥有 a 和 b 对象的属性和方法。但是与多重继承不同的是，c instanceof ObjectB 将返回false。
*/
Object.prototype.extend = function(object) {
  for (property in object) {
    this[property] = object[property];
  }
  return this;
}

/**
* 这个方法很有趣，它封装一个javascript函数对象，返回一个新函数对象，新函数对象的主体和原对象相同，但是bind()方法参数将被用作当前对象的对象。
* 也就是说新函数中的 this 引用被改变为参数提供的对象。
* 比如：
*     &lt;input type="text" id="aaa" value="aaa"&gt;
*     &lt;input type="text" id="bbb" value="bbb"&gt;
*     .................
*     &lt;script&gt;
*         var aaa = document.getElementById("aaa");
           var bbb = document.getElementById("bbb");
           aaa.showValue = function() {alert(this.value);}
           aaa.showValue2 = aaa.showValue.bind(bbb);
*     &lt;/script&gt;
*  那么，调用aaa.showValue 将返回"aaa", 但调用aaa.showValue2 将返回"bbb"。
*
* apply 是ie5.5后才出现的新方法(Netscape好像很早就支持了)。
* 该方法更多的资料参考MSDN http://msdn.microsoft.com/library/en-us/script56/html/js56jsmthApply.asp
* 还有一个 call 方法，应用起来和 apply 类似。可以一起研究下。
*/
Function.prototype.bind = function(object) {
  var method = this;
  return function() {
    method.apply(object, arguments);
  }
}

/**
* 和bind一样，不过这个方法一般用做html控件对象的事件处理。所以要传递event对象
* 注意这时候，用到了 Function.call。它与 Function.apply 的不同好像仅仅是对参数形式的定义。
* 如同 java 两个过载的方法。
*/
Function.prototype.bindAsEventListener = function(object) {
  var method = this;
  return function(event) {
    method.call(object, event || window.event);
  }
}

/**
* 将整数形式RGB颜色值转换为HEX形式
*/
Number.prototype.toColorPart = function() {
  var digits = this.toString(16);
  if (this &lt; 16) return '0' + digits;
  return digits;
}

/**
* 典型 Ruby 风格的函数，将参数中的方法逐个调用，返回第一个成功执行的方法的返回值
*/
var Try = {
  these: function() {
    var returnValue;
   
    for (var i = 0; i &lt; arguments.length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) {}
    }
   
    return returnValue;
  }
}

/*--------------------------------------------------------------------------*/

/**
* 一个设计精巧的定时执行器
* 首先由 Class.create() 创建一个 PeriodicalExecuter 类型，
* 然后用对象直接量的语法形式设置原型。
*
* 需要特别说明的是 rgisterCallback 方法，它调用上面定义的函数原型方法bind, 并传递自己为参数。
* 之所以这样做，是因为 setTimeout 默认总以 window 对象为当前对象，也就是说，如果 registerCallback 方法定义如下的话：
*     registerCallback: function() {
*         setTimeout(this.onTimerEvent, this.frequency * 1000);
*     }
* 那么，this.onTimeoutEvent 方法执行失败，因为它无法访问 this.currentlyExecuting 属性。
* 而使用了bind以后，该方法才能正确的找到this，也就是PeriodicalExecuter的当前实例。
*/
var PeriodicalExecuter = Class.create();
PeriodicalExecuter.prototype = {
  initialize: function(callback, frequency) {
    this.callback = callback;
    this.frequency = frequency;
    this.currentlyExecuting = false;
   
    this.registerCallback();
  },
 
  registerCallback: function() {
    setTimeout(this.onTimerEvent.bind(this), this.frequency * 1000);
  },
 
  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      try {
        this.currentlyExecuting = true;
        this.callback();
      } finally {
        this.currentlyExecuting = false;
      }
    }
   
    this.registerCallback();
  }
}

/*--------------------------------------------------------------------------*/

/**
* 这个函数就 Ruby 了。我觉得它的作用主要有两个
* 1.  大概是 document.getElementById(id) 的最简化调用。
* 比如：$("aaa") 将返回上 aaa 对象
* 2.  得到对象数组
* 比如: $("aaa","bbb") 返回一个包括id为"aaa"和"bbb"两个input控件对象的数组。
*/
function $() {
  var elements = new Array();
 
  for (var i = 0; i &lt; arguments.length; i++) {
    var element = arguments[i];
    if (typeof element == 'string')
      element = document.getElementById(element);

    if (arguments.length == 1)
      return element;
     
    elements.push(element);
  }
 
  return elements;
}
```
prototype 算是一个简单的js框架，没有直接附带应用。它不象activeWidget，也是一个js框架，但是附带一个grid应用。很明确可以用来做webgrid。即使是做为一个框架，我觉得prototype的设计很显然只是针对ajax应用（本来就是rails项目里分出来的）。

prototype.js(源码中第一个js文件) 是整个prototype的核心， Class定义了创建类的规范; $()能让我们少写很多代码;bind和extend扩展很精巧; PeriodicalExecuter解决了setTimeout的限制,是写动态脚本最常用的应用。 所以如果你不想加载整个 prototypes.js 脚本(其实也就20k)，可以只用第一个prototype.js，它能帮你更顺畅的写自己的脚本。另外prototype隐约有些ruby 的语法特点，很通俗易懂。

既然prototype是一个针对ajax的js框架，那么prototype能做什么，你只要这么想：ajax的典型应用是什么？ buffalo 或者 json-rpc 能做什么？ 如果它们的源码如果用 prototype 会是怎样？ 你也可以看看 Rico(http://openrico.org/home.page)，是对prototype的扩展。