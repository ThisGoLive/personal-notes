[[TOC]]

# 1 基本概念

## 1.1 微服务 概念

Netfix 家的：

注册中心 Eureka（E瑞卡）

服务之间使用 Fegin (fei) 调用，Fegin  中包含集成了Ribbon（瑞并） 作为负载均衡，还包含 Hystrix (嗨四瑞克斯) 作为熔断。

Getway Zuul 网关组件

常见的 注册中心

1. Eureka（Spring Cloud 原生， 1.x 维护）
2. Zookeeper （支持 专业的 独立产品，  如 dubbo）
3. Consul （原生  Go语言开发）
4. Nacos

## 1.2 Nacos

Nacos ： 注册中心 + 配置中心（不重启 权限控制 版本回滚）

致力于发现 配置 管理 微服务。

+ 通过 Nacos Server 和 spring-cloud-starter-alibaba-config 实现 配置的动态变更
+ 通过 Nacos Server 和 spring-cloud-starter-alibaba-discovery 实现 服务的注册与发现

功能：

1. 服务的发现与健康监测
2. 动态配置服务
3. 动态DNS（解析域名） 服务
4. 服务及其元数据管理

# 2 开始

Nacos 是直接开启的服务，不是 像Eureka 那样 需要单独建立一个工程模块引入包进行使用。