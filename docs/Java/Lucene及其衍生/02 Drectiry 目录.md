# Directory 目录类

2023年3月26日

## 1 参考资料

[Directory(上)](https://amazingkoala.com.cn/Lucene/Store/2019/0613/Directory%EF%BC%88%E4%B8%8A%EF%BC%89/)

[Directory（下）](https://amazingkoala.com.cn/Lucene/Store/2019/0615/Directory%EF%BC%88%E4%B8%8B%EF%BC%89/)

## 2 Directory 概念

**org.apache.lucene.store.Directory** 该类用来维护索引目录中的索引文件。

定义了**创建**、**打开**、**删除**、**读取**、**重命名**、**同步**(持久化索引文件至磁盘)、**校验和**（checksum computing）等抽象方法。

## 3 BaseDirectory

提供了其子类共有的**获取索引文件锁LockFactory**的方法

### 3.1 FSDirectory

抽象实现 提供了其子类共有的**创建**、**删除**、**重命名**、**同步**(持久化索引文件至磁盘)、**校验和**（checksum computing）等方法

#### 3.1.1 SimpleFSDirectory

在 9.5 中已经删除

- 打开索引文件：使用Files的[newByteChannel](https://docs.oracle.com/javase/8/docs/api/java/nio/file/Files.html)方法来`打开`一个索引文件，比如说通过DirectoryReader.open(IndexWriter)读取索引文件信息会调用此方法
- 读取索引文件：使用FileChannelImpl`读取`索引文件，使得可以随机访问索引文件的一块连续数据。

不支持多线程读取同一个索引

#### 3.1.2 NIOFSDirectory

- 打开索引文件：使用Files的[FileChannel.open](https://docs.oracle.com/javase/8/docs/api/java/nio/channels/FileChannel.html)方法来`打开`一个索引文件
- 读取索引文件：使用FileChannelImpl`读取`索引文件，使得可以随机访问索引文件的一块连续数据。

#### 3.1.3 MMapDirectory

- 打开索引文件：使用 **内存映射**(memory mapping) 功能来`打开`一个索引文件，例如初始化MMapDirectory时，如果索引目录中已存在合法的索引文件，那么将这些文件尽可能的都映射到内存中，或者通过DirectoryReader.open(IndexWriter)读取索引文件信息会打开IndexWriter收集的索引文件数据
- 读取索引文件：将索引文件全部读取到内存中(如果索引文件在磁盘上)

#### 3.1.4 如何选择FSDirectory

默认情况下：

| 名称                | JRE_IS_64BIT && UNMAP_SUPPORTED | wind | other |
| ----------------- | ------------------------------- | ---- | ----- |
| MMapDirectory     | √                               |      |       |
| SimpleFSDirectory |                                 | √    |       |
| NIOFSDirectory    |                                 |      | √     |

### 3.2 ByteBuffersDirectory

BaseDirectory 的实现，使用 ConcurrentHashMap 作为存储源。

### 3.3 RAMDirectory

使用字节数组来存储， 最多1024个字节。9.5 中已经删除

## 4 FilterDirectory

抽象类，它的子类对封装的Directory类增加了不同的限制(limitation)来实现高级功能。

更多是功能上的扩展。

### 4.1 SleepingLockWrapper

索引目录同一时间只允许一个IndexWriter对象进行操作，此时另一个IndexWriter对象(不同的引用)操作该目录时会抛出LockObtainFailedException异常。

该实现，会捕获异常，默认等待1秒。如果重试次数过后还无法获取，就抛出异常 LockObtainFailedException

### 4.2 TrackingTmpOutputDirectoryWrapper

该类用来记录新创建临时索引文件，即带有.tmp后缀的文件。

在**两阶段生成索引文件之第一阶段**中可以知道，IndexWriter在调用addDocument()的方法时，**flush()或者commit()前**，就会生成.fdx、.fdt以及.tvd、.tvx索引文件，而如果IndexWriter配置IndexSort，那么在上述期间内就只会生成临时的索引文件，TrackingTmpOutputDirectoryWrapper会记录这些临时索引文件，在后面介绍IndexWriter时会展开介绍

### 4.3 TrackingDirectoryWrapper

该类用来记录新生成的索引文件名，不会记录从已有的索引目录中读取的索引文件名，比如在初始化Directory对象阶段会先读取索引目录中的索引文件。

### 4.4 LockValidatingDirectoryWrapper

索引文件锁的有效检查。

该类使得在执行`创建`、`删除`、`重命名`、`同步`(持久化索引文件至磁盘)的操作前都会先检查索引文件锁的状态是否有效的，比如说如果用户手动的把write.lock文件删除，那么会导致索引文件锁失效。

### 4.5 NRTCachingDirectory

使用 ByteBuffersDirectory 作为缓存

- maxMergeSizeBytes：允许的段合并生成的索引文件大小最大值
- maxCachedBytes：ByteBuffersDirectory 允许存储的索引文件大小总和最大值

主要 就是判断 多少数据使用缓存，多少数据使用 保证的 目录。

```java
  protected boolean doCacheWrite(String name, IOContext context) {
    long bytes = 0;
    if (context.mergeInfo != null) {
      bytes = context.mergeInfo.estimatedMergeBytes;
    } else if (context.flushInfo != null) {
      bytes = context.flushInfo.estimatedSegmentSize;
    } else {
      return false;
    }
    return (bytes <= maxMergeSizeBytes) 
              && (bytes + cacheSize.get()) <= maxCachedBytes;
  }
```

## 5 FileSwitchDirectory

索引文件都存放同一个目录中，使用一个Directory对象来维护，

而FileSwitchDirectory则使用**两个Directory对象**，即primaryDir跟secondaryDir，用户可以将索引文件分别写到primaryDir 主要 或者secondaryDir 次要，

使用primaryExtensions的Set对象来指定哪些后缀的索引文件使用primaryDir维护，否则使用secondaryDir维护，另外primaryDir或者secondaryDir可以使用同一个目录。

primaryExtensions对象指定后缀为fdx、fdt、nvd、nvm的索引文件由primaryDir维护

## 6 Lucene50CompoundReader

该类仅用来读取复合文件(Compound File)，所以它仅支持`打开`、`读取`。比如当我们在初始化IndexWriter时，需要读取旧的索引文件，如果该索引文件使用了复合文件，那么就会调用Lucene50CompoundReader类中的方法来读取旧索引信息。
