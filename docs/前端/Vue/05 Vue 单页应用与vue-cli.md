# 05 ��ҳӦ����vue-cli

## 5.1 ��ҳӦ��

һ��ҳ���ϣ�������ͬ��������ﵽ��������

�ŵ㣺

+ ������������  ������ת
+ ��ȫ��ǰ�������

ȱ�㣺

+ �״μ��ش�����Դ
+ ���������治�Ѻ�
+ �����Ѷȸ�

## 5.2 ·��

������Ӧ������ƥ�䵽��Ӧ�Ĺ�����ʾ��

ê�㣺 `#ID`  ����ҳ������ת��ָ��λ��

���ڴ������ҳ��Ӧ�ã����Ƽ�ʹ�ùٷ�֧�ֵ� [vue-router ��](https://github.com/vuejs/vue-router)������ϸ�ڿ����Ʋ� [vue-router �ĵ�](https://router.vuejs.org/)��

vue router ʹ�ã�`#/xx`

```html
<scropt src="importvue"></scropt>
<scropt src="importvue-router"></scropt>
<body>
    <div id="app">
        <ul>
            <li><a href="#/login">��½</a></li>
            <li><a href="#/reg">ע��</a></li>
            <!-- router��װ����� -->
            <li><router-link to="/reg">ע��</router-link></li>
            <li><router-link to="/login">��½</router-link></li>
        </ul>
        <!-- �����Ǹ����ֵ�������� -->
        <router-view></router-view>
    </div>
</body>
<script>
    // ��ȡ·�ɶ���
    var router = new VueRouter({
        // �Զ���·�ɹ��� ���Զ��
        routes��[
            {path:'/login', component:{templat:"<s>��½</s>"}},            {path:'/reg', component:{templat:"<s>ע��</s>"}}
        ]
    })
    var vue = new Vue({
        el:"#app",
        router:router
    })
</script>
```

router-link �ڵ��ʱ�����һЩ���ͣ��Ӷ� �������ø����͵���ʽ

### 5.2.1 ��̬·��ƥ��

```html
<scropt src="importvue"></scropt>
<scropt src="importvue-router"></scropt>
<body>
    <div id="app">
        <ul>
            <li>
                <router-link to="/user/9">��½</router-link>
            </li>
        </ul>
        <!-- �����Ǹ����ֵ�������� -->
        <router-view></router-view>
    </div>
</body>
<script>
    // ��ȡ·�ɶ���
    var router = new VueRouter({
        // :id ��������
        routes��[
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

## 5.4 � �� es6ģ�黯

```shell
vue creat myapp
// or
vue ui
```

es6ģ�黯 Ĭ��ʹ���� js ���ϸ�ģʽ��

���룺 import xxx from ppp

���ppp��·�� ,��·�����ң�û�еĻ� �� node_modules ���ҡ�

**ҳ�洦���߼�**

```js
// Vue
import Vue from 'vue'
import i18n from './i18n'
import App from './App'
// �˵���·������
import router from './router'


new Vue({
  // es6 �﷨����������ֵ��������ͬʱ��ֱ��д
  router,
  i18n,
  // ��Ⱦ
  render: h => h(App),
  // ����
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
// es6 �е���export default
// .vue ��β���ļ��У� templete�����ó��������Ķ��� �ڶ�����
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

1. index.html �Զ����� main.js ִ��

2. main.js ʹ�� **es6ģ�黯**��������࣬���� ��ͨ������ Vue ģ�飬���� new Vue, `.$mount('#app')` �󶨡�

3. Vue ѡ���е� `render` ���������ڣ��� Vue ���캯������� `template` ѡ���ͨ�� `el`ѡ��ָ���Ĺ���Ԫ������ȡ���� HTML ģ�������Ⱦ������

5.5 