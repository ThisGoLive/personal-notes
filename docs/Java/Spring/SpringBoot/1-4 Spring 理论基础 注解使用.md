[[TOC]]

# 概要基础

2019年9月9日 - 2019年10月1日

## 第一章 Spring 基础

### 1.1 Spring 模块

（1） 核心容器 Core Container

Spring-Core ： 核心工具

Spring-Beans : Spring 定义 bean 的支持

Spring-Context ： 运行时 spring容器

Spring-Context-Support ： 读第三方包的支持

Spring-Expression ： 表达式语言  查询和操作对象

（2）AOP

Spring-AOP ：： 基于代理的AOP支持

Spring-Aspects : 基于 对 Aspects 的AOP支持

（3）消息 messaging

Spring-Messaging : 对消息框架的支持

（4）Web

Spring-Web ： 提供基础的Web集成，在Web 项目中提供Spring 的容器

Spring-Webmvc : 提供基于 Servlet 的 Spring MVC

Spring-WebSocket ： 对 WebSocket 的支持

Spring-Webmvc-Portlet : 提供 Portlet 环境支持

（5）数据访问集成  Data Access  Integrartion

Spring-JDBC ：提供 JDBC 的支持

Spring-TX ：提供 编程式 和 生命式的事务支持

Spring-ORM ：对象 关系 映射

Spring-OXM ：对象 / xml 映射

Spring-JMS ：对 JMS 支持

### 1.2 Spring 的生态

Spring Boot ：使用默认开发配置来实现快速开发

Spring XD ：简化 大数据应用开发

Spring Could ：分布式系统开发集成工具

Spring Data ：对 主流关系型 和 NoSQL 数据库的支持

Spring Integration ：通过消息机制对企业集成式 EIP 的支持

Spring Batch ：简化 和优化 大量数据的批处理操作

Spring Security ：权限 认证

Spring Social ：与 社交网络API 集成

Spring HATEOAS ：基于 HATEOAS 简化 REST 服务开发

Spring AMQP ：对 AMQP 的消息支持

Spring Mobile ：提供 手机 设备的检查功能，给不同的设备返回不同的也页面

Spring for Android :提供 在 安卓 上 消费 RESTful API 功能

Spring Web Flow ：基于 SpringMVC 提供 基于向导流程式的 Web 应用开发

Spring Web Services :提供基于协议 有限的SOAP Web 服务

Spring LDAP ：简化 LDAP 开发

Spring Session ： 提供一个 API 及实现来管理用户的会话

### 1.3 Spring 集成配置

Spring 框架的四个原则：

1. 使用 POJO 进行轻量级和最小侵入式开发
2. 通过依赖注入 和 基于接口编程 实现 松耦合
3. 通过 AOP 和 模板 减少 代码的模式化
4. 通过AOP 和默认习惯进行 生命式编程

#### 1.3.1 依赖注入

声明Bean的注解：

+ Component 组件，没有明确的角色
+ Service  用于逻辑层类
+ Repository 用于数据访问层类
+ Controller 用于表现层的控制器 SpringMVC 使用

注入 Bean的注解，基本通用：

+ Autowired spring提供
+ Inject  SJR-330
+ Resource JSR -250

配置类注解：

+ Configuration 表示当前类，为一个配置类
+ ComponentScan  自动扫描 对应属性 的包路径中 使用 声明 bean 注解的 类，并注册

#### 1.3.2 Java配置 配置类

Java 配置 是 Spring 4.x 推荐的配置方式，可以完全 替代 xml ， spring boot 也 推荐。

使用 `AnnotationConfigApplicationContext` 可作为容器

```java
// 使用 路径扫描 与 声明 声明Bean的注解
@Configuration
@ComponentScan("com.xxx.xxx.service")
public class JavaConf {
    
}
```

```java
// 只使用 配置注解 与 bean注解 不使用 声明Bean的注解
@Configuration
public class JavaConf {
    @Bean
    public TestService testService () {
        return new TestService()
    }
    @Bean
    public TestService2 testService (TestService testService) {
        TestService2 ts2 = new TestService2();
        ts2.setTestService(testService);
        return ts2;
    }
}
```

#### 1.3.3 AOP 

之前 《9 Spring 进阶》 中也使用过，如果使用注解 需要 **AspectJ** 支持。并且 Spring 只支持 方法级别的 AOP

+ 使用 @Aspect 声明切面
+ 使用 @After @Before @Around 定义建言，直接拦截规则 （切入点）作为参数
+ 除了上面 还可以使用 @Pointcut 专门定义拦截规则，然后 在 上面 的参数中调用

```java
// 自定义注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited // 可以不用
public @interface MyAnnotation {
	public name();
    public name2() default "";
}
```

```java
// 切入点
@Service
public class TestService {
    @MyAnnotation(name="add")
    public void add(){}
    public void save(){}
}
```



```java
// 切面
@Component
@Aspect
public class DoLogAspect {

	@Pointcut(value = "execution(* com.xxx.xxx.*mag.xxxService.impl.*Service.*(..))")
	public void pointcutExpression() {
		
	}
    @Pointcut(value = "@annotation(com.xxx.xxx.xxx.xxx.MyAnnotation)")
	public void pointcutExpression2() {
		
	}

	@After(pointcut="pointcutExpression()")
	public void afterReturningAdvice(JoinPoint jp,MyLog myLog, Object ret) {
	
	}
    @After(pointcut="pointcutExpression2()")
	public void afterReturningAdvice2(JoinPoint jp,MyLog myLog, Object ret) {
	
	}
    // 等等
}
```

```java
// 配置类
@Configuration
@ComponentScan("com.xxx.xxx.service") // 需要 自定义注解 与 切点 都包含
@EnableAspectJAutoProxy  // 开启 spring 对 AspectJ 的支持
public class JavaConf {
    
}
```

## 第二章 Spring 常用配置

### 2.1 Spring Bean 注解的 Scope 注解

这个注解同 配置文件中 Bean 的scope 属性同样。用于 设置 注册 bean 的实例。

+ Singleton 单例注册，整个容器共享这个实力。默认 就是
+ Prototype 每次调用 创建一个 Bean 实例
+ Request Web 项目中 给每一个 http request 新建一个Bean 实例
+ Session  Web 项目中 给每一个 http session 新建一个Bean 实例
+ GloablSession gloabl 项目中使用，给每个  gloabl http session 创建一个bean 实例

另外 Spring batch 中 使用 StepScope 注解，这里不包括

### 2.2 Spring EL 和资源的调用

Spring  EL-Spring 表达式语言，支持在xml 的 注解中使用，类似 JSP 的 EL 表达式。

Spring 开发中，经常涉及调用各种资源的情况，包含普通文件、网址、配置环境、系统变量等，这里 就可以使用 Spring EL 表达式 完成

Spring 中 主要使用 ＠Value　的参数中使用表达式

1. 注入 普通字符串
2. 注入 操作系统属性
3. 注入 表达式运算结果
4. 注入 其他Bean 的属性
5. 注入 文件内容
6. 注入 网址内容
7. 注入 属性文件

例子：

```java
@Configuration
@ComponentScan("xxx")// 扫描包
@PropertySource("classpath:xxx")// 注入 配置文件 所需要的地址
public class TestConfi {
    @Value("string") // 注入 字符串
    private String string;
    @Value("#{systemProperties['os.name']}") // 注入 系统属性
    private String system;
    @Value("#{T(java.lang.Math).randow() * 100}") // 注入运算结果
    private double doubleValue;
    @Value("#{demoService.another}")// 注入 其他Bean的 属性
    private Object value;
    @Value("classpath:xxxx") // 注入 文件内容
    private Resource file;
    @Value("http://xxx") // 注入 网址内容
    private Resource url;
    @Value("${book.name}") // 通过PropertySource得到路径，通过这里注入
    private String bookName;
    @Autowired
    private Environment environment; // 得到spring 的 Environment
    @Bean 
    public static PorpertySourcesPlaceholderConfigurer propertyCOnfigure() {
        return new PorpertySourcesPlaceholderConfigurer();
        //  注入配置文件时，需要 该 对象实例进行解析，故而需要注入一个，并且 Value 注解中使用的 是 “$” 而不是 #，注入后 配置文件 就被放在了 spring系统的 Environment 中。
    }
}
```

### 2.3 Bean 的初始化 和 销毁

Bean的初试化与销毁：在 xml 配置中 使用 init-method 和 destory-method

@Bean 注解时， initMethod 和 destroyMethod

以及 使用注解方式 用 JSR-250 的 @PostContruct 和 @PreDestroy

```java
public class BeanWay {
    public void init() {}
    public void destory() {}
    public BeanWay(){}
}

public class JSR250Bean { // 需要引入 对应jsr250的jar 包
    @PostConstruct
    public void init() {}
    @PreDestroy
    public void destory() {}
    public JSR250Bean(){}
}
```

配置文件中

```java
@Configuration
@ComponentScan("xxx")// 扫描包
public class Config {
    @Bean(initMethod="init", destroyMethod="destory")
    BeanWay beanWay() {
        return new BeanWay();
    }
    @Bean
    JSR250Bean JSR250Bean() {
        return new JSR250Bean();
    }
}
```

### 2.4 Profile

Profile 为在不同环境下使用不同的配置提供支持。开发环境 与 生产环境的配置不同。

1. 通过设定**Environment**的**ActiveProfiles**来设置当前 context 需要使用的配置环境，开发中 使用 @Profile 注解类 或者方法，达到在不同情况下选择实例不同的Bean
2. 通过设置jvm的spring.profiles.active 参数来设置  配置环境
3. Web项目设置在 Servlet 的contextparameter 中

注意3点：Servlet 2.5 及以下，配置 DispatcherServlet 时，init-param 标签中 param-name配置 spring.profiles.active， param-value 配置 production。3.0 及以上 

```java
public class WebInit implements WebApplicationInitializer {
    @Override 
    public void onStartup (ServletContext container) throws ServletException {
        container.setInitParameter("spring.profiles.defualt", "dev")
    }
}
```

例子：

```java
@Configuration
public class ProfileConfig {
    @Bean
    @Profiles("dev")
    TestBean devTestBean() {
        return new TestBean("dev"):
    }
    @Bean
    @Profiles("prod")
    TestBean prodTestBean() {
        return new TestBean("prod"):
    }
}

public class MainTset {
    public static void main(String[] args) {
        AnnotaitionConfigApplicationContext context = new AnnotaitionConfigApplicationContext();
        // 首先 设置为 生成环境配置
        context.getEnvironment().setActiveProfiles("prod");
        // 加载Bean配置类
        context.register(ProfileConfig.class);
        // 刷新容器
        context.refresh();
        TsetBean bean = context.getBean(TestBean.class);
        // 此时的bean 便是 开发环境需要的配置
        // context.getEnvironment().setActiveProfiles("prod");修改 得到对应的 配置类
    }
}
```

### 2.5 事件 （Application Event）

Spring 的事件 （Application Event）为Bean 与 Bean 之间通信提供支持。当一个 Bean 处理完一个任务之后，希望 另外一个 Bean 知道 并做出对应的处理，这是就需要 让另外一个Bean监听当前Bean所发送的事件。

1. 自定义事件，继承 **ApplicationEvent**
2. 定义事件监听器，实现 **ApplicationListener**
3. 使用容器发布事件

在 Spring 源码中 《6 容器功能的扩展》 第6节 BeanFactory 的后置处理中。

例子：

```java
// 自定义 事件
public class DemoEvent extends ApplicationEvent {
    
}

// 对应事件监听器
@Component // 定义 组件
public class DemoListenter implements ApplicationListener {
    public void onApplicationEvent (DemoEvent event) {
        //  DemoEvent得到 事件 进行处理
    }
}

// 发布事件
@Component // 定义 组件
public class DemoPublisher {
    @Autowired
    ApplicationContext context;
    // 发布事件到容器中
    public void publish() {
        context.publishEvent(new DemoEvent());
    }
}

// 运行时 直接使用 context 得到 对应 的DemoPublisher 实例，执行publish(),
// 对应的 DemoListenter 监听器 就会执行onApplicationEvent
```

## 第三章 Spring 高级话题

### 3.1 Spring Aware 意识

Spring 的依赖注入 的最大亮点就是 所有的Bean 对 Spring 容器的存在是没有意识的。即 可以将 容器替换为 别的容器

但是 在实际中，不可避免的 要 使用 Spring 容器本身的功能，这时 Bean 就必须意识到 Spring 容器本身的存在，才能使用，这就是 Spring Aware。

若 使用 Spring Aware ，Bean 将 和 Spring 框架 耦合。

Spring 提供 的 Aware 接口：

| 接口名                         | 描述                                         |
| ------------------------------ | -------------------------------------------- |
| BeanNameAware                  | 获取当前容器中的Bean 名称                    |
| BeanFactoryAware               | 获取当前的 beanfactory,这样可以调用 容器服务 |
| ApplicationContextAware        | 获取 context ，可以获取 所有的服务           |
| MessageSourceAware             | 获得 message source  获得文本信息            |
| ApplicationEventPublisherAware | 应用 事件发布器，可以发布事件                |
| ResourceLoaderAware            | 获取 资源加载器，可以获得 外部资源文件       |

```java
@Component
public class TestAware implements ApplicationContextAware {
    private ApplicationContext context; // 容器管理实例  会自动注入
}
```

### 3.2 多线程

在 S2SH  中，《10 Spring 高阶段》` 10.1.3 Spring 线程池` 中以及知道，Spring 任务执行器 **TaskExecutor**。以及四个 实现类。常用 `ThreadPoolTaskExecutor` 实现。

实际开发中，任务 一般 都是异步的非阻塞的。故而需要开启 异步支持 **@EnableAsync**，通过 在实际执行的Bean的方法中 使用 **@Async** 声明一个 异步任务。

```java
// 配置 类 需要 实现 Spring 的 AsyncCOnfigurer
@Configuration
@ComonentScan(xxx) // 配置扫描
@EnableAsync // 开启异步支持
public class TaskConfig implements AsyncCOnfigurer {
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor task = new ThreadPoolTaskExecutor ();
        task.setCorePoolSize(5);
        task.setMaxPoolSize(10);
        task.setQueueCapacity(35);
        task.initialize();
        return task;
    }
}

// 对应 的服务
@Service
public class TestService {
    @Async
    public void exe(xx) {
        //  执行逻辑
    }
}
```

### 3.3 计划任务

Spring 3.1 开始 提供 spring 自己实现的 计划任务。 

使用 @EnableScheduling 对配置类使用 ，开启 对计划任务的支持。再使用 @Scheduled 配置到 对应 的 服务中 ，设置 策略 （cron,fixDelay,fixRate）。

```java
@Service
public class TestService {
    @Scheduled(cron = "") // cron 格式
    public void doing() {}
    @Scheduled(fixRate = 5000 )  // 间隔一定时间执行  毫秒
    public void doing2() {}
}

// 配置类
@Configuration
@ComponentSacn("xxx")
@EnableScheduling // 开启支持
public class TaskConfig {
    
}
    
```

### 3.4 条件注解 **@Conditional**

在之前 使用了 profile，得到不同的bean， spring 4中 提供了一个更通用的基于条件的Bean创建，即使用 `@Conditional` 注解

`@Conditional` 根据满足投个特定条件创建一个特定Bean。

spring  boot 中 大量 使用 条件注解

集体过程：

1. 实现 **Condition** 接口，来 判断 对应的 逻辑是否成立
2. 创建 对应 条件的Bean 类
3. 通过配置类 对方法使用 @Bean  @Conditional 来获取对应 Bean实例

例子：

```java
// 逻辑
public class TestCondition1 implements Condition {
    public boolean matches (ConditionContext ctx, AnnotatedTypeMetadata matadata) {
        // 判断逻辑
    }
}
// 对应 逻辑的 bean
public class Test1Bean implements ITestBean {
    
}
// 配置类
@Configuration
public class TestConfig {
    @Bean
    @Conditional (TestCondition1.class) 
    ITestBean testBean {
        return new Test1Bean()
    }
}
```

### 3.5 组合注解 与 元注解

Spring 2 开始 使用 由 Java 1.5 推行的 注解。但是在 过多 使用 注解后，就会过于繁琐。

配置 类中：@Configuration @ComponentScan  就是，元注解  组合注解就是将 这两个 注解融入到新写的注解中。

```java
@Target(ElementTpye.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Configuration // 组合的元注解
@ComponentScan // 组合的元注解
public @interface MyConfiguration {
    String[] value() default{}; //覆盖参数
}
```

这样 就可以在 配置类中 使用 该注解 替换 两个元注解

### 3.6 @Enable* 注解的工作原理

在目前 使用 ：@EnableAspectJAutoProxy（开启对 AspectJ 支持） @EnableAsync （开启异步支持）@EnableScheduling（开启 计划任务）

后面 还会使用：

@EnablewebMvc （开启WebMvc  支持）

@EnableConfigurationPropreties  （开启 对 @ConfigurationProperties 注解 配置Bean的 支持）

@EnableJpaRepositiories （开启 对 Spring Data JAP 支持）

@EnableTransactionManagement （开启注解式事务支持）

@EnableCaching （开启注解式的缓存支持）

查看这类 注解 源码，发现 都有一个注解 @Import 。该注解 用来 导入配置类的，也就是说 开启这些的实现 是导入了一些 自动配置的Bean。这些导入的配置方式主要 分为以下三中类型

#### 3.6.1 直接 导入配置类

```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Import({SchedulingConfiguration.class})
@Documented
public @interface EnableScheduling {
}

@Configuration
@Role(2)
public class SchedulingConfiguration {
    public SchedulingConfiguration() {
    }

    @Bean(name = {"org.springframework.context.annotation.internalScheduledAnnotationProcessor"})
    @Role(2)
    public ScheduledAnnotationBeanPostProcessor scheduledAnnotationProcessor() {
        return new ScheduledAnnotationBeanPostProcessor();
    }
}
```

这个类 直接 使用 **@Configuration** 且 直接注册了 ScheduledAnnotationBeanPostProcessor 类的实例

#### 3.6.2 依据条件选择配置类

```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import({AsyncConfigurationSelector.class})
public @interface EnableAsync {
    Class<? extends Annotation> annotation() default Annotation.class;

    boolean proxyTargetClass() default false;

    AdviceMode mode() default AdviceMode.PROXY;

    int order() default 2147483647;
}


public class AsyncConfigurationSelector extends AdviceModeImportSelector<EnableAsync> {
    private static final String ASYNC_EXECUTION_ASPECT_CONFIGURATION_CLASS_NAME = "org.springframework.scheduling.aspectj.AspectJAsyncConfiguration";

    public AsyncConfigurationSelector() {
    }

    public String[] selectImports(AdviceMode adviceMode) {
        switch(adviceMode) {
        case PROXY:
            return new String[]{ProxyAsyncConfiguration.class.getName()};
        case ASPECTJ:
            return new String[]{"org.springframework.scheduling.aspectj.AspectJAsyncConfiguration"};
        default:
            return null;
        }
    }
}
```

EnableAsync 默认 使用 AdviceMode.PROXY，返回 ProxyAsyncConfiguration 的配置类

或者使用 ASPECTJ ，返回  AspectJAsyncConfiguration 的配置类

#### 3.6.3 动态bean 注册

```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import({AspectJAutoProxyRegistrar.class})
public @interface EnableAspectJAutoProxy {
    boolean proxyTargetClass() default false;

    boolean exposeProxy() default false;
}


class AspectJAutoProxyRegistrar implements ImportBeanDefinitionRegistrar {
    AspectJAutoProxyRegistrar() {
    }

    // 重写 运行时 自动添加  Bean 到已有的配置类
    public void registerBeanDefinitions(AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {
        AopConfigUtils.registerAspectJAnnotationAutoProxyCreatorIfNecessary(registry);
        AnnotationAttributes enableAspectJAutoProxy = 
            AnnotationConfigUtils.attributesFor(importingClassMetadata,
                                                EnableAspectJAutoProxy.class);
        if (enableAspectJAutoProxy.getBoolean("proxyTargetClass")) {
            AopConfigUtils.forceAutoProxyCreatorToUseClassProxying(registry);
        }

        if (enableAspectJAutoProxy.getBoolean("exposeProxy")) {
            AopConfigUtils.forceAutoProxyCreatorToExposeProxy(registry);
        }

    }
}
```

importingClassMetadata 参数 获取 当前配置类上的注解， registry 用来注册Bean

### 3.7 测试

Spring 通过 Spring TestContext Framenwork 对集成提供测试支持。它 仅依赖特定的测试框架，Junit TestNG  都可以

Spring 提供 一个 SpringJUnitClassRunner 类，它提供了Spring TestContext Framwork的功能。通过 **@ContextConfiguration** 配置 ApplicationContext， 通过 **@ActiveProfiles** 确定活动的 profile。

依赖：

```xml
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-context</artifactId>
      <version>${spring.version}</version>
    </dependency>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-test</artifactId>
      <version>${spring.version}</version>
    </dependency>
```

```java
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {TestConfig.class})
@ActiveProfiles("dev")
public class AppTest {

    @Autowired
    private TestService2 testService2;

    @Test
    public void shouldAnswerWithTrue() {
        String parm = testService2.getParm();
        System.out.println(parm);
        Assert.assertEquals("dev", parm);
    }
}
```

## 第 四 章 Spring MVC 4.x

### 4.1 实例

项目构建：

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.source>1.7</maven.compiler.source>
    <maven.compiler.target>1.7</maven.compiler.target>
    <spring.version>4.3.25.RELEASE</spring.version>
    <junit.version>4.12</junit.version>
    <log4j.version>1.2.17</log4j.version>
    <slf4j.version>1.7.25</slf4j.version>
    <jstl.version>1.2</jstl.version>
  </properties>

  <dependencies>

    <dependency>
      <groupId>javax.servlet</groupId>
      <artifactId>javax.servlet-api</artifactId>
      <version>3.1.0</version>
      <scope>provided</scope>
    </dependency>
    <dependency>
      <groupId>javax</groupId>
      <artifactId>javaee-api</artifactId>
      <version>7.0</version>
      <scope>provided</scope>
    </dependency>
    <dependency>
      <groupId>javax.servlet.jsp</groupId>
      <artifactId>jsp-api</artifactId>
      <version>2.2</version>
      <scope>provided</scope>
    </dependency>
    <dependency>
      <groupId>junit</groupId>
      <artifactId>junit</artifactId>
      <version>${junit.version}</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-context</artifactId>
      <version>${spring.version}</version>
    </dependency>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-test</artifactId>
      <version>${spring.version}</version>
    </dependency>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-webmvc</artifactId>
      <version>${spring.version}</version>
    </dependency>
    <!-- 引入slf4j相关jar包 -->
    <dependency>
      <groupId>org.slf4j</groupId>
      <artifactId>slf4j-api</artifactId>
      <version>${slf4j.version}</version>
      <scope>test</scope>
    </dependency>
    <!-- 引入log4j日志相关JAR包 -->
    <dependency>
      <groupId>log4j</groupId>
      <artifactId>log4j</artifactId>
      <version>${log4j.version}</version>
    </dependency>
    <!-- 引入jstl标签解析相关jar包 -->
    <dependency>
      <groupId>javax.servlet</groupId>
      <artifactId>jstl</artifactId>
      <version>${jstl.version}</version>
    </dependency>
    <dependency>
      <groupId>taglibs</groupId>
      <artifactId>standard</artifactId>
      <version>1.1.2</version>
    </dependency>
  </dependencies>
```

正常的 Controller

```java
@Controller
public class IndexController {
    @RequestMapping("/hello")
    public String hello() {
        return "hello";
    }
}
```

配置 文件类

```java
@Configuration
@EnableWebMvc
@ComponentScan("com.gl.springmvc")
public class MyMvcConfig {
    @Bean
    public InternalResourceViewResolver viewResolver() {
        InternalResourceViewResolver viewResolver = new InternalResourceViewResolver();
        viewResolver.setPrefix("/WEB-INF/classes/views/");
        viewResolver.setSuffix(".jsp");
        viewResolver.setViewClass(JstlView.class);
        return  viewResolver;
    }
}
// viewResolver 在使用配置文件中，注册到 springservlet.xml 中,如下
// resources 文件下 会被编译到 /WEB-INF/classes/ 约定

```

```xml
	<!-- 视图解析器 -->
	<bean id="viewResolver"
		class="org.springframework.web.servlet.view.InternalResourceViewResolver">
		<property name="prefix" value="/"></property>
		<property name="suffix" value=".jsp"></property>
		<property name="viewClass"
			value="org.springframework.web.servlet.view.JstlView"></property>
	</bean>
```

Web 配置

```java
public class WebInitalizer implements WebApplicationInitializer {
    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        AnnotationConfigWebApplicationContext context = new AnnotationConfigWebApplicationContext();
        context.register(MyMvcConfig.class);
        context.setServletContext(servletContext);
        ServletRegistration.Dynamic servlet = servletContext.addServlet("diapatcher", new DispatcherServlet(context));
        servlet.addMapping("/");
        servlet.setLoadOnStartup(1);
    }
}
```

WebApplicationInitializer 是 Spring 提供来配置 Servlet 3.0 + 配置接口，从而实现 替代 web.xml 的功能，实现 该接口 将会 自动被 **SpringServletContainerInitializer** 获取到。 故而只需要实现即可。

然后 使用 配置类。设置 映射路径 为 ”/“ ，加载 等级 为1

```xml
	<!-- 配置前端控制器，开启springmvc框架支持 -->
	<servlet>
		<servlet-name>dispatcherServlet</servlet-name>
		<servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
		<init-param>
			<param-name>contextConfigLocation</param-name>
			<param-value>classpath:spring-servlet.xml</param-value>
		</init-param>
		<load-on-startup>1</load-on-startup>
	</servlet>

	<servlet-mapping>
		<servlet-name>dispatcherServlet</servlet-name>
		<url-pattern>/</url-pattern>
	</servlet-mapping>
```

### 4.2 Spring MVC 常用注解

（1）@Controller

用于类的注解，声明该类 为 Spring MVC 的 Controller 类，DIspatcherServlet 会自动扫描 使用了 该注解的的类，并注册为Bean，并将Web 请求映射到注解了 RequestMapping 的方法上。声明 Bean 时，都可以使用 Component Service Repository Controller，但 声明 控制器时，只能使用 Controller。

（2）@RequestMapping

用来映射 Web 请求（访问路径和参数）、处理类 和 方法的。故而 可以注解类 和 方法。同时 会继承 注解到 类上的RequestMapping 路径。支持 Servlet 的 request 和 response 作为参数，也支持 对request 和response 的媒体类型进行设置。

（3）@RequestBody

支持将返回值放在 response 体内，而部署返回一个页面。基于 Ajax 的程序多用此注解。此注解放在 返回值前，或者方法上

（4）ResponseBody

允许 request 的参数在 request体内，而不是 直接连接在地址后面。此注解 放在 参数前

（5）PathVariable

用来接收路径参数，如 /parm/001  可结束 001 作为参数，此注解放在参数前

（6）RestController

组合注解，Controller + ResponseBody。

```xml
    <!--json 和 xml 都支持-->    
<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-xml</artifactId>
    <version>2.9.8</version>
</dependency>
```



例子

```java
@Controller
@RequestMapping("/ann")
public class AnnoController {

    @RequestMapping(produces = "text/plain;charset=UTF-8")
    public @ResponseBody String ann(HttpServletRequest request) {
        return "url:" + request.getRequestURI() + " 连接成功！";
    }
    // 直接返回值
    // http://localhost:8080/mvc/ann/test1
    @RequestMapping(value = "test1", produces = "text/plain;charset=UTF-8")
    public @ResponseBody String test(HttpServletRequest request) {
        return "url:" + request.getRequestURI() + " 连接成功！";
    }
    // 路径取值 url/test2/xxx
    // http://localhost:8080/mvc/ann/test2/xxx
    @RequestMapping(produces = "text/plain;charset=UTF-8" , value = "/test2/{str}")
    public @ResponseBody String test2(HttpServletRequest request, @PathVariable String str) {
        return "url:" + request.getRequestURI() + " 连接成功！参数 test2 值为：" + str;
    }
    // request 取值  url?test3=xxx
    // http://localhost:8080/mvc/ann/test3?str=xxx
    @RequestMapping(produces = "text/plain;charset=UTF-8" , value = "/test3")
    public @ResponseBody String test3(HttpServletRequest request, String str) {
        return "url:" + request.getRequestURI() + " 连接成功！参数 test3 值为：" + str;
    }
    // 取值  url?id=xxx&name=xxx  封装好对象
    // http://localhost:8080/mvc/ann/test4?id=123&name=%E5%93%88%E5%93%88
    @RequestMapping(produces = "text/json;charset=UTF-8" , value = "/test4")
    public @ResponseBody String test4(HttpServletRequest request, TestVO test) {
        return "url:" + request.getRequestURI() + " 连接成功！参数 test3 值为：" + test;
    }
    // 多路径 映射
    @RequestMapping(produces = "text/json;charset=UTF-8" , value = {"/test5","/test6"})
    public @ResponseBody String test5(HttpServletRequest request, TestVO test) {
        return "url:" + request.getRequestURI() + " 连接成功！";
    }

}
```

```java
@RestController
@RequestMapping("/rest")
public class AnnRestController {

    // http://localhost:8080/mvc/rest/getjson
    @RequestMapping(value = "/getjson", produces = "application/json;charset=UTF-8")
    public TestVO getJson () {

        TestVO testVO = new TestVO();
        testVO.setId(1);
        testVO.setName("哈哈哈");
        return testVO;
    }
    // http://localhost:8080/mvc/rest/getxml
    @RequestMapping(value = "/getxml", produces = "application/xml;charset=UTF-8")
    public TestVO getXml () {
        TestVO testVO = new TestVO();
        testVO.setId(2);
        testVO.setName("现谢谢");
        return testVO;
    }
}
```



补充 @RequestParam

使用@requestbody 要不需要用一个实体类交互，要不需要对用String接到了json格式进行次转换，而用@RequestParam 可以直接映射接到数据，但是有一些细节上的坑，导致经常会出现 Required Integer parameter 'studentId' is not present 的异常。

```json
contentType: "application/x-www-form-urlencoded", 
traditional: true, //traditional 为true阻止深度序列化 
data: { "studentId": studentId, "name": name },
```

默认的话，traditional为false，即jquery会深度序列化参数对象，而导致@RequestParam无法正常映射
@requestbody 一般处理的都是非Content-Type: application/x-www-form-urlencoded编码格式的数据，而@RequestParam 的contentType为application/x-www-form-urlencoded，RequestParam 不能接受json的，但表单的可以

**@RequestParam**注解比较简单，它用于将请求参数区数据映射到功能处理方法的参数上，自SpringMVC4.2之后，@RequestParam注解内部有4个参数：

- String name
- String value
- boolean required  该属性用于指定某个参数是否是必须的，默认值为true
- String defaultValue

```java
    @RequestMapping("test.do")
    // 指定将username参数的值传递到该方法的name参数上  name 与 value 类似
    public void test(@RequestParam(name = "username") String name) {
        System.out.println(name);
    }
```

### 4.3 Spring MVC 基本配置

#### 4.3.1 静态文件 与 拦截器 配置

定制配置 则需要 继承 **WebMvcConfigurerAdpater**类，重写 方法 进行配置

```java
@Configuration
@EnableWebMvc
@ComponentScan("com.gl.springmvc")
public class MyMvcConfig extends WebMvcConfigurerAdapter {

    // 静态资源映射
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 对外部 暴露 的访问路径
        final ResourceHandlerRegistration resourceHandler = registry.addResourceHandler("/assets/**");
        // 静态文件 内部路径
        resourceHandler.addResourceLocations("classpath:/assets/");
    }

    // 配置 拦截器
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(myHandlerInterceptor());
    }

    @Bean
    MyHandlerInterceptor myHandlerInterceptor() {
        return  new MyHandlerInterceptor();
    }
    @Bean
    public InternalResourceViewResolver viewResolver() {
        InternalResourceViewResolver viewResolver = new InternalResourceViewResolver();
        viewResolver.setPrefix("/WEB-INF/classes/views/");
        viewResolver.setSuffix(".jsp");
        viewResolver.setViewClass(JstlView.class);
        return  viewResolver;
    }
}
```

自定义拦截器 需要 实现 **HandlerInterceptor** 接口 或者 继承 **HandlerInterceptorAdapter** 类

```java

public class MyHandlerInterceptor implements HandlerInterceptor {

    // 请求发生前
    @Override
    public boolean preHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o) throws Exception {
        return false;
    }

    // 请求发生后
    @Override
    public void postHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, ModelAndView modelAndView) throws Exception {

    }

    // 完成后
    @Override
    public void afterCompletion(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, Exception e) throws Exception {

    }
}
```

#### 4.3.2 @ControllerAdvice

使用 **ControllerAdvice**  可以将 对于 **控制器的全局配置**放置在 同一位置，注解@Controller的类 的方法 可以使用 **@ExceptionHandler** **@InitBinder** **@ModelAttribute** 注解到方法上 这对所有 注解了 @RequestMapping 的控制器内的方法有效

**@ExceptionHandler**： 用于 全局控制器的异常

**@InitBinder** ：用来 设置 WebDataBinder ,WebDataBinder 用来自动绑定前台请求参数到Model 中

**@ModelAttribute** ：本来的作用是绑定键值对 到 Model 中。这里 可以 让全局的 @RequestMapping 都能在次设置 键值对

例子：

```java

// 该注解 组合了 component
@ControllerAdvice
public class MyControllerAdvice {

    // 全局处理  所有的 Exception
    @ExceptionHandler(value = Exception.class)
    public ModelAndView exception(Exception exception, WebRequest request) {
        ModelAndView view = new ModelAndView("error");// 页面名称
        view.addObject("errorMessage", exception.getMessage());
        return view;
    }

    // 定制 WebDataBinder
    @InitBinder
    public void initBinder(WebDataBinder binder) {
        // 忽略 request的 id 参数
        binder.setDisallowedFields("id");
    }

    // 添加全局的键值对， 所有 使用 了 RequestMapping 的方法 都可以使用
    @ModelAttribute
    public void addAttributes(Model model) {
        // 设置 全局的键值对
        model.addAttribute("msg","其他信息");
    }
}
```

#### 4.3.3 其他配置

**一 、快捷 ViewController**

当 控制器 中没有逻辑的时候，其实 没必要 使用 特定的 RequestMapping 作为映射。

而实际中 设计 大量的页面 转向就会很麻烦，我们可以通过 配置中 重写 addViewControllers 来简化配置。

```java
@Configuration
@EnableWebMvc
@ComponentScan("com.gl.springmvc")
public class MyMvcConfig extends WebMvcConfigurerAdapter {

    // 便捷 ViewController 配置
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("/index");
        registry.addViewController("/index").setViewName("/index");
    }
}
```

**二、路径匹配参数配置**

在 spring MVC 中，**路径参数**如果 带 “.” 的 话，默认 **.** 后的值会被忽略。

重写 **configurePathMatch** 可以不忽略。

```java
@Configuration
@EnableWebMvc
@ComponentScan("com.gl.springmvc")
public class MyMvcConfig extends WebMvcConfigurerAdapter {

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        configurer.setUseSuffixPatternMatch(false);
    }
}
```

**三、更多配置**

WebMvcConfigurerAdapter 的API 查看

### 4.4 Spring MVC 的高级配置

#### 4.4.1 文件上传配置

文件上传非常 常用的功能，Spring MVC 通过 配置 一个 **MultipartResolver** 来上传文件；

Spring 控制器中，通过 MultipartFile file 来接受文件，通过 MultipartFile[] files  接收多个文件上传。

```xml
    <!-- 文件上传依赖包 -->
    <dependency>
      <groupId>commons-fileupload</groupId>
      <artifactId>commons-fileupload</artifactId>
      <version>1.3.1</version>
    </dependency>
    <!-- 工具包 -->
    <dependency>
      <groupId>commons-io</groupId>
      <artifactId>commons-io</artifactId>
      <version>2.4</version>
    </dependency>
```

```java
// 配置文件 注册 

    // 配置 文件上传
    @Bean
    public MultipartResolver multipartResolver() {
        CommonsMultipartResolver multipartResolver = new CommonsMultipartResolver();
        multipartResolver.setMaxUploadSize(1024*1000*1000);
        return  multipartResolver;
    }
```

处理器

```java
@Controller
public class UploadFileController {

    @RequestMapping(value = "/toupload",method = RequestMethod.POST)
    public @ResponseBody String upload(@RequestParam("file") MultipartFile file) {
        boolean bool = true;
        try {
            String urls = "e:/" + file.getOriginalFilename();
            FileUtils.writeByteArrayToFile(
                    new File(urls),
                    file.getBytes());
        } catch (IOException e) {
            e.printStackTrace();
            bool = false;
        }
        return  Boolean.toString(bool);
    }
    @RequestMapping(value = "/message",method = RequestMethod.POST)
    public @ResponseBody String upload(@RequestParam("name") String name,@RequestParam("psw") String psw) {
        System.out.println("name" + name);
        System.out.println("psw" + psw);
        return  "";
    }
}
```

不知道 什么 原因，表单 上传文件，不能执行。表单 提交数据，又没有问题。

```xml
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
"http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset==UTF-8">
    <script src="https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js"></script>
    <title>文件上传示例</title>
</head>
<body>
<div class="upload">
    <from action="toupload" enctype="multipart/form-data" method="post">
        <input type="file" name="file"/><br/>
        <input type="submit" value="上传"/>
    </from>
</div>
<form id="myForm" action="message" method="post">
    <input type="text" name="name">名字
    <input type="password" name="psw">密码
    <input type="submit" value="提交">
</form>

<div class="form-group">
    <label for="crowd_file" class="col-sm-2 control-label">上传文件</label>
    <div class="col-sm-10">
        <input type="file" accept=".*" id="crowd_file"/>
    </div>
</div>
</body>

<script type="text/javascript">
    $('#crowd_file').change(function () {
        var fileData = $('#crowd_file')[0].files[0];

        var formData = new FormData();

        formData.append("file", $('#crowd_file')[0].files[0]);
        $.ajax({
            url: '/toupload',
            dataType: 'json',
            type: 'POST',
            charset: 'UTF-8',
            async: false,
            data: formData,
            processData: false, // 使数据不做处理
            contentType: false, // 不要设置Content-Type请求头
            success: function (data) {
                console.log(data);
                if (data.status == 'true') {
                    alert('上传成功！');
                }
            },
            error: function (response) {
                console.log(response);
            }
        });
    })
</script>
</html>
```

#### 4.4.2 自定义 HttpMessageConverter （转换器）

HttpMessageConverter 是用来处理 request 和 response 里的数据。Spring 内置了大量 处理器 。如： **MappingJackson2HttpMessageConverter** **StringHttpMessageConverter** 等。

自定义 转换器需要 继承 **AbstractHttpMessageConverter** 抽象类。

示例：

自定义 **HttpMessageConverter**

```java
public class MyHttpMessageConverter extends AbstractHttpMessageConverter<TestObj> {

    //  新建 自定义 媒体类型 application/x-wisely
    public MyHttpMessageConverter() {
        super(new MediaType("application", "x-wisely", Charset.forName("UTF-8")));
    }

    // 处理类型  可以添加泛型 到AbstractHttpMessageConverter
    // 出此表示 只处理 TestObj 类型
    @Override
    protected boolean supports(Class<?> aClass) {
        boolean assignableFrom = TestObj.class.isAssignableFrom(aClass);
        return assignableFrom;
    }

    // 重写 readInternal  处理数据
    // 表明 处理的数据 由 - 隔开 转换 为 TestObj    有点 类似 处理 Json
    @Override
    protected TestObj readInternal(Class<? extends TestObj> aClass, HttpInputMessage httpInputMessage) throws IOException, HttpMessageNotReadableException {
        String temp = StreamUtils.copyToString(httpInputMessage.getBody(), Charset.forName("UTF-8"));
        String[] arr = temp.split("-");
        TestObj testObj = new TestObj();
        testObj.setMessage(arr[0]);
        testObj.setTitle(arr[1]);
        return  testObj;
    }

    // 处理如何 输出 数据 到 response
    @Override
    protected void writeInternal(TestObj o, HttpOutputMessage httpOutputMessage) throws IOException, HttpMessageNotWritableException {
        httpOutputMessage.getBody().write(o.toString().getBytes());
    }
}

```

处理器 

```java
@Controller
public class ConverterController {
    @RequestMapping(value = "/toconverter", produces = {"application/x-wisely"},method = RequestMethod.POST)
    public @ResponseBody TestObj myConverter(@RequestBody TestObj obj) {
        return obj;
    }
}
```

jsp

```xml
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
"http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset==UTF-8">
    <script src="https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js"></script>
    <title>文件上传示例</title>
</head>
<body>

</body>
<button onclick="btn()">点击 执行 自定义 HttpMessageConverter</button>
<script type="text/javascript">
    function btn() {
        $.ajax({
           url:"toconverter",
            data:"自定义Message-自定义Title",
            type:"post",
            contentType:"application/x-wisely",
            success: function (data) {
                alert(data);
            }
        });
    }
</script>
</html>
```

注册

```java
@Configuration
@EnableWebMvc
@ComponentScan("com.gl.springmvc")
public class MyMvcConfig extends WebMvcConfigurerAdapter {

    @Override
    public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        super.extendMessageConverters(converters);
        converters.add(myHttpMessageConverter());
    }

    @Bean
    public MyHttpMessageConverter myHttpMessageConverter () {
        return  new MyHttpMessageConverter();
    }
}
```

#### 4.4.3 服务器推送技术

服务器推送技术在日常开发中比较常用，早期的解决方案： Ajax 轮询 心跳机制，使 浏览器 在第一时间 获取服务端的消息。但是这种方式的 轮询频率 不好控制，对服务器的 压力大。

这里方案指：当客户端向 服务端发送请求后，服务端抓住这个请求不放，等有效数据更新的时候才返回，客户端 接收到 返回的消息后，再发送请求。减少了服务器的压力

另外 还有 双向通信的技术 ： WebSocket 技术， Spring Boot 演示

这里是 基于 SSE （Server Send Event 服务端发送事件）的服务端推送 和 基于 Servlet 3.0+ 的异步方法特性，第一种 需要 新式浏览器支持，第二种 跨浏览器的

##### 4.4.3.1 SSE

```java
@Controller
public class SseController {

    @RequestMapping(value = "/tossepush", produces = "text/event-stream ;charset=UTF-8")
    public @ResponseBody String seepush() {
//        try {
//            Thread.sleep(6000);
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
        return "data : See " + System.currentTimeMillis() + "/n/n";
    }
}
```

```xml
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
"http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset==UTF-8">
    <script src="https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js"></script>
    <title>See 服务器 消息 推送实例</title>
</head>
<body>

</body>
<div id="msgSsePush"></div>
<script type="text/javascript">
    if (!!window.EventSource) { // 只有 chrome  firfox 支持
        s='';
        var source = new EventSource('/tossepush');
        // 添加 客户端 监听    服务端的 消息返回
        // 一直 获取不到数据  一直是到 open 然后  就到 error  evt.readyState 又是undefined
        source.addEventListener('message', function (evt) {
            var da = evt.data;
            s += da + "<br/>";
            // console.log(da);
            $('#msgSsePush').html(s);
        });
        source.addEventListener('mymessage', function (evt) {
            var da = evt.data;
            // console.log(da);
            $('#msgSsePush').html(da + "");
        });

        source.addEventListener("open",function (evt) {
            console.log("打开连接")
            console.log(evt)
        }, false);

        source.addEventListener("error", function (evt) {
            if (evt.readyState == EventSource.CLOSED) {
                console.log("关闭")
            } else {
                console.log(evt.readyState)
            }
        }, false)
    } else {
        alert("浏览器不支持SSE!")
    }
</script>
</html>
```

SSE这里 就留下一个坑了

[参考](https://www.cnblogs.com/goody9807/p/4257192.html)

##### 4.4.3.2 Servlet 3.0+ 异步方法处理

（1）开启异步支持

```java
@Configuration
@EnableWebMvc
@ComponentScan("com.gl.springmvc")
@EnableScheduling
public class MyMvcConfig extends WebMvcConfigurerAdapter {
    ......
}
```



```java
public class WebInitalizer implements WebApplicationInitializer {
    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        AnnotationConfigWebApplicationContext context = new AnnotationConfigWebApplicationContext();
        context.register(MyMvcConfig.class);
        context.setServletContext(servletContext);
        ServletRegistration.Dynamic servlet = servletContext.addServlet("diapatcher", new DispatcherServlet(context));
        servlet.addMapping("/");
        servlet.setLoadOnStartup(1);
        // 开启异步支持
        servlet.setAsyncSupported(true);
    }
}
```

（2） 控制器 与 服务层

```java
@Controller
public class Servlet30Controller {

    @Autowired
    Servlet30Service servlet30Service;

    @RequestMapping(value = "/toasync")
    public @ResponseBody DeferredResult<String> doAsync() {
        return  servlet30Service.getAsyncUpdate();
    }
}
```

```java
@Service
public class Servlet30Service {

    // 在 服务层中 产生 DeferredResult 给控制器使用，通过 @Scheduled 注解方法 定时更新数据
    private DeferredResult<String> deferredResult;

    public DeferredResult<String> getAsyncUpdate() {
        deferredResult = new DeferredResult<>();
        return  deferredResult;
    }

    // 五秒 一次 更新数据
    @Scheduled(fixedDelay = 5000)
    public void refresh() {
        if (this.deferredResult == null) {
            getAsyncUpdate();
        } else {
            deferredResult.setResult(Long.toString(System.currentTimeMillis()));
        }
    }
}
```

（3） 前台

```xml
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN"
"http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset==UTF-8">
    <script src="https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js"></script>
    <title>Servlet3.0 异步 服务器 消息 推送实例</title>
</head>
<body>

</body>
<div id="msgSsePush"></div>
<script type="text/javascript">
    deferred();
    function  deferred () {
        $.get('toasync', function (data) {
            $('#msgSsePush').html(data);
            deferred();
        })
    }
</script>
</html>
```

### 4.5 Spring MVC 测试

在 3.7 只是做了基本的测试，比较简单。这里需要进行一些与 Spring MVC 相关的测试。

测试 Web 项目，通常是不需要启动服务，需要一些Servlet 相关的模拟对象即可，如 **MockMVC** **MockHttpServletRequest** **MockHttpServletResponse** **MockHttpSession**

在 Spring MVC 里使用的 **WebAppConfiguration** 设置配置文件位置

设计人员按照要求先写一个自己预期结果的测试用例，这个用例刚开始肯定是失败的测试，随着不断编码与重构，最终通过。

示例：

1、测试包

```xml
    <dependency>
      <groupId>junit</groupId>
      <artifactId>junit</artifactId>
      <version>${junit.version}</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-test</artifactId>
      <version>${spring.version}</version>
      <scope>test</scope>
    </dependency>
```

2、服务层业务

```java
@Service
public class TestService {

    public String getMessage(){
        // 获取当前时间戳
        Instant instant = Instant.now();

        // 指定系统时间戳
        Instant instant1 = Instant.ofEpochMilli(System.currentTimeMillis());
        // 解析指定时间戳
        Instant instant2 = Instant.parse("2019-06-10T03:42:39Z");
        // 获取当前时间
        LocalDateTime localDateTime = LocalDateTime.now();

        return localDateTime.toString();
    }
}
```

3、测试用例 src/test/java 下

```java
@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration("src/main/resources") // 设置 web 资源位置
@ContextConfiguration(classes = {MyMvcConfig.class})
public class TestGetMessage {
    // 模拟的MVC 对象， 通过 MockMvcBuilders.webAppContextSetup(this.ctx).build();
    private MockMvc mvc;

    @Autowired
    private WebApplicationContext ctx;

    @Autowired
    MockHttpSession session;
    @Autowired
    MockHttpServletRequest request;

    // 可以在测试用例用 @Autowired 注册诸多，spring 管理 的bean, 以及上面三个
    @Before
    public void init(){
        this.mvc = MockMvcBuilders.webAppContextSetup(this.ctx).build();
    }

    @Test
    public void testGetMessage() {
        
    }
}
```

