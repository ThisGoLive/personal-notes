[[TOC]]

# 第十一章 正则表达式

## 11.1 正则格式书写

略

## 11.2 re模块

### 11.2.1 re.match 函数

`re.match(pattern, string, flags=0)`  

pattern 指正则表达式

string 指 需要被匹配的 字符串

flags 控制匹配方式 

匹配成功 返回一个 匹配对象，否则 返回 None

### 11.2.2 re.search 方法

re.search 用于扫描这个呢个字符串 并 返回第一个成功匹配的字符串，

语法 基本 同 match

### 11.2.3 match 与 search

match 只会匹配开始字符

search 会匹配整个字符