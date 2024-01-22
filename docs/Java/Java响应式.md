## rx lang

[reactivex](https://reactivex.io/languages.html)

[RxJava](https://github.com/ReactiveX/RxJava)

[rxjs](https://github.com/ReactiveX/rxjs)

[RxPY](https://github.com/ReactiveX/RxPY)

[RxGo](https://github.com/ReactiveX/RxGo)

## reactor

[reactor](https://github.com/reactor/reactor)

[reactive-streams-jvm](https://github.com/reactive-streams/reactive-streams-jvm)

## RxJava 入门

https://juejin.cn/post/6844903618538110983

https://juejin.cn/post/6966869287122239501

https://juejin.cn/post/6844903960684265479

## 反应式流 Reactive Streams 入门

https://zhuanlan.zhihu.com/p/95966853/

## 背压

https://blog.csdn.net/hdbdhdbh/article/details/132020862

## RxJava 装饰器：

`CustomObservable -> ObservableCreate<A> 装饰为 ObservableMap<A, B>`

`ObservableMap.subscribe subscribeActual 将 CustomObserver<B> 处理为 MapObserver<A, B> 使得 ObservableCreate.subscribe(MapObserver)`

被观察的 创建流程 正向 CustomObservable -> ObservableCreate -> ObservableMap

观察者的 创建流程 逆向 CustomObserver -> MapObserver

观察者回调流 onNext() 正向 CustomObservable.subscribe() ->  ObservableCreate.subscribe(MapObserver) -> ObservableMap.subscribe(CustomObserver)

## reactor:

基本同 RxJava， Flux/Mono -> Observable，

Mono表示要么就有一个元素，要么就只会产生完成和错误信号的Publisher

Flux定义了一个普通的响应式流，它可以产生零个，一个或多个元素，乃至无限个元素

Reactive Streams 是规范，Reactor 实现了 Reactive Streams。Web Flux 以 Reactor 为基础，实现 Web 领域的反应式编程框架

在 Web Flux，你的方法只需返回Mono或Flux即可。你的代码基本也只和Mono或Flux打交道。

而 Web Flux 则会实现Subscriber，onNext时将业务开发人员编写的Mono或Flux转换为 HTTP Response 返回给客户端。

## web flux 基本使用

https://zhuanlan.zhihu.com/p/559158740

https://blog.csdn.net/qq_38515961/article/details/124989725

## Web Flux 原理

https://blog.csdn.net/swg321321/article/details/131646701

## map flatmap concatMap 区别

https://www.cnblogs.com/daydreamer-fs/p/17587371.html