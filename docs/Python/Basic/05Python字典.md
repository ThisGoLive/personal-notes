

[[TOC]]

# 第五章 字典 dict

类似 json 类似 Java 中map

## 5.1 字典 创建

```python
dict1 = {1: 'a', 2: 'b'}
print(dict1)
```

### 5.1.1 dict 函数

```python
dict2 = dict(name='小王', age=12)
```

### 5.1.2 字典 的基本操作

```python
# 修改
dict2 = dict(name='小王', age=12)
dict2['name'] = '老王'
print('我的名字：%(name)s,我的年龄%(age)s' % dict2)

# 删除元素
del dict2['age']
```

字典的 值可以为任何 python 对象，但是 键 就不能了 ，两个要求

1. 必须唯，不能重复
2. 可以为数字 、字符串、元组  不能为列表

len 函数 返回键值对 个数

### 5.1.3 字典的 格式化 字符串

略

### 5.1.4 字典和列表的区别

查找 和 插入 速度极快，不随着key 的增加而变慢

内存占用大，浪费多



list 则刚好相反

## 5.2 字典对象的方法

### 5.2.1 clear 

清除

### 5.2.2 copy 

类似 Java 浅克隆

deep copy 深度

### 5.2.3 fromkeys 

用于创建一个新字典，以序列 seq 中的元素 作为键，value 作为 值

```python
dict.formkeys([1,2], ['a', 'b'])
```

### 5.2.4 get

`dict.get(key, default=None)`  可设置默认值

### 5.2.5 key in dict

key 是否 在dict 中为键

### 5.2.6 items 

得到 对应键值 的列表

### 5.2.7 keys 

得到 所有键的 列表

### 5.2.8 setdefault

获取 对应键的 值，如果没有对应的 键 ，会 在 字典中 添加对应的 键值，值默认 设置 None

有 添加 键值的功能

### 5.2.9 update 

用于  将 dict2 的键值 更新到 dict1 中

### 5.2.10 values 

将 所有的 值 通过列表 返回



