# spring JPA #
spring data 下了一个框架   由很多的子框架

（与数据有关的）持久层框架规范   完成了 对Hibernate 的进一步封装  （就是Hibernate）
## 导包 spring data jpa ##
+ 引入此包  会自动引入spring 包   
+ 再导Hibernate 的包
+ 数据源 连接池
+ mysql jdbc 包
+ 测试  junit 和 spring-test

**Repository**   持久层
## 配置 ##
1-3基本同起前面  

4.配置session工厂时  是在之基础上完成了对dao接口的实现  ：

```xml
<!-- 4、配置localEntityManagerFactoryBean 在sessionFactory的基础上，并且完成了对Dao接口的实现 -->
<bean id="localEntityManagerFactoryBean"
class="org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean">
	<!-- 需要数据源连接中，提供连接 -->
	<property name="dataSource" ref="dataSource"></property>
	<!-- 配置Jpa底层操作时，依旧需要转换成Hibernate的操作方式 -->
    <property name="jpaVendorAdapter">
		<bean 		class="org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter">		</bean>
	</property>

	<property name="jpaProperties">
		<props>
			<prop key="hibernate.dialect">org.hibernate.dialect.MySQLDialect</prop>
			<prop key="hibernate.show_sql">true</prop>
			<prop key="hibernate.format_sql">true</prop>
		</props>
	</property>
    
	<property name="packagesToScan">
		<list>
			<value>org.framestudy.springJpa.beans</value>
		</list>
	</property>
</bean>
```
5.配置事务管理器

```xml
<!-- 5、配置事务管理器 -->
<bean id="transactionManager" class="org.springframework.orm.jpa.JpaTransactionManager">
	<property name="entityManagerFactory" ref="localEntityManagerFactoryBean"></property>
</bean>
```

6、配置spring容器管理事务的两种方案：

```xml
<!-- spring容器提供了2种事务管理手段，1种：编程式事务管理方法，2种：声明式事务管理方法（常用） -->
<!-- 声明式事务管理方案1: 注解控制事务 <tx:annotation-driven transaction-manager="transactionManager"/> -->

<!-- 声明式事务管理方案2: 切面控制事务（常用） -->
<tx:advice id="txAdvice" transaction-manager="transactionManager">
	<tx:attributes>
		<tx:method name="*" read-only="true" />
		<!-- 定义新增方法 -->
		<tx:method name="add*" read-only="false" isolation="DEFAULT"
			propagation="REQUIRED" rollback-for="java.lang.Exception" />
		<tx:method name="save*" read-only="false" isolation="DEFAULT"
			propagation="REQUIRED" rollback-for="java.lang.Exception" />
		<tx:method name="insert*" read-only="false" isolation="DEFAULT"
			propagation="REQUIRED" rollback-for="java.lang.Exception" />
		<tx:method name="create*" read-only="false" isolation="DEFAULT"
			propagation="REQUIRED" rollback-for="java.lang.Exception" />

		<!-- 定义修改方法 -->
		<tx:method name="update*" read-only="false" isolation="DEFAULT"
			propagation="REQUIRED" rollback-for="java.lang.Exception" />
		<tx:method name="modify*" read-only="false" isolation="DEFAULT"
			propagation="REQUIRED" rollback-for="java.lang.Exception" />
		<tx:method name="change*" read-only="false" isolation="DEFAULT"
			propagation="REQUIRED" rollback-for="java.lang.Exception" />

		<!-- 定义删除方法 -->
		<tx:method name="delete*" read-only="false" isolation="DEFAULT"
			propagation="REQUIRED" rollback-for="java.lang.Exception" />
		<tx:method name="remove*" read-only="false" isolation="DEFAULT"
			propagation="REQUIRED" rollback-for="java.lang.Exception" />
	</tx:attributes>
</tx:advice>

<aop:config>
	<aop:pointcut id="pointExpression"
		expression="execution(* org.framestudy.springJpa.*mag.service.impl.*ServiceImpl.*(..))" />
	<aop:advisor advice-ref="txAdvice" pointcut-ref="pointExpression" />
</aop:config>

<!-- 开启切面的动态代理支持 -->
<aop:aspectj-autoproxy></aop:aspectj-autoproxy>

<!-- base-package 主要完成自动扫描，扫描满足JPA规范的DAO接口 -->
<!-- entity-manager-factory-ref 再使用这个标签所对应的localEntityManagerFactoryBean，完成对上述接口实例化，并且注入Session -->
<jpa:repositories base-package="org.framestudy.springJpa"
	entity-manager-factory-ref="localEntityManagerFactoryBean"></jpa:repositories>
```
#### base package  ####
//主要完成自动扫描 扫描满足jpa规范的dao接口 

//

**Repository**   持久层 继承 JpaRepository<k,v>

延迟加载  web.xml中配置  OpenEntityManagerInViewFilter 过滤器：  同 OpenSessionManagerInViewFilter

持久层用 getOne(int id )  等同于 Hibernate 中的load   对象加载是延迟加载
#### 增删改 ####
持久层 会自动封装 session   直接调用方法
#### 查询 ####
基本的 有  可以直接调用方法

复杂的 可以通过 固定方法名字规范  后台自动拼接   jpql
#### 分页 ####

  	PageAble pageAble = new PageRequest（int page，int size） 	
page 重0开始  第一页    size 每页多少个

	new  sort（Direction.ASC,"bean 中所按哪个字段进行排序"）   加入pageAble 的构造中
	new PageRequest（int page，int size ，Direction.ASC，String...） 	  多个字段进行排序
#### 自定义方法名(自定义查询语句) ####
持久层接口  该方法 用@Query（value=“ jpql语句”） 注解

	@Query(value="From Userbean as u where (u.age between ?1 and ?2) and ")
也可以  new 对象   来进行按需查询

	@Query(value="select new Map（u.xx as xxx,）From Userbean as u where (u.age between ?1 and ?2) and ")
多表联查  加fetch只查询主对象  不加 会查询两个表的 
	
	@Query(value="From Userbean as u Left join fetch u.sets set where (u.age between ?1 and ?2) and ")
总之基本类似  hql 的语法  参数 写法不同

**用此注解时 参数不能传对象** 
#### 修改  注解 ####
@Modifiying   只用与 会对数据库造成影响的地方  比如      和@Query 共用 非查询时

Query注解中 value属性 可以直接书写sql 语句  需要配合nativeQuery=“true”

	@Query（value=“sql”，nati veQuery=“true”）
#### 按需查询 ####
使用criteria 完成多条件 灵活查询

```java
public Page<UserBean> findUserBeanByParams(Map<String, Object> params, Pageable pageable) {
	// TODO Auto-generated method stub
	return userRepository.findAll(new Specification<UserBean>() {
		@Override
		public Predicate toPredicate(Root<UserBean> root, CriteriaQuery<?> query, CriteriaBuilder cb) {
			// TODO Auto-generated method stub
			//创建一个 断言集合，Predicate叫做断言， 断定…… (实际上，这里的断言，大家就认为是：添加条件)
			List<Predicate> predicates = new ArrayList<Predicate>();
			//我们自己的条件代码，写在这里
			if(params.containsKey("min") && !TextUtils.isEmpty(params.get("min"))) {
				predicates.add(cb.ge(root.get("age"), (int)params.get("min")));
			}
			
			if(params.containsKey("max") && !TextUtils.isEmpty(params.get("max"))) {
				predicates.add(cb.le(root.get("age"), (int)params.get("max")));
			}
			
			if(params.containsKey("gender") && !TextUtils.isEmpty(params.get("gender"))) {
				predicates.add(cb.equal(root.get("gender"), (int)params.get("gender")));
			}
			
			if(params.containsKey("userName") && StringUtils.hasLength(params.get("userName").toString())) {
				predicates.add(cb.like(root.get("userName"), ""+params.get("userName").toString() + "%"));
			}
			
			//复合对象的属性，属性取法例如：root.get("adds").get("addressName").as(String.class)
			
			//先定义一个数组，数组的大小 与 集合大小保持一致
			Predicate[] pre = new Predicate[predicates.size()];
			//将集合中拼接的条件，调用toArray()转换到数组中去，然后使用and()完成对数组中条件的拼接
			return cb.and(predicates.toArray(pre));
		}
	}, pageable);
}
```