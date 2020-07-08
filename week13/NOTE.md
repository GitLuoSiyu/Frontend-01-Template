# 每周总结可以写在这里  

## Vue3中的Proxy
JavaScript 运行环境包含了一些不可枚举、不可写入的对象属性，然而在 ES5 之前开发者无法定义他们自己的不可枚举属性或不可写入属性。ES5 引入 Object.defineProperty() 方法以便开发者在这方面能够像 JS 引擎那样做。

ES6 为了让开发者能进一步接近 JS 引擎的能力，推出了 Proxy，代理是一种封装，能够拦截并改变 JS 引擎的底层操作。简单的说，就是在目标对象上架设一层 “拦截”，外界对该对象的访问，都必须先通过这层拦截，提供了一种改变 JS 引擎过滤和改写的能力。

```javascript
let target = {};
let proxy = new Proxy(target, {
  get: function(target, property) {
    return 35;
  }
});

proxy.time // 35
proxy.name // 35
proxy.title // 35
```

## 代理的创建

通过调用 new Proxy() 来创建一个代理时，需要传递两个参数：目标对象 target 以及一个处理器 handler，handler 是一个对象，可以定义一个或多个陷阱函数 （能够响应特定操作的函数），来定制拦截行为。

如果未提供陷阱函数，代理会对所有操作采取默认行为。

```javascript
let target = {};

let proxy = new Proxy(target, {});

proxy.name = "proxy";
console.log(proxy.name); // "proxy"
console.log(target.name); // "proxy"

target.name = "target";
console.log(proxy.name); // "target"
console.log(target.name); // "target"
```

## 代理和反射的关系

我们已经知道，通过调用 new Proxy() 可以创建一个代理用来替代目标对象 target。这个代理对目标对象进行了虚拟，因此该代理与该目标对象表面上可以被当作同一个对象来对待。

Reflect 是 ES6 提供的一个内置的对象，它提供拦截 JavaScript 操作的方法。被 Reflect 对象所代表的反射接口，是给底层操作提供默认行为的方法的集合。

每个陷阱函数都可以重写 JS 对象的一个特定内置行为，允许你拦截并修改它。如果你仍然需要使用原先的内置行为，则可使用对应的 Reflect 方法。

简单的来讲，Proxy 是拦截默认行为，Reflect 是恢复默认行。被 Proxy 拦截、过滤了一些默认行为之后，可以使用 Reflect 恢复未被拦截的默认行为。通常它们两个会结合在一起使用。

到这里不明白没关系，在下文会介绍的陷阱函数中，应该就会明白了。

```javascript
let target = {};
let proxy = new Proxy(target, {
  get(target, name) {
    console.log('get', target, name);
    return Reflect.get(target, name);
  },
  deleteProperty(target, name) {
    console.log('delete' + name);
    return Reflect.deleteProperty(target, name);
  },
  has(target, name) {
    console.log('has' + name);
    return Reflect.has(target, name);
  }
});
proxy.name = 'proxy';
delete proxy.name;
name in proxy; 

```
上面代码中，Proxy 对象设置了一些拦截操作（get、delete、has），并且内部都调用了对应的 Reflect 方法，保证原生行为能够正常执行。

## 陷阱函数 set

假设你想要创建一个对象，并要求其属性值只能是数值，并且在属性值不为数值类型时应当抛出错误。

可以使用 set() 陷阱函数来重写设置属性值时的默认行为，该陷阱函数能接受四个参数：

- target：将接收属性的对象（即代理的目标对象）；
- key：需要写入的属性的键（字符串类型或符号类型）；
- value：将被写入属性的值；
- receiver：操作发生的对象（通常是代理对象）。

```javascript
let target = {
name: "target"
};

let handler = {
  set(target, key, value, receiver) {
    // 拦截，忽略已有属性，避免影响它们
    if (!target.hasOwnProperty(key)) {
      if (isNaN(value)) {
      throw new TypeError("Property must be a number.");
      }
    }
    // 满足条件的进行写入 等价于 target[key] = value;
    return Reflect.set(target, key, value, receiver);
  }
}

let proxy = new Proxy(target, handler);

// 添加一个新属性
proxy.count = 1;
console.log(proxy.count); // 1
console.log(target.count); // 1

// 你可以为 name 赋一个非数值类型的值，因为该属性已经存在
proxy.name = "proxy";
console.log(proxy.name); // "proxy"
console.log(target.name); // "proxy"

// 抛出错误
proxy.anotherName = "proxy";
```
set 陷阱函数允许你在写入属性值的时候进行拦截，而 get() 代理陷阱则允许你在读取属性值的时候进行拦截。

## 陷阱函数 get

我们知道，JavaScript 在读取对象不存在的属性时并不会抛出错误，而会把 undefined 当作该属性的值，例如：

```javascript
let target = {};
console.log(target.name); // undefined
```
JS 的这种行为在非常大型的项目中，可能会导致严重的问题，尤其是当属性名称存在书写错误时。我们可以使用代理对访问不存在的属性时，抛出错误。

由于该属性验证只须在读取属性时被触发，因此只要使用 get() 陷阱函数。该陷阱函数会在读取属性时被调用，即使该属性在对象中并不存在，它能接受三个参数：

- target：将会被读取属性的对象（即代理的目标对象）；
- key：需要读取的属性的键（字符串类型或符号类型）；
- receiver：操作发生的对象（通常是代理对象）。
- Reflect.get() 方法同样接收这三个参数，并且默认会返回属性的值。

使用 get() 陷阱函数与 Reflect.get() 方法在目标属性不存在时抛出错误：

```javascript
let proxy = new Proxy({}, {
  get(target, key, receiver) {
      // 读取属性时进行拦截
    if (!(key in receiver)) {
        throw new TypeError("Property " + key + " doesn't exist.");
    }
    // 保持默认的读取行为
    return Reflect.get(target, key, receiver);
  }
})

// 添加属性的功能正常
proxy.name = "proxy";
console.log(proxy.name); // "proxy"

// 读取不存在属性会抛出错误
console.log(proxy.nme); // 抛出错误
```

## 陷阱函数 has

in 运算符用于判断指定对象中是否存在某个属性，如果对象的属性名与指定的字符串或符号值相匹配，那么 in 运算符应当返回 true，无论该属性是对象自身的属性还是其原型的属性。例如：

```javascript
let target = {
  value: 42
}

console.log("value" in target); // true
console.log("toString" in target); // true
```
value 是对象自身的属性，而 toString 则是原型属性，可以使用代理的 has() 陷阱函数来拦截这个操作，从而在使用 in 运算符时返回不同的结果。

has() 陷阱函数会在使用 in 运算符的情况下被调用，并且会被传入两个参数：

- target：需要读取属性的对象（即代理的目标对象）；
- key：需要检查的属性的键（字符串类型或符号类型）。
- Reflect.has() 方法接受与之相同的参数，并向 in 运算符返回默认响应结果。

使用 has() 陷阱函数以及 Reflect.has() 方法，允许你修改部分属性在接受 in 检测时的行为，但保留其他属性的默认行为。


```javascript
let target = {
  name: "target",
  value: 42
}
let proxy = new Proxy(target, {
  has(target, key) {
      // 拦截操作
    if (key === "value") {
      return false;
    } else {
        // 保持默认行为
      return Reflect.has(target, key);
    }
  }
})
console.log("value" in proxy); // false
console.log("name" in proxy); // true
console.log("toString" in proxy); // true


```

## 陷阱函数 deleteProperty

delete 运算符能够从指定对象上删除一个属性，在删除成功时返回 true ，否则返回 false。如果试图用 delete 运算符去删除一个不可配置的属性，在严格模式下将会抛出错误；而非严格模式下只是单纯返回 false 。这里有个例子：

```javascript
let target = {
    name: "target",
  value: 42
}
Object.defineProperty(target, "name", {configurable: false});

console.log("value" in target); // true
delete target.value; // true
console.log("value" in target); // false


delete target.name; // 非严格模式下返回false（在严格模式下会抛出错误）
console.log("name" in target); // true
```
name 属性是不可配置的，因此对其使用 delete 操作符只会返回 false（如果代码运行在严格模式下，则会抛出错误）。可以在代理对象中使用 deleteProperty() 陷阱函数以改变这种行为。

deleteProperty 陷阱函数会在使用 delete 运算符去删除对象属性时下被调用，并且会被传入两个参数：

- target：需要删除属性的对象（即代理的目标对象）；
- key：需要删除的属性的键（字符串类型或符号类型）。
- Reflect.deleteProperty() 方法也接受这两个参数，并提供了 deleteProperty() 陷阱函数的默认实现。

可以结合 Reflect.deleteProperty() 方法以及 deleteProperty() 陷阱函数，来修改 delete 运算符的行为。例如，能确保 value 属性不被删除：

```javascript
let target = {
  name: "target",
  value: 42
}

let proxy = new Proxy(target, {
  deleteProperty(target, key) {
    // 拦截行为
    if (key === "value") {
      return false;
    } else {
      // 恢复行为
      return Reflect.deleteProperty(target, key);
    }
  }
})

console.log("value" in proxy); // true
// 尝试删除 proxy.value
delete proxy.value; // false  // 不能删除，因为这个默认行为被拦截了
console.log("value" in proxy); // true

console.log("name" in proxy); // true
// 尝试删除 proxy.name
delete proxy.name; // true
console.log("name" in proxy); // false
```
value 属性是不能被删除的，因为该操作被 proxy 对象拦截。这么做允许你在严格模式下保护属性避免其被删除，并且不会抛出错误。

## 陷阱函数 ownKeys

ownKeys() 代理陷阱拦截了内部方法 [[OwnPropertyKeys]]，并允许你返回一个数组用于重写该行为。

可以使用 ownKeys() 陷阱函数去过滤特定的属性，以避免这些属性被 Object.keys()、 Object.getOwnPropertyNames()、Object.getOwnPropertySymbols() 或 Object.assign() 方法使用。

ownKeys() 陷阱函数的默认行为由 Reflect.ownKeys() 方法实现，会返回一个由全部自有属性的键构成的数组，无论键的类型是字符串还是符号。

ownKeys() 陷阱函数接受单个参数，即目标对象，同时必须返回一个数组或者一个类数组对象，不合要求的返回值会导致错误。

假设你不想在结果中包含任何以下划线打头的属性（在 JS 的编码惯例中，这代表该字段是私有的），那么可以使用 ownKeys() 陷阱函数来将它们过滤掉，就像下面这样：

```javascript
let proxy = new Proxy({}, {
  ownKeys(target) {
    return Reflect.ownKeys(target).filter(key => {
        // 过滤掉一些特定属性
        return typeof key !== "string" || key[0] !== "_";
    });
  }
});

let nameSymbol = Symbol("name");

proxy.name = "proxy";
proxy._name = "private"; // 被过滤掉
proxy[nameSymbol] = "symbol"; 

let names = Object.getOwnPropertyNames(proxy);
let keys = Object.keys(proxy);
let symbols = Object.getOwnPropertySymbols(proxy);

console.log(names); // ["name"]
console.log(names[0]); // "name"

console.log(keys); // ["name"]
console.log(keys[0]); // "name"

console.log(symbols); // [Symbol(name)]
console.log(symbols[0]); // Symbol(name)
```

这个例子使用了一个 ownKeys 陷阱函数，做了如下操作：

- 首先调用了 Reflect.ownKeys() 方法来获取目标对象的键列表。
- 接下来 filter() 方法被用于将所有下划线打头的字符串类型的键过滤出去。
- 这之后向 proxy 对象添加了三个属性： name 、 _name 与 nameSymbol 。

因此在输出结果中 _name 属性则始终没有出现在结果里，因为它被过滤了。

ownKeys 陷阱函数也能影响 for-in 循环，因为这种循环调用了陷阱函数来决定哪些值能够被用在循环内。(Vue 源码会涉及这里)

到这里陷阱函数的介绍就告一段落了，下面我们回到正题，一起来看下 Vue 3 是如何使用 Proxy 代理打造全新的响应系统的吧。

## 全新的变更检测

Vue 2 中响应系统是基于 Object.defineProperty 的，递归遍历 data 对象上的所有属性，将其转换为 getter/setter，当 setter 触发时，通知 watcher，来进行变更检测的。

```javascript
...
function proxy (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  };
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val;
  };
  Object.defineProperty(target, key, sharedPropertyDefinition);
}
...

for (const key in propsOptions) {
  ...
  if (!(key in vm)) {
    proxy(vm, `_props`, key);
  }
}
```
这种变更检测机制存在一个限制，那就是 Vue 无法检测到对象属性的添加或删除。为此我们需要使用 Vue.set 和 Vue.delete 来保证响应系统的运行符合预期。
```javascript
// vue 2
Vue.set(vm.state, 'name', 'vue 2');

// vue 3
this.state.name = 'vue 3';
```
Vue 3 进行了全新改进，使用 Proxy 代理的作为全新的变更检测，不再使用 Object.defineProperty。

使用代理的好处是，对目标对象 target 架设了一层拦截，可以对外界的访问进行过滤和改写，不用再递归遍历对象的所有属性并进行 getter/setter 转换操作，这使得组件更快的初始化，运行时的性能上将得到极大的改进，据测试新版本的 Vue 比之前 速度快了 2 倍（非常夸张）。

## 创建响应式数据

Vue 3.0 创建响应式数据可以有三种方法：
- data 选项（ 兼容 2.x ）。
- reactive API。
- ref API。

## data 选项
```javascript
// 根组件
<template>
  <div id="app">
    <div>{{ name }}</div>
  </div>
</template>
<script>
import { createApp } from Vue;
export default {
const App = {
  data: {
    name: 'Vue 3',
      // count: ref(0) 
  }
}
createApp().mount(App, '#app')
</script>
```
data 选项定义的数据，最终也会被 reactive 转换为响应式的 Proxy 代理。
```javascript
// runtime-core > src > apiOptions.ts
instance.data = reactive(data)
```

## reactive 函数

返回原始对象的响应式 Proxy 代理（ 同 2.x 的 Vue.observate() ）。
```javascript
<template>
  <div>{{ state.name }}</div>
</template>

<script>
import { reactive } from Vue;
export default {
  setup() {
    const state = reactive({
      name: "Vue 3"
    })
    return {
      state
    }
  }
}
</script>
```
reactive() 函数最终返回一个可观察的响应式 Proxy 代理。
```javascript
// reactivity > src > reactive.ts
reactive(target) => observed => new Proxy(target, handlers)
```

## ref 函数

获取一个内部值并返回一个响应式的可变 ref 对象。

```javascript
<template>
  <div>{{ name }}</div>
</template>

<script>
import { ref } from Vue;
export default {
  setup() {
    return {
      name: ref('Vue 3')
    }
  }
}
</script>
```
ref 对象有一个指向内部值的单个属性 .value。如果将一个值分配为 ref 对象，则 reactive() 方法会使该对象具有高度的响应性。
```javascript
const r = {
  _isRef: true,
  get value() {
      track(r, "get" /* GET */, 'value');
      return raw;
  },
  set value(newVal) {
      raw = convert(newVal);
      // trigger 方法扮演通信员的角色，贯穿整个响应系统，使得 ref 具有高度的响应性
      trigger(r, "set" /* SET */, 'value',  { newValue: newVal } );
  }
};

return r
```
因此，无需在模版中追加 .value。
```javascript
const count = ref(0)
console.log(count.value) // 0

count.value++
console.log(count.value) // 1
```
## 深入源码

在 Vue 3 中，将 Vue 的核心功能（例如创建和观察响应状态）公开为独立功能，例如使用 reactive() 创建一个响应状态：
```javascript
import { reactive } from 'vue'
// reactive state
const state = reactive({
  name: "vue 3.0",
    count: ref(42)
})
```
我们向 reactive() 函数传入了一个 {name: "Vue 3.x", count: {…}}，对象，reactive() 函数会将传入的对象进行 Proxy 封装，将其转换为"可观测"的对象。
```javascript
//reactive f => createReactiveObject()
function createReactiveObject(target, toProxy, toRaw, baseHandlers, collectionHandlers) {
  ...
  // 设置拦截器
  const handlers = collectionTypes.has(target.constructor)
      ? collectionHandlers
      : baseHandlers;
  observed = new Proxy(target, handlers);
  ...
  return observed; 
}
```
传入的目标对象 target 最终会变成这样：

从打印的结果我们可以得知，被代理的目标对象 target 设置了 get()、set()、deleteProperty()、has()、ownKeys()，这几个陷阱函数，结合我们上文介绍的内容，一起来看下它们都做了什么。

## get() - 读取属性值
get() 会自动读取使用 ref 对象创建的响应数据，并进行 track 调用。
```javascript
// get() => createGetter(false)
function createGetter(isReadonly: boolean, unwrap: boolean = true) {
  return function get(target: object, key: string | symbol, receiver: object) {
    // 恢复默认行为
    let res = Reflect.get(target, key, receiver)
    // 根据目标对象 key 类型进行的一些处理
    if (isSymbol(key) && builtInSymbols.has(key)) {
      return res
    }
    // 如果目标对象存在使用 ref 创建的数据，直接获取内部值
    if (unwrap && isRef(res)) {
      res = res.value // 案例中 这里是 42
    } else {
        // 调用 track() 方法
      track(target, OperationTypes.GET, key)
    }
    return isObject(res)
      ? isReadonly
        ? readonly(res)
        : reactive(res)
      : res
  }
}
```

## set() - 设置属性值

set() 陷阱函数，对目标对象上不存在的属性设置值时，进行 “添加” 操作，并且会触发 trigger() 来通知响应系统的更新。解决了 Vue 2.x 中无法检测到对象属性的添加的问题。
```javascript
function set(target, key, value, receiver) {
    value = toRaw(value);
    // 获取修改之前的值，进行一些处理
    const oldValue = target[key];
    if (isRef(oldValue) && !isRef(value)) {
        oldValue.value = value;
        return true;
    }
    const hadKey = hasOwn(target, key);
    // 恢复默认行为
    const result = Reflect.set(target, key, value, receiver);
    // //如果目标对象在原型链上，不要 trigger
    if (target === toRaw(receiver)) {
      /* istanbul ignore else */
      {
        const extraInfo = {
            oldValue,
            newValue: value
        };
        // 如果设置的属性不在目标对象上 就进行 Add 
        // 这就解决了 Vue 2.x 中无法检测到对象属性的添加或删除的问题
        if (!hadKey) {
            trigger(target, "add" /* ADD */ , key, extraInfo);
        } else if (hasChanged(value, oldValue)) {
            // trigger 方法进行一系列的调度工作，贯穿着整个响应系统，是变更检测的“通讯员”
            trigger(target, "set" /* SET */ , key, extraInfo);
        }
      }
    }
    return result;
}
```

## deleteProperty()

deleteProperty() 陷阱函数关联 delete 操作，当目标对象上的属性被删除时，会触发 trigger() 来通知响应系统的更新。这也解决了 Vue 2.x 中无法检测到对象属性的删除的问题。
```javascript
// 这里就没什么好说的
function deleteProperty(target, key) {
  const hadKey = hasOwn(target, key);
  const oldValue = target[key];
  const result = Reflect.deleteProperty(target, key);
  if (result && hadKey) {
    /* istanbul ignore else */
    {
        发布通知
      trigger(target, "delete" /* DELETE */ , key, {
          oldValue
      });
    }
  }
  return result;
}
```
## has() 和 ownKeys()

```javascript
function has(target, key) {
  const result = Reflect.has(target, key);
  track(target, "has" /* HAS */ , key);
  return result;
}

function ownKeys(target) {
  track(target, "iterate" /* ITERATE */ );
  return Reflect.ownKeys(target);
}
```

从源码可以看出，这个两个陷阱函数并没有修改默认行为，但是它们都调用 track(...) 函数，回顾上文我们可知，has() 会对应 in 操作的默认行为，ownKeys() 也会影响 for...in 循环。

#### 梳理一下：

- 当读取数据时，会触发 get() 并进行 track 调用。
- 当修改数据时，会触发 set() 并进行 trigger 调用，解决了 Vue 2.x 响应系统无法检测到对象属性的添加或删除的问题。
- 当删除数据时，会触发 deleteProperty() 并进行 trigger 调用，解决了 Vue 2.x 响应系统无法检测到对象属性的添加或删除的问题。
- 当使用使用 in 操作符 或者 for...in 遍历数据时，会触发has() 和 ownKeys()并进行 track 调用。


## Attribute vs Property
结论：可以一致，也可以不一致
react里面是相同的东西


### Web Components
不行

### redux
react是：V = f(D)