2018/3/3 星期五 下午 16:02:32 
# Spring整合管理 #
## 一、Spring整合MyBatis ##
1.	先需要找到各个框架的相关架包（用maven）
2.	用maven创建一个新的工程
3.	在工程中，组织我们自己的包结构，以及类结构，(这个工程，一般在需求分析设计阶段)
4.	编写spring容器 相关的配置文件（app...xml ）
	1. 开启扫描<context:component-scan base-package="com.test.MyBatisAndSpring"></context:component-scan>在这些包内找用了4中注解的类
	2. 引入外部数据源的配置文件
	3. 配置数据源连接池
	4. 配置Session工厂（mybatis-spring提供的）
	5. 配置mapper映射组件	
	6. .配置事务管理器 ()
	7. spring 容器提供了2种事务管理方案  (声明式管理事务方案：注解和切面。编程式事务管理方案：不常用，耦合高)
	8. 开启切面动态代理支持

### 一、 声明事务管理之注解 ###
对service的对应方法的（用于增删改的方法）：

	@transactional（isolation=Isolation.DEFAULT,
					readOnly=true,
					rollbackFor=Exception.class,
					propagation=Propagation.REQUIRED）
	方法

可以直接在类名前（是查询就不必再写了）

	@transactional（readOnly=true）
	类
#### 事务的传播 ####
以谁的事务为准；

**1**、PROPAGATION_REQUIRED：如果当前没有事务，就创建一个新事务，如果当前存在事务，就加入该事务，该设置是最常用的设置。（常用**增删改**）

**2**、PROPAGATION_SUPPORTS：**支持当前事务**，如果当前存在事务，就加入该事务，如果当前不存在事务，就以非事务执行。（常用**查询**）

3、PROPAGATION_MANDATORY：支持当前事务，如果当前存在事务，就加入该事务，如果当前不存在事务，就抛出异常。

4、PROPAGATION_REQUIRES_NEW：创建新事务，无论当前存不存在事务，都创建新事务。

5、PROPAGATION_NOT_SUPPORTED：以非事务方式执行操作，如果当前存在事务，就把当前事务挂起。

6、PROPAGATION_NEVER：以非事务方式执行，如果当前存在事务，则抛出异常。

7、PROPAGATION_NESTED：如果当前存在事务，则在嵌套事务内执行。如果当前没有事务，则执行与PROPAGATION_REQUIRED类似的操作。
### 二 、声明事务管理之切面 ###
spring已有切面。
#### 具体配置 ####
	<!-- 1.开启自动扫描 -->
	<context:component-scan base-package="com.test.MyBatisAndSpring"></context:component-scan>
	<!-- 2.引入数据库相关配置文件 -->
	<context:property-placeholder location="classpath:mysql.properties" 
	ignore-resource-not-found="true" ignore-unresolvable="true"/><!-- 设置没有找到就忽略 -->
	
	<!-- 3.配置数据源连接池 常见  c3p0,dbcp,driud(apche的)  init-method="init" destroy-method="close" 告诉程序在关闭时调用close方法消灭所有的连接 -->
	<bean id="basicDataSource" class="org.apache.commons.dbcp2.BasicDataSource" init-method="init" destroy-method="close" >
		<!-- 配置JDBC连接的基本4件套 -->
		<property name="driverClassName" value="${jdbc.driver}"></property>
		<property name="url" value="${jdbc.url}"></property>
		<property name="username" value="${jdbc.username}"></property>
		<property name="password" value="${jdbc.password}"></property>
		
		<!-- 默认自动提交true -->
		<property name="defaultAutoCommit" value="false"></property>
		<!-- true默认只读 -->
		<property name="defaultReadOnly" value="false"></property>
		<!-- 事务隔离级别  可重复读 -->
		<property name="defaultTransactionIsolation" value="4"></property>
		<!-- 配置sql语句最大时间10秒，超过就不会执行 -->
		<property name="defaultQueryTimeout" value="10"></property>
			
		<!-- 初始连接数 -->
		<property name="initialSize" value="5"></property>
		<!-- 最大连接数  配置连接池中能够激活的最大连接数 -->
		<property name="maxTotal" value="50"></property>
		<!-- 空闲区的连接条数范围  0-35 -->
		<property name="minIdle" value="0"></property>
		<property name="maxIdle" value="35"></property>
		<!-- 用于校验连接是否正常的查询语句 -->
		<property name="validationQuery" value="select now() from dual"></property>
			
		<!-- 更多配置请看 http://commons.apache.org/proper/commons-dbcp/configuration.html 
			DBCP2中文版配置参数参考：http://blog.csdn.net/kerafan/article/details/50382998-->
	</bean>		
		
	<!-- 4.配置Session工厂     给程序提供Session对象 从连接池中获取连接对象封装到Session里 -->
	<bean id="sessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
		<property name="dataSource" ref="basicDataSource"></property>

		<!-- mybatis采用“，或者“；”来完成 包的拼接-->
		<!-- typeAliasesPackage  主要是用于对包中的类 进行取别名  可以有多个  例如  有多个模块 -->
		<property name="typeAliasesPackage" value="com.test.MyBatisAndSpring.beans"></property>
	</bean>
		
	<!-- 5.配置mapper映射组件    -->
	<bean id="mapper" class="org.mybatis.spring.mapper.MapperScannerConfigurer">
		<!-- basePackage 配置自动扫描sqlmapper映射文件的基准，  若多个包要扫描，则包与包间用“，”或者“；”隔开 -->
		<property name="basePackage" value="com.test.MyBatisAndSpring.school.mapper,com.test.MyBatisAndSpring.log.mapper"  ></property>
		<!-- 将Session与程序的sqlmapper配置文件进行管理，  ：为sqlmapper接口在spring容器中，产生对应的代理实例    name="sqlSessionFactory" 则是多数据源 -->
		<property name="sqlSessionFactoryBeanName" value="sessionFactory"  ></property>
			
		</bean>
		
	<!-- 6.配置事务管理器   -->
	<!-- 之前一直是在dao层的Session事务管理  导致  如果一个业务（逻辑事务） 需要三个dao的业务（物理事务），dataSource为单数据源的事务管理器
	前面两个dao完成但后一个却没有完成，导致这个业务没完成，而前两个dao的操作却完成了 -->
				
	<bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
		<property name="dataSource" ref="basicDataSource"></property>
	</bean>
	<!-- 7.spring 容器提供了2种事务管理方案  (声明式管理事务方案：注解和切面。编程式事务管理方案：不常用，耦合高) -->
		
	<!-- 注解 连接事务管理器的id 需要各个service配置注解 -->
	<tx:annotation-driven transaction-manager="transactionManager" />
	<!-- 
	切面 连接事务管理器的id  不需再为service写注解了 配置以下就可以了
	<tx:advice id="txAdvice" transaction-manager="trandsctionManager">
        <tx:attributes>
        	<tx:method name="*" read-only="true"/>当方法名字不满足下面的时就是这个  只读
	        			
        	定义新增方法
            <tx:method name="add*" read-only="false" isolation="DEFAULT" propagation="REQUIRED" rollback-for="java.lang.Exception"/>
            <tx:method name="save*" read-only="false" isolation="DEFAULT" propagation="REQUIRED" rollback-for="java.lang.Exception"/>
            <tx:method name="insert*" read-only="false" isolation="DEFAULT" propagation="REQUIRED" rollback-for="java.lang.Exception"/>
            <tx:method name="create*" read-only="false" isolation="DEFAULT" propagation="REQUIRED" rollback-for="java.lang.Exception"/>
	      		
      		定义修改 删除等  同上
      		<tx:method name="delete*" read-only="false" isolation="DEFAULT" propagation="REQUIRED" rollback-for="java.lang.Exception"/>
      		<tx:method name="update*" read-only="false" isolation="DEFAULT" propagation="REQUIRED" rollback-for="java.lang.Exception"/>
        </tx:attributes>
   	</tx:advice>
	   	
   	<aop:config>
		<aop:pointcut id="pointExpression"
			expression="execution(* com.test.MyBatisAndSpring.school.service.imp.*ServiceImpl.*(..))" />
		<aop:advisor advice-ref="txAdvice" pointcut-ref="pointExpression" />
	</aop:config> -->
	   	
   	<!-- 开启切面的动态代理支持 -->
	<aop:aspectj-autoproxy></aop:aspectj-autoproxy>
	</beans>
## 二、Spring整合hibernate ##



1.	先需要找到各个框架的相关架包（用maven）
2.	用maven创建一个新的工程
3.	在工程中，组织我们自己的包结构，以及类结构，(这个工程，一般在需求分析设计阶段)
4.	编写spring容器 相关的配置文件（app...xml ）
	1.	开启spring 的扫描
	2.	引入外部数据源文件
	3.	配置数据库的连接池
	4.	配置Session工厂（由spring提供）
	5.	事务管理器（业务方法有处理的能力）
	6.	配置spring管理事务的2种方案
	7.	开启动态代理