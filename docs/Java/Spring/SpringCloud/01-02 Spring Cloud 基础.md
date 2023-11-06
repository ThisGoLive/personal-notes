[[TOC]]

# 第一章 基础知识

## 1.1 什么是微服务

系统架构上的一种设计风格，它的主旨是将一个原本独立的胸痛 拆分为 多个小型服务，这些小服务都在各自独立的进程中运行，服务之间基于通信协议（HTTP RPC）进行通信协作。

## 1.2 与单体服务的区别

**单体服务**

单体引用在初期虽然可以非常方便的进行开发和使用，但是随着系统的发展，维护成本会变得雨来越大，难以控制

**微服务**

运维人员维护压力：管理多部署多

接口的一致问题：业务拆分了，但是业务的依赖还是会存在，只是从单体应用中的代码变为了服务件的通信依赖。

分布式的复杂性：网络延迟、分布式事务、异步消息

## 1.3 微服务设计九大原则

### 1.3.1 服务组件化

组件：是一个可以独立更换和升级的单元，更换 与 升级不会影响到其他单元。

### 1.3.2 按业务组织团队

传统划分为：后端团队、前端团队、数据团队等。按照技术层面进行划分。

微服务中如果使用以上方法，当需要修改一个小东西时，往往各个团队所负责的都会修改，效率低下。

微服务团队：需要采用不同的团队分割方法。由每个微服务针对特定业务的宽栈或者全栈实现。即 单个微服务 需要什么技术，负责的团队里就得有。

### 1.3.3 做 产品 的态度

做**产品**的团队需要对产品的生命周期负责。而不是以 项目 模式，以交付给维护者为最终目的。

### 1.3.4 智能端点与哑管道

微服务之间的通信问题，

使用 HTTP 的 restful API 或者 轻量级的消息协议发送

通过轻量级消息总线上 传递消息，类似 RabbitMQ 等一些提供可靠异步交换的中间件

### 1.3.5 去中心化治理

当采用 集中化的框架治理方案时，通常在技术平台上都会控制统一的标准，但是每一种技术平台都有其短板，

### 1.3.6 去中心化管理数据

### 1.3.7 基础设施自动化

### 1.3.8 容错设计

### 1.3.9 演进式设计

对于没有经验的小团队来说，更复杂

演化式：

在项目初期使用**单体系统**，系统初期 体量不大，构建、维护成本不高

再随着业务发展需要，将一些经常变动 或者 有一定事件效应的内容进行微服务处理，逐步 拆分处理

## 1.4 Spring Cloud 优势

整合、稳定、版本统一

## 1.5 Spring Cloud 简介

一个 基于 Spring Boot实现的微服务框架开发工具。为微服务中涉及的：**配置管理、服务治理、断路器、智能路由、控制总线、全局锁、决策竞选、分布式会话 和 集群状态**等操作听哦了一种简单的方式

1. Spring Cloud Config ： 配置管理工具，支持使用 GIT 存储配置内容，可以是哦也能够它实现应用配置的外部化存储，并且支持客户端配置信息刷新 加密解密等
2. Spring Cloud Netflix : 核心组件，对多个 Netflix OSS 开源套件进行整合
   1. Eureka ： 服务治理中心组件，包含 **服务注册中心** **服务注册** 与 **发现机制**
   2. Hystrix：容器管理组件，实现断路器模式，帮助 服务依赖中出现的延迟和为服务故障提供容错
   3. Ribbon ： 客户端 负载均衡调用组件
   4. Feign ： 基于 Ribbon 和 Hystrix 的声明式 服务调用组件
   5. Zuul：网关组件，提供自能路由 访问过滤 等 功能
   6. Archaius : 外部化配置组件
3. Spring Cloud Bus ： 事件、消息总线，用于传播集群中的状态变化或者事件，以触发后续的处理，比如用来动态刷新配置
4. Spring Cloud Cluster ： 针对 ZooKeeper Redis Hazelcast Consul 的选举算法和 通用状态模式的实现
5. Spring Cloud Consul ：服务发现 与 配置管理工具
6. Spring Cloud Stream ： 通过 Redistribution Rabbit 或者在 Kafka 实现 消费微服务，通过简单的声明式模型来发送 和接收消息
7. Spring Cloud AWS ：用于简化整合 Amazon Web Service 的组件
8. Spring Cloud Security ： 安全工具，提供在 Zuul 代理中 对 OAuth2 客户端请求的中继器
9. Spring Cloud  Sleuth ： Spring Cloud 应用的分布式跟踪实现，可以完美整合 Zipkin
10. Spring Cloud Starters ：Spring Cloud 的基础组件，基于 Spring Boot风格项目的基础依赖模块
11. Spring Cloud CLI ：用于 在 Groovy 中快速创建 Spring Cloud  应用的 Spring boot CLI 插件

# 第二章 微服务构建 Spring Boot

Spring Boot 基本使用参考 Spring Boot。

## 补充 配置问题

多环境配置：

appalication.properties 或者 appalication.yml

为必加载文件，当**spring.profiles.active=xx** 时会去加载对应名称 的 **appalication-xx.properties/yml** 

```yaml
# 当前项目maven激活环境，例如：local/dev/test，对应pom.xml中profile设置值
---
spring:
  profiles:
    active: '@profileActive@'
```

```xml
    <!--MAVEN打包选择运行环境-->
    <!-- 1:local(默认) 本地 2:dev:开发环境 3:test 4:uat 用户验收测试 5.prod:生产环境 -->
    <profiles>
        <profile>
            <id>local</id>
            <properties>
                <profileActive>local</profileActive>
            </properties>
            <activation>
                <activeByDefault>true</activeByDefault>
            </activation>
        </profile>
	</profiles>
```

## 补充 加载顺序

当服务多了 多环境配置多了，就非常不利于 维护。所以后续 有了 配置中心。

Spring Boot 配置的加载顺序：

1. 在命令行传入的参数
2. SPRING_APPLICATION_JSON 中属性。SPRING_APPLICATION_JSON 是以 JSON 格式配置在系统环境变量中的内容
3. java:comp/env 中 JNDI 属性
4. Java 系统属性，通过 System.getProperties 获得
5. 操作系统环境变量
6. 通过 random.* 配置的随机属性
7. 位于当前应用 jar 包之**外**，针对不同 {profile} 环境的配置文件内容。如 application-xx.xxx
8. 位于当前应用 jar 包之**内**，针对不同 {profile} 环境的配置文件内容。如 application-xx.xxx
9. 位于当前应用 jar 包之**外**，环境的配置文件内容。如 application-xx.xxx
10. 位于当前应用 jar 包之**内**，环境的配置文件内容。如 application-xx.xxx
11. 在 @Configuration 注解 修改的类中，通过@PropertySource 注解定义的属性
12. 应用默认属性，使用 SpringApplication.SetDefaultProperties 定义内容

优先级越后，就会覆盖之前的







