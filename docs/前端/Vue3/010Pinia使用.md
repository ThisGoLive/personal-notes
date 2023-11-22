# Pinia 概念

vuex 的新版本，vue 全局的数据存储管理

# 1 state 使用

声明

```ts
import { defineStore } from "pinia";

export const useAuthStore = defineStore({
  id: "data",
  state: (): AuthState => ({
    values： "123"
  }),
})
```

调用，使用规范就是 use{id}Store

```ts
import {mapStores, mapState, mapWritablestate} from "pinia";
import userDataStore from "@/stores/data";

export default {
    name : "xx"
    computed: {
        // 暴露出来
        ...mapStores(userDataStore)
        ...mapState(userDataStore, ["values"])
        ...mapState(userDataStore, {
            val： "values"
        })
        ...mapWritablestate(userDataStore, ["values"])
    }
}
```

mapStores, mapState, mapWritablestate 的区别

mapStores：
如果需要访问 store 里的大部分内容，映射 store 的每一个属性太麻烦。可以用 mapStores，使用属性 就是 {id}Store.values

mapState：
将 state 属性映射为只读

mapWritablestate:
如果你想修改这些 state 属性

mapActions:
将 actions 属性 作为方法给组件