[[TOC]]

# 第九章 异常处理

```python
try:
    <语句>
except <异常名称>:
    # 异常被捕捉时 执行的 的语句
    <语句>
```

## 9.1 异常类型

常见的 异常类型：

1. NameError
2. SyntaxError
3. TypeError
4. ValueError

## 9.2 异常处理

```python
#! /usr/bin/python3
# -*-coding:UTF-8-*-


def cre_error(x, y):
    try:
        tuples = (1, 2, 3)
        print(tuples[3])
        val = x / y
        print(val)
        return val
    except IndexError:
        print('下标错误')
    except ZeroDivisionError:
        print('除数为0错误')


if __name__ == '__main__':
    cre_error(4, 0)

```

## 9.3 异常抛出

Java 中 抛出 异常 Throws 关键字

Python 则为 **raise** 

```python 
raise Exception
raise Exception("抛出异常")
```

常用 内置异常：

| 异常名称       | 异常说明                        |
| -------------- | ------------------------------- |
| Exception      | 异常 基类                       |
| AttributeError | 对象 没有对应属性               |
| IOError        | IO 流错误                       |
| IndexError     | 序列中没有 索引                 |
| KeyError       | 映射中 没有对应的 键            |
| NameError      | 未声明 / 初始化对象（没有属性） |
| SyntaxError    | Python 语法错误                 |
| SystemError    | 一般解释器系统错误              |
| ValueError     | 传入无效参数                    |



## 9.4 多异常处理

```python
# 多个 except
    try:
        tuples = (1, 2, 3)
        print(tuples[3])
        val = x / y
        print(val)
        return val
    except IndexError:
        print('下标错误')
    except ZeroDivisionError， :
        print('除数为0错误')
        
# 一个 except
    except (IndexError, ZeroDivisionError):
        print("")
```

## 9.5 捕捉对象

```python
    try:
    except IndexError as ind:
        print('下标错误', ind)
    except (IndexError, ZeroDivisionError) as exe:
        print(exe)
        
    # 全捕捉
    try:
        xxx
    except:
    	xxx
        
```

## 9.6 try except else 语句

```python
    try:
        # raise Exception("抛出异常")
        print(1)
    except Exception as ex:
        print(ex)
    else:
        print('执行')
       
    # 这种情况 下 由于 没有捕捉到 Exception  所以会报错
    try:
        raise Exception("抛出异常")
        print(1)
    except IndexError as ex:
        print(ex)
    else:
        print('执行')
```

只有 在 **except**   没有被执行时，并且 没有异常抛出时。 才会触发

## 9.7 自定义异常

基本 类似 Java中的 扩展 异常，

```python 
class MyError(Exception):
    def __init__(self):
        pass
    def __str__(Self):
        return '自定义异常'
```

## 9.8 finally 

基本 与 Java 类似 

```python
try:
    print()
    return
except:
    print()
    return
else:
    print()
    return
finally:
   
```



