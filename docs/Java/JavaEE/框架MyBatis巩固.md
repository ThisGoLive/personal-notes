# Myattis巩固 #
2018/2/1 星期四 下午 12:59:33 

dto  数据传输对象  以前的  用于数据库的数据传输，  现在由javabean  来实现

添加 sql 语句的映射层  beanmapper中添加对应dao层的接口 来映射mapper.xml 这样

1. 开闭原则（修改更换底层数据库时，不需要去修改其他层的）
2. 将sql语句和dao层的耦合更低，

mapper.xml 中mapper的namespace  就是来映射 mapper的接口

insert标签 中 useGeneratedKeys="true" keyProperty="bean.id"  将添加数据自增长表时的id存经bean的id属性

不完全的orm映射，首先就没有对象与数据库的映射，只是在查询时，才运用了一部分的orm映射的概念。
####动态拼接sql 语句 
```xml
	<set>标签 中<if test="判断语句"> sql语句 </if>

	<where>  1.标签出现的地方 就自动出现where字样   
			  2.如果where 后的内容 如果直接是and 或者是or 会自动就删除最后一个

	<set> 自动删除最后的一条的语句的逗号 
```

####类别名
```xml
	<typeall>

concat(，);  数据库函数 拼接字符串  间 用逗号隔开

	<resultmap type='javabean' id="benamap">
	//javaType 有Long string  可以小写
		<id propety="bean的属性名" column="表中字段名" javaType="" >
	</>
```
 参数别名 注解  MyBTis 推荐注解 @Param("bean")

传参数 有map就 全部数据封装进去   #{bean.

sql动态添加 时语句重复 
```xml
	<sql id='' >sql语句块</>属性名} #{map.键}
	<incolnud refid = "" >
```
####**Threadlocal  线程变量副本类** 
把重复的 提出放到公共的  需要时给出一个新的对象而不是同一个公共对象 

	public static Threadlocal<Object> loc = new Threadlocal(){
		protected SqlSession initialVlue() {
			return ssf.openSession();
		}
	}

	//然后就想键值对一样 线程id为键 对象为值  get()  得到同线程的 对象  set（obj） 添加在该线程 

####junil 注解 
运行 @before @test @after 且所有的方法全部是void 类型

断言 程序的运行结果与预期的结果是否相同？若不同就会停止程序，Assert 断言类

断点调试  

加载mapper
	
	<package name="com.test.Mybits.mapper"/>

#### sql符号转意

| 原符号  | < | <= | > | >= | & | ' | " |
| -------| -- |-- |-- |-- |-- |-- | -- |
| 替换符号| & lt;  | & lt;= | & gt; | & gt;= | & amp; | & apos; | & quot; |

## 对象关系 ##
2018/2/2 星期五 上午 9:17:33 
####**association**
单关系时 association 为单一关联对象
```xml
	<association  property column select fetchType=lazy>
```
1. property bean中属性名
2. column 表中的字段名 
3. select 一般是引用的一句select标签的id  column即为传的参数
4. fetchType 使用延迟加载
5. javaType 返回的数据类型

#### **collection** ####
同association
```xml
	<collection property="" ofType=""(集合范形) >
		<id property="name" column="f_name"></>
		<result property="name" column="f_name"></> *n
	</>
```
连表 预加载  查询完自己的，再发语句到数据库查询 及时加载

####**延迟加载（相对于及时加载时的）：**
模拟一个代理对象，给javabean。需要这个代理对象的属性时，才会从数据库中拿出。

#####**使用与配置**
```xml
	<setting name = "lazyLoadingEnabled" value=true  >//开启延迟加载
	<setting name = "aggressiveLazyLoading"  value=false >//按需加载
```
####**执行多条sql语句**
1、修改数据库连接参数加上allowMultiQueries=true，如：

	hikariConfig.security.jdbcUrl=jdbc:mysql://xx.xx.xx:3306/xxxxx?
	characterEncoding=utf-8&autoReconnect=true&failOverReadOnly=false&
	allowMultiQueries=true
2、直接写多条语句，用“；”隔开即可

	<delete id="deleteUserById" parameterType="String">
	    delete from sec_user_role where userId=#{id};
	    delete from sec_user where id=#{id};
	</delete>


若采用预加载的话 ， 那么我们可以在resultMap 中

	<result porperty=bean.id    //bean为关联对象引用  z这样就可以不yongassci
####**批量新增与批量删除**

	<insert id="">
		insert into (,,) values
		<foreach collection="传来的集合等" items="指代名" separate=",分割符 每循环一次就加一个">
				(#{指代名.属性}，)
		</foreache>
	</>

	//删除 
	delete from 表 where id in（,,..）
	foreach open= 循环开始前以什么开始 clos= 结束后以什么结束
	
log4j 返回的是第一条的update语句 受影响的条数
####**一对一** 
。。。

####**一对多**
 以一去查一关联多时 不应该用left join（因为要得到的只是一条数据，若用了就会很多条，不符合意思） 而是去select选择器
#### **多对多** ####

## 缓存 ##
#### 过程 ####
1. 一级二级都是本地缓存  与程序耦合在一起的，在内存中。
2. 先一后二都没有数据时  访问数据库，再存到一级中的内存空间  ，
3. 当同Session再访问同一语句时，直接拿出，
4. Session.close()时  数据分到会到二级中(如果开启的话)。没有就销毁了。
5. 其它线程的Session也就可以访问到二级的数据。

##### MyBatis

二级缓存是按照，名字（方法名字）来划分成多个缓存空间。结果，就造成a暂存，b存后再改，a就就没有更新为新数据。

而hiad 就可以是一个缓存 没有这个问题。

**高热点 读写比例大于2 不易修改**类型的数据适合缓存。

## 注解 ##

mapper接口中 
	
	对应的方法名：

	静态的
	@Insert(value = {"sql语句1","sql语句2"...})//对应的mapper.xml的语法
	@Options(useGeneratedKeys=true,keyProperty=bean.id)

	动态拼接的
	@updateProvider(type=新建类的全线类模板,method="对应的方法名")

	@ResultType(value=返回类型)
	@SelectProvider(type=x新建类的类名.class,method="方法明 ")
	public List<UserBean> findByParams(@Param("params") Map params);

	新建一个类，方法名（Map<String,Object> params）  //方法名随意，参数，若无惨就无，若调用方用了@Parma注解 使用了别名  此时必须为该类型。
	方法内再动态拼接sql语句（最终的sql语句  代码不够灵活）

	//若配置文件张配置了resultmap  就可以直接使用
	@resultMap（value="resultmap  的id"）  
	//没有
	@results（{
		@result(id = true,property = id ,column="",javaType = 类 .class)，
		@result(property = "",column="",javaType = 类 .class)，
			...
	//集合
		@result(property = "",column="",javaType =List.class ,many=@many(select="查询语句块"，fetchType=FetchType.lazy))
		}）