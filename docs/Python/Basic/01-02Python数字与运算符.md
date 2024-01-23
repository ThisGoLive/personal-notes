[[TOC]]

# 第一章 介绍 环境搭建

略

# 第二章 数字与运算符

Python 3 数据类型： Number 、 String、 List、 Tuple、 Sets、 Dictionary

## 2.1 数字

Python 3 数字类型：整型  浮点型  复数

### 2.1.1 整型 int

在 Python 3 中 只有 int ， 没有 long，几乎没有最大值，正负值。

```python
number = 0xA0F # 十六进制
number=0o37 # 八进制
```

### 2.1.2 浮点型 float

Python 3.X对于浮点数默认的是提供17位数字的精度。和C语言里面的double类型相同。

### 2.1.3 复数

```python
comp = 1 + 2j 
compl = complex(1,2)
```

### 2.1.4 数据类型转换

+ int(x)  转换为 整数
+ float(x) 转换为 浮点数
+ complex(x) 转换为 复数，实数为 x ，虚数为 0
+ complex(x,y) 转换为 复数，实数为 x ，虚数为 y

除了 函数转换 还有运算转换：

```python
x = 2.1
y = 42
z = 21
print(y/x) # 20.0
print(y/z) # 2.0
```



### 2.1.5 常量

PI ： 圆周率

E ：自然对数

## 2.2 变量与关键字

### 2.2.1 变量类型

使用 type 函数

### 2.2.2 声明变量 与 命名

声明 ： 不需要 声明数据类型

```python
num = 1
```

并且 通常 也是 使用 **引用指针**的方式

变量名 命名规则： 

1. 不能为 **关键字** **保留字**
2. 可以使用 “_” 但是 开头必须字母
3. 任意长度
4. 可以大小写 但是 开头必须小写
5. 可以使用数字 但是 不能数字开头

```python
import keyword
 keyword.kwlist
    ['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield']
```

Python 3.7版本中正式引入两个新的关键字async与await

```python
--- Python 3.6 Console Output ---
['False', 'None', 'True', 'and', 'as', 'assert',                   
'break', 'class', 'continue', 'def', 'del', 'elif', 
'else', 'except', 'finally', 'for', 'from', 'global', 
'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 
'not', 'or', 'pass', 'raise', 'return', 'try', 
'while', 'with', 'yield']

--- Python 3.7 Console Output --- 
['False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await', 
'break', 'class', 'continue', 'def', 'del', 'elif', 
'else', 'except', 'finally', 'for', 'from', 'global', 
'if', 'import', 'in', 'is', 'lambda', 'nonlocal', 
'not', 'or', 'pass', 'raise', 'return', 'try', 
'while', 'with', 'yield']
```

## 2.3 表达式

略

## 2.4 运算符

1. 算术运算符
2. 比较 运算符
3. 赋值运算符
4. 逻辑运算符
5. 位运算符
6. 成员运算符
7. 身份运算符

### 2.4.1 算术运算符

| 运算符 | 描述          | 例子 |
| ------ | ------------- | ---- |
| +      | 加            |      |
| -      | 减            |      |
| *      | 乘            |      |
| /      | 除            |      |
| %      | 取模  取余数  |      |
| **     | 次方          |      |
| //     | 除 取整数部分 |      |

### 2.4.2 比较运算符

| 运算符 | 描述 | 例子 |
| ------ | ---- | ---- |
| ==     |      |      |
| !=     |      |      |
| >      |      |      |
| <      |      |      |
| >=     |      |      |
| <=     |      |      |

### 2.4.3 赋值运算符



| 运算符 | 描述         | 例子 |
| ------ | ------------ | ---- |
| +=     | 加           |      |
| -=     | 减           |      |
| *=     | 乘           |      |
| /=     | 除           |      |
| %=     | 取模  取余数 |      |
| **=    | 次方         |      |
| //=    |              |      |

### 2.4.4 位运算符

运算符 我都是 以二进制进行理解

| 运算符 | 描述                 | 实力                   |
| ------ | -------------------- | ---------------------- |
| &      | 同为1                |                        |
| \|     | 有一个1              |                        |
| ^      | 同为1  同为0  是 取1 |                        |
| ~      | 八位一段 取反        | 00001111 变成 11110000 |
| <<     | 扩大两位             |                        |
| >>     | 缩小两位             |                        |



### 2.4.5 逻辑运算符

意思 大概理解为 && || !  即可，不过 数据 可以为 非 Boolean ，会强制转为 ， 0 为false  other true

| 运算符 | 表达式  | 描述                                                         | 例子            |
| ------ | ------- | ------------------------------------------------------------ | --------------- |
| and    | x and y | 如果 x 为 False 就返回False，否则 计算 y， 有点类似 Java 三目运算符 | 'a' and 10 + 10 |
| or     | x or y  | 如果 x 为 非0 就返回 x，否则 计算 y                          |                 |
| not    | not x   | !                                                            |                 |

### 2.4.6 成员运算符

| 运算符 | 描述                                              | 例子 |
| ------ | ------------------------------------------------- | ---- |
| in     | 如果 在指定的序列中找到值，就返回 True 或者 False |      |
| not in | 取反                                              |      |

### 2.4.7 身份运算符

| 运算符 | 描述                         | 例子 |
| ------ | ---------------------------- | ---- |
| is     | 判断 两个引用是否 同一个对象 |      |
| not is | 取反                         |      |

### 2.4.8 优先级

1. **
2. ~ + - 一元加减
3. */ % //
4. +、 -
5. << >>
6. &
7. ^|
8. <= < > >=
9. <> == !=
10. = .... 赋值运算符
11. is    not is
12. in    not in
13. not or and 

## 2.5 字符串操作

Python3  字符串都是 UTF-8