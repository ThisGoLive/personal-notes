参考

https://juejin.cn/post/6996801799998930981

https://mp.weixin.qq.com/s/bh0WZB9FVAZ2i0V1tIaFmA

https://mp.weixin.qq.com/s/u31mfJfY9yUAJp-vQ9us2w

Redis 布隆（Bloom Filter）过滤器原理与实战

https://my.oschina.net/magebyte/blog/5512608

Redis 缓存击穿（失效）、缓存穿透、缓存雪崩解决

https://my.oschina.net/magebyte/blog/5510913

Redis的内存淘汰策略

https://zhuanlan.zhihu.com/p/105587132

Redis 内存满了怎么办？这样置才正确！

https://my.oschina.net/magebyte/blog/5518381

https://mp.weixin.qq.com/s/H7BN-gCvbJ2S2DT31XMzzQ

Redis 布隆（Bloom Filter）

https://mp.weixin.qq.com/s/pC93Edxe11c6PV4jg2Mvxg

数据一致性

https://my.oschina.net/magebyte/blog/5541328

## 问题

https://www.bilibili.com/video/BV1PA4y1D7Ry

### 01 单线程还是多线程

6.0 版本之前是指网络 IO 和键值对是由一个线程完成的

之后引入的多线程是指 网络请求过程采用多线程，键值对的读写还是单线程

### 02 为什么快

1. 内存操作
2. 单线程 没有线程谢欢开销
3. 基于IO多路复用机制 提示IO利用率
4. 搞笑的数据存储结构 全局Hash表 等 跳表 压缩表 链表

### 03 如何用跳表存储

有序集合 使用 有序链表进行，但是链表的查询效率低，于是在这个链表上构建了，每多个元素 构建索引，再在这个所以基础上进行再二元构建。类似减半查询

由于是有序链表，构建的多层索引也是有序的

### 04 Key 过期内存没施放

惰性删除：过期后，当再请求Key 时，就会检测 value 是否过期，如果是 就删除

定期删除：默认 每过 100ms 就会删除一部分，过期的value

### 05 key 没有设置过期 被删除

当redis被内存快满时，会通过设置的 淘汰策略进行删除

### 06 lru lfu

lru 最近最少使用：最近的访问时间

lfu 最不常使用：最近的访问次数

### 07 删除Key 会阻塞 redis吗

根据删除key的类型，字符串 快， 列表 集合等 根据元素多 就会阻塞

具体 还是看 数据的大小

### 08 主从 哨兵 集群优缺点

主从：缺 同步性、master 切换需要手动

主要是哨兵模式：自动切换，但是不是很快，master 下线后，切换过程中。 由于是单节点，还有 并发 问题，内存 不超10G 因为同步与 启动恢复数据 慢

3.0 的集群：多个主从节点，组成集群 统一提供服务，数据进行**分片**存储，分散到各个 主从节点

### 09 Redis集群 数据Hash分片算法

16384 个逻辑槽位，按照一个规则 一些区间设置给 各个主从节点

槽位定位算法 就是 将 CRC16(key ) mod 16384 ，得到的值 设置到 对于区间的

### 10 执行命令 死循环阻塞

5.0 前，设置最多执行 次数

randomkey 随机挑选key，

随机拿到的 key 如果是 拿到过期的 key ，根据删除key 策略，如果匹配到 定时删除key，那么就会继续找，当过期 key很多时，就会出现问题

slave 自己不会定期清理过期key，而是先 master 删除，发送 给 slave del 命令才行

如果在 slave中，randomkey 随机挑选key，过期的，就会等待

### 11 主从切换 导致 缓存雪崩

m 与 s 的时钟不同 而且差距大，那么就会出现问题，切换到 s 后，原本没有过期的 key 会被清理

### 12 持久化 RDB AOF 混合持久化

#### RDB快照

触发条件 内存数据通过快照全量持久化保存 dump.rdb

redis.conf 一定的触发条件 save 60 1000  60秒内有1000次写操作

redis save 命令持久化 同步操作

如果内存很多，就混繁忙，就会阻塞 请求，由于是同步，不会有 新的写 修改RDB

redis bgsave 异步 需要fork子进程，消耗性能

在 持久化过程中，如果 又有 修改 会同步修改 RDB

缺点：全量持久化 太费性能

#### AOF 策略  append only file

类似 增量

redis.conf appendonly yes

修改命令 会被写到 AOF RESP格式，恢复时 重新执行

执行时机：

appendfsync always 有命令就执行 可能 丢一条

appendfsync everysec 每秒一次，由于一秒延迟，所以 一秒触发时 挂了，就会丢失 （默认）

appendfsync no 不管，由 系统管理，更快 更不安全

缺点：AOF文件 是存储命令，多的时候，体积大 恢复速度慢

AOF 重写：重复的命令 递增命令，AOF文件超过一定的量时， 基于当前内存数据 重写

#### 4.0 混合持久化

AOF 重写的时候，不是将内存数据 RESP格式写入 AOF文件，而是 重写这一刻之前内存的 RDB快照处理，之后如果有 写，再按照 AOF 进行存放

### 13 线上持久化策略

slave 节点进行 AOF 备份，一秒一次

### 14 主从赋值风暴

主从 1vN  导致， 1VNvN

### 15 集群网络抖动导致频繁主从切换

片与片 的 master 通信出现问题，导致 ms 切换

集群节点超时时间

### 16 集群为什么 至少三个片 master

选举机制：半数以上的 master 选举 挂掉的分片 的子节点

### 17 主从切换导致分布式锁丢失 解决

red lock 

setnx key value ex 10s， 设置过期时间  redisson 

### redis 分布式锁死锁

1. 加锁后，没有施放锁

2. 加锁后程序没有执行施放锁，就挂了， 需要使用 key 过期机制

## Redis

#### ACP

一致 可用 分区耐受性

##### 持久化

AOF 

##### 主从

强一致性：写入主时，同步主给从写，等从写入成功后，A再返回，但是降低了 A的可用性

弱一致性：不等从的写，但是 可能 从没有写入，主直接挂了

最终一致性：可能具备延迟，主与从中间添加一个非常可靠的 服务 **分布式文件系统**

分布式文件系统 ： HDFS -->JN --> 集群方式 3.5.7  过半通过 zookeeper

实际zookeeper中，200ms 通过选举一出一个 leader，来对外提供服务， 主从集群，

也可以配置多台 redis, 由客户端 进行过半机制的判断

 综上，redis 做分布式锁，不很合适，而是选择 zookeeper
