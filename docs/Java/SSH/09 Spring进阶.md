[[TOC]]

# 第九章：Spring 进阶

AOP 概述、Spring AOP、Spring 事务管理

# 9.1 AOP 概述

AOP ： 面向切面编程，是面向对象编程的一种补充，OOP的延续。

### 9.1.1 AOP 应用场景

基本适合所有的场景，如果在多个业务六次中需要做相同或者类似的业务处理，则适合AOP解决。

### 9.1.2 AOP 原理

在系统中的业务可以分为核心关注点何横切关注点。可选关注点是业务处理主要流程，横切棍子点是与核心业务无关但更为通用的业务，常常发生在核心关注点周围并且代码类似，如同日志、权限登，各个横切关注带你离散地穿插与核心业务之中，导致每一个模块都与这些业务具有很强依赖性，当需要添加新的横切功能时，往往需要修改大量代码，非常印象系统的维护性与扩展性。

AOP 术语：

+ 连接点（Joinpoint）： 链接点是指代码中一下具有边界性质的特定位置，AOP 框架可以针对链接点配置切面。连接点的类型有很多，类初始化前、初始化后、类的某方法调用前后、方法异常抛出时等。Spring 框架的AOP 只有针对 方法的连接点。
+ 切入点（Pointcut）： 指被增强的连接点。当某个链接点满足预先指定的条件时，AOP 框架能定位到这个连接点，该连接点将被增强（Advice），就变成一个切入点
+ 增强（Advice）： 添加特定的连接点上的一段程序代码。包含用于添加到目标连接点上的一段执行逻辑，以及用于定位连接点的位置信息。在Spring 中 提供的增强接口都是带方位名的，如：BeforeAdvice AfterAdvice
+ 目标对象（Target）：需要添加增强的目标类。借助于AOP框架，业务类可以只实现核心业务，而日志、事务管理等横切关注点通过 AOP 框架添加到特定的连接点上。、
+ 引入（Introduction）： 一种特殊的增强，可以为目标类添加一些属性与方法。即使一个业务类原本没有实现某个接口，通过 AOP 框架的 引入 功能，也可以动态地为该业务类添加 接口逻辑
+ 织入（Weaving）： 将增强 添加到目标类具体的 连接点上的过程。AOP 框架 负责将 **目标类** **增强** 连接在一起。常见AOP 框架织入实现方式： 编译期、类装载期、运行期 等各个阶段
+ 代理（Proxy）： 目标类被AOP 框架织入后产生一个结果类，拥有 目标类 与 增强 逻辑，即称为 目标类的 代理类。更具织入方式不同，代理类分为： 同时实现目标类相同业务接口、直接为目标类的子类
+ 切面（Aspect）： 切面由切入点 和 增强 组成，包括增强逻辑的定义 与 切入点的定义，AOP 框架负责实施切面，将 切面定义的增强逻辑织入到切面所指定的链接点中

### 9.1.3 AOP 的实现策略

Java程序从源码到最终运行： 编写源码—编译成字节码—加载字节码—运行程序

而织入增强 都可以从这些阶段执行

+ JavaSE  动态代理：

  > 即 Spring 源码文件下 《7.3.3.2.1 JDK 代理》
  >
  >  Java 1.3 引入的动态代理是实现 AOP 的最简单直接方式，使用动态代理可以为一个或者多个 接口在运行期动态生成 实现对象。
  >
  > 优点：动态代理是Java 语言标准特性，除了AOP 框架外，无须引入任何第三方的类库。
  >
  > 缺点：动态代理 只能 针对接口进行代理，不能针对类。另外，动态代理是通过反射实现，需要考虑 反射的性能开销

+ 字节码生成：

  >  即 Spring 源码文件下 《7.3.3.2.2 CGLIB 代理》
  >
  > 如果需要对类进行代理，动态代理就不能使用，便可以使用 **动态 字节码** 生成。指在运行时 动态生成指定类的一个子类对象，并覆盖 其中特定的方法。
  >
  > 常用的 工具 即 **CGLIB**
  >
  > 一、开启 `<aop:aspect-autoproxy proxy-target-class="true" />`
  >
  > 二、 引入 CGLIB 包  Spring_HOME/cglib/*.jar

+ 定制的类加载器：

  > 如果需要对某个类的所有对象 都添加增强，即 这个类通过 new 操作 所有对象都增强，上面两种基本无法实现。动态代理 和字节码生成 本质 都是需要动态构造代理对象，即最终被增强的对象是由 AOP 框架生成的，而不是 开发者 new 出来的。 解决上面问题方案 是实现自定义的类加载器，即 在类 被加载时就 对其进行增强。
  >
  > 即 spring 源码文件下 《7.5 创建AOP 静态代理》
  >
  > 在 启动虚拟机 添加 -javaagent:D:\spring-agent-2.5.6.jar  自定义的 包

+ 代码生成： 利用 工具在已有代码基础上直接生成新代码
+ 语言扩展：如果 Java语言进行扩展，提供一个全新的编译器。AspectJ 是采用这种方式实现 AOP 的常见Java 扩展。

## 9.2 Spring AOP

Spring AOP  支持使用 xml 与 注解

### 9.2.1 增强的类型

Spring AOP增强的功能只有 方法级增强，针对方法的执行前后，异常情况

+ 前置增强：方法运行前执行增强，如果 这个增强不抛出异常 则连接点执行
+ 后者增强：无论什么情况下，连接点只要退出就会执行
+ 返回后增强：指 连接点没有抛出异常 正常结束 执行
+ 抛出异常后增强：连接点 抛出异常 执行
+ 环绕增强：包围 连接点方法的增强。可以替代上述任何一种
+ 引介增强：能使目标类实现某个指定的接口

Spring 2.0 开始支持 POJO 定义增强，并提供两种配置方式以支持声明式AOP

+ XML
+ 注解 @Aspect @Pointcut

### 9.2.2 使用 XML 配置 Spring AOP

xml 配置 现在基本不怎么使用，配置量大

主要 Spring 配置文件 引入 命名空间  `www.springframework.org/schema/aop`

主要标签：

+ aop:config ： 主标签
+ aop:pointcut 配置 AOP 切入点  方法路径
+ aop:advisor 配置 AOP 增强  
+ aop:aspect 配置 AOP 切面 类对象
+ aop:declare-parents 引入
+ aop:before 前置
+ aop:after 后者
+ aop:after-returning 正常
+ aop:after-throwing 异常
+ aop:around 环绕配置

### 9.2.3 使用 注解配置

Spring AOP 注解实现，使用了 AspectJ 进行实现的，AspectJ 是一个强大的 AOP 框架，扩展了标准Java语言，为Java添加了针对AOP的很多特殊语法结构，并提供专门的编译器以生成遵守Java字节码规范的class文件，不是纯粹的Java

Spring 框架只是直接使用 AspectJ 的注解，但并没有使用 AspectJ 的编译器或者织入器，仍然是在运行时动态代理

1. 开启 AspectJ 注解

   > 同上 配置文件需要引入命名空间，使用 aop:aspect-autoproxy 开启
   >
   > proxy-target-class 属性 若配置为 true  则，spring 使用 CGLIB生成默认为fasle
   >
   > expose-proxy 属性为 true时，会将代理对象放到 ThreadLocal 中，使用 `AopContext.currentProxy()  `获取当前代理对象，默认false

2. 配置切面

```java
@Aspect
public class AspectTest {

	// 所有包中 所有类中的doing名 的方法都会 被
	@Pointcut("execution(* *.doing(..))")
	public void master() {}
	
	@Before("master()")
	public void beforeTest() {
		System.out.println("执行所有的doing方法前执行Before");
	}
	@After("master()")
	public void afterTest() {
		System.out.println("执行所有的doing方法后执行after");
	}
	// Around 注解 会代理 doing 方法执行
	@Around("master()")
	public Object aroundTest(ProceedingJoinPoint pjp) throws Throwable {
		System.out.println("around开始代理 doing执行");
		Object  o = pjp.proceed();
		System.out.println("around代理 doing执行完成");
		return o;
	}
}
```

并没由使用自定义注解来进行

自定义注解，无非 就 是多了一步 将之整合

## 9.3 Spring 事务管理

### 9.3.1 Spring 事务支持

Java EE应用的事务策略分为：全局事务与局部事务。全局事务 （分布式事务）需要使用 JTA （Java Transaction API），局部事务只需要 JDBC事务支持即可（只是关系型数据库）

**全局事务：**通常由Java EE应用服务器管理，需要使用 **[EJB](https://www.cnblogs.com/strugglion/p/6027318.html)**（把你编写的软件中那些需要执行制定的任务的类，不放到客户端软件上了，而是给他打成包放到一个服务器上了） 并得到应用服务器提供的 **JTA**支持，JTA 需要通过 **[JNDI](https://www.cnblogs.com/xdp-gacl/p/3951952.html)**获取，因此用户的应用无论跨多个事务资源，还是使用单一事务性资源，EJB 都要求使用全局事务加以处理。

**局部事务：**是基于单一事务性资源。通常和底层的持久化技术有关，例如，采用JDBC，需要使用 Connection对象来操作事务，当采用Hibernate时，需要Session操作事务

当多个事务时，Spring 会寻求 Java EE应用服务器支持，勇敢引用服务器的 JNDI 资源完成对 JTA 事务支持。使用少

但主流 还是 **局部事务**。

Spring  框架 局部事务提供两种管理： **编程式事务** **声明式事务**

编程式事务：Spring 提供了 高层次统一的事务模型抽象，底层都可以使用统一的编程模型控制事务，通过 **TransactionTemplete** 与 **TransactionCallback**回调接口指定具体的持久化操作即可完成编程式事务管理。

**声明式事务：**大多数使用。支持 XML 配置 与 注解两种事务声明。

Spring 框架的声明式事务管理通过 其AOP 框架实现。通过事务的声明性信息，Spring 负责将事务增强逻辑织入到业务方法相应的连接点上。逻辑包括 ： 获取线程绑定资源、开启事务、提交\回滚事务、进行异常转换和处理

Spring 框架提供的事务管理抽象层主要 `org.springframework.transaction`包下的三个接口：

+ TransactionDefinition
+ TransactionStatus
+ PlatformTransactionManager

#### 9.3.1.1 TransactionDefinition 接口

描述事务的隔离级别、传播规则、超时时间、是否为只读事务，可以在编程方式设置，也可以 配置 xml 或者 注解



回顾隔离级别：

读未提交：读其他事务中，没有提交的  产生脏读

读已提交：读其他事务中，提交的新纪录、和对已有记录的更新 参数  不可重复读

可重复读：只能 读 提交新记录，不能对 已有记录的跟新的读取 幻读 （读取数据增加）

序列化：不能读取其他事务中的



传播规则：

事务的传播是指参与事务的业务方法发生互相调用时如何控制事务，即业务A中调用业务B，B采用事务控制的问题。

TransactionDefinition 借用 EJB CMT 中的事务传播分类：





超时：

TransactionDefinition .getTimeout()

只读：

TransactionDefinition .isReadOnly()

#### 9.3.1.2 TransactionStatus 接口

用于描述事务的状态，事务管理器通过该接口获取事务的运行期状态信息，也可以通过该接口间接回滚事务

+ Object createSavepoint()  创建保存对象
+ boolean rollbackToSacepoint（Object savepoint）事务回滚到特定的保存点，这个保存点都会被释放
+ void releaseSavepoint（Object savepoint）释放保存点。事务提交时，自动释放
+ boolean hasSavePoint() 当前事务是否在内部创建一个保存点
+ boolean isNewTransaction() 判断当前事务是否为新事务
+ boolean isCompleted() 当前事务是否已经结束，即是否已经 提交 或者 回滚
+ void setRollbackOnly() 当前事务设置为 rollback-only
+ boolean isRollbackOnly()  当前事务 是否为 rollback-only

#### 9.3.1.3 PlatformTransactionManager接口

事务管理器接口

+ Transaction getTransaction (TransactionDefinition def) 根据事务定义信息冲事务环境中返回一个已存在的事务，或者创建一个新事务
+ void commit（TransactionStatus  status） 根据事务的状态提交事务，如果事务状态已经被标识为 rollback-only  执行回滚
+ void rollback（TransactionStatus  status） 回滚，如果提交异常  也会执行回滚

针对不同的持久化方式 提供的不同实现：

+ org.springframework.orm.jpa.JpaTransactionManager   
+ org.springframework.orm.hibernate3.HibernateTransactionManager hibernate3
+ org.springframework.jdbc.datasource.DataSourceTransactionManager  使用 Spring JDBC、MyBatis、等 DataSource 数据源持久化时的事务管理器
+ org.springframework.transaction.jta.JtaTransactionManager 使用全局事务管理器

### 9.3.2 使用 XML 配置

引入命名空间 `http://www.springframework.org/schema/tx`

```xml
<bean id="trancationManager" class="org.springframework.transaction.jta.JtaTransactionManager">
	<property name="dataSource" ref="dataSource"></property>
</bean>

<tx:advice id="txAdvice" transaction-manager="trancationManager">
	<tx:attributes>
    	<tx:method name="get*" read-only="true"></tx:method>
        <tx:method name="save*" rollback-for="Excption"></tx:method>
    </tx:attributes>
</tx:advice>

<!-- 开启事务增强切面 -->
<aop:config>
		<!-- com.alibaba.NetCTOSS.*mag.service*.impl.*ServiceImpl.*(..) -->
		<aop:pointcut id="pointExpression"
			expression="execution(* com.alibaba.NetCTOSS.*mag.service*.impl.*ServiceImpl.*(..))
			and execution(* com.alibaba.NetCTOSS.admmag.service_demand.impl.AdminDemandServiceImpl.findAdminByAdminLoginName(..))
			and execution(* com.alibaba.NetCTOSS.usermag.service_demand.impl.UserDemandServiceImpl.findByLoginName(..))" />
		<aop:advisor advice-ref="txAdvice" pointcut-ref="pointExpression" />
</aop:config>
```

tx:method 属性：

+ name 增强的方法名 
+ propagation 事务传播类型
+ isolation 事务隔离级别
+ timeout 超时
+ read-only 只读 默认false
+ rollback-for 回滚异常类型，默认只回滚 RuntimeException
+ no-rollback-for 不回滚的异常类型 CheckedException都不会

### 9.3.3 使用注解配置

开启注解支持

```xml
<bean id="trancationManager" class="org.springframework.transaction.jta.JtaTransactionManager">
	<property name="dataSource" ref="dataSource"></property>
</bean>
<tx:annotation-driven transaction-manager="trancationManager"></tx:annotation-driven>
```

tx:annotation-driven 属性

+ transaction-manager  已经配置好的事务管理器bean id
+ proxy-target-class   是否通过 cglib  创建代理
+ order  如果业务类除事务切面外，还需要织入其他切面，通过该属性可以控制事务切面在目标连接i但的织入顺序

使用 **@Transactionl**

属性 与上一节类似。

```java
@Transactionl
public class XXXDao {
    @Transactionl(readOnly = true)
    public List<Bean> findBean() {
        
    }
}
```

