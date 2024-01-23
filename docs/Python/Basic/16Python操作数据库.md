[[TOC]]

# 第十六章 数据库操作

## 16.1 Python 数据库 API

也称为 DB-API

Python 所有数据库接口程序都 在 一定程度上 遵守 **Python DB-API** 规范。

定义了一些列必需的对象 和 数据库存取方式， 

### 16.1.1 全局变量

DB-API 规范数据库接口 模块 必须实现一些全局属性。



| 变量名       | 用途                     |
| ------------ | ------------------------ |
| apilevel     | 使用的 DBAPI 版本        |
| threadsafety | 模块的线程安全等级       |
| paramstyle   | sql 查询中使用的参数风格 |

apilevel 一个常量字符串，兼容的 版本最高号，不填 默认 1.0

threadsafety 整数：

0 表示不支持线程安全，多个线程不能共享此模块

1 初级线程安全支持，线程可以共享模块，但不能 共享连接

2 中级线程安全支持，线程可以共享模块和连接，但不能 共享 游标

3 高级线程安全支持，线程可以共享模块和连接、游标

paramstyle 表示 执行多次查询时，参数如何被拼接到SQL查询中。

format  标准字符串格式化，可以在拼接的地方插入 %s。

pyformt 表示格式大妈，用于字典拼接，如 %(foo)

qmark 使用问号

mumeric 使用 :1 :2 格式  数字表示参数序号

named 表示 :foobar  参数名称

### 16.1.2 异常

DB API 统一定义的异常

| 异常              | 超类          | 描述                         |
| ----------------- | ------------- | ---------------------------- |
| StandardError     |               | 所有异常的泛型基类           |
| Warning           | StandardError | 在非致命错误发生时引发       |
| Error             | StandardError | 错误异常基类                 |
| DatabaseError     | Error         | 数据库异常基类               |
| InterfaceError    | Error         | 数据接口异常                 |
| DataError         | DatabaseError | 处理数据时出错               |
| OperationalError  | DatabaseError | 数据库执行命令时出错         |
| IntergrityError   | DatabaseError | 数据完整性错误               |
| InternalError     | DatabaseError | 数据库内部出错               |
| ProgrammingError  | DatabaseError | SQL 执行失败                 |
| NotSupportedError | DatabaseError | 试图执行数据库不支持丢单特性 |



### 16.1.3 连接 和 游标

为了使用基础数据库系统，首先必须连接它。 连接的名称 connect 函数。 

该函数多个参数

| 参数名   | 描述                                  | 是否可选 |
| -------- | ------------------------------------- | -------- |
| dsn      | 数据源名称，给出 该参数表示数据库依赖 | 否       |
| user     | 用户名                                | 是       |
| password | 用户密码                              | 是       |
| host     | 主机名                                | 是       |
| database | 数据库名                              | 是       |

connect 函数 返回的对象，这个连接对象表示 目前和数据库的会话。

连接对象方法

| 方法名     | 描述               |
| ---------- | ------------------ |
| close()    | 关闭连接           |
| commit()   | 提交事务           |
| rollback() | 回滚事务           |
| cursor()   | 返回连接的游标对象 |

游标对象方法：

| 方法名称                  | 描述                                              |
| ------------------------- | ------------------------------------------------- |
| callproc(func[, args])    | 使用给定的名称和参数 可选 调用 已命名的数据库程序 |
| close()                   | 关闭游标后，游标不可用                            |
| execute(op[, args])       | 执行 SQL                                          |
| executemany(op. args)     | 对序列中的 每个参数执行 SQL 操作                  |
| fetchone()                | 把查询结果集中的下一行保存序列或None              |
| fetchmany([size])         | 获取查询结果集中的多行， 默认尺寸为 arraysize     |
| fetchall()                | 将 所有 剩余 行  作为序列的序列                   |
| nextset()                 | 调至下个 可用的 结果集                            |
| setinputsizes(sizes)      | 为 参数 预先第一内存区域                          |
| setoutputsize(size[,col]) | 获取最大数据值 设置缓冲区尺寸                     |

游标属性

| 属性名      | 描述                        |
| ----------- | --------------------------- |
| arraysize   | fetchmany 中返回的行数 只读 |
| description | 结果中描述的 序列  只读     |
| rowcount    | 结果中 行数  只读           |

### 16.1.4 类型

| 构造函数 和特殊值名称               | 描述                       |
| ----------------------------------- | -------------------------- |
| Date(yr, mo, dy)                    | 日期对象                   |
| Time(hr, min, sec)                  | 时间对象                   |
| Timestamp(yr, mo, dy, hr, min, sec) | 时间戳对象                 |
| DateFromTicks(ticks)                | 网络新纪元日期对象         |
| TimeFromTicks(ticks)                | xxx                        |
| TimestampFromTicks(ticks)           | xxx                        |
| Binary(string)                      | 对应二进制长字符串值对象   |
| STRING                              | 描述字符串列对象，VARCHAR  |
| BINARY                              | 描述二进制长对象 RAW　BOLB |
| NUMBER                              | 数字列对象                 |
| DATETIME                            | 日期时间对象               |
| ROWID                               | row ID 列对象              |

## 16.2 操作实例

略