# 参考资料

[构造IndexWriter对象（一）](https://www.amazingkoala.com.cn/Lucene/Index/)

[构造IndexWriter对象（二）](https://www.amazingkoala.com.cn/Lucene/Index/)

# IndexWriterConfig 索引写入配置

- 不可变配置（unmodifiable configuration）：
  - 在实例化IndexWriter对象后，这些配置不可更改，即使更改了，也不会生效，因为仅在IndexWriter的构造函数中应用一次这些配置
- 可变配置（modifiable configuration）：
  - 在实例化IndexWriter对象后，这些配置可以随时更改

## 1 不可变配置

不可变配置包含的内容有：OpenMode、IndexDeletionPolicy、IndexCommit、Similarity、MergeScheduler、Codec、DocumentsWriterPerThreadPool、ReaderPooling、FlushPolicy、RAMPerThreadHardLimitMB、InfoStream、IndexSort、SoftDeletesField

### OpenMode 打开模式

OpenMode描述了在IndexWriter的初始化阶段，如何处理索引目录中的已有的索引文件，这里称之为旧的索引，OpenMode一共定义了三种模式，即：

CREATE、APPEND、CREATE_OR_APPEND。

+ `CREATE`：如果目录中已经存在旧索引，那么会覆盖。Segment_N 还是会变 n+1(9.4 z中 都是从1开始，所以都是n)，但是 _n.xx，并且旧的 _n--.xx 会被全部删除
+ **`APPEND`**：先读取索引目录中的旧索引，新的提交操作不会删除旧的索引，注意的是如果索引目录没有旧的索引（找不到任何的Segment_N文件），并且使用当前模式打开则会报错，即空文件报错。
+ `CREATE_OR_APPEND`：先判断索引目录中是否有旧的索引，如果存在旧的索引 就是追加。

`默认值 CREATE_OR_APPEND`

### IndexDeletionPolicy 索引删除策略

当一个新的提交生成后，如何处理上一个提交

### IndexCommit 索引提交

IndexWriter 执行 commit 后，这次提交所有段（segment）的信息用 indexCommit 描述。

执行一次提交操作（执行commit方法）后，`这次提交包含的所有的段的信息`用IndexCommit来描述，其中至少包含了两个信息，分别是segment_N文件跟Directory

`默认值为空`

### Similarity 相似

Similarity描述了Lucene打分的组成部分。何使用BM25算法实现对文档的打分

### MergeScheduler 合并调度器

用来定义如何执行一个或多个段的合并，比如并发执行多个段的合并任务时的执行先后顺序，磁盘IO限制。

`默认 ConcurrentMergeScheduler`

### Codec 编解码器

索引文件的数据结构，即描述了每一种索引文件需要记录哪些信息，以及如何存储这些信息，

`默认 Lucene70Codec`

### DocumentsWriterPerThreadPool

逻辑上的线程池。每当IndexWriter要添加文档，会从DocumentsWriterPerThreadPool中获得一个ThreadState去执行，故在多线程（持有相同的IndexWriter对象引用）执行添加文档操作时，每个线程都会获得一个ThreadState对象

### ReaderPooling

布尔值，用来描述是否允许共用（pool）SegmentReader。

`默认值为true`

### FlushPolicy 推送策略

自动flush策略，因为flush分为自动flush跟主动flush。

`只有一个实现 FlushByRamOrCountsPolicy`

### RAMPerThreadHardLimitMB

MaxBufferedDocs、RAMBufferSizeMB

### InfoStream

对Lucene进行调试时实现debug输出信息，在业务中打印debug信息会降低Lucene的性能，故在业务中使用默认值就行，即不输出debug信息。

9.5 还有PrintStream。`config.setInfoStream(System.out);` 即可打印。

### IndexSort

索引阶段如何对segment内的文档进行排序

`默认 null`

### SoftDeletesField

SoftDeletesField用来定义哪些域为软删除的域

`默认 null`

## 2 可变配置

变配置包含的内容有：MergePolicy、MaxBufferedDocs、RAMBufferSizeMB、MergedSegmentWarmer、UseCompoundFile、CommitOnClose、CheckPendingFlushUpdate。

### MergePolicy 段的合并策略

如何从索引目录中找到满足合并要求的段集合

`默认 TieredMergePolicy`

### MaxBufferedDocs、RAMBufferSizeMB

RAMBufferSizeMB：描述了索引信息被写入到`磁盘前暂时缓存在内存中允许的最大使用内存值`

MaxBufferedDocs：描述了索引信息被写入到`磁盘前暂时缓存在内存中允许的文档最大数量`

**MaxBufferedDocs指的是一个DWPT允许添加的最大文档数量** 可以多线程多个，并不是所有线程的文档数

每次执行文档的增删改后，会调用FlushPolicy（flush策略）判断是否需要执行自动flush

该策略正是依据MaxBufferedDocs、RAMBufferSizeMB来判断是否需要执行自动flush

`RAMPerThreadHardLimitMB`，该值被允许设置的值域为0~2048M，它用来描述每一个DWPT允许缓存的最大的索引量。

`DWPT`可以简单理解为一个容器，存放每一篇文档对应转化后的索引信息，在多线程下执行文档的添加操作时，每个线程都会持有一个DWPT，然后将一篇文档的信息转化为索引信息（DocumentIndexData），并添加到DWPT中。

+ `一个`DWPT中的DocumentIndexData的`个数`超过`MaxBufferedDocs`时，那么就会触发自动flush，将DWPT中的索引信息生成为一个段。影响一个DWPT。

+ `一个`DWPT中的所有DocumentIndexData的`索引内存占用量`超过`RAMPerThreadHardLimitMB`，那么就会触发自动flush，将DWPT中的索引信息生成为一个段。影响一个DWPT。

+ `所有`DWPT中的DocumentIndexData的**索引内存占用量**超过RAMBufferSizeMB，那么就会触发自动flush，将DWPT中的索引信息生成为一个段，RAMPerThreadHardLimitMB影响的是所有的DWPT。

| 名称                      | 后置可修改 | DocumentIndexData的索引单位 | 对应DWPT | 默认值 |
| ----------------------- | ----- | ---------------------- | ------ | --- |
| RAMPerThreadHardLimitMB | 否     | 索引内存占用量                | 每个     |     |
| MaxBufferedDocs         | 是     | 索引数量                   | 每个     | -1  |
| RAMBufferSizeMB         | 是     | 索引内存占用量                | 全部     | 16M |

### MergedSegmentWarmer

预热合并后的新段，

执行段的合并期间，提前获得合并后生成的新段的信息，由于段的合并和文档的增删改是并发操作，所以使用`该配置可以提高性能`

默认值 null

### UseCompoundFile

布尔值，通过flush、commit的操作生成索引使用的数据结构都是`复合索引文件`，即索引文件`.cfs、.cfe`

`默认为true`

### CommitOnClose

影响IndexWriter.close()的执行逻辑，如果设置为true，那么会先应用（apply）所有的更改，即执行[commit](https://www.amazingkoala.com.cn/Lucene/Index/2019/0906/91.html)操作，否则上一次commit操作后的所有更改都不会保存，直接退出。

`默认为true`

### CheckPendingFlushUpdate

检查挂起刷新更新

设置为true，那么当一个执行添加或更新文档操作的`线程完成处理`文档的工作后，会尝试去`帮助待flush的DWPT`，其执行的时机点见下图中红框标注的两个流程点
