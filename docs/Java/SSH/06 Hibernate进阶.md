[[TOC]]

# 第 六 章 ： Hibernate 进阶

2019年6月20日 - 2019年7月7日22:15:53

## 6.1 Hibernate 关联关系

关联关系 从访问方向上分为：

+ 单向关联：只需要 单向访问关联端
+ 双向关联：关联的两端 都可以 互相访。

从对应关系有分为 ：

+ 单向 1-1
+ 单向 1-N
+ 单向 N-1
+ 单向 N-N
+ 双向 1-1
+ 双向 1-N
+ 双向 N-N

共有 2*4 种，但是 双向 一对多 与 多对一，实际时一种。所以 共 七种。

### 6.1.1 1-N关联

#### 6.1.1.1 单向 N-1 关联

很常见的关系，如 学生 与 班主任。

在 Hibernate 映射 文件中 需要 `many-to-one`标签实现，Hibernate 不需要使用 表连接，而是直接使用外键 关联处理这种关系。

| 属性名       | 描述                                                         |
| ------------ | ------------------------------------------------------------ |
| name         | 属性名称，如 学生类 中 的 班主任 属性                        |
| column       | 表中 用于关联的，外键列名                                    |
| class        | 关联的类，如 班主任的 老师类                                 |
| cascade      | 指定 哪些持久化 操作会从  主表记录 级联 到子表记录           |
| fetch        | 指定 Hibernate 的抓取策略，可以时 join 和 select 连个值 之一 |
| property-ref | 指定关联类的一个属性，该属性 将会和 本类的外键对应，默认使用 对方关联类的 主键 |
| access       | 指定 Hibernate 访问此关联 属性 的访问策略，默认是 property   |
| unique       | 指定 Hibernate 通过 DDL 为 外键列 添加唯一约束，也可以 作用 property-ref 的目标属性 |
| lazy         | 指定 引用关联实体 的 延迟加载特性，该属性只能接受 false proxy（默认） no-proxy 三个值，默认 是 启动 单实例关联的。代理当指定 no-proxy 时，则实例变量第一次被访问时 采取延迟抓取。false 时 关联的实体 总是 预先抓取 |
| not-null     | 指定使用 DDL 为外键字段添加非空约束。如果 为 true，表示属性不能为null，该属性默认为 false。  为 true 就是指 学生的班主任 不能为空，而且 每次 Hibernate 操作时，都会检查 学生的 包主任字段 |
| not-fonud    | 指定 该属性 当外键参照的主表记录不存在时，如何处理，ignore 和 exception （默认）。即 学生的班主任 不能在 表中查到 |
| formula      | 指定 一个 SQL 表达式，该外键 值 将根据 SQL 的值 进行计算。   |

```xml
<class name="StudetsBean" table="STUDENTSTABLE">
	<id name="" column="">
    	<generator class="native"></generator>
    </id>
    <many-to-one name="masterTeacher" column="" class=""></many-to-one>
</class>
```



#### 6.1.1.2 单向 1-N关联

类似 单向 多对一。标签 `one-to-many`

使用集合 来进行标识

```xml
<set name="teachers">
	<key colnum=""></key>
    <one-to-many class="Teacher"></one-to-many>
</set>
```

set 常用属性

| 属性        |                        |
| ----------- | ---------------------- |
| name        | 类中属性               |
| key         | 表中外键               |
| one-to-many | 指定关联的持久化对象类 |

#### 6.1.1.3 双向1-N 关联

将 上面 两类都填上。

而且 实际中 ，不推荐 使用 单向 **一对多 关联** 即 6.1.1.2。而是使用 双向 一对多

### 6.1.2 1-1 关联

分类：单向 与 双向、基于主键 与 基于外键

共4种。

+ 外键 单向 1-1：可以理解为特殊 的 单向 N-1。
+ 主键 单向 1-1：基于 主键的关联 持久化类不能拥有自己的主键生成器策略，而是有 关联它的主体负责生成
+ 外键 双向 1-1：外键 可以放任意一边，存放外键一边 作 “外键 单向 1-1 处理”，使用 `many-to-one`，另外一段 使用 `one-to-one`
+ 主键 双向 1-1：两个关联表 使用相同的主键值，其中一个表的主键共享给另外一个表

#### 6.1.2.1 外键 单向 1-1

使用 就如同 单向 N-1。只不过 1 的一方，只会被 关联一次。

例如

```xml
<class name="UserBean" table="USERTABLE">
	<id name="id" column="ID">
    	<generator class="native"></generator>
    </id>
    <many-to-one name="idCard" class="IdCardBean" cascade="all" column="IDCARD_ID" unique="true" -- 做约束></many-to-one>
</class>

<class name="IdCardBean" table="IDCARDTABLE">
	<id name="id" column="ID">
    	<generator class="native"></generator>
    </id>
</class>
```



#### 6.1.2.2 主键 单向 1-1

被关联的类，不能拥有自己的主键生成策略，主键 是有 关联它的 实例负责生成，使用 `one-to-one`

| 属性         |                                                              |
| ------------ | ------------------------------------------------------------ |
| name         | 类属性                                                       |
| class        | 指定 关联的实体 的全路径类名，默认通过反射                   |
| cascade      | 指定 那些操作 会从主表记录 级联到 子表记录                   |
| constrained  | 指定 该类对应的表 和被 关联的对象 对应的表之间，通过一个外键引用对主键进行约束，此属性 影响 save 与 delete 在级联执行时的操作顺序，以及 该关联能否被委托 |
| fetch        | 指定 抓取策略                                                |
| property-ref | 指定 关联类的一个属性，该属性与本类的主键向对应，默认使用对方关联类的主键 |
| access       | 指定 Hibernate 访问该关联属性的访问策略，默认 property       |
| lazy         | 延迟加载特性，false，proxy  与 no-proxy                      |

例如 ：

```xml
<class name="UserBean" table="USERTABLE">
    <id name="id" column="ID">
    	<generator class="foreign"> -- 由关联的持久化对象的ID 赋值
        	<param name="property">idCard</param>
        </generator>
    </id>
    <one-to-one name="idCard" class="IdCardBean" constrained="true" -- 指定该对象 与 关联它的对象 所对应的表></one-to-one>
</class>

<class name="IdCardBean" table="IDCARDTABLE">
	<id name="id" column="ID">
    	<generator class="native"></generator>
    </id>
</class>
```

UserBean 的主键  配置的 主键生成器 `foreign` 通过 关联的对象 ID 主键 来赋值。而 标签 `one-to-one`中 `constrained` 为true，标识 两个表 之间 有 外键 与主键的关联约束，配置的 `foreign` 会告诉 Hibernate 使用 主键 来作为 外键关联 约束。

#### 6.1.2.3 外键 双向 1-1

外键 可以存放任意一端，存放外键一端 使用 `many-to-one`标签，并且 `unique="true" -- 做约束`。而另外一边 使用 `one-to-one`。当 表 拥有外键后即使用 `many-to-one`的一边，称为从表，另外一个 为主表。

例如：

```xml
<class name="UserBean" table="USERTABLE">
	<id name="id" column="ID">
    	<generator class="native"></generator>
    </id>
    <many-to-one name="idCard" class="IdCardBean" cascade="all" column="IDCARD_ID" unique="true" -- 做约束></many-to-one>
</class>

<class name="IdCardBean" table="IDCARDTABLE">
	<id name="id" column="ID">
    	<generator class="native"></generator>
    </id>
    <one-to-one name="userBean" class="UserBean" constrained="true"></one-to-one>
</class>
```

#### 6.1.2.4 主键 双向 1-1

类似 基于 主键的 单向 1-1，区别 是  两边都配置 `one-to-one`

```xml
<class name="UserBean" table="USERTABLE">
	<id name="id" column="ID">
    	<generator class="foreign">
        	<param name="property">idCard</param>
        </generator>
    </id>
    <one-to-one name="idCard" class="IdCardBean" cascade="all" column="IDCARD_ID" constrained="true" ></one-to-one>
</class>

<class name="IdCardBean" table="IDCARDTABLE">
	<id name="id" column="ID">
    	<generator class="native"></generator>
    </id>
    <one-to-one name="userBean" class="UserBean" unique="true" -- 做约束></one-to-one>
</class>
```

没有 自己 的 id创建策略的一方，使用 `constrained="true"`配合 `foreign`说明 id 从 关联的 对象 那里来。

  `unique="true"`标识 外键 唯一约束。

### 6.1.3 N-N 关联

通常 化繁为简，通过 管理表，转换为 两个 1-N处理。Hibernate 也是这么处理的。

#### 6.1.3.1 单向 N-N 

与 单向 N-1 配置类似，区别 使用 `many-to-many`，并且 不使用 unique=true，唯一外键约束。

主表一方的类中添加 Set 属性。

例如：

```xml
<class name="StudetsBean" table="STUDENTSTABLE"> 
	<id name="" column="">
    	<generator class="native"></generator>
    </id>
    <many-to-one name="masterTeacher" column="" class="TeacherBean"></many-to-one>
    <set name="testchers" table="STU_TEACHERTABLE">-- 指定 学生 与 老师的管理表名
    	<key column="STU_ID"></key>
        <many-to-many class="TeacherBean" column="TEACHER_ID" ></many-to-many>
    </set>
</class>
```

#### 6.1.3.2 双向 N-N

即 在 单向 N-N的基础上延伸。两边 都使用 `Set` 集合.

例如：

```xml
    <set name="testchers" table="STU_TEACHERTABLE">-- 指定 学生 与 老师的管理表名
    	<key column="STU_ID"></key>
        <many-to-many class="TeacherBean" column="TEACHER_ID" ></many-to-many>
    </set>
```

```xml
    <set name="students" table="STU_TEACHERTABLE">-- 指定 学生 与 老师的管理表名
    	<key column="TEACHER_ID"></key>
        <many-to-many class="StudentsBean" column="STU_ID" ></many-to-many>
    </set>
```

#### 6.1.3.3 拆分 N-N

在实际中  还有这种问题：学生 与 图书管。N-N 关系，但是 中间表 需要存放 “学生” 借 “书  ”，借了多少本。

就 需要 进行拆分 成 具体的 两个 1-N。

```xml
<class name="StudentsBean" table="STU_TABLE">
	<id name="id" column="STU_ID">
    	<generator class="Native"></generator>
    </id>
    <!-- 这里 双向是  一对多 -->
   	<set name="books" cascade="save-update" table="STU_BOOK_TABLE" inverse="true">
    	<key name="NUM_STU_ID"></key>
    	<one-to-many class="StudentsBookEntity"></one-to-many>
    </set>
</class>
```

```xml
<class name="StudentsBookEntity" table="STU_BOOK_TABLE">
	<id name="id" column="STU_ID">
    	<generator class="Native"></generator>
    </id>
    <property name="bookNum" column="BOOK_NUM" type="integer"></property>
    <!-- 这里 两个 双向 一对多 -->
    <many-to-one name="sutdents" class="StudentsBean" column="NUM_STU_ID"></many-to-one>
    <many-to-one name="books" class="BookHouse" column="NUM_BOOK_ID"></many-to-one>
</class>
```

```xml
<class name="BookHouse" table="BOOK_TABLE">
	<id name="id" column="STU_ID">
    	<generator class="Native"></generator>
    </id>
    <!-- 这里 双向是  一对多 -->
    <set name="books" cascade="save-update" table="STU_BOOK_TABLE" inverse="true">
    	<key name="NUM_BOOK_ID"></key>
    	<one-to-many class="StudentsBookEntity"></one-to-many>
    </set>
</class>
```

### 6.1.4 级联关系

使用 Hibernate 时，持久化对象 之间 通过关联关系互相引用，通常 对其中一个 对象 进行修改、删除等更新操作时，被关联的对象 也需要 进行 对应操作。

这些操作 可以 使用 Hibernate 的 级联 （cascade）功能 完成。cascade 是 set 标签的一个 属性

| cascade的属性值 | 意义                                                         |
| --------------- | ------------------------------------------------------------ |
| none            | 默认值，标识 关联对象之间无级联操作                          |
| save-update     | 表示 主动 方对象，在调用 save 、 update 、saveOrUpdate 时，被关联的对象 需要 执行 保存或者 更新操作 |
| delete          | 主动方 对象 删除 时，被关联对象 也执行                       |
| delete-orphan   | 用于 1-N 中，表示 主动方 删除时，被关联的 实例中，所有的 只是被它关联的 和 没有被关联的 都会被删除。 |
| all             | 等同于 save-upate 加上 delete                                |

级联 操作 常用于  1-1 N-1 中，N-1 N-N 是没有意义的。而且使用最多的 为 `svae-update`

## 6.2 检索方式简介

检索 在 结果 与 查询相同，但是 检索 时面向对象 中的概念，而 查询 是面向关系的概念。

Hibernate 的 检索主要有五中 ： 导航对象图检索、OID检索、HQL检索、QBC检索、SQL检索

| 检索方式       | 描述                                                         |
| -------------- | ------------------------------------------------------------ |
| 导航对象图检索 | 根据已加载的对象，利用关联关系，使用函数得到。如：stu.getTeacher(); |
| OID检索        | 使用对象的 OID 。Session 的 get() 和 load()方法。session.get(Teacher.class , 1) （1 为 查询的 老师 id） |
| HQL检索        | 使用 HQL，比较面向对象                                       |
| QBC检索        | Query By Criteria API 进行 检索。更加 面向对象               |
| SQL检索        | 使用本地 SQL 查询。Hibernate 负责 把JDBC ResultSet 封装进对象中 |

## 6.3 HQL 与 QBC 检索

| 检索方式 | 优点                                                         | 缺点                                                         |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| HQL      | (1)与 SQL 查询类似，容易理解。   (2)功能强大，支持各种查询。 | (1)基于字符串。(2)HQL 只有在运行时才编译解析。 (3)支持动态查询，但是 编程麻烦 |
| QBC      | (1)封装了基于 字符串形式的查询、更加面向对象。  (2)在编译时，就会去检查，更加容易排错。  (3)适合生成动态查询 | (1)没有 HQL 强大，对连接查询不友好，不支持子查询，但是可以通过 DetachedCriteria 和 Subqueries 实现子查询 。(2) 可读性较差 |

### 6.3.1 HQL检索

与 SQL 语法类似，并且都是 在 允许时进行解析，但是 HQL 是完全面向对象的查询语言，而不是 查询 数据表 的。

HQL 所操作的 对象是类 对象 属性等。并且 支持 继承 多态等特征。

而 Hibernate 提供的 各种 检索方式中， HQL 也是 最广泛的 。

#### HQL 语法 ：

>[select attribute_name_list]
>
>from class_name
>
>[where ...]
>
>[group by ...]
>
>[having ...]
>
>[order by ...]

+ `[]` 句子 可选
+ `attribute_name_list`指定 查询的属性的 列，多个属性名之间逗号隔开
+ `class_name` 指定的类名，可以是 全路径

| 关键字   | 功能                                                   | 例子                                                         |
| -------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| from     | 指定查询的类                                           | from StudentBeans (默认情况 即 省略 select 时，查询 该类全部属性) |
| where    | 指定筛选条件                                           | from StudentBeans where name like ':?'                       |
| select   | 指定查询后，返回的 内容                                | select name , gender from StudentBeans                       |
| group by | 查询结果 分组                                          | select count(obj)  from StudentBeans obj group by obj.gender |
| order by | 查询结果 排序                                          | from StudentBeans obj order by  obj.age （默认 升序 asc， desc 降序） |
| join     | 单独 使用 表示 内联，left join 、right join            | select obj from StudentBeans obj inner join obj.teacher （默认 是延迟加载） |
| fetch    | 一次性 去除当前对象 和 所有被关联的对象，也叫预先 抓取 | select obj from StudentBeans obj inner join fetch obj.teacher (执行 时 就会 查询 teacher 表) |

HQL 的查询 依赖 Query接口，每一个 Query 实例 都对应一个 查询 对象，用于 向 数据库查询 对象 以及 控制执行查询的过程。

#### Query 接口：

| 方法名                                        | 描述                                                         |
| --------------------------------------------- | ------------------------------------------------------------ |
| int executeUpdate()                           | 执行更新 或者 删除操作，返回影响条数                         |
| Iterator Iterator()                           | 返回一个 Iterator 对象，用于迭代查询结果。该方法 首先 通过id是去一二级缓存中 寻找，剩下的id 通过 select 寻找，效率 略高于list |
| List list()                                   | 返回 List 类型的结果，若投影查询 为部分 属性，返回的  为 Object[] |
| Query setFirstResult(int first)               | 设定开始检索的初始位置，参数 first 标识对象 在查询中 索引位置，索引位置初始化 为0, |
| Query setMaxResult(int max)                   | 设置 最大检索条数，默认取全部                                |
| Object uniqueResult()                         | 返回单个对象，如果没有查询到结果返回空，                     |
| Query setString(String name,String val)       | 绑定映射类型为String参数，                                   |
| Query setEntity(String name,Object val)       | 把参数 与 一个持久化对象绑定。                               |
| Query setParameter(String name, Object val)   | 任意类型的参数                                               |
| Query setProperties(String name , Object val) | 把命名参数 与 一个对象的属性值绑定                           |

### 6.3.2 QBC 检索

`Query By Criteria` 

由于 5.2 中 `session.createCriteria`为弃用，推荐使用 JPA 的 Criteria。

```java
// 5.2 过后 (since 5.2) for Session, use the JPA Criteria
			final CriteriaQuery<StudentsBean> criteriaQuery = session.getCriteriaBuilder().createQuery(StudentsBean.class);
			Query<StudentsBean> query = session.createQuery(criteriaQuery);
			System.out.println(query.getResultList());
```

如上中示例，没法操作 Criteria 的接口。

故而 还是 使用失效的。

+ Criteria 接口表示一次查询。
+ Criterion 接口 表示 一个查询条件
+ Restrictions 类，产生查询条件的工具类

| 方法名                                          | 描述                                                         |
| ----------------------------------------------- | ------------------------------------------------------------ |
| Criteria add(Criterion cir)                     | 添加查询条件                                                 |
| Criteria addOrder(Order order)                  | 增加排序规则，通过调用Order的asc或者 desc确定结果集的升降序  |
| Criteria createCriteria(String path)            | 在相互关联的持久化类之间建立条件约束                         |
| List list()                                     | 返回结果集                                                   |
| Criteria setFirstResult(int first)              |                                                              |
| Criteria setMaxResult(int max)                  |                                                              |
| Object uniqueResult()                           |                                                              |
| Criteria setProjection (Projection projectionf) | 设定统计函数实现分组统计功能，Projection 类的对象表示一个统计函数，通过 Projections 可以获取统计函数 |

```java
Criteria cri = session.createCriteria(StudentsBean.class);
			cri.add(Restrictions.eq("name", "哈儿1"));
			System.out.println(cri.list());
```

`Restrictions`  工具类函数描述：

| 函数名                                                 | 描述                                           |
| ------------------------------------------------------ | ---------------------------------------------- |
| allEq(Map keyValue)                                    | 多条件                                         |
| between(String name,Ojbect o1 , Object o2)             | 在之间                                         |
| iLike(String name, Object val)                         | 判断属性值 匹配某个字段                        |
| in(String name,Collection values)                      | 属性值 在集合内                                |
| in(String name,Object[] values)                        |                                                |
| isEmpty(String name)                                   |                                                |
| isNotEmpty(String name)                                |                                                |
| isNull(String name)                                    |                                                |
| isNotNull(String name)                                 |                                                |
| not(Criterion expression)                              | 条件取反                                       |
| sqlRestrction(String sql)                              | 使用 SQL 作为筛选条件                          |
| sqlRestrction(String sql，Object value，Type type)     | 使用一个带参数的 SQL作为筛选条件，并且有条件值 |
| sqlRestrction(String sql，Object[] value，Type[] type) | 使用多个                                       |

### 6.3.3 使用别名

HQL 中 使用 正常的 SQL 别名 

QBC 中 通常 不写，或者 用this

`Restrictions.eq("this.name", "哈儿1")`

### 6.3.4 排序

HQL:

```sql
from TableName as T order by T.age,T.xxx asc
```

QBC:

```java
criteria.addOrder(Order,asc("age"))
```

### 6.3.5 分页查询

Query 与 Criteria 接口 都提供了分页查询

HQL：

使用 `setFirstResult` 与 `setMaxResults` 配合使用

QBC ：

同理 也是使用上面同函数名

### 6.3.6 查询单条记录

基本 类似 ，使用 `setMaxResults` 与 `uniqueResult`

### 6.3.7 HQL 中绑定参数

就是 防止 **SQL 注入**。

由于 HQL 底层 就是基于 `PreparedStatement` (基本SQL 就是使用 这个 防止 SQL 注入)。

所以Query 提供 `setXXX`函数 进行设置条件。

并且 在 5.0 版本中 HQL 参数只能使用 `T.name = :name` 无法再使用 `？`

### 6.3.8 设定查询条件

HQL 与 SQL 条件 过滤 非常类似，只有 属性不同而已

| HQL 运算         | QBC 运算               |                       |
| ---------------- | ---------------------- | --------------------- |
| =                | Restrictions.eq()      |                       |
| `>`              | Restrictions.gt        |                       |
| `>=`             | Restrictions.ge        |                       |
| <                | Restrictions.lt        |                       |
| <=               | Restrictions.le        |                       |
| <>               | Restrictions.ne        |                       |
| is null          | Restrictions.inNull    |                       |
| is not null      | Restrictions.isNotNull |                       |
| in               | Restrictions.in        |                       |
| ont in           |                        |                       |
| between and      | Restrictions.between   |                       |
| not betwween and |                        |                       |
| like             | Restrictions.like      |                       |
|                  | Restrictions.iLike     | 同 like但是忽略大小写 |
| and              | Restrictions.and       |                       |
| or               | Restrictions.or        |                       |
| not              | Restrictions.not       |                       |

> 注意： SQL中判断空 不是 =null 而是用 is null.

**不区分大小写**

HQL ： lower 或者 upper

```sql
from student c where lower(c.name) = :name
```

QBC ： ignoreCase

```java
Restrictions.eq("","").ignoreCase()
```

**字符串匹配**

`%` 与 `_`

基本类似，但是 QBC 还可以 使用常量参数 `org.hibernate.criterion.MatchMode`

```java
Restrictions.like("","",MatchMode.START)
```

### 6.3.9 连接查询

HQL 中 连接查询 只适用于 有关联的持久化类，并且映射关系 做了映射的。

+ 内联：inner join 或者 join
+ 预先提取内联 ： join fetch
+ 左外连： left outer join 或者 left join
+ 预提取左外联： left outer join fetch 或者 left join fetch
+ 右外联： right join

**注意**：如果 在配置映射关系时，主类对从类的集合设置 立即检索策略的化，适用 inner join 会把集合中实例 初始化

left outer join fetch 会覆盖 映射关系任何的检索策略

### 6.3.10 投影查询

投影查询：机构仅仅包含部分实体 或者 部分实体的属性（不包含全部的属性）

```java
// 效果一
String hql = "select T.name,T.age from student T"
final Query query = session.creatQuery(hql);
Lit<Objet[]> list = query.list();

// 效果二  student 必须有同参数 构造
String hql = "select new Student(T.name,T.age) from student T"
final Query query = session.creatQuery(hql);
Lit<Student> list = query.list();

// 效果三
String hql = "select new map(T.name,T.age) from student T"
final Query query = session.creatQuery(hql);
Lit<Map> list = query.list();
```

如果 在 只是数据提取的查询中，不推荐 持久化对象查询

### 6.3.11 分组与统计查询

+ count
+ min
+ max
+ sum
+ avg

SQL  与 HQL 中都可以使用

QBC使用：

```java 
criteria.setProjection(Projections.XXX)
```

Projection的函数：

| 函数名         | 描述                                          |
| -------------- | --------------------------------------------- |
| avg()          |                                               |
| max()          |                                               |
| min()          |                                               |
| sum()          |                                               |
| count()        |                                               |
| rowCont()      | 统计行数 同count（*）                         |
| countDistinct  | 不重复的统计记录数                            |
| groupProperty  | 根据特定分组，同 group by proname             |
| projectionList | 返回一个 projectList 对象数组，代表 投影的 列 |
| property       | 把 某属性加入到 投影中                        |

Projects 也 有 as 函数

### 6.3.12 动态查询

动态查询 都是通过 自建函数  通过不同的传入参数，通过以上已经 进行查询

**QBE**

QBE 查询 就是指  检索 与指定的样板 具有相同属性的对象，为 QBC 的功能子集。QBE 检索方式中使用的核心类为 `Example`

| 函数名                       |                                            |
| ---------------------------- | ------------------------------------------ |
| igonreCase()                 | 忽略模板类中 string 的大小写               |
| enableLike（MatchMode mode） | 进行 like 查询，mode 为 那种类型           |
| excludeZeroes()              | 不把 0 的字段 加入到 where 条件中          |
| excludeNone()                | 不把空的字段 加入到 where 中               |
| excludeProperty(String name) | 不把 name 名称的字段 加入到 where 条件中。 |

```java
// HQL 
// 拼接 HQL时  判断参数
// QBC 
Criteria criteria = session.createCriteria(Class)
if (xxx != null)
criteria.add(Restrictions.iLike(xxxName,xxx,MatchMode.START))
// QBE
Criteria criteria = session.createCriteria(Class)
Exaple exaple = Exaple.creat(bean)
    .excludeZeroes()
    .ignoreCase()
    .enableLike(MatchMode.START)
criteria.add(exaple)
```

**缓存 查询**

主要 和 session 绑定，声明周期 与session 同步。

为了 在 延迟生命并重复使用，3.0 添加了 `DetachedCriteria` 对象。

```java
DetachedCriteria  cri = DetachedCriteria .forClass(Class);
// 使用 QBC 的add参数
cri.add(Restrtictions.eq(xxxName,xxx));
Criteria criteria = cri.getExecutableCriteria(session);

```

### 6.3.13 子查询

子查询 只推荐 HQL 。QBC 可以通过 `Subqueries`在 `DetachedCriteria`中使用。

按照 返回结果 ：单行子查询 与 多行

单行比较简单，可以直接使用  单行比较符

多行的化需要用到一定的函数。

以下函数 在 Hibernate 4 中 只能在 where 条件中使用。

多行运算符：

| 名     |                                                            |
| ------ | ---------------------------------------------------------- |
| all    | 比较查询中 的 全部值，不能单独使用，只能与单行比较符结合   |
| in     | 等价与 列表中的 任何                                       |
| any    | 比较子查询返回的每个值，不能单独使用，只能与单行比较符结合 |
| some   | 同 any                                                     |
| exists | b表示 子查询已经 至少返回一条查询记录                      |

还提供 函数 进行替代 子查询

| 属性 函数 名              |                                |
| ------------------------- | ------------------------------ |
| size size()               | 获取集合中数目                 |
| minIdex minIdex()         | 对于 建立所以集合，取最小      |
| maxIndex maxIndex()       | 对于 建立所以集合，取最大      |
| minElemenet minElemenet() | 对于包含基本类型的集合，取最小 |
| maxElement maxElement()   | 对于包含基本类型的集合，取最大 |
| elemnets()                | 获取集合中的所有函数           |

```sql
 where 0<(select count(*) from c.students)
 // 等同
 where 0<(size(c.students))
```

## 6.4 Hibernate 事务管理

Hibernate 本身 没有事务能力，事务管理 交给类 底层的 JDBC 或者 JTA 实现事务调度。

### 6.4.1  数据库事务

数据库 四大特性：

+ 原子性   事务时应用中最小的执行单位，全部操作 与 数据库中不可分割，全部执行 或者 全部不执行
+ 一致性   几个并行执行的事务，其执行结果必须 与 按照 某一顺序执行的结果相同
+ 隔离性  各个事务之间 互不干扰，事务执行的中间结果 对 其他事务必须透明
+ 持久性   事务一但提交，对数据的所有操作 记录 都物理数据库中，保证不被丢失

事务的 ACID 以上四个特性，由关系形数据库实（DBMS）现。

> DBMS 采用日志来保证事务的原子性、一致性、持久性。日志记录了事务对数据库所做的更新，如果某个事务在执行过程中发生错误，就可以过根据日志，撤销事务对数据库已做的更新，执行回滚。

> 对事务的隔离性，DBMS 采用 锁的机制 实现。当多个事务同时进行数据更新时，只允许 持有锁的事务更新该数据，其他事务必须等待，直到前一个事务释放类锁，其他事务才能进行更新数据。

#### 事务隔离不完全，导致并发问题：

+ **更新丢失** ： 当两个事务同时更新同一数据，由于某一事务的撤销，导致另一事务对事件的修改也失效了，这就是更新丢失。
+ **脏读** ： 一个事务读取到另一个事务还没有提交，但已经更改的数据。这种情况下数据可能不一致。
+ **不可重复读** ： 当一个事务读取了某些数据后，另外一个事务修改了这些数据，并提交了。这个事务再去读取时发现，数据和之前的不同。
+ **幻读** ： 同一查询在同一事务中多次进行，但由于其他事务的插入，导致每次读取的数据都不同。可以理解为 不可重复读的一种。 **幻读** 第二次读时，数据有新增。**不可重读**第二次读时，数据 有更新 或者减少。

大致理解：

1. A事务更新数据时，数据 被 B事务 撤销了。所以 更新失败
2. A 事务 读数据时，读到了 B 事务，修改还没提交的数据，如果 此时 B 撤销了更新，A 事务 就脏读了没有提交的数据。
3. A 事务 读取后，B事务 对数据进行更新，导致 A 再读 时，两次数据不同。
4. A 事务 读取后，B事务 对数据新增，导致 A 再读 时，两次数据集不同。

#### 隔离级别

因为事务 之间隔离级别的存在，对于具有相同输入、相同执行流程的事务可能产生不同的执行结果

数据隔离性越高，数据越准确，并发性能越低。

ANSI/ISO  SQL 92定义的 隔离级别：

+ **序列化** ： 所有事务之间完全隔离。所有事务 不能并发执行。事务完全隔离
+ **可重复读**： 所有的 Select 语句 读取的数据都不能被修改。
+ **读已提交**：读取数据的事务预先其他事务继续访问它正读取的数据，但是 **未提交的写事务** 将禁止其他事务正在写的数据。
+ **读未提交** ： 如果一个事务正在写数据，不允许其他事务写，但允许 其他事务读取它正在写的数据。故而 一个事务 可能 读取到 其他事务 未提交 的数据。（脏读）

| 隔离级别 | 更新丢失 | 脏读                                                         | 不可重复读                                                   | 幻读                             |
| -------- | -------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------------------------------- |
| 序列化   | 不发生   | 不发生                                                       | 不发生                                                       | 不发生                           |
| 可重复读 | 不发生   | 不发生                                                       | 不发生                                                       | 读就数据时，可以新增数据（发生） |
| 读已提交 | 不发生   | 不发生                                                       | A 事务读的数据 ，可以被 B事务写，但是 B事务没有提交，不允许其他事务再读该数据（发生） |                                  |
| 读未提交 | 不发生   | A 事务 正在写数据，还没提交，不允许 他去事务 也来写数据，放在 更新丢丢失，但允许 其他事务来读还没提交的数据。（发生） |                                                              |                                  |

以上全部 都是 在 一个事务执行过程中的。例如 ： A事务整个过程可能要读甲数据5次，第一次 读取 到 甲数据 被B 修改后没提交的数据，在 第一 与第二次之间，B事务 执行回滚 或者 数据修改，导致 第二次 读取 与第一次不同。

2019年7月7日21:48:01

> Hibernate.connection.isolation = 4 // 可重复读

## 6.5 Hibernate批量数据处理

由于 Hibernate 的 session 会缓存 关联的 实例，所有 在批量保存时需要 定期清理缓存 提交事务，和 Hibernate 的 二级缓存 关闭。避免 内存 溢出，

```java
Transaction tran = session.beginTransaction();
session.save(xxx);
if (xxx) {
	session.flush();
    session.clear();
    tran.commit();
    tran = session.beginTransaction();
}

// hibernate.cache.use_second_level_catch false
```

查询修改：

可以 使用 `query.srcoll()` 进行 数据遍历修改。