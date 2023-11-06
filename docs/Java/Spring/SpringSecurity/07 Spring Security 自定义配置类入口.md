# 7 自定义 Security 配置类

例如：

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
                // 设置 / /login 路径不进行拦截
                .antMatchers("/", "login", "/favicon.ico", "/stu/**", "/rest/**").permitAll()
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

默认需要实现

```java
protected void configure(AuthenticationManagerBuilder auth) throws Exception {
               super.configure(auth);
           }
```

```java
public void configure(WebSecurity web) throws Exception {
               super.configure(web);
           }
```

```
protected void configure(HttpSecurity http) throws Exception {
               super.configure(http);
           }
```

## 7.1  认证管理器配置方法

AuthenticationManagerBuilder

用来配置认证管理器`AuthenticationManager`。说白了就是所有 `UserDetails` 相关的它都管，包含 `PasswordEncoder` 密码机

## 7.2  核心过滤器配置方法

WebSecurity

`WebSecurity` 是基于 `Servlet Filter` 用来配置 `springSecurityFilterChain` 。而 `springSecurityFilterChain` 又被委托给了 **Spring Security 核心过滤器 Bean** `DelegatingFilterProxy` 。  相关逻辑你可以在 `WebSecurityConfiguration` 中找到。我们一般不会过多来自定义 `WebSecurity` , 使用较多的使其`ignoring()` 方法用来忽略 **Spring Security** 对静态资源的控制。

## 7.3 安全过滤器链配置方法

`void configure(HttpSecurity http)` 这个是我们使用最多的，用来配置 `HttpSecurity` 。 `HttpSecurity` 用于构建一个安全过滤器链 `SecurityFilterChain` 。`SecurityFilterChain` 最终被注入**核心过滤器** 。 `HttpSecurity` 有许多我们需要的配置。我们可以通过它来进行自定义安全访问策略

## 7.4 HttpSecurity 配置

```java
      protected void configure(HttpSecurity http) throws Exception {
          logger.debug("Using default configure(HttpSecurity). If subclassed this will potentially override subclass configure(HttpSecurity).");

          http
              .authorizeRequests()
                  .anyRequest().authenticated()
                  .and()
              .formLogin().and()
              .httpBasic();
      }
```

 上面是 **Spring Security** 在 **Spring Boot** 中的默认配置。通过以上的配置，你的应用具备了一下的功能：

- 所有的请求访问都需要被授权。
- 使用 `form` 表单进行登陆(默认路径为`/login`)，也就是前几篇我们见到的登录页。
- 防止 `CSRF` 攻击、 `XSS` 攻击。
- 启用 `HTTP Basic` 认证

配置方法含义：

| 方法                | 说明                                                         |
| ------------------- | ------------------------------------------------------------ |
| openidLogin()       | 用于基于 OpenId 的验证                                       |
| headers()           | 将安全标头添加到响应,比如说简单的 XSS 保护                   |
| cors()              | 配置跨域资源共享（ CORS ）                                   |
| sessionManagement() | 允许配置会话管理                                             |
| portMapper()        | 允许配置一个PortMapper(HttpSecurity#(getSharedObject(class)))，其他提供SecurityConfigurer的对象使用 PortMapper 从 HTTP 重定向到 HTTPS 或者从 HTTPS 重定向到 HTTP。默认情况下，Spring  Security使用一个PortMapperImpl映射 HTTP 端口8080到 HTTPS 端口8443，HTTP 端口80到 HTTPS  端口443 |
| jee()               | 配置基于容器的预认证。 在这种情况下，认证由Servlet容器管理   |
| x509()              | 配置基于x509的认证                                           |
| rememberMe          | 允许配置“记住我”的验证                                       |
| authorizeRequests() | 允许基于使用HttpServletRequest限制访问                       |
| requestCache()      | 允许配置请求缓存                                             |
| exceptionHandling() | 允许配置错误处理                                             |
| securityContext()   | 在HttpServletRequests之间的SecurityContextHolder上设置SecurityContext的管理。 当使用WebSecurityConfigurerAdapter时，这将自动应用 |
| servletApi()        | 将HttpServletRequest方法与在其上找到的值集成到SecurityContext中。 当使用WebSecurityConfigurerAdapter时，这将自动应用 |
| csrf()              | 添加 CSRF 支持，使用WebSecurityConfigurerAdapter时，默认启用 |
| logout()            | 添加退出登录支持。当使用WebSecurityConfigurerAdapter时，这将自动应用。默认情况是，访问URL”/  logout”，使HTTP  Session无效来清除用户，清除已配置的任何#rememberMe()身份验证，清除SecurityContextHolder，然后重定向到”/login?success” |
| anonymous()         | 允许配置匿名用户的表示方法。 当与WebSecurityConfigurerAdapter结合使用时，这将自动应用。  默认情况下，匿名用户将使用org.springframework.security.authentication.AnonymousAuthenticationToken表示，并包含角色 “ROLE_ANONYMOUS” |
| formLogin()         | 指定支持基于表单的身份验证。如果未指定FormLoginConfigurer#loginPage(String)，则将生成默认登录页面 |
| oauth2Login()       | 根据外部OAuth 2.0或OpenID Connect 1.0提供程序配置身份验证    |
| requiresChannel()   | 配置通道安全。为了使该配置有用，必须提供至少一个到所需信道的映射 |
| httpBasic()         | 配置 Http Basic 验证                                         |
| addFilterBefore()   | 在指定的Filter类之前添加过滤器                               |
| addFilterAt()       | 在指定的Filter类的位置添加过滤器                             |
| addFilterAfter()    | 在指定的Filter类的之后添加过滤器                             |
| and()               | 连接以上策略的连接器，用来组合安全策略。实际上就是”而且”的意思 |