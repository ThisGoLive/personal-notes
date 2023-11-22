# 05 单页应用与vue-cli

## 5.1 单页应用

一个页面上，更换不同的组件，达到各个功能

优点：

+ 操作体验流畅  不会跳转
+ 完全的前端组件化

缺点：

+ 首次加载大量资源
+ 对搜索引擎不友好
+ 开发难度高

## 5.2 路由

概念：与对应操作来匹配到对应的功能显示。

锚点： `#ID`  来在页面上跳转到指定位置

对于大多数单页面应用，都推荐使用官方支持的 [vue-router 库](https://github.com/vuejs/vue-router)。更多细节可以移步 [vue-router 文档](https://router.vuejs.org/)。

vue router 使用：`#/xx`

```html
<scropt src="importvue"></scropt>
<scropt src="importvue-router"></scropt>
<body>
    <div id="app">
        <ul>
            <li><a href="#/login">登陆</a></li>
            <li><a href="#/reg">注册</a></li>
            <!-- router封装的组件 -->
            <li><router-link to="/reg">注册</router-link></li>
            <li><router-link to="/login">登陆</router-link></li>
        </ul>
        <!-- 必须是该名字的组件名称 -->
        <router-view></router-view>
    </div>
</body>
<script>
    // 获取路由对象
    var router = new VueRouter({
        // 自定义路由规则 可以多个
        routes：[
            {path:'/login', component:{templat:"<s>登陆</s>"}},            {path:'/reg', component:{templat:"<s>注册</s>"}}
        ]
    })
    var vue = new Vue({
        el:"#app",
        router:router
    })
</script>
```

router-link 在点击时会添加一些类型，从而 可以设置该类型的样式

### 5.2.1 动态路由匹配

```html
<scropt src="importvue"></scropt>
<scropt src="importvue-router"></scropt>
<body>
    <div id="app">
        <ul>
            <li>
                <router-link to="/user/9">登陆</router-link>
            </li>
        </ul>
        <!-- 必须是该名字的组件名称 -->
        <router-view></router-view>
    </div>
</body>
<script>
    // 获取路由对象
    var router = new VueRouter({
        // :id 接受数据
        routes：[
            {path:'/user/:id', 
                component:{
                    templat:"<s>{{$route.params.id}}</s>"
                }
            }
        ]
    })
    var vue = new Vue({
        el:"#app",
        router:router
    })
</script>
```

## 5.3 vue-cli

```shell
npm install -g @vue/cli @vue/cli-init
```

## 5.4 搭建 与 es6模块化

```shell
vue creat myapp
// or
vue ui
```

es6模块化 默认使用了 js 的严格模式。

引入： import xxx from ppp

如果ppp有路径 ,从路径中找，没有的话 从 node_modules 中找。

**页面处理逻辑**

```js
// Vue
import Vue from 'vue'
import i18n from './i18n'
import App from './App'
// 菜单和路由设置
import router from './router'


new Vue({
  // es6 语法，属性名与值的引用相同时，直接写
  router,
  i18n,
  // 渲染
  render: h => h(App),
  // 钩子
  created () {

  },
  mounted () {

  },
  watch: {

  }
}).$mount('#app')
```

```vue
<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>

import util from '@/libs/util'
// es6 中导出export default
// .vue 结尾的文件中， templete单独拿出，其他的都是 在对象中
export default {
  name: 'app',
  watch: {
    '$i18n.locale': 'i18nHandle'
  },
  created () {
    this.i18nHandle(this.$i18n.locale)
  },
  methods: {
    i18nHandle (val, oldVal) {
      util.cookies.set('lang', val)
      document.querySelector('html').setAttribute('lang', val)
    }
  }
}
</script>

<style lang="scss">
@import '~@/assets/style/public-class.scss';
</style>
```

1. index.html 自动引入 main.js 执行

2. main.js 使用 **es6模块化**引入了许多，其中 就通过引入 Vue 模块，创建 new Vue, `.$mount('#app')` 绑定。

3. Vue 选项中的 `render` 函数若存在，则 Vue 构造函数不会从 `template` 选项或通过 `el`选项指定的挂载元素中提取出的 HTML 模板编译渲染函数。

5.5 