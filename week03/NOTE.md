# 每周总结可以写在这里
## 对象的特殊属性
JS中的对象本质上就是一个若干个无序的键值对组成的集合。每个键值对就是对象的属性或方法。而对象中的每个属性都对应着有属性描述符，属性描述符分为数据描述符和存储描述符。属性描述符又包含了以下几个属性。

数据描述符和存取描述符均具有以下可选键值(一共6个可组合的配置项)：

### configurable
是否可以再次改动配置项

### value
当前值

### writable
是否可重写

### get
读取时内部调用的函数

### set
写入时内部调用的函数

### enumerable
是否可以遍历


ES5最瞩目的升级时为对象引入属性描述符，属性描述符让我们对属性有了更精细的控制，比如这个属性是否可以修改，是否可以在for in 循环中被枚举出来、是否可以被删除。下面这几个特殊属性也是我们无法去模拟的。

- Object.keys (用于收集当前对象的可遍历属性,不包括原型链上的,然后以数组的形式返回)
- Object.getOwnPropertyNames (用于收集当前对象不可遍历属性与可遍历属性,不包括原型链上,以数组形式返回)
- Object.getPropertyOf
- Object.defineProperty
- Object.defineProperties
- Object.getOwnPropertyDescriptor
- Object.create
- Object.seal
- Object.freeze
- Object.preventExtensions
- Object.isSealed
- Object.Frozen
- Object.isExtensible

特别注意：除了Object.keys这个方法外，旧版本的IE都无法模拟其他新API；除了Object.create之外，其他API的第一个参数不能是数字、字符串、布尔、null、undefined这五种字面量，否则抛出TyepeError异常

如果对比ES3和ES6就会发现，曾经的[[ReadOnly]]、[[DontEnum]]、[[DontDelete]]更换成了[[Writable]]、[[Enumerable]]、[[Configurable]]
其中这6个配置项可以将原有的本地属性分为2组，数据属性、访问器属性。