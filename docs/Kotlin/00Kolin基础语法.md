# Kolint

2024年2月28日

[中文文档](https://www.kotlincn.net/)

## 1 基本语法

### 1.1 启动入口

```kotlin
fun main() {
    println("Hello world!")
}

fun main(args: Array<String>) {
    println(args.contentToString())
}
```

### 1.2 函数

```kotlin
fun sum(a: Int, b: Int): Int {
    return a + b
}

// 表达式
fun sum(a: Int, b: Int) = a + b

// 无意义返回
fun printSum(a: Int, b: Int): Unit {
    println("sum of $a and $b is ${a + b}")
}
// Unit 返回类型可以省略
fun printSum(a: Int, b: Int) {
    println("sum of $a and $b is ${a + b}")
}
```

### 1.3 变量

定义只读局部变量使用关键字 `val` 定义。只能为其赋值一次。

```kotlin
    val a: Int = 1  // 立即赋值
    val b = 2   // 自动推断出 `Int` 类型
    val c: Int  // 如果没有初始值类型不能省略
    c = 3       // 明确赋值
```

可重新赋值的变量使用 `var` 关键字。

```kotlin
    var x = 5 // 自动推断出 `Int` 类型
    x += 1
```

### 1.4 类与实例

```kotlin
// 如需让一个类可继承， 请将其标记为 open
open class Shape

class Rectangle(var height: Double, var length: Double): Shape() {
    var perimeter = (height + length) * 2 
}
```