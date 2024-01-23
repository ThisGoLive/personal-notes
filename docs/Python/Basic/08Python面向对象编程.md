[[TOC]]

# 第八章 面向对象

## 8.1 面向对象理解

略

## 8.2 类的定义

```python
class Student(object):
    name = '小王'
    age = 12

    def __init__(self, name, age):
        self.name = name
        self.age = age


    def tellSelf(self):
        print('我叫：', self.name, '年龄：', self.age)
        # 不能取到
        # print('我叫：', name, '年龄：', age)
        return

```

1. class 声明 创建类
2. 类名 第一个字母大写
3. () 内为 基础的 类名，默认为 object

## 8.3 深入类

### 8.3.1 构造方法

每个类都可以 定义多个 参数的 `__init__` 方法，但是 构造生效的 只有 最后一个 构造方法。

### 8.3.2 类的访问权限

在 Java 中 有 访问 修饰符， 四个 权限。而 类的 属性 都是 使用 private 修饰的。 使用 getset 

Python 中类似 ，  私有属性 使用 `__` 命名，使用 `get__ set__`

```python
class Student(object):
    name = '小王'
    age = 12
    __gender = '未知'

    def __init__(self, name, age):
        self.name = name
        self.age = age

    def tellSelf(self):
        print('我叫：', self.name, '年龄：', self.age, '性别：', self.__gender)
        # 不能取到
        # print('我叫：', name, '年龄：', age)
        return

    def get__gender(self):
        return self.__gender

```

同理，如果 私有方法 也就是 可以 使用 `__` 命名 ，成为 私有方法。

## 8.4 继承

```python
# 类定义
class People(object):
    # 定义基本属性
    name = ''
    age = 0

    # 定义构造方法
    def __init__(self, name, age):
        self.name = name
        self.age = age
        return

    def speak(self):
        print("%s 说: 我 %d 岁。" % (self.name, self.age))
        return


class Student(People):
    __gender = '未知'

    def __init__(self, name, age, gender):
        # 调用 基类的方法时，必须带上基类的 类名，参数 加上 self
        People.__init__(self, name, age)
        self.__gender = gender

    def tellSelf(self):
        print('我叫：', self.name, '年龄：', self.age, '性别：', self.__gender)
        # 不能取到
        # print('我叫：', name, '年龄：', age)
        return

    def get__gender(self):
        return self.__gender
```

1. 子类 不能 使用 父类的 私有方法。
2. 多继承的情况下，self 的使用 不同与 Java 的 this，self 会依次指代 本实例， 第一个 基类 第二个基类。。。。
3. 由于 没有类型声明，构造返回的实例  只能为 子类，向上转型 就没有了 意义

## 8.5 多态

动态多态： 运行后才知道结果   重写父类

静态多态： 运行前 就知道结果  方法参数不同



## 8.6 封装

只关注  对象 ，而不关注 对象 具体 怎么操作

即 操作函数 变为 对象方法

## 8.7 多继承

略

## 8.8 获取对象信息

type  isinstace dir

```python
    # true  不为 基类 People
    print(type(stu2) == Student)
    # true 
    print(isinstance(stu2, People))
    # stutent 相信信息
    print(dir(stu2))
```

## 8.9 类的专有方法

即 可以/需要 重写的

### 8.9.1 `__str__`

同 Java toString

### 8.9.2 `__iter__`

迭代时 使用，返回值， 默认 返回 self  本身

Python 的 for  会不断调用 对象 的 `__next__`

```python
for obj in Student():
    xxx
```



### 8.9.3 `__getitem__`

虽然 iter 后，可以像 for 一样使用，但是 不能 像 list 一样 [index] 取对应值，那么 该 函数 即可实现该功能

```python
Sutdent()[0]
```



### 8.9.4 `__getattr__`

```python
def __getattribute__(self, name: str) -> Any:
    xxx
    return super().__getattribute__(name)
```

类似 通用get

同理 还有 setattr

### 8.9.3 `__call__`

```python
    def __call__(self):
        print(123)
        
# 类中 写了该方法 
# 实例加() 就和 调用 
```

## 8.10 面向对象扩展

python 中是否 有 序列化 反射 克隆  如果有怎么使用？





