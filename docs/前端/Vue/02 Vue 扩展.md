# 02 Vue 进阶

## 2.1 ES6

[ECMAScript 6 入门](https://es6.ruanyifeng.com/#docs/intro)

ECMAScript 和 JavaScript 的关系是，前者是后者的规格，后者是前者的一种实现

### 2.1.1 let const

`let`命令，用来声明变量。它的用法类似于`var`，但是所声明的变量，只在`let`命令所在的代码块内有效。`for`循环的计数器，就很合适使用`let`命令。

```javascript
// var 的情况
console.log(foo); // 输出undefined
var foo = 2;

// let 的情况
console.log(bar); // 报错ReferenceError
let bar = 2;
```

上面代码中，变量`foo`用`var`命令声明，会发生变量提升，即脚本开始运行时，变量`foo`已经存在了，但是没有值，所以会输出`undefined`。变量`bar`用`let`命令声明，不会发生变量提升。这表示在声明它之前，变量`bar`是不存在的，这时如果用到它，就会抛出一个错误。



`const`声明一个只读的常量。一旦声明，常量的值就不能改变。

### 2.1.2 变量的解构赋值

```javascript
// 数组
let [a, b, c] = [1, 2, 3];
const [ , , third] = ["foo", "bar", "baz"];
let [x, , y] = [1, 2, 3];
let [head, ...tail] = [1, 2, 3, 4];
let [x, y, z] = new Set(['a', 'b', 'c']);
// 对象
let { foo, bar } = { foo: 'aaa', bar: 'bbb' };
const { bar, foo } = { foo: 'aaa', bar: 'bbb' };
let {foo} = {bar: 'baz'}; // 失败，左边必须与右边的属性同名 顺序不定
```

### 2.1.3 对象的扩展

ES6 允许在大括号里面，直接写入变量和函数，作为对象的属性和方法。这样的书写更加简洁。

```js
// 属性简洁
const foo = 'bar';
const baz = {foo};
baz // {foo: "bar"}
// 等同于
const baz = {foo: foo};

function f(x, y) {
  return {x, y};
}
// 等同于
function f(x, y) {
  return {x: x, y: y};
}


// 方法简洁
const o = {
  method() {
    return "Hello!";
  }
};
// 等同于
const o = {
  method: function() {
    return "Hello!";
  }
};
// 如果属性方法名字 与 外部的函数同名，可以直接 使用方法名称即可表示方法
fuunction fun () {
	// xxx
}
var obj = {
    a:1
    fun
}
```

### 2.1.4 (=>) 箭头函数

```js
() > {
    
} // 格式

// 只有返回时
x => x * x
function (x) {
    return x * x;
}

// => 中的 this
// 在 浏览器器中 this 指代  Window 对象
// 在node 中指代一个 {} 空对象，并不是 model 对象

```

## 2.2 promise

用于表示一个异步操作的最终状态 完成或失败，以及该异步操作的结果值。

主要为了解决回调地狱

```js
// resolve, reject 指的时 当成功或者失败时，传递来的操作函数
var promisel = new Promise(function(resolve, reject) {
    // 需要异步执行逻辑
    setTimeout(function(){
        // 执行 成功时
        resolve("")
    }, 300)
})
// then 其实就是调用的回调函数，function(value) 被传递给 Promise的构造中 resolve
promisel.then(function(value) {
    // 异步调用成功
});
promisel.catch(function(err) {
    // 异步调用失败
})
```

## 2.3 网络请求 axios (ajax 的封装)

```javascript
axios.get(地址).then(function (response){
	// 请求成功 触发    
},function (err) {
    // 请求失败 触发
})

axios.post(地址, {数据对象}).then(function (response){
	// 请求成功 触发    
},function (err) {
    // 请求失败 触发
}
)

// 多种情况,类似 Ajax的请求
axios({
    method:'post',
    url:'',
    data:{
        
    }
});
```

```html
<div id = "app">
    <!-- 单击 -->
    <input type = "text" @click = "getMsg" />

</div>
<script>
	new Vue ({
        el:"#app",
        data:{
            msg : ''
        },methods : {
            getMsg : function () {
                var vueObj = this;
                axios.get(地址).then(function (response){
                    // 请求成功 触发    
                    vaueObj.msg = response.data;
                },function (err) {
                    // 请求失败 触发
                })
            }
        }
    })
```

audio 多媒体标签 play pause 

video 视频

自定义组件，中 data  必须为 一个函数，返回数据

props  子组件 使用该属性 接受父组件 传值