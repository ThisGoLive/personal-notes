# 我的第二个Vue

## 

### 问题一

**component has been registered but not used**

1.组件引用名错了 2. 组件被注册，但是没有被使用 可以关掉

```json
"eslintConfig": {
  "rules": {
    "vue/no-unused-components": "off"
  }
}
```

### 问题二

**`data` property in component must be a function**

```vue
<template>
  <div >
    {{'我的地二个vue,第一个 原来学了后忘了'}}
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: new String("")
  }
}
</script>
```

