# RxLang

2024 年 3 月 5 日

## rx lang

[reactivex](https://reactivex.io/languages.html)

[RxJava](https://github.com/ReactiveX/RxJava)

[rxjs](https://github.com/ReactiveX/rxjs)

[RxPY](https://github.com/ReactiveX/RxPY)

[RxGo](https://github.com/ReactiveX/RxGo)

## RxJava 入门

https://juejin.cn/post/6844903618538110983

https://juejin.cn/post/6966869287122239501

https://juejin.cn/post/6844903960684265479

## 背压

https://blog.csdn.net/hdbdhdbh/article/details/132020862

## RxJava 装饰器

`CustomObservable -> ObservableCreate<A> 装饰为 ObservableMap<A, B>`

`ObservableMap.subscribe subscribeActual 将 CustomObserver<B> 处理为 MapObserver<A, B> 使得 ObservableCreate.subscribe(MapObserver)`

被观察的 创建流程 正向 CustomObservable -> ObservableCreate -> ObservableMap

观察者的 创建流程 逆向 CustomObserver -> MapObserver

观察者回调流 onNext() 正向 CustomObservable.subscribe() ->  ObservableCreate.subscribe(MapObserver) -> ObservableMap.subscribe(CustomObserver)
