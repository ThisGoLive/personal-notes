# 01 Redis 简介

Remote dictionary server   远程字典服务

## 特点

1. 数据没有必要关联
2. 单线程 原子性强
3. 性能强
4. 多数据支持  基础 为 （string list hash set sortsed_set）
5. 持久化 灾难恢复

## 应用

+ 热点查询
+ 任务队列： 秒杀 抢购
+ 即时信息查询 ： 排行榜 访问统计 公交信息
+ 时效信息控制：验证码 控制
+ 分布式 数据共享  分布式集群中 session tonken
+ 消息队列
+ 分布式锁

