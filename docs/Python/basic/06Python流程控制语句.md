[[TOC]]

# 第六章 流程控制语句

## 6.1 ide 选择

略

## 6.2 import 使用

导包 或者 导入模块

import xxx

from xxx import nxxx

> 注意： 当 多个模块，并且 不是在同一个路径下的时候，
>
> 如 a.b.module1  a.c.module2  
>
> module2 想引入 module1 时，import a.b.module1 没有问题。
>
> 但是 在执行，或者 说 main 入口 的文件 必须 在 a 的上一级目录下。

## 6.3 赋值

### 6.3.1 序列解包

```python
# 正常
x=1 
y=2 
z=3

# 也可以  多赋值
x,y,z = 1,2,3

# 交换赋值
x,y = y,x

# popitem
dict1 = {'name':"小王", 'age':'12'}
x,y = dict1.popitem()

```

### 6.3.2 链式赋值

```python
x = y = z = 1
```

### 6.3.3 增量赋值

```python
x = 1
x += 1
x -= 2
```

## 6.4 语句块

在 Python 中 ： 表示 语句块 的开始 ，并使用 缩进 来 保证 语句块内容 为 同一段。

## 6.5 条件语句

### 6.5.1 if else esif

```python
#! /usr/bin/python3
# -*-coding:UTF-8-*-

num = 123

if num == 123:
    print(123)
elif num == 234:
    print(234)
else:
    print(0)
```

### 6.5.2 更多

== 与 is 

字符串 与 序列的 大小 比较 ，类似

。。。。。

### 6.5.3 断言

assert , 当 判断 条件为假 时，就会抛出异常，反之  直接跳过

```python
assert num > 1244, "错误"
```

## 6.6 循环

### 6.6.1 while 循环

```python
n = 1
while n < 10:
    print(n)
    n += 1
# python 没有 n++ 
```

### 6.6.2 for 循环

```python
nfor = 1

# 报错 故而 for 在python 中 貌似 只保留了 遍历的的功能
# for 10 > nfor:
#     print(nfor)
#     nfor += 1
str1 = 'abcdef'
for s in str1:
    print(s)
```

### 6.6.3 迭代工具

当 两个 序列 需要一同便利时

可以使用 while ，使用 下标

但是 也可以  使用 for

```python
list1 = [1, 2, 3]
list2 = ['a', 'b', 'c']
for l1, l2 in zip(list1, list2):
    print(l1, l2)
```

### 6.6.4 跳出循环

break continue

### 6.6.5 循环的 else

while  else 表示循环体 结束后 再执行 else 

for else  表示 如果  没有进入 循环体  就会执行 else



```python
# 阿姆斯特朗数

am = 1
amNum = []
while am < 10000:
    amStr = str(am)
    lens = len(amStr)
    amNew = 0
    for chars in amStr:
        val = int(chars)
        # print(type(val))
        # print(type(lens))
        amNew += val ** lens

    if am == amNew:
        amNum.append(am)
    am += 1

print(amNum)
```

