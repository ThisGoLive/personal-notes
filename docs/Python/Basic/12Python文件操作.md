[[TOC]]

# 第十二章 文件操作



## 12.1 打开文件

文件打开 需要 open 函数

`open(file_name[, access_mode][, buffering])`

1. file_name 文件路径
2. access_mode 文件的访问模式 ，默认 为只读   r
3. buffering 寄存，0不寄存，大于1 寄存区大小

 `open(file, mode='r', buffering=-1, encoding=None, errors=None, newline=None, closefd=True, opener=None)`

完整的语法结构

- file: 必需，文件路径（相对或者绝对路径）。
- mode: 可选，文件打开模式
- buffering: 设置缓冲
- encoding: 一般使用utf8
- errors: 报错级别
- newline: 区分换行符
- closefd: 传入的file参数类型
- opener:

```python
#! /usr/bin/python3
# -*-coding:UTF-8-*-

# 使用 /
path1 = """D:/test.txt"""
# 返回一个 Field 对象
fiel1 = open(path1)
print(fiel1.read())

```

### 12.1.1 文件模式

| 模式 | 描述                                                         |
| ---- | ------------------------------------------------------------ |
| t    | 文本模式 (默认)。                                            |
| x    | 写模式，新建一个文件，如果该文件已存在则会报错。             |
| b    | 二进制模式。                                                 |
| +    | 打开一个文件进行更新(可读可写)。                             |
| U    | 通用换行模式（**Python 3 不支持**）。                        |
| r    | 以只读方式打开文件。文件的指针将会放在文件的开头。这是默认模式。 |
| rb   | 以二进制格式打开一个文件用于只读。文件指针将会放在文件的开头。这是默认模式。一般用于非文本文件如图片等。 |
| r+   | 打开一个文件用于读写。文件指针将会放在文件的开头。           |
| rb+  | 以二进制格式打开一个文件用于读写。文件指针将会放在文件的开头。一般用于非文本文件如图片等。 |
| w    | 打开一个文件只用于写入。如果该文件已存在则打开文件，并从开头开始编辑，即原有内容会被删除。如果该文件不存在，创建新文件。 |
| wb   | 以二进制格式打开一个文件只用于写入。如果该文件已存在则打开文件，并从开头开始编辑，即原有内容会被删除。如果该文件不存在，创建新文件。一般用于非文本文件如图片等。 |
| w+   | 打开一个文件用于读写。如果该文件已存在则打开文件，并从开头开始编辑，即原有内容会被删除。如果该文件不存在，创建新文件。 |
| wb+  | 以二进制格式打开一个文件用于读写。如果该文件已存在则打开文件，并从开头开始编辑，即原有内容会被删除。如果该文件不存在，创建新文件。一般用于非文本文件如图片等。 |
| a    | 打开一个文件用于追加。如果该文件已存在，文件指针将会放在文件的结尾。也就是说，新的内容将会被写入到已有内容之后。如果该文件不存在，创建新文件进行写入。 |
| ab   | 以二进制格式打开一个文件用于追加。如果该文件已存在，文件指针将会放在文件的结尾。也就是说，新的内容将会被写入到已有内容之后。如果该文件不存在，创建新文件进行写入。 |
| a+   | 打开一个文件用于读写。如果该文件已存在，文件指针将会放在文件的结尾。文件打开时会是追加模式。如果该文件不存在，创建新文件用于读写。 |
| ab+  | 以二进制格式打开一个文件用于追加。如果该文件已存在，文件指针将会放在文件的结尾。如果该文件不存在，创建新文件用于读写。 |

### 12.1.2 缓冲

略

## 12.2 基本文件方法

IO 编程   Input  Output Stream 

### 12.2.1 读写

```python
print(fiel1.read())
fiel1.write('111')
```



### 12.2.2 读写行

read write  都是 按照 字节 进行操作，效率低下。

而 Python 提供的 readline() readlines() writelines() 等提供的 行操作。

```python
    fiel1 = open(path1, 'r+')
    # print(fiel1.read())
    # fiel1.write('111')
    # print(fiel1.read())
    # 有点类似 便利器，每行为一个指针点
    print(fiel1.readline())
    # 返回 剩下全部的 list
    print(fiel1.readlines())

    fiel2 = open(path2, 'a+')
    for val in ['第一行\n', '第二行\n', '第三行\n']:
        fiel2.writelines(val)
```

### 12.2.3 关闭文件

```python
try:
    fiel1 = open(path1, 'r+')

    fiel2 = open(path2, 'a+')
finally:
    if fiel1:
        fiel1.close()
    if fiel2:
        fiel2.close()
```

### 12.2.4 文件重名称 与 删除

都使用 os 模块

```python
# m命名
os.rename('oldpath', 'newpath')
# 删除
os.remove('path')
```

## 12.3 文件内容进行迭代

### 12.3.1 按字节处理

使用 read  ，得到 str  进行迭代

### 12.3.2 按行处理

readline 

### 12.3.3 fileinput实现 懒加载式迭代

```python
import fileinput
for line in fileinput.input(path1):
        print(line)
```

### 12.3.4 文件迭代器

即 文件对象 的迭代

```python
f = open(path)
for line in f:
    print(line)
    
f.close();
```

## 12.4 StringIO 函数

除了 读取文件，还可以 从内存中读取数据。python 的 io模块中 提供的 StringIO 便是对 str 进行操作

```python
from io import StringIO
str_io = StringIO();
str_io.write("123")
```

## 12.5 序列化 与 反序列化

即把 内存中 对象实例 与 二进制数据 的互相转换

### 12.5.1 基本序列化 与  反序列化

pickle 模块 提供了 基本数据的系列化 与 反序列化。

```python
import pickle
# 将对象 序列化为 二进制
pickle.dumps(obj)
# 将 序列化的 二进制 转换为 对象
pickle.load(val)
```

### 12.5.2 JSON序列化 与 反序列化

python 数据类型 与 json 数据类转换参照

| Python       | JSON       |
| ------------ | ---------- |
| dict         | {}         |
| list(tuple)  | []         |
| str          | string     |
| int or float | number     |
| Ture False   | ture fasel |
| None         | null       |



使用 json 模块

```python
# 转换为 json 后为 str 类型
json.dumps() 
json.laods()
```





