# 响应式编程

2024年3月5日

## 1 JDK8 StreamAPI

```java
Stream.of(1, 2, 3, 4, 5).filter(i -> i % 2 == 0).map(i -> i * 2).forEach(System.out::println);
```

## 2 Reactive-Stream

[反应式流 Reactive Streams 入门介绍](https://zhuanlan.zhihu.com/p/95966853/)

`java.util.concurrent.Flow`

或者

```xml
<dependency>
  <groupId>org.reactivestreams</groupId>
  <artifactId>reactive-streams</artifactId>
  <version>1.0.4</version>
</dependency>
```

- Publisher 事件发布者
- Subscriber 事件订阅者（观察者）
- Subscription 订阅关系
- Processor 处理器

```java
    class NewProcessor extends SubmissionPublisher<Integer> implements Flow.Processor<Integer, Integer> {
      @Override
      public void onSubscribe(Flow.Subscription subscription) { subscription.request(100);}
      @Override
      public void onNext(Integer item) {
        System.out.println(item);
        this.submit(item * item);
      }
      @Override
      public void onError(Throwable throwable) {}
      @Override
      public void onComplete() {}
    }
    Flow.Processor<Integer, Integer> processor = new NewProcessor();

    SubmissionPublisher<Integer> publisher = new SubmissionPublisher<>();
    Flow.Subscriber<Integer> subscriber = new Flow.Subscriber<>() {
      @Override
      public void onSubscribe(Flow.Subscription subscription) {
        subscription.request(100);
      }
      @Override
      public void onNext(Integer item) {
        System.out.println(item);
      }
      @Override
      public void onError(Throwable throwable) {}
      @Override
      public void onComplete() {}
    };
    // 将 subscriber 包装到 BufferedSubscription 中，订阅关系管理链表
    // publisher.subscribe(subscriber);

    // processor 处理器，做中间转发，作为订阅者 处理 发布者的信息，又作为发布者，将之前处理的信息 发布
    processor.subscribe(subscriber);
    publisher.subscribe(processor);
    publisher.submit(2);
    try {
      Thread.sleep(2_000);
    } catch (InterruptedException e) {
      throw new RuntimeException(e);
    }
```

## 3 Reactor

[Reactor](https://projectreactor.io/)

[Reactor github](https://github.com/reactor/reactor)

[reactive-streams-jvm](https://github.com/reactive-streams/reactive-streams-jvm)

[Flux中的map、flatMap、concatMap的区别](https://www.cnblogs.com/daydreamer-fs/p/17587371.html)

基本同 RxJava， Flux/Mono -> Observable，

Mono 表示要么就有一个元素，要么就只会产生完成和错误信号的 Publisher

Flux 定义了一个普通的响应式流，它可以产生零个，一个或多个元素，乃至无限个元素

Reactive Streams 是规范，Reactor 实现了 Reactive Streams。Web Flux 以 Reactor 为基础，实现 Web 领域的反应式编程框架

在 Web Flux，你的方法只需返回 Mono 或 Flux 即可。你的代码基本也只和 Mono 或 Flux 打交道。

而 Web Flux 则会实现 Subscriber，onNext 时将业务开发人员编写的 Mono 或 Flux 转换为 HTTP Response 返回给客户端。

## Web Flux

[Spring WebFlux 实现原理与架构图](https://blog.csdn.net/swg321321/article/details/131646701)

[一文弄懂 Spring WebFlux 的来龙去脉](https://zhuanlan.zhihu.com/p/559158740)

[Spring WebFlux编写响应式Controller接口](https://blog.csdn.net/qq_38515961/article/details/124989725)
