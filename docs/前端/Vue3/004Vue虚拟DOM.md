# Vue 虚拟 DOM

# 1. 什么是 Virtual DOM， 为什么要实现

就是将 HTML 转换为 Vue 的 DOM 树

```html
<h1 class="blue">hell</h1>
```

vue compiles to

```json
{
    tag: "h1",
    attributes: {
        class: "blue"
    }
    content: "hell"
}
```

直接操作 DOM 树，是很快的

```js
document.getElementById("").innerHTML = "xxx";
```

- 虚拟 DOM 是 DOM 的轻量级副本，并没有原本的属性和方法，目的不是替换。
- 数据更新，同时更新虚拟 DOM，自动与实际 DOM 同步
- 检索每个元素过程快， 然后直接对 DOM 进行定位操作
