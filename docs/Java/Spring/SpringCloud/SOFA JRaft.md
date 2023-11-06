# SOFA JRaft

SOFAJRaft 是 Raft 算法的 Java 实现

## Raft

共识算法：

+ 多个参与者针对一件事达成完全一致：一个事情 一个结论

+ 已经达成的一致结论，不可推翻

raft特点：

+ Strong Leader 整个集群只有一个 Leader

+ Leader election 通过算法 随机进行选举

+ Membership changes 全员变化，如果集群有节点加入或者退出，整个集群不会受影响

## 一致状态机 复制状态机

![一致状态机](https://www.sofastack.tech/projects/sofa-jraft/overview/raft.png)

+ 保证被复制的日志的内容一致

+ 保证被复制的日志顺序一致

共识算法就是保证上边两个一致

## SOFA JRaft 结构图

Node 就表示实际的 服务节点 Leader

Closure 用户请求到达 Node , 然后转换成 Log

Replicator 将Log 分发给 对应的 Follower 节点

当超过半数的 Follower 返回接受完成，主节点 执行请求指令 然后返回给 客户端

快照是 为了 新增节点时，避免 全量加载Log，而给出的某个时间点的快照

![SOFA JRaft 结构图](https://www.sofastack.tech/projects/sofa-jraft/engine-architecture/engine.png)

存储：

+ Log Storage

+ Log Manager

Raft Metadata 存储

+ 元数据存储

Snapshot 存储

+ Snapshot Storage

+ Snapshot Executor

状态机 StateMachine

+ 用户的核心逻辑的实现

FSM Caller 调用者

+ 封装对 状态机的调用

复制

+ Replicator 用于Leader 向 Followers 复制Log，有多少个 Follower 就会有多少个 Replicator

+ ReplicatorGroup 

RPC Clien RPC Server：节点之间的通信 底层实现

### StateMachine 状态机

把用户的指令 转换成 Log，以及 将日志的执行，以及执行结果

接口 `onApply(iterator)` 把Log日志 执行

onSnapshotLoad onSnapshotSave 快照的保存于加载

还需要实现 Snapshot 具体的实现，以及 用户读请求 与写请求

## 例子

https://www.sofastack.tech/projects/sofa-jraft/counter-example/

## SOFA JRaft 的任务

1. Leader 选举

2. Leader 与 Follwer 的数据同步

3. Follwer 半数以上节点响应

## 用户实现内容

1. Request 业务请求

2. Response 业务响应

3. Processor 处理业务请求
   
   1. handleRequest 处理请求的接口，分别对应 request 的类型，及多个 请求多个 处理逻辑

4. StateMachine 业务状态机
   
   1. onApply 执行 Task 更新状态机
   
   2. onSnapshotLoad onSnapshotSave 快照的保存于加载
   
   3. onLeaderStart onLeaderStop 该节点成为Leader 或者不为转换为非Leader时调用

5. Closure 回调函数接口

## 几个标识

commint log index 已经复制的日志标识

applyIndex leader已经运算的日志 标识
