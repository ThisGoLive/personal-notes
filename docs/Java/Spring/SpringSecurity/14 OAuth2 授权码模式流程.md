## 四个角色

1. 用户客户端（浏览器、小程序等）

2. WebApp服务器（app:8080）

3. 授权/认证中心服务器（auth:8081）

4. 资源服务器（resource:8082，可以和授权服务器一起）

## 流程

### 1. 浏览器请求应用服务

brower get http://app:8080/

WebApp服务器 oauth 过滤器 ExceptionTranslationFilter 判断是否有权限，ACCESS_DENIED 就抛出异常 AccessDeniedException

异常捕获 ExceptionTranslationFilter 重定向：

http://app:8080/oauth2/authorization/{registrationId}

### 2. 重定向到授权服务

WebApp服务器 OAuth2AuthorizationRequestRedirectFilter OAuth2AuthorizationRequestResolver 收到 http://app:8080/oauth2/authorization/{registrationId}

通过 registrationId 找到本服务对应的注册的客户端信息：redirectUriStr 重定向路径、clientId 客户端ID、授权服务器地址

构建认证请求 重定向，auth:8081/oauth2/authorize?response_type=code&client_id=客户端ID&scope=message.read%20userinfo%20message.write&state=xxx&redirect_uri=http://app:8080/foo/bar

1. response_type 认证模式 code

2. client_id 客户端ID

3. scope 请求的操作权限 

4. state 状态值 用于标识

5. redirect_uri 认证完成后跳转的地址

### 3. 认证服务处理请求

授权/认证中心服务器 过滤器 ExceptionTranslationFilter ACCESS_DENIED，抛出异常

异常捕获 ExceptionTranslationFilter 重定向到：登陆界面

auth:8081/login

### 4. 登陆完成 授权

输入密码账号成功 UsernamePasswordAuthenticationFilter 处理

刚才 请求 oauth:8081/oauth2/authorize... 重新执行

AuthenticationSuccessHandler 需要实现，重定向到 进行用户授权

auth:8081/oauth2/consent？scope=message.read%20userinfo%20message.write&client_id=e2fa7e64-249b-46f0-ae1d-797610e88615&state=uXHZ8v7FCh1TwO6OAgxucOGhRIDJBE3UUag96pZa9jM%3D

选择授权内容，提交 post 到 oauth:8081/oauth2/authorize （authorizationEndpoint）OAuth2AuthorizationEndpointFilter 处理重定向回 

http://app:8080/?code=授权码

### 5. 使用授权码请求

WebApp服务器 get http://app:8080/?code=授权码 

重定向到 post oauth:8081/oauth2/token 

authorization: Basic ZTJmYTdlNjQtMjQ5Yi00NmYwLWFlMWQtNzk3NjEwZTg4NjE1OnNlY3JldA==

请求体： grant_type 授权码模式 code 授权码

得到 对应的 token

再 请求 resource:8082/sso/user 接收令牌，进行验证

resource 请求 oauth:8081/oauth2/jwts 获取公钥，进行验证令牌，并且进行缓存

令牌 返回给 app 

### 6. 使用令牌 获取资源服务器

webapp 请求 resource:8082/* 并传 authorization：Bearer token 获取对应的资源 如权限等

## 7. 简单来说

客户端 请求 app，先判断登陆状态  再判断令牌，没有的时候

转到 授权中心，登陆 授权，返回 授权码 

客户端拿到了 授权码，再请求 授权中心，得到 令牌

客户端 再用令牌，去请求 App。


