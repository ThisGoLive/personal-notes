## 01 ts基本类型

1. number
   + 整数
   + 小数
   + 0b
   + 0o
   + 0x
   + NaN
2. string
3. boolean
4. undefined  null,基本相同 需要设置 strict:false
5. void 函数返回值
6. unknown any, unknown 不能设置属性和方法
   + 区别 any 类型的数据可以设置属性. unknown 不能

## 02 联合类型与断言

### 联合类型

不同类型绑定到一个对象上

```TypeScript
let val :number|string = "11"

function get(val :number|string):string {
    return "123"
}
```

### 类型断言

将不确定的类型断言为确定的类型，在编辑器中进行欺骗，类似强转

```Typescript
let val:string|number = xx.getXX()

let val:string = xx.getXX() as string
let val:string = <string>xx.getXX()
```

## 03 数组类型

1. 泛型数组
2. 杂乱数组
3. 多维数组
4. 元组

```typescript
let list :string[] = ["123"]
let list2 :Array<number> = [1]
// 杂乱
let list3 :any[] = [1, "1"]
let list4 :(string|number)[] = [1, "1"]

// 元组
let list5 :[number, number] = [1, 2]
let list5 :[1,number, string] = [1, 2, ""]

let list7:string[][] = [[], []]
```

## 04 接口

```typescript
interface IUser {
    name: string
    name2?: string
    readonly name3: string
    func1: (param:string)  => void;
    func1?: (param:string)  => void;
}

let user: IUser & IUser2 = {
    name: "xxx",
    func1: function(param: string) {

    }
}

// 同名接口是 合并
```

## 05 类型别名

```typescript
// 将多个类型 组合成一个别名
type nameType = string | string[]

// 类似接口，但是可以实现
type user = {
    name: string
}
let userInfo : user$user2 = {

}
type func = (name :string, num :number) => void
let func1 ：func = function(name:string, num:number) {}

// 同名别名 报错
```

## 06 函数类型

1. 参数选填
2. 默认值

```typescript
// 默认值
function func1(num:number = 10) ： void  {}

// 函数的定义名称可以多个，但是实现只能一个，进行重载
```

## 07 枚举类型

```typescript
enum Color {
    Red,
    Blue,
    Green
}

const enum Color {
    Red = 100,
    Blue, // 101
    Green // 102
}
```

## 08  泛型

```typescript
function array<T, K>(a:T, b:K):T[] {}

function array<T extends string|array, K>(a:T, b:K):T[] {}



interface User {
    user:string
}

function getUserName(user:User, key: keyof User) : void {
    // key 只能是User属性名称
    user[key]
}

function getUserName<V extends keyof User>(user:User, key: V) : User<V> {
    // key 只能是User属性名称
    return user[key];
}
// keyof 相当于 将 该类型分解得到属性名称,  type name = 'user' | ...
```

## 09 内置类型

1. ES 中的对象
   1. new Date()
   2. new RegExp("")  /.*?*/
2. DOM BOM
   1. HTMLElementTagNameMap
   2. document.querySelector()
3. Promise
   1. then
   2. error

## 10 tsconfig.json

```json
{
"compilerOptions": {
  /* 基本选项 */
  // 指定 ECMAScript ⽬标版本: 'ES3'(default), 'ES5', 'ES6'/'ES2015', 'ES2016', 'ES2017', or 'ESNEXT'
  "target": "es5", 
  "module": "commonjs", // 指定使⽤模块: 'commonjs', 'amd','system', 'umd' or 'es2015'
  "lib": [], // 指定要包含在编译中的库⽂件
  "allowJs": true, // 允许编译 javascript ⽂件
  "checkJs": true, // 报告 javascript ⽂件中的错误
  "jsx": "preserve", // 指定 jsx 代码的⽣成: 'preserve','react-native', or 'react'
  "declaration": true, // ⽣成相应的 '.d.ts' ⽂件
  "sourceMap": true, // ⽣成相应的 '.map' ⽂件
  "outFile": "./", // 将输出⽂件合并为⼀个⽂件
  "outDir": "./", // 指定输出⽬录
  "rootDir": "./", // ⽤来控制输出⽬录结构 --outDir.
  "removeComments": true, // 删除编译后的所有的注释
  "noEmit": true, // 不⽣成输出⽂件
  "importHelpers": true, // 从 tslib 导⼊辅助⼯具函数
  "isolatedModules": true, // 将每个⽂件做为单独的模块（'ts.transpileModule' 类似）.
  /* 严格的类型检查选项 */
  "strict": true, // 启⽤所有严格类型检查选项
  "noImplicitAny": true, // 在表达式和声明上有隐含的 any类型时报错
  "strictNullChecks": true, // 启⽤严格的 null 检查
  "noImplicitThis": true, // 当 this 表达式值为 any 类型的时候，⽣成⼀个错误
  "alwaysStrict": true, // 以严格模式检查每个模块，并在每个⽂件⾥加⼊ 'use strict'
  /* 额外的检查 */
  "noUnusedLocals": true, // 有未使⽤的变量时，抛出错误
  "noUnusedParameters": true, // 有未使⽤的参数时，抛出错误
  "noImplicitReturns": true, // 并不是所有函数⾥的代码都有返回值时，抛出错误
  "noFallthroughCasesInSwitch": true, // 报告 switch 语句的 fallthrough 误。（即，不允许 switch 的 case 语句贯穿）
  /* 模块解析选项 */
  "moduleResolution": "node", // 选择模块解析策略： 'node' (Node.js)or 'classic' (TypeScript pre-1.6)
  "baseUrl": "./", // ⽤于解析⾮相对模块名称的基⽬录
  "paths": {}, // 模块名到基于 baseUrl 的路径映射的列表
  "rootDirs": [], // 根⽂件夹列表，其组合内容表示项⽬运⾏时的结构内容
  "typeRoots": [], // 包含类型声明的⽂件列表
  "types": [], // 需要包含的类型声明⽂件名列表
  "allowSyntheticDefaultImports": true, // 允许从没有设置默认导出的模块中默认导⼊。
  /* Source Map Options */
  "sourceRoot": "./", // 指定调试器应该找到 TypeScript ⽂件⽽不是源⽂件的位置
  "mapRoot": "./", // 指定调试器应该找到映射⽂件⽽不是⽣成⽂件的位置
  "inlineSourceMap": true, // ⽣成单个 soucemaps ⽂件，⽽不是将sourcemaps ⽣成不同的⽂件
  "inlineSources": true, // 将代码与 sourcemaps ⽣成到⼀个⽂件中，要求同时设置了 --inlineSourceMap 或 --sourceMap 属性
  /* 其他选项 */
  "experimentalDecorators": true, // 启⽤装饰器
  "emitDecoratorMetadata": true // 为装饰器提供元数据的⽀持
  },
  // 指定匹配列表
  "include" : {
  },
  // 指定排除列表 不编译
  "exclude" : {
  }
}
```

## 11 xx.d.ts

作用：对js文件 扩展，用来兼容支持 ts 使用类型
declare 声明

```TypeScript
declare moudle 'xx' { // 包名
  // 再以接口进行定义类型与函数
}
```

## 装饰器

ClassDecorator 可以读取类的定义
MethodDecorator 方法装饰器
属性装饰墙
参数装饰器

开启配置

```json
  /* 其他选项 */
  "experimentalDecorators": true, // 启⽤装饰器
  "emitDecoratorMetadata": true // 为装饰器提供元数据的⽀持
```

```ts
const app:ClassDecorator = (fn)=> {
    // 直接添加属性 函数
    fn.prptotype.name = "aa"
    fn.prptotype.getName = functoin () : {
        return fn.prptotype.name;
    }
}

@app
class Stu {

}

let s: Stu = new Stu();

(s as any).getName();

const appf = (name:string):ClassDecorator => {
    return (fn) => {
        // 直接添加属性 函数
        fn.prptotype.name = name
        fn.prptotype.getName = functoin () : {
            return fn.prptotype.name;
        }
    }
}

@appf("123")
const methodApp = (str:string):MethodDecorator => {
    return (traget: Object, propertyKey: string, decriptor: PropertyDescriptor) => {
        // 直接执行 对应的函数，并且传递参数
        // decriptor.value
    }
}
```