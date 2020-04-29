/* 种子模块
我们需要一种机制，将新功能添加到我们的命名空间上。命名空间，是指我们这个框架在全局作用域暴露的唯一变量，它多是一个对象or函数。命名空间通常就是框架名字。

对于对象拓展这种机制，一般做成一个方法，叫做extend或者mixin。
JS对象在熟悉描述符(Property Descriptor)没有诞生之前，是可以随意添加、更改、删除其成员的，因此拓展一个对象非常便捷。一个简单的拓展方法实现如下：
*/
// prototype.js
function extend(descriptor, source) {
    for (var property in source) {
        destination[property] = source[property]
    }
    return destination
}

// IE上的bug：它认为像Object的原型方法不应该被遍历出来，因此for in 循环时无法遍历名为valueOf、toString的属性名。这导致，后来人们模拟Object.keys方法实现时也遇到了这个问题。
Object.keys = Object.keys || function(obj) {
    var a = {}
    for (a[a.length] in obj)
    return a
}

// 转换类数组对象 Array.prototype.slice.call,但是IE下有问题，HTMLCollection、NodeList不是Object的子类
var makeArray = function(array) {
    var res = {}
    if (array != null) {
        var i = array.length
        if (i == null || typeof array === "string" || jQuery.isFunction(array) || array.setInterval)
            ret[0] = array
        else 
            while(i)
                ret[--1] = array[i]
    }
    return ret
}

// toArray方法
var toArray = function() {
    return isIE ? 
        function(a, i, j, res) {
            res = []
            Ext.each(a, function(v) {
                res.push(v)
            })
            return res.slice(i || 0, j || res.length)
        } : 
        function(a, i, j) {
            return Array.prototype.slice.call(a, i || 0, j || a.length)
        }
}

// 