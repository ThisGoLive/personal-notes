# 10 自定义登出

## 我们使用 Spring Security 登录后都做了什么

这个问题我们必须搞清楚！一般登录后，服务端会给用户发一个凭证。常见有以下的两种：

- 基于 `Session`   客户端会存 `cookie` 来保存一个 `sessionId` ，服务端存一个 `Session` 。
- 基于 `token`   客户端存一个 `token` 串，服务端会在缓存中存一个用来校验此 `token` 的信息。

## 2. 退出登录需要我们做什么

1. 当前的用户登录状态失效。这就需要我们清除服务端的用户状态。
2. 退出登录接口并不是 `permitAll`， 只有携带对应用户的凭证才退出。
3. 将退出结果返回给请求方。
4. 退出登录后用户可以通过重新登录来认证该用户。

## 3. Spring Security 中的退出登录

接下来我们来分析并实战 **如何定制退出登录逻辑**。首先我们要了解 `LogoutFilter` 。

### 3.1 LogoutFilter

我们知道退出登录逻辑是由过滤器 `LogoutFilter` 来执行的。  它持有三个接口类型的属性：

1. **`RequestMatcher logoutRequestMatcher`**  这个用来拦截退出请求的 `URL`
2. **`LogoutHandler handler`**  用来处理退出的具体逻辑
3. **`LogoutSuccessHandler logoutSuccessHandler`**  退出成功后执行的逻辑

我们通过对以上三个接口的实现就能实现我们自定义的退出逻辑。  

### 3.2 LogoutConfigurer

我们一般不会直接操作 `LogoutFilter` ，而是通过 `LogoutConfigurer` 来配置 `LogoutFilter`。 你可以通过 `HttpSecurity#logout()` 方法来初始化一个 `LogoutConfigurer` 。 接下来我们来实战操作一下。

#### 3.2.1 实现自定义退出登录请求URL

`LogoutConfigurer` 提供了 `logoutRequestMatcher(RequestMatcher logoutRequestMatcher)`、`logoutUrl(Sring logoutUrl)` 两种方式来定义退出登录请求的 `URL` 。它们作用是相同的，你选择其中一种方式即可。

#### 3.2.2 处理具体的逻辑

默认情况下 **Spring Security** 是基于 `Session` 的。`LogoutConfigurer` 提供了一些直接配置来满足你的需要。如下：

- `clearAuthentication(boolean clearAuthentication)`  是否在退出时清除当前用户的认证信息
- `deleteCookies(String... cookieNamesToClear)`  删除指定的 `cookies`
- `invalidateHttpSession(boolean invalidateHttpSession)` 是否移除 `HttpSession`

如果上面满足不了你的需要就需要你来定制 `LogoutHandler` 了。

#### 3.2.3 退出成功逻辑

- `logoutSuccessUrl(String logoutSuccessUrl)`  退出成功后会被重定向到此 `URL`  ，**你可以写一个Controller 来完成最终返回，但是需要支持 `GET` 请求和 匿名访问** 。 通过 `setDefaultTargetUrl` 方法注入到 `LogoutSuccessHandler`
- `defaultLogoutSuccessHandlerFor(LogoutSuccessHandler handler, RequestMatcher preferredMatcher)`  用来构造默认的 `LogoutSuccessHandler`  我们可以通过添加多个来实现从不同 `URL` 退出执行不同的逻辑。
- `LogoutSuccessHandler logoutSuccessHandler`  退出成功后执行的逻辑的抽象根本接口。

### 3.3 Spring Security 退出登录实战

现在前后端分离比较多，退出后返回json。 而且只有用户在线才能退出登录。否则不能进行退出操作。我们采用实现 `LogoutHandler` 和 `LogoutSuccessHandler` 接口这种编程的方式来配置 。退出请求的 `url` 依然通过 `LogoutConfigurer#logoutUrl(String logoutUrl)`来定义。 

#### 3.3.1 自定义 LogoutHandler

默认情况下清除认证信息 （`invalidateHttpSession`），和Session 失效（`invalidateHttpSession`） 已经由内置的`SecurityContextLogoutHandler` 来完成。我们自定义的  `LogoutHandler` 会在`SecurityContextLogoutHandler`  来执行。

以上是我们实现的 `LogoutHandler` 。 我们可以从 `logout` 方法的 `authentication` 变量中 获取当前用户信息。你可以通过这个来实现你具体想要的业务。比如记录用户下线退出时间、IP 等等。

#### 3.3.2 自定义 LogoutSuccessHandler

如果我们实现了自定义的 `LogoutSuccessHandler` 就不必要设置 `LogoutConfigurer#logoutSuccessUrl(String logoutSuccessUrl)` 了。该处理器处理后会响应给前端。你可以转发到其它控制器。重定向到登录页面，也可以自行实现其它 `MediaType` ,可以是 `json` 或者页面

```java
.logout()
                .logoutUrl("/logout")
                /** 清除当前用户的登陆信息 */
                .clearAuthentication(true)
                .addLogoutHandler(new YbbhLogoutHandler())
                .logoutSuccessHandler(new YbbhLogoutSuccessHandler())
```

