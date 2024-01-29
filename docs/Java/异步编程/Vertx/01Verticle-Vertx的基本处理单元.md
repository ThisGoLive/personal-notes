# Verticle-Vertx的基本处理单元
2024-01-29

## 1 创建Verticle

事件处理

```java
vertx.deployVerticle("com.example.demo_vertx.XXVerticle",
          new DeploymentOptions().setConfig(result));
vertx.deployVerticle(new XXVerticle(),
          new DeploymentOptions().setConfig(result));
```

## 2 线程问题

Verticle 运行在 
1. 事件循环线程（eventloop）上，并且默认固定为CPU核心的两倍。不能进行动态变动。
2. 每个 Verticle 固定运行在固定的 线程上。多个 共享一个线程。
3. 如果其中执行了 阻塞逻辑，默认两秒就会报错。

解决办法：
1. `WorkVerticle` 即 创建时的 `DeploymentOptions` 设置 `setWorker` ，但是容易出错。设置后 整个 Verticle 运行在 工作线程（worker）上
2. 使用 `Vertx#executeBlocking` , 阻塞逻辑 交由 工作线程处理，完成后 由 事件循环线程处理。

## 3 Verticle内部结构

1. Vertx 实例引用， Vertx 也被其他 Verticle 引用
2. Context 实例，记录Verticle的上下文信息。由它接收事件，将事件派发到 **事件循环线程** 与 **工作线程** 处理。事件循环线程能确定始终一个，工作线程不能。

### 3.1 Verticle的Context 

虽然 Context 总与 Verticle 相关，但是可以 直接 `Vertx#getOrCreateContext`  进行获取，如果为 非 vertx 上下文中调用，会创建一个

```java
// 主线程执行，分配了一个 循环线程执行
vertx.getOrCreateContext().runOnContext(event -> );
```

`Context#exceptionHandler` 进行异常处理。可以覆盖默认Verticle的处理逻辑。

### 3.2 桥接 Vertx 线程与非 Vertx 线程

通常情况下不必使用 Context。但是 如果 使用了第三方代码，而且 是内置了自己的线程模型，想让两种进行沟通协同时。

第三方逻辑，传入 Context ,再调用 `Context#runOnContext`