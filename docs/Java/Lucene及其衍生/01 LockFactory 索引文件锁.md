# LockFactory索引文件锁

2023年3月26日

## 1 参考资料

[索引文件锁LockFactory](https://amazingkoala.com.cn/Lucene/Store/2019/0604/%E7%B4%A2%E5%BC%95%E6%96%87%E4%BB%B6%E9%94%81LockFactory/)

## 2 LockFactory概念

用来对**索引文件**所在的**目录**进行**加锁**

使得同一时间总是只有一个IndexWriter对象可以更改索引文件，即保证单进程内(single in-process)多个不同IndexWriter对象互斥更改

```java
public abstract class LockFactory {
    public LockFactory() {
    }
    // 尝试获取这个 目录的锁对象
    public abstract Lock obtainLock(Directory var1, String var2) throws IOException;
}

public abstract class Lock implements Closeable {
    public Lock() {
    }
    // 锁上
    public abstract void close() throws IOException;
    // 合法性 上锁
    public abstract void ensureValid() throws IOException;
}
```

## 3 常见实现

### 3.1 NoLockFactroy

没有锁的实现

### 3.2 SingleInstanceLockFactory

RAMDirectory 默认使用的索引文件锁，对于相同 RAMDirectory 对象的 多个 IndexWriter 对象，达到相互之间是对索引文件是互斥更改。

因为 使用 LockFactory#obtainLock时，lockName 都是 IndexWriter 默认的 **WRITE_LOCK_NAME**，始终获取的是同一把锁。

### 3.3 FSLockFactory

提供两个子类给 FSDiectory 作为索引文件锁。

#### NativeFSLockFactory 默认使用

在目录生成一个`write.lock`文件

#### SimpleFSLockFactory

该类通过在索引文件所在目录创建一个名为`write.lock`文件的方式来实现索引文件锁，该方法的缺点在于如果JVM异常退出，那么索引文件锁可能无法被释放，即没有删除`write.lock`文件。

#### SimpleFSLockFactory与NativeFSLockFactory各自的特点

| 名称       | 性能    | 兼容性              | JVM异常                            |
| -------- | ----- | ---------------- | -------------------------------- |
| Simpfs   | 良     | 优                | 锁文件可能不会被删除                       |
| NativeFs | nio 优 | nio NFS下无法获取lock | 它只关心write.lock是否被其他进程占用，异常后会自动释放 |
