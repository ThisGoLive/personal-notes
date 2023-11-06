[[TOC]]

# 第 七 章 Spring Boot Web 开发

Web 开发的核心 有 内嵌 Servlet容器 和 Spring MVC

## 7.1 Spring Boot 的 Web 开发支持

Spring Boot 提供 spring-boot-starter-web 为 Web开发给予支持，提供了嵌入式的Tomcat 以及 Spring MVC的依赖，而 Web 的相关 自动配置存储再 spring-boot-autoconfigure包下。

由于 版本差异， 具体的包路径 不同。

+ ServerProperties 自动配置内嵌的Servlet 容器
+ HttpEncodingAutoConfiguration 和 HttpProperties 自动配置 http 编码
+ MultipartAutoConfiguration 和 MultipartProperties 自动配置上传文件的属性
+ JacksonHttpMessageConvertersConfiguration 用来配置 MappingJackson2HttpMessageConverter 与 MappingJackson2XmlHttpMessageConverter 
+ WebMvcAutoConfiguration 与 WebMvcProperties 配置 Spring MVC

## 7.2 Thymeleaf 模板引擎

由于 JSP 在内嵌Servlet的容器运行时，会有一些问题（内嵌的Tomcat Jetty 都不支持 以jar形式运行JSP，而 Undertow 则不支持JSP）。

故而在 Spring Boot 中使用的大多是 模板引擎，并且提供了大量的模板引擎：FreeMark、Groovy、Thymeleaf、Velocity 和 Mustache，Spring Boot中推荐使用 Thymeleaf，因为完美支持 Spring MVC。

### 7.2.1 Thymeleaf 基础知识

​	1.Thymeleaf  在有网络和无网络的环境下皆可运行，即它可以让美工在浏览器查看页面的静态效果，也可以让程序员在服务器查看带数据的动态页面效果。这是由于它支持  html 原型，然后在 html 标签里增加额外的属性来达到模板+数据的展示方式。浏览器解释 html 时会忽略未定义的标签属性，所以  thymeleaf 的模板可以静态地运行；当有数据返回到页面时，Thymeleaf 标签会动态地替换掉静态内容，使页面动态显示。

​    2.Thymeleaf 开箱即用的特性。它提供标准和spring标准两种方言，可以直接套用模板实现JSTL、 OGNL表达式效果，避免每天套模板、该jstl、改标签的困扰。同时开发人员也可以扩展和创建自定义的方言。

​    3. Thymeleaf 提供spring标准方言和一个与 SpringMVC 完美集成的可选模块，可以快速的实现表单绑定、属性编辑器、国际化等功能。

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"> <!-- 引入命名空间, 以 th为前缀-->
<head>
    <meta content="text/html" charset="UTF-8">
    <!-- 引入静态资源 也可以 @{} 引入 -->
    <script src="https://cdn.staticfile.org/jquery/1.10.2/jquery.min.js"></script>
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">
    <title>thy_view_1</title>
</head>
<body>
<!-- 访问model 中的属性-->
<span class="panel-title">访问model 中的属性</span>
<!-- 访问model 中的single 的name属性-->
<span th:text="${single.name}"></span>
<hr/>
<span class="panel-title">thy 的 迭代遍历</span>
<div>
    <ul class="list-group">
        <li class="list-group-item" th:each="item:${details}">
            <span th:text="${item.name}"></span>
            <span th:text="${item.age}"></span>
        </li>
    </ul>
</div>
<hr/>
<span class="panel-title">thy 的 数据判断</span>

<script th:inline="javascript">
    // 在 js 中访问 model
    var single = [[${singlePerson}]]
</script>
</body>
</html>
```

```java
@Controller
public class IndexController {

    @RequestMapping("/")
    public String index(Model model) {
        TeacherVO singlTea = new TeacherVO();
        singlTea.setName("老赵");
        singlTea.setAge(66);
        TeacherVO teacherVO1 = new TeacherVO("老王",11);
        TeacherVO teacherVO2 = new TeacherVO("老李",12);
        List<TeacherVO> list = new ArrayList<>();
        list.add(teacherVO1);
        list.add(teacherVO2);
        model.addAttribute("single", singlTea);
        model.addAttribute("details", list);
        return "thy_view_1";
    }
}
```



### 7.2.2 与Spring MVC 集成

```java
@EnableConfigurationProperties(ThymeleafProperties.class)
public class SpringBootWeb1Application {

    public static Logger logger = LoggerFactory.getLogger(SpringBootWeb1Application.class);

    @Autowired
    private ThymeleafProperties thyProperties;

    @Autowired
    private ServletContext context;

    // 用于 设置 Thymeleaf 的模板参数
    @Bean
    public ServletContextTemplateResolver templateResolver() {
        logger.info("创建 THY 模板,前缀：" + thyProperties.getPrefix() + " 后缀 :" + thyProperties.getSuffix());
        ServletContextTemplateResolver templateResolver = new ServletContextTemplateResolver(context);
        templateResolver.setSuffix(thyProperties.getSuffix());
        templateResolver.setPrefix(thyProperties.getPrefix());
        templateResolver.setTemplateMode(thyProperties.getMode());
        return templateResolver;
    }

    // spring 提供 用于 驱动 在 spring mvc下 Thymeleaf模板
    @Bean
    public SpringTemplateEngine templateEngine() {
        SpringTemplateEngine engine = new SpringTemplateEngine();
        engine.setTemplateResolver(templateResolver());
        return engine;
    }

    // 默认 使用 Thymeleaf 作为View
    @Bean
    public ThymeleafViewResolver thymeleafViewResolver() {
        ThymeleafViewResolver resolver = new ThymeleafViewResolver();
        resolver.setTemplateEngine(templateEngine());
        return resolver;
    }
}
```

### 7.2.3 Spring Boot 的 支持

如果 在 spring boot 中，对 Thymeleaf的 支持，不需要 配置模板的。

**org.springframework.boot.autoconfigure.thymeleaf** 下以及全部完成 上述配置。

## 7.3 Web 相关配置

### 7.3.1 Spring Boot 提供的自动配置

通过查看 **WebMvcAutoConfiguration** 及 **WebMvcProperties** ，有如下自动配置

#### 7.3.1.1 自动配置的ViewResolver （视图解析器）

**ContentNegotiatingViewResolver**

Spring MVC 提供的特殊 ViewResolver，不是自己处理View，而是代理给不同的ViewResolver 来处理不同的View，它有最高的优先级。

**BeanNameViewResolver**

在控制器中的一个方法返回的字符串（视图名），BeanNameViewResolver 会根据 该返回的**字符串** 去寻找 容器中 注册bean，返回对应名称注册的bean的View来渲染视图

```java
    @Nullable
    public View resolveViewName(String viewName, Locale locale) throws BeansException {
        ApplicationContext context = this.obtainApplicationContext();
        if (!context.containsBean(viewName)) {
            return null;
        } else if (!context.isTypeMatch(viewName, View.class)) {
            if (this.logger.isDebugEnabled()) {
                this.logger.debug("Found bean named '" + viewName + "' but it does not implement View");
            }

            return null;
        } else {
            return (View)context.getBean(viewName, View.class);
        }
    }
```

**InternalResourceViewResolver**

这是一个非常常见的ViewResolver，主要通过设置前缀、后缀，以及控制器中方法来返回识图名的字符串，以得到实际页面

```java
       @Bean
        @ConditionalOnMissingBean
        public InternalResourceViewResolver defaultViewResolver() {
            InternalResourceViewResolver resolver = new InternalResourceViewResolver();
            resolver.setPrefix(this.mvcProperties.getView().getPrefix());
            resolver.setSuffix(this.mvcProperties.getView().getSuffix());
            return resolver;
        }
```

#### 7.3.1.2 自动配置的静态资源

在 自动配置类 **WebMvcAutoConfiguration** 中 addResourceHandler 方法中定义以下静态资源自动配置：

```java
public void addResourceHandlers(ResourceHandlerRegistry registry) {
	if (!this.resourceProperties.isAddMappings()) {
		logger.debug("Default resource handling disabled");
	} else {
    	Duration cachePeriod = this.resourceProperties.getCache().getPeriod();
		CacheControl cacheControl = this.resourceProperties.getCache().getCachecontrol().toHttpCacheControl();
        // 为/webjars/** 时，映射
		if (!registry.hasMappingForPattern("/webjars/**")) {
			this.customizeResourceHandlerRegistration(registry.addResourceHandler(new String[]{"/webjars/**"}).addResourceLocations(new String[]{"classpath:/META-INF/resources/webjars/"}).setCachePeriod(this.getSeconds(cachePeriod)).setCacheControl(cacheControl));
		}

        // 类路径文件，映射 "/" "classpath:/public/" 
        // "classpath:/static/" "classpath:/resources/" 
        // "classpath:/META-INF/resources/"
		String staticPathPattern = this.mvcProperties.getStaticPathPattern();
    	if (!registry.hasMappingForPattern(staticPathPattern)) {
			this.customizeResourceHandlerRegistration(registry.addResourceHandler(new String[]{staticPathPattern}).addResourceLocations(WebMvcAutoConfiguration.getResourceLocations(this.resourceProperties.getStaticLocations())).setCachePeriod(this.getSeconds(cachePeriod)).setCacheControl(cacheControl));
		}

	}
}
```

配置文件 

```properties
spring.resources.static-locations=classpath:xxx
```



#### 7.3.1.3 自动配置的**Formatter** 和 **Converter**

格式化程序 与 转换器（用来处理 request 和 response 里的数据）

```java
        public void addFormatters(FormatterRegistry registry) {
            Iterator var2 = this.getBeansOfType(Converter.class).iterator();

            while(var2.hasNext()) {
                Converter<?, ?> converter = (Converter)var2.next();
                registry.addConverter(converter);
            }

            var2 = this.getBeansOfType(GenericConverter.class).iterator();

            // 通用转换器
            while(var2.hasNext()) {
                GenericConverter converter = (GenericConverter)var2.next();
                registry.addConverter(converter);
            }

            var2 = this.getBeansOfType(Formatter.class).iterator();

            while(var2.hasNext()) {
                Formatter<?> formatter = (Formatter)var2.next();
                registry.addFormatter(formatter);
            }

        }
```

只要定义了 Converter、GenericConverter、Formatter 接口的实现类的Bean，就会自动被注册到Spring MVC  中

**Converter** 处理器，

#### 7.3.1.4 自动配置的HttpMessageConverter （HttpMessage转换器）

在 **WebMvcAutoConfiguration** 中的 注册的 消息转换器集合

```java
        public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
            this.messageConvertersProvider.ifAvailable((customConverters) -> {
                converters.addAll(customConverters.getConverters());
            });
        }
```

这里直接注册了 **HttpMessageConverters** 的 Bean，这个Bean是在 **HttpMessageConverterAutoConfiguration** 类中定义的。

这里自动注册的 HttpMessageConverter 除了 Spring MVC 默认的

**ByteArrayHttpMessageConverter**

**StringHttpMessageConverter**

**ResourceHttpMessageConverter**

**SourceHttpMessageConverter**

**AllEncompassingFormHttppMessageConverter**

外，在 HttpMessageConvertersAutoConfiguration 的自动配置文件里 还引入了 **JacksonHttpMessageConverters** 和 **GsonHttpMessageConverterConfiguration**

从而 获得额外的 HttpMessageConverter

#### 7.3.1.5 静态页面的支持

+ classpath:/META-INF/index.html
+ classpath:/resources/index.html
+ classpath:/static/index.html
+ classpath:/public/index.html

这些 都可以 直接 默认映射。

### 7.3.2 接管 Spring Boot 的Web 配置

如果 Spring boot 默认的配置 不符合需求，可以在 配置类（使用了 @Configuration） 再加上 **@EnableWebMvc** 注解，来完全控制 mvc 配置

即 按照第四章 中，继承 **WebMvcConfigurerAdpater** 

### 7.3.3 注册 Servlet Filter Listener

第一种： 声明为Bean 给容器自动注册

```java
@Bean
public XXServlet XXServlet() {
    return new XXServlet();
}
@Bean
public XXFilter XXFilter() {
    return new XXFilter();
}
@Bean
public XXListener XXListener() {
    return new XXListener();
}
```

第二种：注册 **ServletRegistrationBean**   **FilterRegistrationBean** **ListenerRegistrationBean** 是再注册

```java
@Bean
public ServletRegistrationBean  ServletRegistrationBean   () {
    return new ServletRegistrationBean(new XXServlet(),"/xx/*");
}
@Bean
public FilterRegistrationBean FilterRegistrationBean() {
    FilterRegistrationBean filters = new FilterRegistrationBean();
    filters.setFilter(new XXFilter());
    filters.setOrder(2);
    return filters;
}
@Bean
public ListenerRegistrationBean ListenerRegistrationBean() {
    ListenerRegistrationBean listener = new ListenerRegistrationBean<XXListener>( new XXListener());
    return listener;
}

```

## 7.4 Servlet 容器配置

对 Tomcat Jetty Undertow都是通用的。

### 7.4.1 配置 Tomcat

所有 关于 配置 Web 容器的配置 都在 **org.springframework.boot.autoconfigure.web.ServerProperties** 中。通用 Servlet容器配置 都是 以 **server** 为前缀。

例如

```properties
# servlet 容器配置
# 容器端口 默认 8080
server.port=  
# session 会话 过期时间 秒为单位
server.session-timeout= 
# 配置的访问路径 默认 /
server.context-path=

# 配置 Tomcat
# 配置 tomcat 编码 默认 utf-8
server.tomcat.uri-confing=
# tomcat 是否开启 压缩 默认 off 关闭
server.tomcat.compression=
```

### 7.4.2 代码配置 Tomcat

[Spring Boot  错误异常页面处理](https://www.cnblogs.com/wangzhuxing/p/10158390.html)

1 **通用配置**

如果要通过代码的方式实现配置 servlet 容器，则 需要注册测一个 实现 **EmbeddedServletContainerCustomizer** （2.0之前）

[Spring Boot 2.0以上 使用 WebServerFactoryCustomizer](https://segmentfault.com/a/1190000014610478)

```java
public void customize(ConfigurableServletWebServerFactory factory) {
    
}

@Bean 
public WebServerFactoryCustomizer<ConfigurableWebServerFactory> webServerFactoryWebServerFactoryCustomizer(){ 
    return new WebServerFactoryCustomizer<ConfigurableWebServerFactory>() { 
        @Override 
        public void customize(ConfigurableWebServerFactory factory) {
            factory.setPort(8002); 
        } 
    }; 
}
```

2 **特定配置**

```java

@Component
public class EmbeddedTomcatConfig implements WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> {

    @Override
    public void customize(ConfigurableServletWebServerFactory factory) {
        ((TomcatServletWebServerFactory)factory).addConnectorCustomizers(new TomcatConnectorCustomizer() {
            @Override
            public void customize(Connector connector) {
                Http11NioProtocol protocol = (Http11NioProtocol) connector.getProtocolHandler();
                protocol.setMaxConnections(200);
                protocol.setMaxThreads(200);
                protocol.setSelectorTimeout(3000);
                protocol.setSessionTimeout(3000);
                protocol.setConnectionTimeout(3000);
            }
        });
    }
}
```

### 7.4.3 替换 Tomcat

默认使用 Tomcat 如需替换需要：

```xml
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <exclusions>
                <exclusion>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-starter-tomcat</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-jetty</artifactId>
        </dependency>
```

### 7.4.4 SSL配置

[配置 SSL](https://blog.csdn.net/liuxy_236/article/details/87956494)

可以使用  **keytool** 生成证书

```shell
keytool -gnkey -alias tomcat
```

配置：

将生成的 **.keystore** 文件复制到 项目的根目录，然后配置

```properties
server.prot=8443
server.ssl.key-store= .keystore
server.ssl.key-store-password= 
server.ssl.keyStoreType= JKS
server.ssl.keyAlias= tomcat
```

但是此时 HTTP 是无法 自动跳转到 HTTPS下的

故而 需要添加 代码配置

```java
@SpringBootApplication
public class ServerApplication {
 
	public static void main(String[] args) {
		SpringApplication.run(ServerApplication.class, args);
	}
 
    @Bean
    //配置http某个端口自动跳转https
    public TomcatServletWebServerFactory servletContainer() {
 
        TomcatServletWebServerFactory tomcat = new TomcatServletWebServerFactory() {
 
            @Override
            protected void postProcessContext(Context context) {
                SecurityConstraint securityConstraint = new SecurityConstraint();
                // 保密
                securityConstraint.setUserConstraint("CONFIDENTIAL");
                SecurityCollection collection = new SecurityCollection();
                collection.addPattern("/*");
                securityConstraint.addCollection(collection);
                context.addConstraint(securityConstraint);
            }
        };
        tomcat.addAdditionalTomcatConnectors(initiateHttpConnector());
        return tomcat;
    }
 
    private Connector initiateHttpConnector() {
        Connector connector = new Connector("org.apache.coyote.http11.Http11NioProtocol");
        connector.setScheme("http");
        //监听的http端口
        connector.setPort(8080);
        connector.setSecure(false);
        //跳转的https端口
        connector.setRedirectPort(8443);
        return connector;
    }
}
```

## 7.5 Favicon（图标）配置 

Spring Boot 默认一个 Facicon ，为开启。

```properties
spring.mvc.favicon.enable=false  #关闭
```

可以设置自己的 **favicon.ico** (文件名不能变) 放置在 

类路径根目录 

类路径META-INF/resources/ 

类路径resources 

类路径static  

类路径public

下即可。

## 7.6 WebSocket

WebSocket 是通过一个 socket 来实现双工异步通信能力。但是直接使用 WebSocket 协议开发程序繁琐，故而使用它的子协议 **STOMP**

**STOMP**协议使用一个基于帧的格式来定义消息，与HTTP的request和response类似。

Spring Boot 中提供 **org.springframework.boot.autoconfigure.websocket** 包的实现 来 对 tomcat jetty undertow 的支持

而Spring Boot 对 WebSocket 的支持 由 **spring-boot-starter-websocket** 提供

### 7.6.1实例 广播式

配置类

```java
@SpringBootApplication
// 开启 对 websocket 的支持 并 通过 实现 WebSocketMessageBrokerConfigurer 对 STOMP 协议的支持
// 控制器支持使用 @MessageMapping  如同 RequestMapping
@EnableWebSocketMessageBroker
public class SpringBootWeb1Application implements WebSocketMessageBrokerConfigurer{

    private static Logger logger = LoggerFactory.getLogger(SpringBootWeb1Application.class);

    public static void main(String[] args) {
        SpringApplication.run(SpringBootWeb1Application.class, args);
    }

    // 注册 STOMP 协议的节点 映射指定的url socket
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 注册 STOMP 的 endpoint （末节点）  指定 socketJS 协议
        registry.addEndpoint("/socket").withSockJS();
    }

    // 配置消息代理 Message Broker
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 广播式配置一个 /topic 代理
        registry.enableSimpleBroker("/topic");
    }
}
```

处理器

```java
@Controller
public class SocketController {

    private static Logger logger = LoggerFactory.getLogger(SpringBootWeb1Application.class);

    // 浏览器向服务端发送请求的地址 类似 requestMapping
    @MessageMapping("/socketmessage")
    // 当服务端有消息时，会对订阅的 @SendTo 中路径的浏览器 发送消息
    @SendTo("/topic/getResponse")
    public MessageResponse socketMessage(SocketMessage mesage) {
        String message = mesage.getMessage();
        String name = mesage.getName();
        message = message == null ? "你好" : message;
        return new MessageResponse(name + "说：" + message);
    }
}
```

现在 就出现了 **四个** 访问路径 或者说 **三个**。

再看 前端

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <script src="https://cdn.bootcss.com/jquery/3.4.0/jquery.min.js"></script>
    <script src="https://cdn.bootcss.com/stomp.js/2.3.3/stomp.js"></script>
    <script src="https://cdn.bootcss.com/sockjs-client/1.4.0/sockjs.min.js"></script>
    <title>Title</title>
</head>
<body onload="disconnect()">
<noscript><h2>你的浏览器不支持 websocket</h2></noscript>
<div>
    <div>
        <button id="connect" onclick="connect();">点击链接 Web Socket</button>
        <button id="disconnect" disabled = "disabled" onclick="disconnect();">点击断开 Web Socket链接</button>
    </div>
    <div id="messagename">
        <label>输入你的名字</label><input type="text" id="name"/>
        <button id="sendName" onclick="sendName();">发送名称</button>
    </div>
    <p id="response"></p>
</div>
</body>
<script type="text/javascript">
    var stompClient = null;
    function connect() {
        var socket = new SockJS("/socket")
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function (frame) {
            setConnected(true);
            console.log("Connected:" + frame);
            console.log("WebSocket链接成功！");
            stompClient.subscribe('/topic/getResponse', function (respnose) {
                showResponse(JSON.parse(respnose.body).message)
            })
        })
    }
    function setConnected(connected) {
        document.getElementById("connect").disable = connected;
        document.getElementById("disconnect").disable = !connected;
        document.getElementById("messagename").disable = connected ? 'visible' : 'hidden';
    }
    function disconnect() {
        if (stompClient != null) {
            stompClient.disconnect();
        }
        setConnected(false);
        console.log("WebSocket链接关闭！");
    }
    function sendName() {
        var name = $("#name").val();
        stompClient.send("/socketmessage", {}, JSON.stringify({'name': name}));
    }
    function showResponse(message) {
        var response = $("#response");
        response.html(message);
    }
</script>
</html>
```

说明：

一、 配置类中 **registry.addEndpoint("/socket").withSockJS();** 是指定 创建 WebSocket 的访问路径

二、 配置 **registry.enableSimpleBroker("/topic");** 广播式代理统一

三、 处理器中 **@MessageMapping("/socketmessage") ** 客户端 发送消息的路径

四、 处理器中 **@SendTo("/topic/getResponse")** 订阅地址，即对应 发送消息路径对应的 相应消息地址。

### 7.6.2 实例 一对一式

虽然 上面 能解决很多场景，但是 还是有个别场景无法解决。即 谁发送消息 接收到 对应的消息。

这里 在 spring boot 中需要 引入 Spring Security。

配置类

```java
@SpringBootApplication
// 开启 对 websocket 的支持 并 通过 实现 WebSocketMessageBrokerConfigurer 对 STOMP 协议的支持
// 控制器支持使用 @MessageMapping  如同 RequestMapping
@EnableWebSocketMessageBroker
public class SpringBootWeb1Application implements WebSocketMessageBrokerConfigurer{

    private static Logger logger = LoggerFactory.getLogger(SpringBootWeb1Application.class);

    public static void main(String[] args) {
        SpringApplication.run(SpringBootWeb1Application.class, args);
    }

    // 注册 STOMP 协议的节点 映射指定的url socket
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 注册 STOMP 的 endpoint （末节点）  指定 socketJS 协议
        // 广播
        registry.addEndpoint("/socketWisely").withSockJS();
        // 一对一
        registry.addEndpoint("/socketChat").withSockJS();
    }

    // 配置消息代理 Message Broker
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 广播式配置一个 /topic 代理
        // 点对点 queue
        registry.enableSimpleBroker("/topic","/queue");
    }
}

```

WebMVC 配置

```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("test").setViewName("thy_view_socket_1");
        registry.addViewController("login").setViewName("login");
        registry.addViewController("chat").setViewName("chat");
    }
}
```

Security 配置类

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
                // 设置 / /login 路径不进行拦截
                .antMatchers("/","login","/favicon.ico").permitAll()
                .anyRequest().authenticated()
                .and()
                .formLogin()
                .successHandler(new ForwardAuthenticationSuccessHandler("/chat"))
                // 设置 spring security 的登陆页面的访问路径
                .loginPage("/login")
                // 登陆成功后的 转向 /chat路径
                .defaultSuccessUrl("/chat")
//                .failureUrl("/chat")
                .permitAll()
                .and()
                .logout()
                .permitAll();
    }

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

    // /resources/static 路径下的资源不拦截
    @Override
    public void configure(WebSecurity web) throws Exception {
        web.ignoring().antMatchers("/resources/static/**");
    }
}
```

控制器

```java
@Controller
public class SocketController {

    private static Logger logger = LoggerFactory.getLogger(SpringBootWeb1Application.class);

    // 通过 SimpMessagingTemplate  向浏览器发送消息
    @Autowired
    private SimpMessagingTemplate messageingTemplate;

    // 浏览器向服务端发送请求的地址 类似 requestMapping
    @MessageMapping("/socketmessage")
    // 当服务端有消息时，会对订阅的 @SendTo 中路径的浏览器 发送消息
    @SendTo("/topic/getResponse")
    public MessageResponse socketMessage(SocketMessage mesage) {
        String message = mesage.getMessage();
        String name = mesage.getName();
        message = message == null ? "你好" : message;
        return new MessageResponse(name + "说：" + message);
    }

    // 在 spring mvc 中 可以直接 在参数中获取 principal，principal 包含当前用户的信息 , String text
    @MessageMapping("/chatmessage")
    public void handleChat(Principal principal, String text) {
        String name = principal.getName();

        logger.info("消息:" + text);
        logger.info("名称:" + name);
        // 用户 是 test1  就发送消息给 test2
        if (name.equals("test1")) {
            // 通过 messageingTemplate.convertAndSendToUser 发送给用户消息，
            // 第一个参数 接收消息的用户
            // 第二个 是订阅的地址
            // 第三个 消息本身
            // 不知道 什么原理 前台订阅路径 为 /uesr/queue/notifications
            // 里面代码 拼接的路径 为 /uesr/test2/queue/notifications
            // 总体来说 踩了很多坑
            messageingTemplate.convertAndSendToUser("test2", "/queue/notifications",  name + "-send" + text);
        } else {
            messageingTemplate.convertAndSendToUser("test1", "/queue/notifications",  name + "-send" + text);
        }
    }
}

```

登陆客户端

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<html lang="en">
<head>
    <meta charset="UTF-8">
    <script src="https://cdn.bootcss.com/jquery/3.4.0/jquery.min.js"></script>
    <script src="https://cdn.bootcss.com/stomp.js/2.3.3/stomp.js"></script>
    <script src="https://cdn.bootcss.com/sockjs-client/1.4.0/sockjs.min.js"></script>
    <title>登陆页面</title>
</head>
<body>
<!--<div th:if="${param.error}">登陆失败</div>-->
<!--<div th:if="${param.logout}">退出登陆</div>-->
<from id="fromid" action="/login" method="post" οnsubmit="return sub();">
    <div><label>账号：<input id="inp1" type="text" name="username"></label></div>
    <div><label>密码：<input id="inp2" type="password" name="password"></label></div>
    <div><input type="button" value="登陆" onclick="sub()"></div>
    <div><input type="submit" value="提交"></div>
</from>

<form th:action="@{/login}" method="post">
    账号：<input type="text" name="username"><br>
    密码：<input type="password" name="password"><br>
    <input type="reset" value="重置">
    <input type="submit" value="提交">
</form>
</body>
<script type="">
    function sub() {
        var loginName = $('#inp1').val();
        var password = $('#inp2').val();
        $.ajax({
            cache: true,
            type: "POST",
            url:"/login",
            data:{
                uesrname : loginName,
                password : password},
            // data: $('#form1').serialize(),
            async: true,
            error: function(request) {
                alert("Connection error:"+request.error);
            },
            success: function(data) {
                alert("SUCCESS!");
            }
        });
    }
</script>
</html>

```

一对一客户端

```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<html lang="en">
<head>
    <meta charset="UTF-8">
    <script src="https://cdn.bootcss.com/jquery/3.4.0/jquery.min.js"></script>
    <script src="https://cdn.bootcss.com/stomp.js/2.3.3/stomp.js"></script>
    <script src="https://cdn.bootcss.com/sockjs-client/1.4.0/sockjs.min.js"></script>
    <title>聊天室</title>
</head>
<body>
<form id="mess">
    <textarea id="message" rows="4" cold="60" name="text"></textarea>
    <input type="submit" value="发送">
    <input type="button" id="sendMesss" onclick="sendMess();" value="发送消息">
</form>
<button id="stop">关闭Socket链接</button>
<div id="output"></div>
</body>
<script type="text/javascript">
    $("mess").submit(function (e) {
        e.preventDefault();
        var text = $('mess').find('textarea[name="text"]').val();
        console.log("发送消息！" + text);
        sendSpittle(text);
    });

    function sendMess() {
        var text = $("#message").val();
        console.log("发送消息！" + text);
        sendSpittle(text);
    }

    var sock = new SockJS("/socketChat");
    var stomp = Stomp.over(sock);
    stomp.connect('guest', 'guest', function (frame) {
        console.log("链接成功！" );
        stomp.subscribe("/user/queue/notifications", function (respnose) {
            console.log("监听到消息！");
            handleNotification(respnose.body);
        });
    });

    function handleNotification( message ) {
        $('#output').append("<b>消息："+ message +"</b><br/>")
    }

    function  sendSpittle(text) {
        stomp.send("/chatmessage",{}, JSON.stringify({'text': text}))
    }
    $('#stop').click(function () {
        sock.close();
    })
</script>
</html>
```

## 7.7 前端 技术 

略