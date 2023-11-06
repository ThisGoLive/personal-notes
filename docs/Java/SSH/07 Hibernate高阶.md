[[TOC]]

# 第七章 ： Hibernate 高阶

2019年7月22日 - 2019年7月30日

## 7.1 检索策略

上一章 基本你了解了 Hibernate 的session检索 有 `load ` 与 `get`，两种 并按照 指定的UI小标识符号 OID 来加载一个持久化对象。

检索 包含：

**类级别检索**：即对 类对象本身的检索，检索策略包含：立即加载 与 延迟加载

**关联级别检索：**指 对当前对象的关联对象的检索。策略包含：立即加载、延迟加载、预先加载

## 7.2 类级别检索

默认为立即加载，使用 `session.get(xxx)` 或者 当 `calss`元素配置 lazy属性 为 false时，使用的 `load`。

延迟加载即为 当 `calss`元素配置 lazy属性 为 true时，使用的 `load`。

延迟逻辑：

1. Hibernate 在 运行时动态扩展需要检索的类，并继承。
2. 当创建实例时，仅仅初始化了 OID 。其余属性全部为空，因此占用内存很少。
3. 当 应用程序 使用该实例时，调用 属性 set/get 时，Hibernate 才会去初始化实例。

注意： 

+ 当 数据库中不存在数据时，load不会报错，只有在使用 具体 函数时才会
+ 如果 在session范围内，没有访问过 实例，那么其代理类的实例不会被初始化，不会执行 任何select 语句。
+ Hibernate 类的 `initialize()` 静态方法用于 在 session范围内显示初始化代理类实例， `isInitialized()`函数 用于判断 代理实例 是否被初始化
+ 程序调用 `getOID` 类型的函数时，不会触发初始化

## 7.3 1-N检索策略

+ 立即加载
+ 延迟加载
+ 预先加载

在 1-N 或者 N-N 时，使用 set 标签进行维护。使用 lazy 属性 为 false true 来控制，立即加载或者延迟加载。

### 7.3.2 批量检索

set 标签 有个 `batch-size`属性，用于延迟加载或者立即加载策略时，设定批量检索的数量，批量检索可以减少  `select`语句的数目，提高延迟或者立即加载的性能。

即 当 set 集合 有N个时，配置的 batch-size n就可以 一次select 查询出n，执行 N/n 次

### 7.3.3 预先抓取

预先抓取指，Hibernate 通过 select 语句，使用 ` outer join` 外连接，一般是左外联，来获取对象的关联实例或者关联集合，但是 过程 不简单的连接。所以才是 **预先抓取 **

+ 立即加载：检索时立即加载
+ 延迟加载：创建一个代理，只有在使用实际属性时，才会加载
+ 预先加载：使用的 select 都不同

| lazy 属性 | fetch 属性 | 检索策略                                                     |
| --------- | ---------- | ------------------------------------------------------------ |
| false     | select     | 立即加载，当使用  Hibernate 的二级缓存时，可以考虑立即加载方式 |
| false     | join       | 预先加载，Hibernate 4 默认                                   |
| true      | join       | 预先加载，预先加载 的优先级 高于 延迟加载                    |
| true      | select     | 延迟加载                                                     |

当 HQL 语句  使用了 join 时，而 对应 属性对象 无论配置的什么策略，都将失效。外连接 必定会 初始化 属性对象，但是如果 配置文件里对 该类型为 延迟加载时，主类 为了 获得 属性对象的 引用，需要 再执行 一个SQL 来确定 引用关系。为集合时 常出现

## 7.4 关联检索策略

当 N-1 ，1-1 时，有 fetch 属性

| many-to-one / one-to-one 的 fetch属性 | class 的 lazy 属性 | 检索策略 |
| ------------------------------------- | ------------------ | -------- |
| join                                  | true               | 预先加载 |
| join                                  | false              | 预先加载 |
| select                                | true               | 延迟加载 |
| select                                | false              | 立即加载 |

## 7.5 预先抓取的显示指定

**抓取时机**

Hibernate ，对于集合类型的关联在默认情况下，会使用**延迟集合加载**的抓取时机，而对于返回单值类型的关联在默认情况下会使用**延迟代理抓取**的抓取时机

抓取时机，在时机开发中很少用到，可能会造成数据库不必要的操作。当 宿主对象与 关联对象 同时被访问时，才可能会用到。

延迟 加载 还会有一个问题，如果 session 关闭前，关联的对象没有被实例化，就会报空。

通常情况下 还是 使用 延迟加载

**抓取策略**

通常情况下都针对每个查询来指定对其合适的抓取策略

```java
session.createCriteria(class).setFetchMode("",FetchMode.JOIN)....
```

## 7.6 c3p0 说明

| 属性                       | 效果                                                         |
| -------------------------- | ------------------------------------------------------------ |
| acquireIncrement           | 当连接池中连接耗尽时，一次同时新增的连接数。默认 3           |
| acquireRetryAttempts       | 定义在从数据库中获取连接失败后重复尝试的次数。默认 30        |
| acquireRetryDelay          | l两次连接中间间隔时间 毫秒 默认 1000                         |
| autoCommitOnClose          | 连接关闭时默认将所有未提交操作回滚 默认 false                |
| automaticTestTable         | C3P0将创建test新表，使用自带的查询语句进行测试，如果定义了这个参数，那么 preferredTestQuery 将被忽略。不能在 test 表中任何操作。默认 null |
| breakAfterAcquireFailure   | 获取连接失败将会引起所有等待连接池来获取连接的线程抛出异常。但数据源 依然保留，下次 使用 getConnection（）时，依旧尝试连接，如果 设置为 true ，数据源永久关闭 |
| checkoutTimeout            | 当连接池用完时，客户端调用 getConnection 后等待获取新连接的事件，超时抛出异常，设置为0 为一致等待，单位 毫秒。 默认 0 |
| connectionTesterClassName  | 通过实现 ConnectionTester 或 QueryConnectionTester 的类来测试连接，类名需要全路径。默认 com.mchange.v2.c3p0.impl.DefaultConnectionTester |
| factoryClassLocation       | 指定 c3p0 libraries 路径，在本地即可获取，即不需要设置。默认 null |
| idleConnectionTestPeriod   | 每 60 秒检查所有连接池中空闲连接，默认                       |
| initialPoolSize            | 初始化 时 连接数，取值在 minPoolSize 与 maxPoolSize 之间。 默认 3 |
| maxIdleTIme                | 最大空闲时间，60 秒内未使用连接 就被抛弃，0 时 不失效        |
| maxPoolSize                | 连接池中 保留最大 连接数                                     |
| maxStatements              | JDBC的保留参数                                               |
| maxStatementsPerConnection | 定义了 连接池 内单个连接所拥有的最大缓存 statement 数 默认 0 |
| numHelperThreads           | C3P0 是异步操作。缓慢的JDBC 操作 通过 进程完成。扩展这些操作可以有效提升性能，通过多线程实现多个操作同时被执行。 默认 3 |
| overrideDefaultUser        | 主要用于 连接池 连接非 c3p0 数据源时                         |
| overrideDefaultPassword    | 同上                                                         |
| preferredTestQuery         | 定义所有连接测试 都 执行的测试语句。在使用连接测试的情况下这可以显著提升测试速度 |
| propertyCycle              | 用户修改 系统配置参数执行前最多等待 300 秒 默认 300          |
| testConnectionOnCheckout   | 因性能消耗大                                                 |
| testConnectionOnCheckin    | 设置为 true 时，那么在取得连接的同时将校验连接的有效性 默认 false |

