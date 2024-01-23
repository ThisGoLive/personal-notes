[[TOC]]

# 第 五 章 Spring Boot 基础

2019年10月1日 - 2019年10月5日

## 5.1 Spring Boot 概述

习惯 优于 配置（项目中大量的配置，还有内置的习惯配置，无需手动进行配置）

Spring Boot 创建一个独立运行（运行 jar，内嵌 Servlet 容器），准生产级别的Spring 框架项目，故而 使用 spring 很少 或者 不会用到 配置。

### 5.1.1 核心功能

1. 独立运行的spring项目：一个 完整的Jar包

2. 内嵌 Servlet 容器：可以选择 Tomcat Jetty 或者 Undertow作为容器，无须以war 包的方式发布
3. 提供starter简化Maven配置：Spring 提供了一系列 starter pom 来简化 Maven 的依赖，当 使用 spring-boot-starter-web 时，会自动引入依赖包。
4. 自动配置 Spring：Spring Boot 会根据类路径中的jar 包 类，为 jar 包里的类自动配置Bean，极大减少配置。如果需要我们自动配置Bean，则可以自定义配置
5. 准生产的应用监控：Spring 提供 基于 http ssh telnet 对运行时的项目进行监控 （第十章）
6. 无代码生成 和 xml 配置 ： 由于 Spring 4.x 提供的 注解 新特性，从而达到 不 需要配置任何xml 完成spring 的所有配置

### 5.1.2 Spring Boot 的优缺点

#### **优点**

1. 快速构建项目
2. 对主流开发框架的无配置集成
3. 项目可独立运行，无须外部依赖 Servlet 容器
4. 提供运行时的引用监控
5. 极大提高开发效率 部署效率
6. 与云计算 天然集成

#### 缺点

1. 书籍文档 不深入
2. Spring 框架的缺点

### 5.1.3 版本

《Spring Boot 实战》 作者写于2016，我买于18年。所以使用的 SpringBoot 版本比较老，1.3.0

## 5.2 快速搭建

1. start.spring.io  
2. Spring Tool Suite : e
3. IDEA 需要插件 Spring Initializr、IDEA 社区版 使用 *Spring Assistant* 、Eclipse 需要 Spring Tools 4 插件、Spring Boot CLI 使用命令行、Maven 构建时 直接 引入 **spring-boot-starter-parent**

# 第 六 章 Spring Boot 核心

简单实例

```java

@RestController
@SpringBootApplication
public class Boot1Application {

    @RequestMapping(value = "/")
    public String boot1 () {
        return "hello,spring boot!";
    }

    public static void main(String[] args) {
        SpringApplication.run(Boot1Application.class, args);
    }

}
```

## 6.1 基本配置

### 6.1.1 入口类 和 @SpringBootApplication

**SpringBootApplication** 注解是Spring Boot核心注解

```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan(
    excludeFilters = {@Filter(
    type = FilterType.CUSTOM,
    classes = {TypeExcludeFilter.class}
), @Filter(
    type = FilterType.CUSTOM,
    classes = {AutoConfigurationExcludeFilter.class}
)}
)
public @interface SpringBootApplication {
    @AliasFor(
        annotation = EnableAutoConfiguration.class
    )
    Class<?>[] exclude() default {};

    @AliasFor(
        annotation = EnableAutoConfiguration.class
    )
    String[] excludeName() default {};

    @AliasFor(
        annotation = ComponentScan.class,
        attribute = "basePackages"
    )
    String[] scanBasePackages() default {};

    @AliasFor(
        annotation = ComponentScan.class,
        attribute = "basePackageClasses"
    )
    Class<?>[] scanBasePackageClasses() default {};
}
```

主要融合了 **@SpringBootConfiguration** **@EnableAutoConfiguration** **@ComponentScan**

三个注解，如果 不使用 SpringBootApplication，可以单独使用这三个

**@EnableAutoConfiguration** 让Spring Boot 根据类路径中 的 jar 包依赖为当前项目进行自行配置

**@ComponentScan** 扫描 入口类 的同级包以及 下级包里的Bean （若为JPA项目，还能扫描到 使用 @Entity 的实体类）。

### 6.1.2 关闭特定的自动配置

源码中的 exclude 参数就是，关闭特定的自动配置。

```java
@SpringBootApplication(exclude = {xxx.class})
```

### 6.1.3 Banner

resources 中。支持 文本 和 图片

关闭Banner

1. main中修改
2. 使用 fluent API

### 6.1.4 Spring Boot 的配置文件

Spring Boot 使用 全局配置文件 **application.properties**  或者 **application.yml** 放置在 resources 或者 类路径的/config 下

```properties
server.port=80
server.context-path=/hello
```

```yaml
sever:
	port:80
	contextPath:/hello
```

但是 @PropertySource 不支持 yaml 文件，

第一种、您通常可以将配置放在标准位置- application.yml类路径根目录中- src/main/resources并且此yaml属性应由Spring Boot自动使用您提到的平坦路径名加载。

第二种、方法更广泛一些，基本上是定义一个类来以这种方式保存属性：

```java
@ConfigurationProperties(path="classpath:/appprops.yml", name="db")
public class DbProperties {
    private String url;
    private String username;
    private String password;
...
}
```

### 6.1.5 starter pom

Spring Boot 提供了简化企业级开发绝大多数场景的 starter pom，只要 使用了应用场景所需要的 starter pom， 相关的技术配置将会消除，可以得到 SpringBoot 为我们提供的自动配置的Bean

**1.官方 start pom**

| 名称                                   | 描述                                                         |
| -------------------------------------- | ------------------------------------------------------------ |
| spring-boot-starter                    | Spring Boot 的核心 starter，包含自动配置、日志、yaml配置文件的支持 |
| spring-boot-starter-actuator           | 准生产特性，用来监控和管理应用                               |
| spring-boot-starter-remote-shell       | 提供基于SSH协议的监控和管理                                  |
| spring-boot-starter-amqp               | 使用 spring-rabbit 来支持 AMQP                               |
| spring-boot-starter-aop                | 使用 spring-aop 和 AspectJ 支持面向切面编程                  |
| spring-boot-starter-batch              | 对 spring-batch 的支持                                       |
| spring-boot-starter-cache              | 对 spring-cache的支持                                        |
| spring-boot-starter-cloud-connectors   | 对云平台（CloudFoundry、Heroku）提供的服务 提供简化的连接方式 |
| spring-boot-starter-data-elasticsearch | 通过 spring-data-elasticearch 对 Elasticesearch 支持         |
| spring-boot-starter-data-gemfire       | 对分布式存储 GemFIre 的支持                                  |
| spring-boot-starter-data-jpa           | 对 JPA 支持，包含 spring-data-jps  spring-orm  Hibernate     |
| spring-boot-starter-data-mongodb       | 对 MongoDB 支持                                              |
| spring-boot-starter-data-rest          | 通过 spring-data-rest-webmvc 将 Spring Data repository 暴露为REST 形式的服务 |
| spring-boot-starter-data-solr          | 通过 spring-data-solr 对 Apache Solr 数据检索平台的支持      |
| spring-boot-starter-freemarker         | 对 FreeMark 模板引擎的支持                                   |
| spring-boot-starter-groovy-templates   | 对 Groovy 模板引擎的支持                                     |
| spring-boot-starter-hateoas            | 通过 spring-hateoas 对基于 HATEOAS 的 REST 形式的网络服务支持 |
| spring-boot-starter-hornetq            | 通过 HornetQ 对JMS 的支持                                    |
| spring-boot-starter-integration        | 对系统集成框架 spring-integration 的支持                     |
| spring-boot-starter-jdbc               | 对 JDBC 数据库的支持                                         |
| spring-boot-starter-jersey             | 对 Jersery REST 形式的网络服务的支持                         |
| spring-boot-starter-jta-atomikos       | 通过 Atomikos 对 分布式 事务的支持                           |
| spring-boot-starter-jta-bitronix       | 通过 Bitronix 对 分布式 事务的支持                           |
| spring-boot-starter-mail               | 对 javax.mail 支持                                           |
| spring-boot-starter-mobile             | spring-mobile的支持                                          |
| spring-boot-starter-mustache           | 对 Mustache 模板引擎的支持                                   |
| spring-boot-starter-redis              | 对键值对内存数据库 Redis 的支持，包含 spring-redis           |
| spring-boot-starter-security           | 对 spring-security 安全框架的支持                            |
| spring-boot-starter-social-facebook    |                                                              |
| spring-boot-starter-social-linkedin    |                                                              |
| spring-boot-starter-social-twitter     |                                                              |
| spring-boot-starter-test               | 对常用的测试框架 JUnit Hamcrest Mockito的支持 包含 spring -test 模块 |
| spring-boot-starter-thymeleaf          | 对 Thymeleaf 模板引擎的支持 ， 包含与 spring 整合的配置      |
| spring-boot-starter-velocity           | 对 Velocity 模板引擎的支持                                   |
| spring-boot-starter-web                | 对 Web 项目的开发支持，包含 Tomcat 和 spring-webmvc          |
| spring-boot-starter-Tomcat             | Spring Boot 默认 的Servlet 容器                              |
| spring-boot-starter-Jetty              | 使用 Jetty 作为 Servlet 容器                                 |
| spring-boot-starter-undertow           | 使用 Undertow 作为 Servlet 容器                              |
| spring-boot-starter-logging            | Spring Boot的默认日志框架 Logback                            |
| spring-boot-starter-log4j              | 支持 使用 Log4j 日志框架                                     |
| spring-boot-starter-websocket          | 对 WebSocket 开发的支持                                      |
| spring-boot-starter-ws                 | 对 Spring Service的支持                                      |

**2.第三方 stater pom**

| 名称                      | 地址 |
| ------------------------- | ---- |
| Handlebars                |      |
| Vaadin                    |      |
| Apache Camel              |      |
| WOR4J                     |      |
| Spring Batch （高级使用） |      |
| HDIV                      |      |
| Jade Templates            |      |
| Actitivi                  |      |

### 6.1.6 使用 xml 配置

当 特殊情况 需要 xml 配置的时候，使用 **@ImportRescue**

```java
@ImportRescue({"classpath:some-context.xml","classpath:some-context2.xml"})
```

## 6.2 外部配置

Spring Boot 允许使用 properties 文件 yaml文件 或者命令行参数作为 外部配置

### 6.2.1 命令行参数配置

执行 jar 包时的命令 添加参数

```shell
java -jar xx.jar --server.port=80
```

### 6.2.2 常规属性配置

在 2.2 时，spring 常规环境下，注入 properties 文件里的值的方式，通过 **@PropertySource("classpath:xxx")** 然后通过 **@Value**注入值。

而Spring Boot中只需要 在 application.properties 中设值，然后直接使用 @Value

```properties
test.value=hello,properties! i can see you!
```

```java
@RestController
@SpringBootApplication
public class Boot1Application {

    @Value("${test.value}")
    private String propretiesValue;
    @RequestMapping(value = "/")
    public String boot1 () {
        return this.propretiesValue;
    }

    public static void main(String[] args) {
        SpringApplication.run(Boot1Application.class, args);
    }
}
```

### 6.2.3 类型安全的配置（基于 properties）

如果 某个配置 使用地方很多，就比较麻烦。这里就可以使用 **@ConfigurationProperties** 将 配置文件 与 一个实例Bean的属性关联起来。

yaml 文件 也就可以使用该方法。

但是 在 spring boot 2.1.8.RELEASE 中 该注解只有 profile 前缀 和 value 两个属性。并没有 指定 路径的path 或者 locations , 而是 需要 `@PropertySource` 注解来进行配置

profile 指的是 文件内的前缀，而不是文件名前缀，如果 部署末级 返回的是键值对 map

```properties
test.name=zhangsan
test.geder=male
```

## 6.3 日志配置

Spring Boot 支持 的日志框架：Java Util Logging、Log4J  以及默认 使用的 Logback

## 6.4 Profile 配置

Profile 是 Spring 用来针对不同的环境对不同的配置提供支持的，全局 Profile 配置使用 **application-{profile}.properties/yml**

```properties
spring.profiles.active=dev
```

```yaml
spring:
	profiles:
		active:dev
```

甚至还可以直接使用 `'@profileActive@'` 直接从 maven 运行环境获取

```yaml
spring:
  profiles:
    active: '@profileActive@'
```

```xml
    <profiles>
        <profile>
            <id>dev</id>
            <properties>
                <profileActive>dev</profileActive>
            </properties>
            <activation>
                <activeByDefault>true</activeByDefault>
            </activation>
        </profile>
     <profile>
```

就会自动加载 application-dev.properties/yml

## 6.5 Spring Boot 的运行原理

在 3.4 条件注解 @Conditional 时，Spring 4.x提供基于条件配置Bean的能力，而Spring Boot 的实现原理 就是基于这一功能的

理解这里，Spring Boot运行自动配置的原理，并实现自己的自动配置。

Spring Boot 的自动配置源码位于 **spring-boot-cutoconfigure**内。

可以通过 三种方式查看当前项目是否 开启 启用了自动配置的报告！

（1）运行 jar 包增加 --debug 参数

（2）在 application.properties 中设置属性: **debug=true**

（3） 运行 Java虚拟机 时，设置 -Ddebug

启用了自动配置的 **Positive matches**

> Positive matches:
> -----------------
>
>    CodecsAutoConfiguration matched:
>
>       - @ConditionalOnClass found required class 'org.springframework.http.codec.CodecConfigurer' (OnClassCondition)
>
>    CodecsAutoConfiguration.JacksonCodecConfiguration matched:
>
>       - @ConditionalOnClass found required class 'com.fasterxml.jackson.databind.ObjectMapper' (OnClassCondition)

 **未启用自动配置**

> Negative matches:
> -----------------
>
>    ActiveMQAutoConfiguration:
>       Did not match:
>
>          - @ConditionalOnClass did not find required class 'javax.jms.ConnectionFactory' (OnClassCondition)
>
>    AopAutoConfiguration:
>       Did not match:
>
>          - @ConditionalOnClass did not find required class 'org.aspectj.lang.annotation.Aspect' (OnClassCondition)
>
>    ArtemisAutoConfiguration:
>       Did not match:
>
>          - @ConditionalOnClass did not find required class 'javax.jms.ConnectionFactory' (OnClassCondition)

### 6.5.1 运作原理

@SpringBootApplication 组合注解中，核心功能 **@EnableAutoConfiguration**

```java
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited
@AutoConfigurationPackage
@Import({AutoConfigurationImportSelector.class})
public @interface EnableAutoConfiguration {
    String ENABLED_OVERRIDE_PROPERTY = "spring.boot.enableautoconfiguration";

    Class<?>[] exclude() default {};

    String[] excludeName() default {};
}
```

**AutoConfigurationImportSelector** 类中：

```java
    protected List<String> getCandidateConfigurations(AnnotationMetadata metadata, AnnotationAttributes attributes) {
        List<String> configurations = SpringFactoriesLoader.loadFactoryNames(this.getSpringFactoriesLoaderFactoryClass(), this.getBeanClassLoader());
        Assert.notEmpty(configurations, "No auto configuration classes found in META-INF/spring.factories. If you are using a custom packaging, make sure that file is correct.");
        return configurations;
    }
```

可看出 是 通过该方法 扫描了，该类所在包（由于各个版本不同，包也就不同，2.1.8位于 spring-boot-autoconfigure 包下）下 **META-INF/spring.factories** 文件。

```properties
# Initializers
org.springframework.context.ApplicationContextInitializer=\
org.springframework.boot.autoconfigure.SharedMetadataReaderFactoryContextInitializer,\
org.springframework.boot.autoconfigure.logging.ConditionEvaluationReportLoggingListener

# Application Listeners
org.springframework.context.ApplicationListener=\
org.springframework.boot.autoconfigure.BackgroundPreinitializer

# Auto Configuration Import Listeners
org.springframework.boot.autoconfigure.AutoConfigurationImportListener=\
org.springframework.boot.autoconfigure.condition.ConditionEvaluationReportAutoConfigurationImportListener

# Auto Configuration Import Filters
org.springframework.boot.autoconfigure.AutoConfigurationImportFilter=\
org.springframework.boot.autoconfigure.condition.OnBeanCondition,\
org.springframework.boot.autoconfigure.condition.OnClassCondition,\
org.springframework.boot.autoconfigure.condition.OnWebApplicationCondition

# Auto Configure  自动配置
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
org.springframework.boot.autoconfigure.admin.SpringApplicationAdminJmxAutoConfiguration,\
org.springframework.boot.autoconfigure.aop.AopAutoConfiguration,\
org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration,\
```

### 6.5.2 核心注解

而上面的自动配置的类中基本都会 使用如下注解之一 或者 多个

**@ConditionalOnBean:** 当容器里有指定的Bean的条件下。当给定的在bean存在时,则实例化当前Bean

**@ConditionalOnClass:** 当类路径下有指定的类的条件下。 当给定的类名在类路径上存在，则实例化当前Bean

**@ConditionalOnExpression:** 基于 SqEL 表达式作为判断条件。

**@ConditionalOnJava:** 基于 JVM 版本作为判断条件。

**@ConditionalOnJndi:** 在JNDI 存在的条件下查找指定的位置。

**@ConditionalOnMissingBean:** 当容器里没有指定bean的情况下。

**@ConditionalOnMissingClass:** 当类路径下没有指定的类的条件下。

**@ConditionalOnNotWebApplication:** 当前项目不是Web项目条件下。

**@ConditionalOnProperty:** 指定属性是否有指定的值

**@ConditionalOnResource:** 类路径是否有指定的值

**@ConditionalOnSingleCandidate:** 当指定Bean在容器中只有一个的时候，或者虽然有多个但是指定首选的Bean的时候。

**@ConditionalOnWebApplication:** 当前项是Web项目的条件下。

这些组合注解的元注解都是 **@Condition**，只不过配置了不同的条件类。

回顾一下使用方式：

1.  创建一个类实现 Condititon 接口，来完成 对应条件判断。
2.  对应逻辑返回的Bean类 
3.  配置类中使用  **@Conditional (TestCondition1.class)** 注册Bean

### 6.5.3 Spring Boot 自动配置 Http编码 分析

在正常的 Web 项目中，添加 **过滤器** 到**web.xml**

```xml
<filter>
	<filter-name>encodingFilter</finlter-name>
    <filter-class>org.springframework.filter.CharacterEncodingFilter</filter-class>
    <init-param>
    	<param-name>encoding</param-name>
        <param-value>UTF-8</param-value>
    </init-param>
    <init-param>
    	<param-name>forceEncoding</param-name>
        <param-value>true</param-value>
    </init-param>
</filter>
```

如果使用自动配置：配置 **CharacterEncodingFilter** 这个Bean  和 配置参数 encoding 与 forceEncoding

`
org.springframework.boot.autoconfigure.web.servlet.HttpEncodingAutoConfiguration
` 类中可以查看：

```java
@Configuration
// 开启属性注入，使 HttpProperties 被注册
@EnableConfigurationProperties(HttpProperties.class)
// 确保 类路径 的条件
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@ConditionalOnClass(CharacterEncodingFilter.class)
// 设置 当spring.http.encoding 启用时 没有值时默认为true 条件成立
@ConditionalOnProperty(prefix = "spring.http.encoding", value = "enabled", matchIfMissing = true)
public class HttpEncodingAutoConfiguration {

	private final HttpProperties.Encoding properties;

    // 直接初试化时 创建 对properties 赋值，HttpProperties 已经被 容器管理
	public HttpEncodingAutoConfiguration(HttpProperties properties) {
		this.properties = properties.getEncoding();
	}

    // 容器中没有这个 Bean 时 创建该Bean
	@Bean
	@ConditionalOnMissingBean
	public CharacterEncodingFilter characterEncodingFilter() {
		CharacterEncodingFilter filter = new OrderedCharacterEncodingFilter();
		filter.setEncoding(this.properties.getCharset().name());
		filter.setForceRequestEncoding(this.properties.shouldForce(Type.REQUEST));
		filter.setForceResponseEncoding(this.properties.shouldForce(Type.RESPONSE));
		return filter;
	}

	@Bean
	public LocaleCharsetMappingsCustomizer localeCharsetMappingsCustomizer() {
		return new LocaleCharsetMappingsCustomizer(this.properties);
	}

	private static class LocaleCharsetMappingsCustomizer
			implements WebServerFactoryCustomizer<ConfigurableServletWebServerFactory>, Ordered {

		private final HttpProperties.Encoding properties;

		LocaleCharsetMappingsCustomizer(HttpProperties.Encoding properties) {
			this.properties = properties;
		}

		@Override
		public void customize(ConfigurableServletWebServerFactory factory) {
			if (this.properties.getMapping() != null) {
				factory.setLocaleCharsetMappings(this.properties.getMapping());
			}
		}

		@Override
		public int getOrder() {
			return 0;
		}

	}

}
```

```java
// 2.1.8 直接将 配置文件中的 spring.http 以键值对的形式 保存到实例中
@ConfigurationProperties(prefix = "spring.http")
public class HttpProperties {

	/**
	 * Whether logging of (potentially sensitive) request details at DEBUG and TRACE level
	 * is allowed.
	 */
	private boolean logRequestDetails;

	/**
	 * HTTP encoding properties.
	 */
	private final Encoding encoding = new Encoding();

	public boolean isLogRequestDetails() {
		return this.logRequestDetails;
	}

	public void setLogRequestDetails(boolean logRequestDetails) {
		this.logRequestDetails = logRequestDetails;
	}

	public Encoding getEncoding() {
		return this.encoding;
	}

	/**
	 * Configuration properties for http encoding.
	 */
	public static class Encoding {

		public static final Charset DEFAULT_CHARSET = StandardCharsets.UTF_8;

		/**
		 * Charset of HTTP requests and responses. Added to the "Content-Type" header if
		 * not set explicitly.
		 */
		private Charset charset = DEFAULT_CHARSET;

		/**
		 * Whether to force the encoding to the configured charset on HTTP requests and
		 * responses.
		 */
		private Boolean force;

		/**
		 * Whether to force the encoding to the configured charset on HTTP requests.
		 * Defaults to true when "force" has not been specified.
		 */
		private Boolean forceRequest;

		/**
		 * Whether to force the encoding to the configured charset on HTTP responses.
		 */
		private Boolean forceResponse;

		/**
		 * Locale in which to encode mapping.
		 */
		private Map<Locale, Charset> mapping;

		public Charset getCharset() {
			return this.charset;
		}

		public void setCharset(Charset charset) {
			this.charset = charset;
		}

		public boolean isForce() {
			return Boolean.TRUE.equals(this.force);
		}

		public void setForce(boolean force) {
			this.force = force;
		}

		public boolean isForceRequest() {
			return Boolean.TRUE.equals(this.forceRequest);
		}

		public void setForceRequest(boolean forceRequest) {
			this.forceRequest = forceRequest;
		}

		public boolean isForceResponse() {
			return Boolean.TRUE.equals(this.forceResponse);
		}

		public void setForceResponse(boolean forceResponse) {
			this.forceResponse = forceResponse;
		}

		public Map<Locale, Charset> getMapping() {
			return this.mapping;
		}

		public void setMapping(Map<Locale, Charset> mapping) {
			this.mapping = mapping;
		}

		public boolean shouldForce(Type type) {
			Boolean force = (type != Type.REQUEST) ? this.forceResponse : this.forceRequest;
			if (force == null) {
				force = this.force;
			}
			if (force == null) {
				force = (type == Type.REQUEST);
			}
			return force;
		}

		public enum Type {

			REQUEST, RESPONSE

		}

	}

}
```

### 6.5.4 实例 创建自定义 starter 自动配置

创建一个Maven quarkstart项目，maven 依赖 springboot autoconfigure 

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.gl.spring</groupId>
  <artifactId>spring-boot-starter-test1</artifactId>
  <version>1.0</version>
  <name>spring-boot-starter-test1</name>
  <url>http://www.example.com</url>

  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.source>1.7</maven.compiler.source>
    <maven.compiler.target>1.7</maven.compiler.target>
  </properties>

  <dependencies>
    <dependency>
      <groupId>junit</groupId>
      <artifactId>junit</artifactId>
      <version>4.12</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-autoconfigure</artifactId>
      <version>2.1.8.RELEASE</version>
    </dependency>
  </dependencies>

```

配置导入

```java
@ConfigurationProperties(prefix="hellostarter")
public class MyStarterTestProperties {

    private String value;

    public MyStarterTestProperties() {
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
```

要注册的Bean

```java
public class MyStarterTestService {

    private String mes;

    public String doing(String value) {
        return "MyStarterTestService is doing : " + value;
    }
    public String doing() {
        return "MyStarterTestService is doing : hello!" + mes;
    }

    public String getMes() {
        return mes;
    }

    public void setMes(String mes) {
        this.mes = mes;
    }
}
```

注册的配置类

```java
@Configuration
// 自动 配置注入MyStarterTestProperties实例 必须为要注册的类，否则就无法注册
@EnableConfigurationProperties(MyStarterTestProperties.class)
// 判断 MyStarterTestService  该类是否存在
@ConditionalOnClass(MyStarterTestService.class)
@ConditionalOnProperty(prefix = "hellostarter.value", value = "enable", matchIfMissing = true)
public class MyStarterTestConfigure {

    @Autowired
    private MyStarterTestProperties properties;

    @Bean
    @ConditionalOnMissingBean(MyStarterTestService.class)
    public MyStarterTestService myStarterTestService() {
        final MyStarterTestService service = new MyStarterTestService();
        service.setMes(properties.getValue());
        return  service;
    }
}
```

spring.factories

```properties
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
  com.gl.spring.MyStarterTestConfigure
```

然后 spring boot 项目依赖：

```xml
        <dependency>
            <groupId>com.gl.spring</groupId>
            <artifactId>spring-boot-starter-test1</artifactId>
            <version>1.0</version>
        </dependency>
```

这样 在 spring boot 项目中，**MyStarterTestService** 的实例就注册完成，可以直接使用。打开了 debug , 在启动时 就 看到对应的Bean 被注册。

```
   MyStarterTestConfigure matched:
      - @ConditionalOnClass found required class 'com.gl.spring.MyStarterTestService' (OnClassCondition)
      - @ConditionalOnProperty (hellostarter.value.enable) matched (OnPropertyCondition)

   MyStarterTestConfigure#myStarterTestService matched:
      - @ConditionalOnMissingBean (types: com.gl.spring.MyStarterTestService; SearchStrategy: all) did not find any beans (OnBeanCondition)
```

