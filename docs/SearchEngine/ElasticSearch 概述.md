### 数据结构

Elasticsearch是面向文档型数据库，一条数据在这里就是一个文档，用JSON作为文档序列化的格式
即 一个文档就是 关系数据库的一条数据

| 关系数据库         | 数据库 | 表   | 行   | 列   |
| ------------- | --- | --- | --- | --- |
| ElasticSearch | 索引  | 类型  | 文档  | 字段  |

### 倒排索引

每个文档都有一个ID，并且必须有序

Elasticsearch分别为每个field都建立了一个倒排索引，字段的值为 `Term`，`Posting List`是文档ID。

posting list 是一个int数组，即重复，存储符合 Term 的id。

1. 通过字段的值，排序，创建一个二分查，即字典，存放内存

2. 如果太多，并且 term 还是一个短语，放内存并不合适。

3. 所以 将 term 映射成一个 index。使用了 FST 创建 index，term 值放磁盘

4. 以字节的方式存储所有的term，存放内存

5. 除了压缩 term index 外，Posting List 如果有很多文档ID，所以使用 Roaring bitmaps 进行存储

##### Term Dictionary 字典

Elasticsearch为了能快速找到某个term，将所有的term排个序，二分法查找term，logN的查找效率，就像通过字典查找一样，这就是**Term Dictionary**。

现在再看起来，似乎和传统数据库通过B-Tree的方式类似啊，为什么说比B-Tree的查询快呢？

##### Term Index 索引

B-Tree通过减少磁盘寻道次数来提高查询性能，Elasticsearch也是采用同样的思路，直接通过内存查找term，不读磁盘，但是如果term太多，term dictionary也会很大，放内存不现实，于是有了**Term Index**，就像字典里的索引页一样，A开头的有哪些term，分别在哪页，可以理解term index是一颗树：

这棵树不会包含所有的term，它包含的是term的一些前缀。通过term index可以快速地定位到term dictionary的某个offset，然后从这个位置再往后顺序查找。

所以term index不需要存下所有的term，而仅仅是他们的一些前缀与Term Dictionary的block之间的映射关系，再结合FST(Finite State Transducers)的压缩技术，可以使term index缓存到内存中。从term index查到对应的term dictionary的block位置之后，再去磁盘上找term，大大减少了磁盘随机读的次数。

#### FST 压缩技术

FST以字节的方式存储所有的term，这种压缩方式可以有效的缩减存储空间，使得term index足以放进内存，但这种方式也会导致查找时需要更多的CPU资源。

#### bitmaps

数值即对应的位上为1

例如 1 3 5 为 10101000 ，第 1 3 5 位上有值。

Bitmap的缺点是存储空间随着文档个数线性增长

#### Roaring bitmaps

将posting list按照65535为界限分块，比如

第一块所包含的文档id范围在0~65535之间，

第二块的id范围是65536~131071，以此类推。

再用`<商，余数>`的组合表示每一组id，这样每组里的id范围都在0~65535内了，剩下的就好办了，既然每组id不会变得无限大，那么我们就可以通过最有效的方式对这里的id存储。

65535也是一个经典值，因为它=2^16-1，正好是用2个字节能表示的最大数，一个short的存储单位
