# 说明

[OAuth 2.0 &mdash; OAuth](https://oauth.net/2/) 中已经标识 

授权码：

+ Authorization Code

+ PKCE

+ Client Credentials

+ Device Code

+ Refresh Token

+ Legacy: Implicit Flow 2.1中将被弃用

+ Legacy: Password Grant 2.1中将被弃用

# 入口梳理

通过前面已经有个大致的流程了，SecurityFilterChain 最终被注入核心过滤器

1. ApplicationFilterChain 是 tomcat 实现javax.servlet的过滤器链，该链下有 ApplicationFilterConfig[] filters  

2. filters  就包含几个 常见的过滤器 
   
   1. characterEncodingFilter 
   
   2. webMvcMetricsFilter 
   
   3. formContentFilter 
   
   4. requestContextFilter
   
   5. springSecurityFilterChain(DelegatingFilterProxyRegistrationBean$DelegatingFilterProxy) 
   
   6. webSocketFilter  

3. DelegatingFilterProxyRegistrationBean的getFilter 创建了 DelegatingFilterProxy ，下有个 private volatile Filter delegate （DebugFilter）

4. DebugFilter 下包含一个 (FilterChainProxy filterChainProxy) 即 Security的核心，DebugFilter#doFilter 通过 filterChainProxy.getFilterChains() 获取过滤器链集合，遍历这个集合，每条过滤器链 （DefaultSecurityFilterChain）在注入的时候 会设置 matches，只要请求路径满足对应的 matches ，先返回对应的 过滤器集合，进行打印日志，再通过 this.filterChainProxy.doFilter(request, response, filterChain) 执行

5. FilterChainProxy 下又包含了 `List<SecurityFilterChain>` filterChains，所以有多条过滤器链 ，（`List<Filter>` filters = getFilters(firewallRequest);）再次通过 遍历这个集合，请求路径满足对应的 matches 找到对应的 Filter 集合封装到 FilterChainProxy#VirtualFilterChain中，过滤器链就会执行 virtualFilterChain.doFilter(firewallRequest, firewallResponse);
   
   1. 一条是默认配置的 security 的过滤器链，包含默认的几条以及新增的几条  即 **老板本中 FilterComparator 下的数个过滤器**，新版本中 FilterOrderRegistration 类下，以及 自定义注册到 到该 链下的过滤器
   
   2. 另外一条是 WebSecurityConfiguration#configure 增加的，该链下只有一个过滤器 ，或者直接注册 WebSecurityCustomizer（只会设置RequestMatcher，但没有过滤集合为0）

6. FilterChainProxy#VirtualFilterChain 遍历这个 Filter 集合，每条都会执行

7. 这两天链都配置了 RequestMatcher ，请求路径满足就会进入 对应的链中 FilterChainProxy#getFilters

RequestMatcher其中可以发现,几个和 OAuth2 相关的过滤器.

**DefaultLoginPageGeneratingFilter 默认登陆页生成 在非 OAuth2 中有使用**

**OAuth2AuthorizationRequestRedirectFilter 请求重定向的**

**OAuth2LoginAuthenticationFilter 认证逻辑**

# 一、授权码模式

在OAuth2LoginConfigurer配置文件中 String loginPage， 其父类 AbstractAuthenticationFilterConfigurer 也有一个同样的字段。

## 第一步 初始请求的重定项

最开始不清楚是哪个过滤器执行重定向，所以反推，OnCommittedResponseWrapper#sendRedirect

看到执行的是 ExceptionTranslationFilter ，但是这是一个一次处理过滤器

1. 什么异常被这个过滤器处理？

2. 这个过滤哪里做了 重定向 /oauth2/authorization/{registrationId} 的修改

### 异常

ExceptionTranslationFilter

```java
private void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain)  
 throws IOException, ServletException {  
 try {  
// 执行下个过滤器
 chain.doFilter(request, response);  
 }  
 catch (IOException ex) {  
 throw ex;  
 }  
 catch (Exception ex) {  
 // Try to extract a SpringSecurityException from the stacktrace  
 Throwable[] causeChain = this.throwableAnalyzer.determineCauseChain(ex);  
 RuntimeException securityException = (AuthenticationException) this.throwableAnalyzer  
 .getFirstThrowableOfType(AuthenticationException.class, causeChain);  
 if (securityException == null) {  
 securityException = (AccessDeniedException) this.throwableAnalyzer  
 .getFirstThrowableOfType(AccessDeniedException.class, causeChain);  
 }  
 if (securityException == null) {  
 rethrow(ex);  
 }  
 if (response.isCommitted()) {  
 throw new ServletException("Unable to handle the Spring Security Exception "  
 + "because the response is already committed.", ex);  
 }  
// 异常处理
 handleSpringSecurityException(request, response, chain, securityException);  
 }  
}
```

debug 或者 FilterOrderRegistration 可知道 下个过滤器为 FilterSecurityInterceptor

父类AbstractSecurityInterceptor

```java
private void attemptAuthorization(Object object, Collection<ConfigAttribute> attributes,  
 Authentication authenticated) {  
 try {  
 this.accessDecisionManager.decide(authenticated, object, attributes);  
 }  
 catch (AccessDeniedException ex) {  
 if (this.logger.isTraceEnabled()) {  
 this.logger.trace(LogMessage.format("Failed to authorize %s with attributes %s using %s", object,  
 attributes, this.accessDecisionManager));  
 }  
 else if (this.logger.isDebugEnabled()) {  
 this.logger.debug(LogMessage.format("Failed to authorize %s with attributes %s", object, attributes));  
 }  
// 还会发布一个 AuthorizationFailureEvent 事件
// AuthorizationAuditListener  LoggerListener 处理
 publishEvent(new AuthorizationFailureEvent(object, attributes, authenticated, ex));  
 throw ex;  
 }  
}
```

AffirmativeBased accessDecisionManager

```java
/**
这个具体的实现只需轮询所有配置的AccessDecisionVorter，
并在任何AccessDecisitionVorter投票赞成的情况下授予访问权限。
只有在有否决票且没有赞成票的情况下才拒绝访问。

如果每个AccessDecisionVorter都放弃投
票，则该决定将基于isAllowIfAllAbstrainDecisions（）属性（默认为false）。
*/
public void decide(Authentication authentication, Object object, Collection<ConfigAttribute> configAttributes)  
 throws AccessDeniedException {  
 int deny = 0;
  // WebExpressionVoter
 for (AccessDecisionVoter voter : getDecisionVoters()) {  
 int result = voter.vote(authentication, object, configAttributes);  
 switch (result) {  
 case AccessDecisionVoter.ACCESS_GRANTED:  
 return;  
 case AccessDecisionVoter.ACCESS_DENIED:  
 deny++;  
 break; default:  
 break;  
 }  
 }  
 if (deny > 0) {  
 throw new AccessDeniedException(  
 this.messages.getMessage("AbstractAccessDecisionManager.accessDenied", "Access is denied"));  
 }  
 // To get this far, every AccessDecisionVoter abstained  
 checkAllowIfAllAbstainDecisions();  
}
```

WebExpressionVoter 如下返回的 枚举类型

```java
public int vote(Authentication authentication, FilterInvocation filterInvocation,  
 Collection<ConfigAttribute> attributes) {  
 Assert.notNull(authentication, "authentication must not be null");  
 Assert.notNull(filterInvocation, "filterInvocation must not be null");  
 Assert.notNull(attributes, "attributes must not be null");  
 WebExpressionConfigAttribute webExpressionConfigAttribute = findConfigAttribute(attributes);  
 if (webExpressionConfigAttribute == null) {  
 this.logger  
 .trace("Abstained since did not find a config attribute of instance WebExpressionConfigAttribute");  
// 访问弃权
 return ACCESS_ABSTAIN;  
 }  
 EvaluationContext ctx = webExpressionConfigAttribute.postProcess(  
 this.expressionHandler.createEvaluationContext(authentication, filterInvocation), filterInvocation);  
 boolean granted = ExpressionUtils.evaluateAsBoolean(webExpressionConfigAttribute.getAuthorizeExpression(), ctx);  
 if (granted) {  
// 数据访问权限
 return ACCESS_GRANTED;  
 }  
 this.logger.trace("Voted to deny authorization");  
// 拒绝访问
 return ACCESS_DENIED;  
}
```

### 处理异常即 设置 重定向路径

ExceptionTranslationFilter

```java
private void handleSpringSecurityException(HttpServletRequest request, HttpServletResponse response,  
 FilterChain chain, RuntimeException exception) throws IOException, ServletException {  
 if (exception instanceof AuthenticationException) {  
 handleAuthenticationException(request, response, chain, (AuthenticationException) exception);  
 }  
 else if (exception instanceof AccessDeniedException) {  
 handleAccessDeniedException(request, response, chain, (AccessDeniedException) exception);  
 }  
}
```

AuthenticationEntryPoint(LoginUrlAuthenticationEntryPoint) 

在OAuth2LoginConfigurer构建的时候 （oauth2clientLogin.loginPage("/oauth2/authorization/xx"))），将 loginFormUrl 即 /oauth2/authorization/{registrationId} 生成 LoginUrlAuthenticationEntryPoint

authenticationEntryPoint

```java
public void commence(HttpServletRequest request, HttpServletResponse response,  
 AuthenticationException authException) throws IOException, ServletException {  
 if (!this.useForward) {  
 // redirect to login page. Use https if forceHttps true  
// 重定向到登陆界面
 String redirectUrl = buildRedirectUrlToLoginPage(request, response, authException);  
 this.redirectStrategy.sendRedirect(request, response, redirectUrl);  
 return; }  
 String redirectUrl = null;  
 if (this.forceHttps && "http".equals(request.getScheme())) {  
 // First redirect the current request to HTTPS. When that request is received,  
 // the forward to the login page will be used. redirectUrl = buildHttpsRedirectUrlForRequest(request);  
 }  
 if (redirectUrl != null) {  
 this.redirectStrategy.sendRedirect(request, response, redirectUrl);  
 return; }  
 String loginForm = determineUrlToUseForThisRequest(request, response, authException);  
 logger.debug(LogMessage.format("Server side forward to: %s", loginForm));  
 RequestDispatcher dispatcher = request.getRequestDispatcher(loginForm);  
 dispatcher.forward(request, response);  
 return;}
```

loginFormUrl 即 /oauth2/authorization/{registrationId}

redirectUrl 即 IP:PORT/oauth2/authorization/{registrationId}

## 第二步 重定向到授权服务器

### OAuth2AuthorizationRequestRedirectFilter 重定向

### 1.OAuth2AuthorizationRequestResolver 解析

#### 1.1 解析器路径

默认的DefaultOAuth2AuthorizationRequestResolver实现. 匹配规则:

> /oauth2/authorization/{registrationId}

如果获取到 **registrationId** 就进行处理

#### 1.2. 获取Action

如果请求中没有指定action,那么就使用默认的 "login"

#### 1.3 获取客户端

ClientRegistrationRepository 通过 registrationId 获取对应的客户端,默认为内存InMemoryClientRegistrationRepository实现.通过 配置注入 ClientRegistration 的数据.即这个 服务客户端的信息

#### 1.4 构建OAuth2AuthorizationRequest

主要有几个参数, 

1. ClientRegistration 中获取的 RegistrationId 注册ID

2. ClientRegistration 中的 redirectUriStr  重定向路径

3. ClientRegistration 中的 clientId 客户端ID

4. 资源服务器地址，通过配置导入

以及一个 Consumer<OAuth2AuthorizationRequest.Builder> authorizationRequestCustomizer

#### 1.5 sendRedirectForAuthorization 发送重定向授权

判断授权模式,如果是AUTHORIZATION_CODE(即默认), 会将这个 OAuth2AuthorizationRequest 保存到此次请求的 session里面,

```java
if (AuthorizationGrantType.AUTHORIZATION_CODE.equals(authorizationRequest.getGrantType())) {
    // 保存到session
    this.authorizationRequestRepository.saveAuthorizationRequest(authorizationRequest, request, response);
}
// 执行发送重定向
this.authorizationRedirectStrategy.sendRedirect(request, response, authorizationRequest.getAuthorizationRequestUri());
```

#### 1.6 执行发送重定向

RedirectStrategy authorizationRedirectStrategy的默认实现 DefaultRedirectStrategy

```java
    public void sendRedirect(HttpServletRequest request, HttpServletResponse response, String url) throws IOException {
        // 够远指向 授权服务器的路径
        String redirectUrl = this.calculateRedirectUrl(request.getContextPath(), url);
        redirectUrl = response.encodeRedirectURL(redirectUrl);
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(LogMessage.format("Redirecting to %s", redirectUrl));
        }
        // 转发
        response.sendRedirect(redirectUrl);
    }
```

转发路径 autho2ip:port/oauth2/authorize?....

## 第三步 授权服务器 重定向到 客户初始请求

其中注意的是 授权服务中的FilterChainProxy，有多条过滤器链。

1. 公共资源无条件通过

2. OAuth2AuthorizationServerConfigurer 配置的过滤器链 "/oauth2/consent..." ”/.well-known/oauth-authorization-server“，用于 OAuth2AuthorizationEndpointFilter 处理。

3. 授权服务器 自己后台应用的过滤器链 "/system/****"

4. 上边的 路径匹配的 反向。

第二点 过滤器链明细

  WebAsyncManagerIntegrationFilter
  SecurityContextPersistenceFilter
  ProviderContextFilter
  HeaderWriterFilter
  CsrfFilter
  LogoutFilter
  OAuth2AuthorizationEndpointFilter
  OidcProviderConfigurationEndpointFilter
  NimbusJwkSetEndpointFilter
  OAuth2AuthorizationServerMetadataEndpointFilter
  OAuth2ClientAuthenticationFilter
  UsernamePasswordAuthenticationFilter
  DefaultLoginPageGeneratingFilter
  DefaultLogoutPageGeneratingFilter
  BearerTokenAuthenticationFilter
  RequestCacheAwareFilter
  SecurityContextHolderAwareRequestFilter
  AnonymousAuthenticationFilter
  SessionManagementFilter
  ExceptionTranslationFilter
  FilterSecurityInterceptor
  OAuth2TokenEndpointFilter
  OAuth2TokenIntrospectionEndpointFilter
  OAuth2TokenRevocationEndpointFilter
  OidcUserInfoEndpointFilter

第四点 过滤器链

  WebAsyncManagerIntegrationFilter
  SecurityContextPersistenceFilter
  HeaderWriterFilter
  CaptchaAuthenticationFilter
  LogoutFilter
  UsernamePasswordAuthenticationFilter
  RequestCacheAwareFilter
  SecurityContextHolderAwareRequestFilter
  AnonymousAuthenticationFilter
  SessionManagementFilter
  ExceptionTranslationFilter
  FilterSecurityInterceptor

### 1. 跳转到登陆界面

同理还是 OnCommittedResponseWrapper#sendRedirect 切入

autho2ip:port/oauth2/authorize?.... 请求到了后，还是触发了 ExceptionTranslationFilter 的逻辑，ACCESS_DENIED 拒绝访问。

被重定向到 登陆界面, AbstractAuthenticationFilterConfigurer 的默认值是 ip:port/login

问题1 如果autho2ip:port/oauth2/authorize跟随的条件不满足 授权码模式要求应该怎么处理？

oauth2/authorize 路径是回到 OAuth2AuthorizationEndpointFilter 下，抛出 OAuth2AuthenticationException OAuth 2.0 Parameter: response_type 参数不对。调用 AuthenticationFailureHandler 的实现 OAuth2AuthorizationEndpointFilter#sendErrorResponse 

1. 有请求类型码 重定向到 autho2ip:port/error

2. 无类型码 响应会被设置为 400 Bed request，这里还是 TODO，该过滤器链会直接停止继续 OnCommittedResponseWrapper#sendError ，但是 没看到设置 继续请求的 autho2ip:port/error。参考 请求到过滤器后的处理过程.txt 。过滤器中报错，会在resp中设置参数。然后再 StandardHostValve 中判断。StandardHostValve#custom ApplicationDispatcher#forward 执行，会再次进入过滤器链 重新请求。/error 重新写入req(/error 由Tomcat 配置)

### 2.账号输入完成跳转到 用户授权确认

同正常的 Security 引入登陆。UsernamePasswordAuthenticationFilter 处理。到定义配置的AuthenticationSuccessHandler实现 或者 AuthenticationFailureHandler实现中。处理登陆结果。

AuthenticationSuccessHandler 需要实现，重定向到 /oauth2/consent 作为，进行用户授权。

默认实现是 HttpSessionRequestCache 中获取session 的 SAVED_REQUEST 属性。

### 3.同意授权

AuthenticationSuccessHandler 返回得到 需要跳转的界面路径，然后跳转。到授权界面。

点击同意授权

1. 授权服务器 /oauth2/authorize，到 OAuth2AuthorizationEndpointFilter ，OAuth2AuthorizationCodeRequestAuthenticationProvider 重定向 会业务服务地址

2. 业务服务的 过滤器 OAuth2AuthorizationCodeGrantFilter OAuth2AuthorizationCodeAuthenticationProvider 会请求 授权服务 /oauth2/token

3. 授权端/oauth2/token， OAuth2ClientAuthenticationFilter ClientSecretAuthenticationProvider，OAuth2TokenEndpointFilter OAuth2AuthorizationCodeAuthenticationProvider 重定向会业务端

4. 业务端 根据 SecurityContextHolder.getContext().getAuthentication 情况，直接返回 或者继续请求

/oauth2/consent 处理器，接受到授权同意，将同意授权的 用户数据返回。

OAuth2AuthorizationEndpointFilter

该过滤器并没有在 FilterOrderRegistration 里面，因为它只是在 授权服务器中。OAuth2AuthorizationServerConfigurer 配置进来的。

### 3.用户授权完成，重定向到 原始路径

## 第四、流程总梳理

1. 业务服务:浏览器输入 请求 业务服务的 路径 serverIp:port/service

2. 业务服务:中的过滤器链的FilterSecurityInterceptor 校验 结果为 ACCESS_DENIED ，抛出异常AccessDeniedException

3. 业务服务:中的过滤器链的ExceptionTranslationFilter，捕获异常，重定向到 serverIp:port/oauth2/authorization/xx 或者 配置的路径

4. 业务服务:再次进入业务服务中的过滤器链，被OAuth2AuthorizationRequestRedirectFilter matches。xx 为服务ID，通过配置构建 需要转发 到

授权服务的路径。authorServerIp:port/oauth2/authorize?response_type=code&client_id=xx&redirect_uri=serverIp:port/service 或者 配置的路径

5. 授权服务:还是被 FilterSecurityInterceptor 抛出异常，还是被ExceptionTranslationFilter处理。但是 重定向的路径变为了，GET请求授权服务的登陆页，

默认是 authorServerIp:port/login。返回登陆页面。

6. 授权服务:post 登陆，Handler 处理成功，跳转到 authorServerIp:port/oauth2/authorization?response_type=code&client_id=xx&redirect_uri=serverIp:port/service

OAuth2AuthorizationEndpointFilter authenticationConverter（OAuth2AuthorizationCodeRequestAuthenticationConverter）.convert 转换得到之前保存的

OAuth2AuthorizationService#save(OAuth2Authorization) 保存，后面会通过 state 查询,

OAuth2AuthorizationEndpointFilter 校验的是各个参数 OAuth2AuthorizationCodeRequestAuthenticationProvider#authenticateAuthorizationRequest ，

registeredClientRepository.findByClientId，通过clientID, 查找对应的 registeredClient，以及后续字段校验，

通常报错也是这里，然后 走 /error，如果正常 这里会创建 state. DEFAULT_STATE_GENERATOR.generateKey

7. 授权服务:OAuth2AuthorizationEndpointFilter在上边设置state,保存了 OAuth2Authorization，就重定项到 authorServerIp:port/oauth2/consent?scope=xx&client_id=xx&state=xx

8. 授权服务:选择对应授权点， POST authorServerIp:port/oauth2/authorize?scope=xx&client_id=xx&state=xx，

OAuth2AuthorizationEndpointFilter 校验的是各个参数 OAuth2AuthorizationCodeRequestAuthenticationProvider#authenticateAuthorizationConsent，

会authorizationService.findByToken，通过 state 查询OAuth2Authorization。

9. 授权服务:state 的校验.  第9步的请求会构建一个 Authentication，并得到 scope, 而 authorizationService.findByToken 找到的 OAuth2Authorization 也有scope ,全部相同才行.

OAuth2AuthorizationEndpointFilter authenticationConverter（OAuth2AuthorizationCodeRequestAuthenticationConverter）.convert 转换得到之前保存的

> 请求路径变化
> 
> 请求客户端
> 
> get http://localhost:8082/
> 
> get http://localhost:8082/oauth2/authorization/felord
> 
> get 9000/oauth2/authorize?response_type=code&client_id=e2fa7e64-249b-46f0-ae1d-797610e88615&scope=message.read%20userinfo%20message.write&state=jyRV71ljpH_JIT4O7Nky37G64oNi3KRQaWOYCquK5UE%3D&redirect_uri=http://127.0.0.1:8082/foo/bar
> 
> get 9000/login  输入账号密码
> 
> POST '/login' 提交
> 
> GET '/oauth2/authorize?response_type=code&client_id=e2fa7e64-249b-46f0-ae1d-797610e88615&scope=message.read%20userinfo%20message.write&state=iewn_bPv1Sera_UEfmcsfpFywX-PykbWC0zO7Oo9WwM%3D&redirect_uri=http://127.0.0.1:8082/foo/bar'
> 
> GET '/oauth2/consent?scope=message.read%20userinfo%20message.write&client_id=e2fa7e64-249b-46f0-ae1d-797610e88615&state=uXHZ8v7FCh1TwO6OAgxucOGhRIDJBE3UUag96pZa9jM%3D': 重定向到授权界面
> 
> 点击授权内容 同意
> 
> POST '/oauth2/authorize'  referer: http://localhost:9000/oauth2/consent?scope=message.read%20userinfo%20message.write&client_id=e2fa7e64-249b-46f0-ae1d-797610e88615&state=uXHZ8v7FCh1TwO6OAgxucOGhRIDJBE3UUag96pZa9jM%3D
> 
> 重定向到最开始的请求服务，这时已经获取到了 授权码
> 
> 8082
> 
> GET '/foo/bar?code=sutC90Lw3tvAa0bGte81989dEG7CNPURfyHq-uDsZHjZR9cn8wYwPEmovy0V1EHkyUCnIpilzpi7rT16q2HHeO-y7N3ROg7h9tg_lD064f3V2UtWnAx0hIHPu1MveRsw&state=iWkzMhLKLXSDiAdmT6DmjGyhFXPaDcTqJUUnfbzSuk8%3D':
> 
> 客户端 请求，获取授权
> 
> 9000
> 
> GET '/oauth2/authorize?response_type=code&client_id=e2fa7e64-249b-46f0-ae1d-797610e88615&scope=message.read%20userinfo%20message.write&state=FoS4d6yRb0oFM9NstjUyz_s9UjSgJD-DI1quav9fKoU%3D&redirect_uri=http://127.0.0.1:8082/foo/bar':
> 
> 8082
> 
> GET '/foo/bar?code=HcwzXA5PXry7ygzZy8PHGsqWP2EZgXDDRv9p7U6RKy3qbNRtsI_xNz7EV3DYy1tfRullb7kjcKLwES7wQJl7aKU_OWSl1MIM1_6s_Hso0xWfY8nIi8k7KQhEynw25ieg&state=FoS4d6yRb0oFM9NstjUyz_s9UjSgJD-DI1quav9fKoU%3D':
> 
> 客户端请求 获取token
> 
> 9000
> 
> POST '/oauth2/token':
> 
> 8082
> 
> GET '/foo/bar?code=sutC90Lw3tvAa0bGte81989dEG7CNPURfyHq-uDsZHjZR9cn8wYwPEmovy0V1EHkyUCnIpilzpi7rT16q2HHeO-y7N3ROg7h9tg_lD064f3V2UtWnAx0hIHPu1MveRsw&state=iWkzMhLKLXSDiAdmT6DmjGyhFXPaDcTqJUUnfbzSuk8%3D':
