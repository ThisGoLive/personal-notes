强引用 略

**软引用** 当内存不够时GC掉，用处 是大对象的

**弱引用** 只有弱引用指向的对象，就会GC， 用来处理 内存泄漏问题 ThreadLocal

**虚引用** 几乎没有， 用来 管理堆外内存（才做系统直接的内存 例如 DirectByteBuffer），这个内存不是JVM 管理的，当这个使用堆外内存对象引用被GC时，写入 queue ，然后GC线程处理这个堆外内存

```java
PhantomReference<Object> p = new PhantomReference<>(new Object(), queue);
// 当虚引用被回收时，信息会被加入到queue，
```

### ThreadLocal

spring 事务管理就是 用的ThreadLocal，每个线程单独有一份数据空间，ThreadLocal firstKey弱引用作为 key

ThreadLocal 内部 维护一个  ThreadLocalMap ，key ThreadLocal 的 弱引用，value 数据空间

这个Map 在初始化的时候，会被设置给线程中，所以一个线程只能设置一个ThreadLocal 

ThreadLocal 的内存泄露：当 线程结束后，但是线程没有被回收时，线程内部的map 还存在，ThreadLocal引用被设置为空，如果 Map 中的Key强引用指向ThreadLocal，那么就永远没法被回收，所以使用 弱引用。

value 就会出现这个问题，所以 ThreadLocal#remove

https://mp.weixin.qq.com/s/3mZS7Mrnk6ugjgltfxgdlQ