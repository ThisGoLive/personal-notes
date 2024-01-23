[[TOC]]

# 第十章 

常用的 时间日期模块： **time**  **datetie** **calendar**

# 10.1 日期时间

### 10.1.1 时间戳

timestamp DTS

```python
time.time()
```



### 10.1.2 时间格式化符号

| 符号 | 含义                                                         |                                                        |
| ---- | ------------------------------------------------------------ | ------------------------------------------------------ |
| %a   | 本地简化星期名称                                             |                                                        |
| %A   | 本地完整星期名称                                             |                                                        |
| %b   | 本地本月简化名称                                             |                                                        |
| %B   | 本地本月完整名称                                             |                                                        |
| %c   | 本地相应的日期和时间表示                                     |                                                        |
| %d   | 一个月中的第几天（01-31）                                    |                                                        |
| %H   | 一天中的第几小时（00 - 23）                                  |                                                        |
| %I   | 第几小时  （01 - 12）                                        |                                                        |
| %j   | 一年中的第几天 （001 - 366）                                 |                                                        |
| %m   | 月份 01 -12                                                  |                                                        |
| %M   | 分钟数 00 - 59                                               |                                                        |
| %p   | 本地 AM 或者 PM 的相应符                                     | %p 只有 在和 %I 一起使用时才生效                       |
| %S   | 秒 00 - 61                                                   | 闰年时, 才为 60 61                                     |
| %U   | 一年中的星期数 00 - 53 ，周日为一周的开始，第一个星期天 之前的 所有 都是放在 第 00 周的 | strptime()使用时，只有 这年 天数 与周数 确定时才能计算 |
| %w   | 一星期中的 第几天 0 - 6                                      |                                                        |
| %W   | 基本 与 %U 相同 不同为  开始为周一                           |                                                        |
| %x   | 本地相应的日期                                               |                                                        |
| %X   | 本地相应的时间                                               |                                                        |
| %y   | 年份 00 - 99                                                 |                                                        |
| %Y   | 年份 完整年份 四位                                           |                                                        |
| %Z   | 时区的名字                                                   |                                                        |
| %%   | %                                                            |                                                        |

### 10.1.3 struct_time 元组

共有 9个元素： 

1. 年 tm_year 四位数年
2. 月 tm_mon 1 - 12
3. 日 tm_mday 1 - 31
4. 时 tm_hour  0 - 23
5. 分 tm_min 0 -59
6. 秒 tm_sec 0 - 61
7. 一周中的第几天  tm_wday 0 - 6
8. 一年中的第几天 tm_yday  1- 366
9. 是否为夏令时 tm_isdst  -1 0 1 是否决定夏令时的旗帜

## 10.2 time 模块

1970-01-01-8:00 开始为0 

### 10.2.1 time() 函数

```python
import time

print('%f' % time.time())
```

### 10.2.2 localtime(secs) 函数

将秒数  转换为 本地时区的 struct_time

```python
print(time.localtime())
# time.struct_time(tm_year=2020, tm_mon=1, tm_mday=27, tm_hour=23, tm_min=7, tm_sec=49, tm_wday=0, tm_yday=27, tm_isdst=0)
```



### 10.2.3 gmtime(secs) 函数

将 秒数 转换为 UTC (0时区)时区的 stuct_time

```python
print(time.gmtime())
print(time.gmtime(1))

# 由于时区问题
# time.struct_time(tm_year=2020, tm_mon=1, tm_mday=27, tm_hour=15, tm_min=5, tm_sec=15, tm_wday=0, tm_yday=27, tm_isdst=0)
# time.struct_time(tm_year=1970, tm_mon=1, tm_mday=1, tm_hour=0, tm_min=0, tm_sec=1, tm_wday=3, tm_yday=1, tm_isdst=0)
```

### 10.2.4 mktime(t) 函数

刚好 与 localtime  gmtime  相反的操作，将 struct_time  转换为 时间戳

### 10.2.5 asctime(t) 函数

将 时间 元组 转换为 字符串

```python
print(time.asctime(time.localtime()))
# Tue Jan 28 15:48:13 2020
```

### 10.2.6 ctime(secs) 函数

直接将 时间戳 转换为 asctime() 的格式

```python
print(time.ctime(time.time()))
# Tue Jan 28 15:48:13 2020
```

### 10.2.7 sleep(secs) 函数

用于线程的 睡眠 ，注意 参数是 秒，而不是 和 Java 的 毫秒

### 10.2.8 clock() 函数

用于 以 浮点数计算的秒数返回当前的 CPU 时间，用来衡量不同 程序的耗时，比 time.time()更有效

### 10.2.9 strftime(format[, t]) 函数

用于格式化 时间元组 为 对应格式的 字符串

```python
# 问题 不能使用 汉字，导致 编码格式错误
print(time.strftime('%Y %M %d %H %M %S s', time.localtime()))
```

### 10.2.10 strptime(str, format) 

将 str 转换为 对应  时间元组 ，与 strftime  刚好相反

### 10.2.11 三种时间格式转换

timestarmp struct_time format_str  之间的转换

## 10.3 datetime 模块

datetime  是 date 与 time的 结合，支持 0001(datetime.MINYEAR) 到 9999 (datetime.MAXYEAR) 年

定义的五个类：

1. date 表示日期  属性 year month day
2. time 表示 时间 属性 hour minutes second microsecond
3. datetime 表示 日期时间
4. timedelta 表示时间间隔 即两个时间点之间的 长度
5. tzinfo 时区相关信息

### 10.3.1 today()

```python
import datetime

# 第一个  datetime 表示 模块 
# 第二个 表示 这个模块中的 datetime 类
print(datetime.datetime.today())

```

### 10.3.2 now([tz]) 

tz 表示 时区参数 , 返回 与 today 一样 返回一个 datetime 对象

```python
print(datetime.datetime.now())
```

### 10.3.3 utcnow() 

返回 当前 utc 时区的 datetime 对象

### 10.3.4 fromtimestamp(timestamp[, tz])

更加时间戳 创建一个 datetime 对象。tz  指时区

```python
# 只能 最小为0  也就是 1970 -1-1 8：00
print(datetime.datetime.fromtimestamp(0))
```

### 10.3.5 utcfromtimestamp(timestamp)

创建当前时区的 datetime对象

### 10.3.6 stptime(date_time, format) 

将 datetime的对象字符串格式 转换为 对应的格式

### 10.3.7 strftime(fromat)

将格式化的 字符串 转换为 对应的 datetime 对象

datetime 对象调用



## 10.4 日历模块 Calendar

该模块的 函数 都与日历相关，并且 周一 是一周的开始，故而 如果使用 周末为开始 ，需要 `calendar.setfirstweekday()`

具体使用 略，如果 使用时 再查询就可以

