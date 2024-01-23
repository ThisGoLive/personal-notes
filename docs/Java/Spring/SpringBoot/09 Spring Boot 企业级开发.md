[[TOC]]

# 第 九 章 ： Spring Boot 企业级开发

2019年10月31日

安全框架的核心：认证 和 授权

## 9.1 安全控制 Spring Security

极度依赖 Spring，故而才有 重量级一说，Apache Shiro 可以不依赖。

支持 WebFul 异步。

### 9.1.1 Spring Security 快速入门

依赖 Spring 的依赖注入 与 AOP 来实现安全功能。在早期版本中 需要使用大量的 XML 配置。

#### 9.1.1.1 Spring Security 配置

#### 9.1.1.2 过滤器配置

`DelegatingFilterProxy `

Spring Security为我们提供一个多个过滤器来实现所有安全功能，只需要 注册 一个特殊**DelegatingFilterProxy ** 过滤器 到 WebApplicationInitializer 中。

而在实际使用中，只需要 自己的 Initializer 类 继承 **AbstractSecurityWebApplicationInitializer** 即可。以及 继承了 WebApplicationLinitializer，并且 调用了 onStarup 方法。

```java
	/*
	 * (non-Javadoc)
	 *
	 * @see org.springframework.web.WebApplicationInitializer#onStartup(javax.servlet.
	 * ServletContext)
	 */
	public final void onStartup(ServletContext servletContext) throws ServletException {
		beforeSpringSecurityFilterChain(servletContext);
		if (this.configurationClasses != null) {
			AnnotationConfigWebApplicationContext rootAppContext = new AnnotationConfigWebApplicationContext();
			rootAppContext.register(this.configurationClasses);
			servletContext.addListener(new ContextLoaderListener(rootAppContext));
		}
		if (enableHttpSessionEventPublisher()) {
			servletContext.addListener(
					"org.springframework.security.web.session.HttpSessionEventPublisher");
		}
		servletContext.setSessionTrackingModes(getSessionTrackingModes());
		insertSpringSecurityFilterChain(servletContext);
		afterSpringSecurityFilterChain(servletContext);
	}
```

并且 调用了 **insertSpringSecurityFilterChain(servletContext);** 从而 注册 了 **DelegatingFilterProxy**

```java
	private void insertSpringSecurityFilterChain(ServletContext servletContext) {
		String filterName = DEFAULT_FILTER_NAME;
        // 注册 Spring Security 过滤器
		DelegatingFilterProxy springSecurityFilterChain = new DelegatingFilterProxy(
				filterName);
		String contextAttribute = getWebApplicationContextAttribute();
		if (contextAttribute != null) {
			springSecurityFilterChain.setContextAttribute(contextAttribute);
		}
		registerFilter(servletContext, true, filterName, springSecurityFilterChain);
	}
```

故而 只要实现了 抽象类就可以 完成 Spring Security 的支持。

#### **9.1.1.3 配置**

与 Spring MVC 配置 类似。第一 使用 **@EnableWebSecurity**，第二 在配置类中 继承 `WebSecurityConfigureAdapter` (MVC 是 WebMvcConfigurerAdapter )

#### **9.1.1.4 用户认证**

需要 在配置类中 重写 **configure(AuthenticationManagerBuilder auth)** 方法。

```java
	protected void configure(AuthenticationManagerBuilder auth) throws Exception {
		this.disableLocalConfigureAuthenticationBldr = true;
	}
```

内存用户添加

```java

    // 向内存中添加 两个用户
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        // 由于 spring security 5.0 后 存储密码的格式发生了改变。 {id}encodedPassword
        // There is no PasswordEncoder mapped for the id "null"
        auth.inMemoryAuthentication()
                .passwordEncoder(new BCryptPasswordEncoder())
                .withUser("test1").password(new BCryptPasswordEncoder().encode("123")).roles("USER")
                .and()
                .withUser("test2").password(new BCryptPasswordEncoder().encode("123")).roles("USER");
    }
```

JDBC 用户

```java
	@Autowrired
	DataSource dataSource

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.jdbcAuthentication().dataSource(dataSource);
    }
```

通过 jdbcAuthentication 的源码

```java
	public <T extends UserDetailsService> DaoAuthenticationConfigurer<AuthenticationManagerBuilder, T> userDetailsService(
			T userDetailsService) throws Exception {
		this.defaultUserDetailsService = userDetailsService;
		return apply(new DaoAuthenticationConfigurer<>(
				userDetailsService));
	}
```

UserDetailsService 的实现 `JdbcDaoImpl`  中

```java
	public static final String DEF_USERS_BY_USERNAME_QUERY = "select username,password,enabled "
			+ "from users " + "where username = ?";
```

默认 了一个 用户数据结构。

也可以 自定义 sql

```java
	@Autowrired
	DataSource dataSource

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.jdbcAuthentication().dataSource(dataSource)
        // 查询用户
        .usersByUsernameQuery("sql")
        // 查询 权限
        .authoritiesByUsernameQuery("sql")
    }
```

上面的两种 用户 和 权限 的获取方式只局限与**内存** 或者 **JDBC**

但是 通过 上一章 数据访问，我们 获取数据的方式有很多： 缓存 非关系型数据库 或者 是 JPA 等。

这时 我们需要自定义 实现 `UserDetailsService` 接口

```java
UserDetails loadUserByUsername(String username) throws UsernameNotFoundException;
```

并返回`org.springframework.security.core.userdetails.User`   

这里 可以 自定义 实现 **PasswordEncoder** 接口 ，实现 对 前台传来 密码的解密 、 加盐 、再加密 等操作。

```java
public interface PasswordEncoder {

    /** 加密
     */
    String encode(CharSequence rawPassword);
        /** 判断密码是否匹配
     */
    boolean matches(CharSequence rawPassword, String encodedPassword);
}
```



注册 不可逆加密算法。

```java
   @Bean
    public PasswordEncoder passwordEncoder(){
        return  new BCryptPasswordEncoder();
    }
```



具体 实现，通过 自己操作 数据层返回 DO ， 封装 到User 中。

此时的配置类：

```java
    @Override
	UserDetailsService userService(){
        return new UserDetailsServiceImpl();
    }
	@Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userService());
    }
```

#### **9.1.1.5 请求授权**

重写 **configure(HttpSecurity http)**

提供的匹配拦截逻辑

+ antMatchers: 相对路径 匹配 访问路径
+ regexMatchers: 正则表达式匹配 访问路径
+ anyRequest : 匹配 全部请求路径

在匹配路径后 需要进行安全处理

| 方法名                     | 用途                                         |
| -------------------------- | -------------------------------------------- |
| access(String)             | Spring EL 表达式 为true 时可访问             |
| anonumous()                | 匿名 访问                                    |
| denyAll()                  | 用户不能访问                                 |
| fullyAuthenticated()       | 用户完全认证可访问（非 remember 下自动登陆） |
| hasAnyAuthority(String...) | 用户有参数的 任意权限 可访问                 |
| hasAnyRole(String...)      | 用户有参数的 任意角色 可访问                 |
| hasAuthority(String)       | 用户有参数的权限 可访问                      |
| hasIpAddress(String)       | 用户来自 IP 是 可访问                        |
| hasRole(String)            | 用户 有 参数中的 角色 可访问                 |
| permitAll()                | 用户可任意访问                               |
| rememberMe()               | 运行 通过remember-me登陆的用户访问           |
| authenticated()            | 用户登陆后可访问                             |

#### **9.1.1.6 定制 登陆行为**

重写

```java
  @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.formLogin()// 定制登陆操作
            .loginPage("/login") // 指定登陆页面
            .defaultSuccessUrl("/index")// 指定登陆成功后页面
            .failureUrl("/login?error")// 指定失败后的也页面
            .permitAll()
            .and()
            .rememberMe()// 开启cookie 存储用户信息
            	.tokenValiditySeconds(12312) // 指定 Cookie 的有效期
            	.key("key") // 指定 cookie 的私钥
            .and()
            .logout()// 定制 注销
            	.logoutUrl("/logout") // 注销路径
            	.logoutSuccessUrl("") // 注销成功后跳转页面
            	.permitAll();
    }
```

### 9.1.2 Spring Boot 支持

**org.springframework.boot.autoconfigure.security**  自动配置

```java
@Configuration
@ConditionalOnClass(DefaultAuthenticationEventPublisher.class)
@EnableConfigurationProperties(SecurityProperties.class)
@Import({ SpringBootWebSecurityConfiguration.class, WebSecurityEnablerConfiguration.class,
		SecurityDataConfiguration.class })
public class SecurityAutoConfiguration {

	@Bean
	@ConditionalOnMissingBean(AuthenticationEventPublisher.class)
	public DefaultAuthenticationEventPublisher authenticationEventPublisher(ApplicationEventPublisher publisher) {
		return new DefaultAuthenticationEventPublisher(publisher);
	}

}
```

导入了 `SpringBootWebSecurityConfiguration`

```java
@Configuration
@ConditionalOnClass(WebSecurityConfigurerAdapter.class)
@ConditionalOnMissingBean(WebSecurityConfigurerAdapter.class)
@ConditionalOnWebApplication(type = Type.SERVLET)
public class SpringBootWebSecurityConfiguration {

	@Configuration
    // 默认的配置
	@Order(SecurityProperties.BASIC_AUTH_ORDER)
	static class DefaultConfigurerAdapter extends WebSecurityConfigurerAdapter {

	}

}
```

默认的配置 

1. 默认再内存中的一个 用户，默认 名称 user，密码 **UUID.randomUUID().toString();** （SecurityProperties 中）
2. 忽略静态文件 /css/** 、/js/** 、/image/** 、/**/favicon.ico （StaticResourceLocation  中）
3. 自动配置 securityFilterChainRegistration 的 Bean

2.x 使用 spring.security 为前缀。

自定义时，只需要 继承 `WebSecurityConfigurerAdpater`  并且 **@EnableWebSecurity** 都不需要

## 9.2 批处理 Spring Batch

### 9.2.1 Spring Batch 入门

#### 1 概念

Spring Batch 是用来处理大数据操作的一种框架，主要用来读取大量数据，然后进行一定处理后输出指定的形式。

#### 2 Spring Batch 主要构成

| 名称          | 用途                                   |
| ------------- | -------------------------------------- |
| JobRepository | 用来注册 Job 的容器                    |
| JobLauncher   | 用来启动 Job 的接口                    |
| Job           | 实际执行的任务，包含一个或者 多个 Step |
| Step          | 步骤： 包含下面三步 Item               |
| ItemReader    | 用来读取数据接口                       |
| ItemProcessor | 用来处理数据的接口                     |
| ItemWriter    | 用来输出数据的接口                     |

上面主要构成，只需要注册为Spring的Bean 即可，若想开启批处理的支持 还需要 配置类上使用 `@EnableBatchProcessing` 

配置实例

```java
@Configuration
@EnableBatchProcessing
public class BatchConf {
    
    @Bean
    public JobRepository jobRepository(DataSourece ds, PlatformTransactionManager mang)   throws Exception {
        JobRepositoryFactoryBean fac = new JobRepositoryFactoryBean();
        fac.setDataSource(ds);
        fac.setTransactionManager(mang);
        // 数据库类型
        fac.setDatabaseType("");
        return fac.getObject();
    }
    
    @Bean
    public SimpJobLauncher jobLauncher(DataSourece ds, PlatformTransactionManager mang)   throws Exception {
        SimpJobLauncher launcher = new SimpJobLauncher();
        launcher.setJobRepostory(jobRepository(ds, mang));
        return launcher;
    }
    
    @Bean 
    public Job importJob(JobBuilderFactory jobs, Step step) {
        return jobs.get("importJob")
            	.incrementer(new RuinIdIncrementer())
            	.flow(step)
            	.end().build();
    }
    
    @Bean
    public Step step(StepBuilderFactory stepFac, ItemReader<xxBean> reader, ItemWriter<xxBean> writer, ItemProcessor<xxBean, xxBean> processor) {
        return stepFac.get("step")
            	.<xxBean, xxBean>chunk(65000)
            	.reader(reader)
            	.processor(processor)
            	.writer(writer)
            	.build();
    }
    
    /**
    * ItemReader<xxBean> reader, 
      ItemWriter<xxBean> writer, 
      ItemProcessor<xxBean, xxBean> processor
      三个 对应的实现
    */
}
```

#### 3 Job 监听

若需要监听 Job 的执行， 需要 自定义 实现 `JobExecutionListener`， 并绑定到 job 

```java
    @Bean 
    public Job importJob(JobBuilderFactory jobs, Step step) {
        return jobs.get("importJob")
            	.incrementer(new RuinIdIncrementer())
            	.flow(step)
            	.end()
            	.listener(MyJobListener())
            	.build();
    }
```

#### 4 读取数据 ItemReader 

Spring Batch 提供了大量实现 ItemReader 的 实现类，用来读取不同的数据源。

#### 5 数据处理及校验 ItemProcessor

数据处理 与 校验都是 通过 ItemProcessor 接口实现类完成

**数据处理**

实现 ItemProcessor 接口， 重写 process 方法

```java
public class MyItemProcessor implements ItemProcessor<xxBean, xxBean> {
    
    @Override
    public xxBean process(xxBean bean) {
        // xxx
    }
}
```

**数据校验**

使用 JSR-303 ( hibernate-validator) 来校验得到数据

```java
public class MyItemProcessor implements ValidatingItemProcessor<xxBean, xxBean> , {
    
    @Override
    public xxBean process(xxBean bean) {
        // xxx
    }
}
```

定义校验器

```java
public class MyBeanValidator<T> implements Validator<T> ,InitializingBean {
    private javax.validation.Validator validator;
    
}
```

```java
@Bean 
public class ItemProcessor<xxBean, xxBean> processor() {
    ItemProcessor pro = new MyItemProcessor();
    pro.setValidator(MyBeanValidator());
    return pro;
}
```

#### 6 数据输出

同 IteamReader ，有很多 ItemWriter 实现。

#### 7 计划任务

在实际中， Spring Batch任务通过JobLauncher的run 方法执行 Job， 

```java
@Service 
public class ScheduledTaskService{
    @Autowired
    private JobLauncher jobLauncher;
    
    @Autowired
    Job job;
    
    private JobParameters jobPar;
    @Scheduled(fixedRate = 5000)
    public void execute() {
        jobPar = new JobParametersBuilder().addLong("time", System.currentTimeMillis()).toJobParameters();
        jobLauncher.run(job, jobPar)
    }
}
```

#### 8 参数后置绑定

在 ItemReader 和 ItemWriter 的Bean 定义的时候， 参数以及硬编码到 Bean的初试化中

例如 ：

```java
@Bean
public ItemReader<xxBean> reader() {
    FlatFileTiemReader<xxBean> reader = new FlatFileTiemReader<>();
    reader.setResource(new ClassPathResource("xxx.file"));
	return reader;
}
```

这种 ， 就相当于写死了

后置参数，使用 注解 @StepScope  开启， 使用 @Value 设值：

```java
@Bean
public ItemReader<xxBean> reader(@Value("#{jobParameters['key']}") String path) {
    FlatFileTiemReader<xxBean> reader = new FlatFileTiemReader<>();
    reader.setResource(new ClassPathResource(path));
	return reader;
}
```

在 启用任务时：

```java
@Service 
public class ScheduledTaskService{
    @Autowired
    private JobLauncher jobLauncher;
    
    @Autowired
    Job job;
    
    private JobParameters jobParameters;
    public void execute(String path) {
        jobParameters = new JobParametersBuilder()
            .addLong("time", System.currentTimeMillis())
            .addString("key", path)
            .toJobParameters();
        jobLauncher.run(job, jobPar)
    }
}
```

### 9.2.2 Spring Boot 支持

支持的源码在 `org.springframework.boot.autoconfigure.batch`

已经 自动初试化了 Spring  Batch 的存储批处理记录的数据库，且当 程序启动时描绘自动执行我们定义的Job 的Bean。

### 9.2.3 实例 

略

手动触发，默认配置中， 是会在程序启动就会去执行Job。

实际中往往是 通过调用完成。

```properties
# 关闭 自动执行
spring.batch.job.enabled=false
```

配置类中 基本 不变， 唯独 **ItemRead**  实现注册的时候，返回的为 实现，而不是接口 ItemReader。

## 9.3 异步消息

异步消息主要目的是为了系统于系统之间的通信。所谓异步消息 即 **消息发送者无须等待消息接收者的处理于与返回，甚至不关心 消息是否发送成功**

异步消息中两个概念：**消息代理** 与 **目的地**。

消息发送后，由消息代理管理，代理保证消息传递到指定的目的地。

两种形式的目的地：**队列（queue）** 和 **主题（topic）**

队列用于 点对点， 主题用于发布/订阅

### 9.3.1 企业级消息代理

JMS 即 Java消息服务，基于JVM 消息代理规范。ActiveMQ HornetQ便是 JMS 实现

AMQP 也是一个规范，不仅兼容 JMS 还可以跨平台，主要实现 RabbitMQ


|  对比方向    |   JMS   |   AMQP   |
| ---- | ---- | ---- |
| 定义 | Java API | 协议|
| 跨语言| 否 | 是|
|跨平台|否|是|
|支持消息类型|提供两种消息模型：①Peer-2-Peer;②Pub/sub|提供了五种消息模型：①direct exchange；②fanout exchange；③topic change；④headers exchange；⑤system exchange。本质来讲，后四种和JMS的pub/sub模型没有太大差别，仅是在路由机制上做了更详细的划分；|
|支持消息类型|支持多种消息类型 ，我们在上面提到过|byte[]（二进制）|

**总结：**

- AMQP 为消息定义了线路层（wire-level protocol）的协议，而JMS所定义的是API规范。在 Java 体系中，多个client均可以通过JMS进行交互，不需要应用修改代码，但是其对跨平台的支持较差。而AMQP天然具有跨平台、跨语言特性。
- JMS 支持TextMessage、MapMessage 等复杂的消息类型；而 AMQP 仅支持 byte[] 消息类型（复杂的类型可序列化后发送）。
- 由于Exchange 提供的路由算法，AMQP可以提供多样化的路由方式来传递消息到消息队列，而 JMS 仅支持 队列 和 主题/订阅 方式两种。

消息队列说明：

ActiveMQ 的社区算是比较成熟，但是较目前来说，ActiveMQ 的性能比较差，而且版本迭代很慢，不推荐使用。

RabbitMQ 在吞吐量方面虽然稍逊于 Kafka 和 RocketMQ ，但是由于它基于 erlang 开发，所以并发能力很强，性能极其好，延时很低，达到微秒级。但是也因为 RabbitMQ 基于 erlang 开发，所以国内很少有公司有实力做erlang源码级别的研究和定制。如果业务场景对并发量要求不是太高（十万级、百万级），那这四种消息队列中，RabbitMQ 一定是你的首选。如果是大数据领域的实时计算、日志采集等场景，用 Kafka 是业内标准的，绝对没问题，社区活跃度很高，绝对不会黄，何况几乎是全世界这个领域的事实性规范。

RocketMQ 阿里出品，Java 系开源项目，源代码我们可以直接阅读，然后可以定制自己公司的MQ，并且 RocketMQ 有阿里巴巴的实际业务场景的实战考验。RocketMQ 社区活跃度相对较为一般，不过也还可以，文档相对来说简单一些，然后接口这块不是按照标准 JMS 规范走的有些系统要迁移需要修改大量代码。还有就是阿里出台的技术，你得做好这个技术万一被抛弃，社区黄掉的风险，那如果你们公司有技术实力我觉得用RocketMQ 挺好的

kafka 的特点其实很明显，就是仅仅提供较少的核心功能，但是提供超高的吞吐量，ms 级的延迟，极高的可用性以及可靠性，而且分布式可以任意扩展。同时 kafka 最好是支撑较少的 topic 数量即可，保证其超高吞吐量。kafka 唯一的一点劣势是有可能消息重复消费，那么对数据准确性会造成极其轻微的影响，在大数据领域中以及日志采集中，这点轻微影响可以忽略这个特性天然适合大数据实时计算以及日志收集。

### 9.3.2 Spring 支持

Spring 对 JMS 与 AMQP 的支持分别为 ：spring-jms   spring-rabbit

都分别需要 `ConnectionFactory` 的实现来连接消息代理， 并分别提供了 JmsTemplate  和 RabbitTemplate 发送消息。

Spring 分别为它们提供 **@JmsListener、@RabbitListener** 注解到方法上监听消息代理发布的消息。 通过 @EnableJms @EnableRabbit 开启支持。

### 9.3.3 Spring Boot 支持

Spring Boot 中 **org.springframework.boot.autoconfigure.jms 、 org.springframework.boot.autoconfigure.amqp** 都以及配置好了

定义好了 ActiveMQConnectionFactory 作为 Bean连接

JmsAutoCOnfiguration 中配置好了 JmsTemplate，只需要开启注解 @EnableJms

RabbitTemplate

### 9.3.4 JMS 实例

#### 安装 ActiveMQ

1. 软件安装
2. Docekr 安装
3. 内嵌ActiveMQ

```xml
<dependency>
	<groupId>org.apache.activemq</groupId>
    <artifactId>activemq-broker</artifactId>
</dependency>
```

#### 代码

依赖：Spring Boot 中 **spring-boot-starter-hornetq** 默认的使用 HornetQ。故而 需要 添加 spring-jms 和 activemq-client

```properties
spring.activemq.broker-url=tcp://xxx:61616
```

创建消息生成者

```java
public  class Msg implements MessageCreator {
    
    @Override
    public Message createMessage(Session session) {
        return session.creatTextMessage("xxx");
    }
}
```

消息发送 及 目的地定义

```java
public class CommandLine implements CommandLineRunner {
    @Autowried
    JmsTempleat jmsTemplate;
    
    @Override
    public void run(String... age) {
        jmsTemplate.send("消息组", new Msg())
    }
}
```

 消息接收放；

```java
@Component
public class Receiver {
    
    @JmsListener(destination="消息组")
    public void readMessage (String mess) {
        // 解析消息 处理
    }
}
```

### 9.3.5 AMQP 实战

安装 略

代码：

依赖 spring-boot-starter-amqp 

RabbitMQ 默认 端口 5672

由于 AMQP 全部使用 二进制传输，都不需要生成者

发送消息

```java
public class AmqpTest implements CommandLineRunner {
    
    @Autowired 
    RabbitTemplate tabbitTemplate;
    
    @Bean
    public Queue creatQueue(){
        return new Queue("消息组")；
    }
    
    @Override
    public void run (String... age) {
        tabbitTemplate.convertAndSend("消息组", objMess)
    }
}
```

消息接收

```java
@Component
public class Receiver {
    
    @RabbltListener(queue="消息组")
    public void readMessage (String mess) {
        // 解析消息 处理
    }
}
```

## 9.4 系统集成 Spring Integration ( Spring 集成)

Spring Integration 提供 基于 Spring 的EIP（企业集成模式）的实现。

Spring Integration 主要解决的问题是 不同系统之间交互问题，通过异步消息驱动来达到 系统交互时系统之间的松耦合。

Spring Integration 主要构成 Message Channel（通道） Message EndPoint （消息 末端）

### 9.4.1 Message 

Message 是用来在不同部分之间传递的数据。 由两部分构成： 消息体（payload） 消息头（header）。消息体可以是任何数据类型（XML JSON Java 对象）

```java
public interface Message<T> {
    T getPayload();
    MessageHeaders getHeaders();
}
```

### 9.4.2 Channel

在消息系统中 ，消息发送者 通过 Channel 发送，接收者通过 Channel 接收

**顶级接口**

MessageChannel 是 Spring Integration 消息通道的顶级接口

```java
public interface MessageChannel {
    boolean send(Message<?> message);
     boolean send(Message<?> message, long timeout);
}
```

有两个子接口：PollableChannel （轮询） SubscribableChannel （订阅）

```java
public interface PollableChannel extends MessageChannel {
    Message<?> receive();
    Message<?> receive(long timeout);
}

public interface SubscribableChannel  extends MessageChannel {
    boolean subscribe(MessageHandler handler);
    boolean unsubscribe(MessageHandler handler);
}
```

**常用的消息通道**

直接使用 @Bean 注入

+ PublishSuscribeChannel 允许广播消息给所有订阅者
+ QueueChannel 允许接收者 轮询获得消息，用队列接收，可设置大小
+ PriorityChannel 参照优先级存储，依据消息头 priority 属性
+ RendezvousChannel 确保每一个接收者都接收到消息后再发送消息
+ DirectChannel 是 Spring Integration 默认的通道，将消息发送给订阅者，然后阻碍发送 直到 消息被接收
+ ExecutorChannel 可绑定一个多线程的 task Executor

**通道拦截器**

ChannelInterceptor 用来拦截发送 和 接收消息的操作，只需要实现该接口

```java
public interface ChannelInterceptor {
    xxx
}
```

给通道添加拦截器

```java
channel.addInterceptor(xxInterceptor);
```

### 9.4.3 Message EndPoint

消息端点 是 真正处理消息的组建，它还可以控制通道的路由

可用的端点：

| 端点名           | 解释                                                         |
| ---------------- | ------------------------------------------------------------ |
| ChannelAdapter   | 通道适配器，一种连接外部系统或者 传输协议的端点，可以分为 入站（inbound） 和 出战（outbound） |
| Gateway          | 消息网关， 类似 Adapter, 但是提供了双向的请求 返回集成方式。也分为 出入站 |
| ServiceActivator | 可调用 Spring Bean来处理消息，并将处理后的结果输出到指定消息通道。 |
| Router           | 路由  可更具消息体类型 消息头的值 以及定义好的接收表作为条件，来决定消息传递到的通道 |
| Filter           | 类似路由， 不同的是过滤器不决定消息路由到哪里，而是决定消息是否传递给通道 |
| Splitter         | 拆分器 将消息拆分为几个部分单独处理，返回值为一个集合 或者 数组 |
| Aggregate        | 聚合器 与拆分器相反，将多个消息 合并为一个消息               |
| Enricher         | 消息增强器 获取到消息后增强额外消息到消息中  分为 消息头增强 与 消息体增强 |
| Transformer      | 转换器 是对获得的消息进行一定的逻辑转换处理（如数据格式转换） |
| Bridge           | 连接桥  简单地将两个消息通道 连接起来                        |

### 9.4.4 Spring Integration Java DSL 

Spring Integration 提供了一个 IntegrationFlow 来定义系统集成流程，而通过 IntegrationFlows 和 IntegrationFlowBuilder 来实现FluentAPI定义流程

略

