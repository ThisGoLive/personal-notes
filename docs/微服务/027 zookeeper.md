zookeeper 分布式协调服务

自带高可用协调光环

实际zookeeper中，200ms 通过选举一出一个 leader，来对外提供服务， 主从集群，

### 实现分布式锁

临时节点 ： 如：创建 lock目录下N个节点，ZK集群就会创建顺序节点，节点名依次递增， 例如创建了一个 /lock-test/000001

顺序节点 ： 某个客户端创建，当客户端与ZK集群断开连接，该节点删除。

1. 客户端1 调用create()方法创建名称为 “/业务ID/lock-”的临时节点

2. 客户端1 调用 getChildren("业务ID")方法 获取所有已经创建的节点

3. 客户端1 获取所有子节点path后，发现自己步骤一中创建的临时节点，是否所有节点中序号最小的？就看自己创建的序列号是否排第一，如果是第一，那么就获取锁，

4. 如果创建的节点不是所有节点中最小的，则监视 比自己创建节点序列号小的最大节点，进入等待。直达变动

5. 使用Zookeeper集群，锁原理是使用 Zookeeper的临时顺序节点，临时顺序节点的生命周期在 Client 与 集群的Session结束时结束。因此某天个 Client 节点存在网络问题，与 Zookeeper 集群断开连接，Session超时同样会导致锁被错误施放，因此 Zookeeper 无法保证完全一致性

6. Zookeeper 聚麀较好的稳定性，影响时间抖动小，没有出现异常。但是随着并发 和 业务梳理的提升影响时间和QPS会下降

### 如何选举很快？

myid zxid（事务ID），zxid 最大就选，同选 myid   

### ZAB 工作原理

#### 1. Leader选举过程

状态：Looking Leading Following

选举规则 优先级 epoch(时代) > counter(计数器) > SID (事物ID)

Looking 的服务按照 选举规则 进行投票给各个拉票服务最合适的。超过半数

选举出的 Leader ，状态为 Leading ，其他的 为 Following， 并且 epoch 增加一

#### 2. 原子广播

proposal 

新 Leader 会提交 前任Leader 未提交的信息，Raft 是Leader 强一致，不会提交。

而 counter 就是 消息的 计算器。

集群中 含有未提交信息的服务都挂了，剩下的 服务选出的Leader，没发提交 前Leader 未提交的信息，那么就会 广播自己的 proposal，此时含有 前Leader 未提交的消息 以 Following 加入，只有 放弃自己的未提交消息

#### 3.与 Raft 差异

Rate 谁先超时，谁先发起选举拉票

ZAB 即 counter 比较
