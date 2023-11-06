# 03 组件

## 3.1 认识组件

```html
<div id="components-demo">
  <button-counter></button-counter>
    <zujian></zujian>
</div>
<script>
// 定义一个名为 button-counter 的新组件，全局声明
Vue.component('button-counter', {
  data: function () {
    return {
      count: 0
    }
  },
  template: '<button v-on:click="count++">You clicked me {{ count }} times.</button>'
});
    // 在vue中即可使用 button-counter 的标签
    new Vue({ 
        el: '#components-demo' ,
        // 局部组件
        components:{
            zujian:{
                // 为一个独立的 vue 实例对象
                  data: function () {
                    return {
                      count: 0
                    }
                  },
                template: '<button v-on:click="count++">You clicked me {{ count }} times.</button>'
            }
        }
    })
</script>
```

因为组件是可复用的 Vue 实例，所以它们与 `new Vue` 接收相同的选项，例如 `data`、`computed`、`watch`、`methods` 以及生命周期钩子等。仅有的例外是像 `el` 这样根实例特有的选项。

## 3.2 注意点

**1.其中 data 不像 new Vue 中是一个对象， 而是一个函数**



**2.组件声明时，如果组件名称有大小写，但是标签不不区分**

首字母如果大写，就会小写，使用 `-` 加在大写字母前即可 MyTem -> `<my-tem>`



**3.template 中有且只有一个根节点**



**4. 如果一个组件中 有 el  又有 template ，那么 template 会替换掉 el 管理下的全部**

## 3.3 父组件传值子组件 prop

```html
<body>
    <div id='app'>
        <!-- 自定义组件的标签 可以随意 定制属性 -->
		<!-- props 可以直接获取对应名称的属性的值 -->
        <zujian value="val"></zujian>
        <!-- 父传递值给子 -->
        <zujian v-bind:value="msg"></zujian>
    </div>
</body>
<script>
new Vue({ 
	el: '#app',
    data:{
        msg:"msgValue"
    }
    // 局部组件
    components:{
            zujian:{
        	// 为一个独立的 vue 实例对象
            data: function () {
                    return {
                        count: 0
                    }
                },
            // 无法直接获取 msg
            template: '<h2>{{value}}</he>',
            //  此时 可以 获取到value 对应的 val 字符串
            // v-bind绑定value对应的msg的值 msgValue 字符串
            props:['value',''],
		     watch: {
	    		// 用于子组件监听 父组件 传值的变化
		    	msg(){
				}
			}
          },
   }
})
</script>
```

prop 大小写如同 组件 与 标签使用一样  `-`进行代替

### 3.3.2 prop 的类型

```json
props: {
  title: String,
  likes: Number,
  isPublished: Boolean,
  commentIds: Array,
  author: Object,
  callback: Function,
  contactsPromise: Promise // or any other constructor
}
```

### 3.3.3 单项数据流

所有的 prop 都使得其父子 prop 之间形成了一个**单向下行绑定**：父级 prop 的更新会向下流动到子组件中，但是反过来则不行。这样会防止从子组件意外变更父级组件的状态，从而导致你的应用的数据流向难以理解。

额外的，每次父级组件发生变更时，子组件中所有的 prop 都将会刷新为最新的值。这意味着你**不**应该在一个子组件内部改变 prop。如果你这样做了，Vue 会在浏览器的控制台中发出警告。

注意在 JavaScript 中对象和数组是通过**引用**传入的，所以对于一个数组或对象类型的 prop 来说，在子组件中改变变更这个对象或数组本身**将会**影响到父组件的状态。

## 3.4 自定义事件

### 3.4.1 事件名称

不同于组件和 prop，事件名不存在任何自动化的大小写转换。而是触发的事件名需要完全匹配监听这个事件所用的名称。举个例子，如果触发一个 camelCase 名字的事件：

```js
this.$emit('myEvent')
```

```html
<!-- 没有效果 -->
<my-component v-on:my-event="doSomething" @my-event></my-component>
```

不同于组件和 prop，事件名不会被用作一个 JavaScript 变量名或 property 名，所以就没有理由使用 camelCase 或 PascalCase 了。并且 `v-on` 事件监听器在 DOM 模板中会被自动转换为全小写 (因为 HTML 是大小写不敏感的)，所以 `v-on:myEvent` 将会变成 `v-on:myevent`——导致 `myEvent` 不可能被监听到。

因此，我们推荐你**始终使用 kebab-case 的事件名**。

### 3.4.2 自定义组件的 v-model

输入型标签时，双向绑定时

一个组件上的 `v-model` 默认会利用名为 `value` 的 prop 和名为 `input` 的事件，

但是像单选框、复选框等类型的输入控件可能会将 `value` 属性用于不同的目的。

即 在使用 **单选框、复选框等类型的输入控件** 他们的 value 属性 并不是控制显示的，控制显示的是 checked 属性。

如下来避免

```js
Vue.component('base-checkbox', {
  model: {
    prop: 'checked',
    event: 'change'
  },
  props: {
    checked: Boolean
  },
  template: `
    <input
      type="checkbox"
      v-bind:checked="checked"
      v-on:change="$emit('change', $event.target.checked)"
    >
  `
})
```

自定义事件也可以用于创建支持 `v-model` 的自定义输入组件。记住：

```html
<input v-model="searchText" />
```

等价于：

```html
<input :value="searchText" @input="searchText = $event.target.value" />
```

当用在组件上时，`v-model` 则会这样：

```html
<custom-input
  :model-value="searchText"
  @update:model-value="searchText = $event"
></custom-input>
```

### 3.4.3 将原生事件绑定到组件

### 3.4.4 .sync 修饰符

在有些情况下，我们可能需要对一个 prop 进行“双向绑定”。不幸的是，真正的双向绑定会带来维护上的问题，因为子组件可以变更父组件，且在父组件和子组件都没有明显的变更来源。

## 3.5 父组件子组件函数调用

### 3.5.1父组件调用子组件函数

```vue
<body>
    <div id='app'>
        <child ref="child2"></child>
    </div>
</body>
<script>
	this.$refs.child2.子组件的函数
</script>
```

### 3.5.2 子组件调用父组件函数

```vue
<template>
  <div>
    <child></child>
  </div>
</template>
<script>
  import child from '~/components/child';
  export default {
    components: {
      child
    },
    methods: {
      fatherMethod() {
        console.log('测试');
      }
    }
  };
</script>


<template>
  <div>
    <button @click="childMethod()">点击</button>
  </div>
</template>
<script>
  export default {
    methods: {
      childMethod() {
        this.$parent.fatherMethod();
      }
    }
  };
</script>
```



数据事件监听

http://www.javashuo.com/article/p-zogpsfue-kv.html
