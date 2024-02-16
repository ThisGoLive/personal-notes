2018/2/6 星期二 下午 9:44:44 

## 1.6 垃圾回收技术

1/64的物理内存 对空间分为3区间 

1. 青年代：伊甸园（所有的新建对象都在这里产生，满了就触发普通垃圾回收，检测此中的有无引用的对象，第一此清理时，有到from、无着清理）1/3  save（from（）to（）第一清理时就到from内，但二次到三次，所有对象就会到to，并把from变为to,to变from）
2. 老年代：三次后就到了老年代，垃圾回收不怎么会触发。满了就会触发forgc（全量回后，检测整个堆的空间）此时，性能低下，尽量避免。
3. 持久代： **类信息(类模板)**，用于反射

空对象:8字节; 包装类都是8字节;按8的倍数分配;有属性就会加.(堆中,在栈中还有4字节的对象引用)

# Hibernate应用

## 1.7  查询

#### 知道id

        Session.get(javabean.class,id); 两个参数，一个为类模板，一个是已知id
        Session.load(javabean.class,id); 延迟加载方法。

应用>一级>二级>数据库查 （get）
应用>一级>二级 （load 默认数据库中有，产生一定代理实例，返回给应用。若本就没有，会Objectnotfund）

新增 删除 修改 传值都为满足orm映射 的对象   修改，劲量保证对象数据的完整，应为修改是全部字段都要修改的。
saveOrUpdate()  不知道是修改还是添加时，

#### 不知道id时

问号传值：

        //hibernate 查询语句
        String hql = " from UserBean as u where u.userName like CONCAT(?,'%') and u.password = ? "；
        //1.创建Query 接口实例
        //2.将hql 转换为sql 并  对sql 预编译
        Query query = session.createQuery(hql);
        //jdbc中第一个问号为一    hibernate 中第一个为零            
        query.setString（0,userName）；
        query.setString（1,password）；
        query.list();//完成查询，返回结果集list

参数别名：

    ':'属性名来进行传值；
        //hibernate 查询语句
        String hql = " from UserBean as u where u.userName like CONCAT(:userName,'%') and u.password = :userName "；
    
        //1.创建Query 接口实例
        //2.将hql 转换为sql 并  对sql 预编译
        Query query = session.createQuery(hql);
        //jdbc中第一个问号为一    hibernate 中第一个为零            
        query.setString（"userName",userName）；
        query.setString（"userName",password）；
        query.list();//完成查询，返回结果集list    

解决按需查询：

    String hql = "select u.id,u.name from UserBean as u where u.userName like CONCAT(:userName,'%') and u.password = :userName "；
    //此时，返回的不是封装的对象，而是一行一列的对象。
    
    //常用与单表
    添加有参构造    select new 构造器（u.id,u.name） from。。。 
    // 常用与多表
    select new map（u.id as ''键名,u.name as ''键名） from。。。 

#### 多参数查询

1.将参数封装为对象，进行传递（对象，不一定就非要是javaBean）

    Query query = ...
    query.setProperrties(Object obj);//若有多参数，要保证obj对象的属性名与参数名字（：名）一致；
    query.setProperrties(Map map);//若有多参数，要保证map键名与参数名字（：名）一致；

#### 分页

    //当结果集只有一个时（例：max()等函数），可以调用。返回对象。
    query.uniqueResult();
    //
    query.setFirstResult(int a);//相当于limit的起始位置 包含
    query.setMaxResults(itn b );//结束位置    不包含

#### 无sql语句查询

    //判断查询的哪个表
    Criteria criteria = session.createCriteria（类模板）；、
    //添加查询的关键字
    criteria.setProjection(Projections.count("id"));
    //添加查询的条件    
    criteria.add(Restriction.like("userName"对象属性名，bean.getUserName,MatchMode.STArt));
    criteria.add(...)...

## 1.8 缓存

常规的位于数据库和程序之间；

本地缓存（在本地，和服务器互抢资源 容量不大） 

分步式缓存（和应用服务器不在一起，通过网络传输。种类多：，优点、无限加机器，且机器间数据不同步，在依据不同**算法**，去到机器去存取数据。）

1. hash取余的算法  简单，但灵活性差，。
2. hash一致算法  0-2^32间 分布机器个数的节点编号，顺时针，靠近哪个机器就存  数据分步不均匀。
3. 虚拟节点hash一致算法   多分成节点，来缓存

### 1.8.1 本地缓存

- 一级缓存  Session创建的，生命周期短暂，与事务相关，默认开启（事务级缓存）
- 二级缓存  Session工厂提供，依据数据源（数据库），生命周期约等于系统，又名应用级缓存。由该Session工厂产生的实例共享这个二级空间； 不用，降低性能；

用第三方缓存：默认兼容EHCache;缓存同步。

### 1.8.2 查询缓存

save update get load 会缓存于Session本地中。

开启二级缓存： 

```xml
prom  <dependency> 导入hibernate和ecahe
hibernate cfg 中  开启二级缓存
<property name="hibernate.cache.use_secnd_level_cache">true</property>
//指定二级缓存的提供类 ，ecahe
<property name="hibernate.cache.region.factory_class">.class</property>
//需要二级缓存来查询类
<property name="hibernate.cache.region.factory_class">.class</property>
```

配置：

```xml
<ehcache>
    //存放的位置，，tmdir代表 内存中，生的临时目录，用于存放缓存数据
    //也可改为D：//..
    <diskStore path="java.io.tmpdir"/>
        //maxelementsInMemory="1000" 缓存中允许存放的最大容量数 1000条
        //eternal="false" 代表缓存中的数据  是否为常量 true  是  false 变量
        //timeToIdleSeconds="120" 空闲时间 代表缓存中的数据，如果没有被使用的情况下，可以在缓存中存活的时间为120秒
        //timeToLiveSeconds 钝化时间，代表缓存中的数据.可以在缓存中存活的时间 
        //overflowToDisk=“true” 当缓存容量不足时，是否需要想硬盘中写入数据，写的位置由人自己定。 <dis>
        //FIFO first int first out 先进先出，
        //lru 最近最少使用，在一分分钟的单位时间，判断哪个数据用得最少。最少被调用， 那么级清理它，
        //    LFU  最少使用 从缓存创建到现在 使用最少  清理

        <defualtCache>
            maxelementsInMemory="1000"

        </ehcache>
```

设置对象的缓存策略：

UserBeanxml中：

    //only 表示缓存中数据 只能读，不能写
    //write 严格读写，在修改数据时，其他人不能读，直到修改完毕，才能再次读取
    //nonstrict-read-write 非严格读写，修改 时可以读
    //teamsactional  事务缓存策略 与数据库的事务保持一致，事务提交缓存的数据做保存，事务回滚，缓存的数据就不保存。
    
    <cache usge = "read_only"/> 
    Session.creatQery(hql).ehcache
