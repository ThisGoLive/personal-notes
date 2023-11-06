[[TOC]]

# 第七章 函数

内置函数   不需要引入包  直接使用的。如 abs  取绝对值函数，在例如 len  取长度 函数

## 7.1 定义函数

创建语法：

```python
def 函数名 (ages):
    函数体
```

注意：

> 函数 返回时 使用 return 关键字时，如果 只是使用了 return  而没有 任何 对象 引用，则表示 返回的 数据 为 None， 如果 没有使用 return ，那么 返回的 也是 None

如果 只是 想定义一个 函数，而不执行 任何 逻辑 。可以使用 pass 关键字。

例如 ：

```python
def null_Funtion (age):
    pass
```

## 7.2 函数的参数

调用 函数时 可以使用 一下参数类型：

1. 必须参数
2. 关键字参数
3. 默认参数
4. 可变参数
5. 组合参数

### 7.2.1 必须参数

必须 以正确的 **数据类型** 、 **数据顺序** 、 **参数数量**传入参数。

```python
def test(str1, num):
    print('字符串：'+str1)
    print('数字:'+str((num+1)))

if __name__ == '__main__':
    test('123', 123)
    # 参数数据类型错误
    # test('123', '1234')
```

### 7.2.2 关键字参数

即 使用系统 的关键字  作为参数，如果 参数的 **顺序 不对**，python 解释器 就会自动矫正。故而 不会报错！

```python
def test(str1, num):
    print('字符串：'+str1)
    print('数字:'+str((num+1)))

if __name__ == '__main__':
    test('123', 123)
    # 参数数据类型错误
    # test('123', '1234')
    # 关键字参数
    test(num=123, str1='123')
```

### 7.2.3 默认参数

```python
def tellSelf(name = '小王', age = '12'):
    print('我叫：' + name, '年龄：' + age)


if __name__ == '__main__':
    tellSelf()
```

### 7.2.4 可变参数

使用 `*` 表示 参数

```python
def test2(*ages):
    # 数据类型为 Tuple
    print(type(ages))
    print(ages)


def test3(**ages):
    print(type(ages))
    print(ages)


if __name__ == '__main__':
    # 可变参数
    test2(123, 'abc')
    lis = [123, 'abc', '+-*']
    tup = (123, 'abc', '+-*')
    # 将 tup 看作一个 参数
    test2(tup)
    # 将 lis 看作一个 参数
    test2(lis)
    test2(tuple(lis))
    # * 时参数类型 tuple
    test2()
    # ** 时参数类型 dict
    test3()
```

### 7.2.5 组合参数

略

## 7.3 执行流程 形参与实参

略

## 7.4 变量作用域

全局变量  与 局部变量

```python
num = num2 = 100

def print_val():
    num = 102
    # 将 num2 定义为 一个 全局变量
    global num2
    num2 = 103
    print(num)
    # 获取 全局 同名变量
    print(globals()['num'])
    print(globals()['num2'])

# 102
# 100
# 103
```

## 7.5 有返回值 与 无返回值的函数

略

## 7.6 返回函数

即  把函数 返回

```python
def ret_fun(a=1):
    def fauns():
        print(a)
        return
    return fauns
```

说明：

> 当 内部 函数 使用的 外部函数的参数时，即为 闭包   ，并且不能 修改外部函数，类似 Java的 内部类

另外 

```python
def ret_fun():
    fs = []
    for i in range(1, 4):
        def f():
            return i*i
        fs.append(f)
    return fs
f1, f2, f3 = ret_fun();
# 此时  如果 调用 f1 f2 f3 那么 结果 都是 9，因为 当返回时，三个函数 的内部 i 的 引用 全部指向的 3
# 如果 非要使用对应的 i , 可以 使用
def ret_fun():
    fs = []
    def cre_f(i):
        def f():
            return i*i
        return f
    for i in range(1, 4):
        fs.append(cre_f(i))
    return fs
```

## 7.7 递归

略

## 7.8 匿名函数  lambda

python 语法 ： `lambda 参数: 函数块`

```python
def sm_val(x, y):
    return x + y
lambda x, y : x + y
```

**lambda 使用条件**

1. 程序 一次性使用 函数时
2. 代码简洁

规则

1. 一般有一行 表达式，必须有返回值
2. 不能 return
3. 可以没有参数

## 7.8 偏函数

python 中 使用 partial 函数 创建一个 偏函数

partial 参数说明：第一个参数， 为 需要创建的偏函数的基础函数名，后续参数 为 基础函数的 依次参数

产生的 新函数 的参数 ，为 后续参数 的补充 

```python
def base_f(a, b, c):
    print(a);

new_f = partial(base_f, 1, 2)
new_f(3)
```
