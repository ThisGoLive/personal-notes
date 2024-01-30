# 框架MyBatis #
2018/1/19 星期五 下午 12:41:49 
## 概念 ##
就是一般的Java代码，封装了的。

三层架构中，每层都有自己的框架。而MyBtis就是持久层的框架。

半自动：要自己去写sql语句，MyBTis；

全自动：不需要写sql， hibernate；

ORM:o对象 r关系 m模型（上面两种都是属于对象关系模型）;

是优秀的持久层框架，主要封装了底层jdbc，数据操作代码，让开发可以实现不写一句jdbc代码，也能和数据交互。

1.	半自动：虽然封装看底层很多内容。但是sql语句还是要开发者来编写，能让开发中控制sql执行效率；  
	.	对象关系模型：java 中是面向对象编程，对于数据库，核心表，使用的关系型数据库。那就会存在阻抗，从对象到关系的转化以前需要我们自己去完成，MyBTis可以染成这块操作。

## xml配置文件 ##

可以通过xml配置多个数据库，达到一个程序连接多个数据库.(加载驱动)

连接数据库配置的conf.xml

	<?xml version="1.0" encoding="UTF-8"?>
	<!DOCTYPE configuration
	  PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
	  "http://mybatis.org/dtd/mybatis-3-config.dtd">
	
	<configuration>
	
	  <environments default="development">
	    <environment id="development">
	      <transactionManager type="JDBC"/>
	      <dataSource type="POOLED">
	        <property name="driver" value="com.mysql.jdbc.Driver"/>
	        <property name="url" value="jdbc:mysql://localhost:3306/mydb"/>
	        <property name="username" value="root"/>
	        <property name="password" value="gl418"/>
	      </dataSource>
	    </environment>
	  </environments>
	
	  <mappers>
		//加载sql语句 加载的xml的路径
	    <mapper resource="com/project/mapper/UserMapper.xml"/>
	  </mappers>
	
	</configuration>


书写sql：书写sql语句于xml文件中，mapper文件

加载sql语句的UserMapper.xml

	<?xml version="1.0" encoding="UTF-8"?>
	<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
	
	//namespace=  引入其他的的mapper   本文件的路径  本文件内的，默认就不写
	<mapper namespace="com.project.bean.UserBeanMapper">
	
		//id="getUser"  	确定唯一化，不重名
		//parameterType="int"  参数数据类型
		//resultType="com.project.bean.UserBean">  返回数据类型
		
		<select id="getUser" parameterType="int" resultType="com.project.bean.UserBean">
			select * from t_user where id=#{id} //要载入的sql语句 也可以用?占位符
		</select>
	
		//增删改查标签名依次对应
		<!-- <select id="getAllUser">
			select * from t_user;
		</select> -->
	
	</mapper>

读取xml，运行

	String ur = "连接数据库配置的xml文件所在的路径";
	InputStream in = Resources.getResourceAsStream(ur); //文件流读取xml，
	SqlSessionFactory ssf = new SQLSessionFactoryBuild.build(in);
	SqlSession session = ssf.openSession(); //得到连接对象；
	
	JavaBean bean = session.selectOne("sql语句xml的路径.select ID ",参数值（即站位符的值）);
	例：session.selectOne("com.project.mapper.mapper.getUser", 2)

查询出多个javabean 时：

	返回类型还是javabean  框架会自动添加进集合。但不是调selectOne方法了。而是selectList；

多条件的增删改查：通常是参数类型为javabean  
	
		<select id="" parameterType="int" 
		resultType="com.project.bean.UserBean">
			select * from t_user where f_usernaem=#{f_usernaem} and  f_pwd=#(f_pwd)
			//此时#()内不能随意写，而要与前者对应。
			//我遇到在这里${f_username}将传进来的字符串属性，变成了没有引号的，就一直报错，$就如同creatsta  先拼接后编译   # ：pertersta 预编译
	
		</select>

增删改 事务：同时成功 同时失败。

手动提交事务，session.commit();

之前因为jdbc中有自动提交事务，con.setcommiter（true）,所以没有手动提交事务；
## xml标签含义 ##

#### environments : 
 环境  defult"devement"  默认连接devement

#### environment: 
具体的数据库  多个环境 id="" 每个环境我唯一标识 默认devement
	
	//不修改environment时，可以不填
	SqlSessionFactory ssf = new SQLSessionFactoryBuild.build(in); 
	
	//若要选择 .build(in，""具体environment的id) 

#### transactionManager: 
事务管理器 默认 type="JDBC";

dataSource: type
	
	UNPOOLED:不用连接池。
	POOLED（默认）：使用连接池（预先放连接）  不是客户来一个开一个再关，

mappers:导入sql语句xml
mapper：具体哪个	
properties ：导入 键值对的     ${};

porperrtie 下还有个 setting log4j 打印一些记录。

#### 设置类的别名 
	typeAlias alias=""别名  type=""全路径

#### 设置所有包
	 package  mybatis01  详细代码

### 数据库属性名与JavaBean不同 ###

	<select id=""getUser resulitMap="userMap"></>
	
	<resulitMap id="userMap" type="UserBean">
	
		//代指数据库中的主键
		<id property="id" column="pk_id"> </id>  
	
		//非主键属性  *n
		<result property="" column="f_username"></result>  *n
	</>

### 多参数时 ###

####一、map集合

	直接传参为map。
	<select id=""getUser parameterMap="userMap">  #{}/? </>
	<parameterMap id="userMap" type="java.util.map">
		//将property键转为f_** 表中属性值
		<parameter property="f_**" ></>		
		
	</>

####二、注解

。。。
###  多表操作（关联关系） ###

####一对一的关系：

	表中就互放对方的ID；
	javabean中互放对象：
	
	sql语句直接连表全部查询出主Javabean 和 属性Bean
	当对象有bean对象属性时，如何直接添加：

#####assocition 封装对象

	<resulitMap>内添加前必须有 id 和 result  如果是resulttype 就无法创建属性对象
	<association property="bean属性名" javaType=""类名 >
		
		<id property="id" column=""表中></>
		<result property="name" column="f_name"表中 ></> *n
		
	</assocition>
	
	以上association 后加resultmap  可以添加一个resultmap;在新的中再创建
	
	例：
	<select ... resulitMap="userMap"></>
	
	<resulitMap id="userMap" ... ><assocition ... resulitMap="1ap"></>
	<resulitMap id="1ap" ... ><assocition ... resulitMap="2ap"></>

####一对多：

	表中  多有一的唯一标识：
	bean中 一有多的集合  一有多的引用：

#####collection 封装集合

	<collection property="" ofType=""(集合范形) >
		<id property="name" column="f_name"></>
		<result property="name" column="f_name"></> *n
	</>

####多对多：

	表中  看做多个一对多  都有唯一标识存与第三表；
	bean中 都有对方的list集合；
	
	基本同一对多	查询是三表联立；

## 动态sql语句 ##

也是标签完成

### if标签 	
用于拼接查询的语句

	<select id="唯一标识" parameterType="Blog" resultType="Blog">
	
	  SELECT * FROM BLOG 
	  WHERE 1 = 1
	
	  <if test="title != null">  //test后就接判断语句 直接取对象的属性名
	    AND title like #{title}
	  </if>
	</select>

### where if 标签 ###
用于拼接查询的语句

	<select id="findActiveBlogLike" 
	 parameterType="Blog" resultType="Blog">
	  SELECT * FROM BLOG 
	
	  <where>  //选择性的添加   
	
	    <if test="state != null">
	         state = #{state}
	    </if> 
	    <if test="title != null">
	        AND title like #{title}
	    </if>
	    <if test="author != null and author.name != null">
	        AND author_name like #{author.name}
	    </if>
	
	  </where>
	</select>

### set 标签 ###
用于拼接修改的语句

	//注意：若set下面的所有的if 都不成立时 set 不会添加到语句中去 就会造成语句报错
	//解决办法：set 下加上     <if test="id!=0">id=#{id}</>
	<update id="updateAuthorIfNecessary"
	   parameterType="domain.blog.Author">
	   update Author
	    <set>
	      <if test="username != null">username=#{username},</if>
	      <if test="password != null">password=#{password},</if>
	      <if test="email != null">email=#{email},</if>
	      <if test="bio != null">bio=#{bio}</if>
	    </set>
	  where id=#{id}
	</update>


## 延迟加载（懒加载） ##

### 概念 ###
为避免不必要的性能开销而设计的。

所谓延迟加载：当业务真正需要数据的时候才发送sql是语句去响应的数据。
延迟加载的有效期是Session打开的情况下。当Session 关闭后，就无效了。

目的：减少数据库的压力，先查询主要的信息，关联的信息 等需要的时候，再去查询。

### 如何实现 ###
####1.

	<association ... select = "(com.project.mapper.xml名.)唯一表示"  column="当前的查询出来的唯一标识ID">无</>
	//去执行其他代码 
####2.

	conf.xml 中 settings 添加一行
	
	//在查开启延迟加载
	<setting nam询过程中e ="lazyLoadingEnabled" value="true"></>
	
	//将加载的内容编程消极加载（积极加载）
	<setting name ="aggressiveLazyLoading" value="false">
	
	//当返回的数据要操作到关联信息时，就会去查询并加载 封装 返回

**如果出现了多个sql语句xml。就要全部加载到conf.xml中**

## MyBatis缓存 ##

都是同一个sql语句，就会从sqlSession中取出之前查询的

#### 一级缓存：

存储的作用域就是sqlSession 底层就是hashmap 。一旦Session 对象销毁(.close（）)，清空（.clearcache()）。一级缓存就失效

若见检测有增删改  就会自动清空一级缓存。

#### 二级缓存：
与一级缓存相同，都是hashmap。存储查询后的数据。存储的作用域为mapper(一个命名空间)，而且可以自定义储存
	
mapper级别。 可以跨Session。就是多个用户都可一用。
默认关闭的，在Session 中打开二级缓存。

若见检测有增删改  就会自动清空二级缓存。（同Session一样，原则。）

	打开方式：
	在conf.xml中   <setting name="cacheEnabled" value="true"></>
	
	//即 只要是该xml文档中的语句就会开启   缓存
	在sqlxml中添加<cache />
	
	//  如果，Session不同  即每次的Session是新的factory打开的，就不是一个同一个，就不会存储。即一个factory就够了；


**每次方法完成就就可以把Session关了，线程不安全，一个Session就是一个连接对象**
#### 过程 ####

程序》》一级》》二级》》数据库

## mapper实例 ##
####一、
	javaDao :  com.project.dao.javaDao

####二、sql语句的xml文件
允许多条sql语句写在同一个语句块中，分号隔开，并且在jdbc 连接时加上 参数。用得少。

	<?xml version="1.0" encoding="UTF-8"?>
	<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
	<mapper namespace="com.project.dao.javaDao">************
		
		<select id="getUser" parameterType="int" resultType="com.project.bean.UserBean">
			select * from t_user where id=#{id} //要载入的sql语句 也可以用?占位符
		</select>
	
	</mapper>

**注意：此时，所有的javaDaos 方法全部必须与xml中的 意义对应： 方法名 ==id 参数类型==parameterType 返回类型相同 ！集合同上**

#### 三、得到代理对象 Session自己生成的对象

	javaDap dao = Session.getmapper（javaDao.class）；
	
	Session.close（）；
		
	insert into 表名（） values
	<foreach collection="li" item="item" indext="index" sparator=",">
	(#{item.属性名，jdbcTYPE="数据类型"});
	</>

**1.resulitMap 内可以有多个 association   2.association是可以有resultMap属性 调用其他的resultMap（但我一直报错） 3.association内可再写association**
	