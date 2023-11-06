# Shrio 

参考：

[博客](https://blog.csdn.net/larger5/article/details/79838212)

[springbootplus](https://springboot.plus) 中 springboot shiro jwt 的集成

之前写的一个shrio 功能。

## 领域 Realm （AuthorizingRealm 授权领域）

注册到容器中, 用于验证

```xml
<bean id="AdminRealm" class="com..AdminRealm">
		<property name="cachingEnabled" value="false"></property>
	</bean>
```

```java
    @Bean
    public JwtRealm jwtRealm(LoginRedisService loginRedisService) {
        JwtRealm jwtRealm = new JwtRealm(loginRedisService);
        jwtRealm.setCachingEnabled(false);
        jwtRealm.setCredentialsMatcher(credentialsMatcher());
        return jwtRealm;
    }
```



需要两个方法实现：一个为，用户登录校验，一个为 角色权限校验

```java
public class AdminRealm extends AuthorizingRealm {

	@Resource
	private IAdminDemandService adminDemandServiceImpl;

	@Resource
	private IRoleDemandService roleDemandServiceImpl;

	/**
	 * 为当限前登录的用户授予角色和权限, 返回授权信息
	 */
	@Override
	protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principal) {
		String userName = (String) principal.getPrimaryPrincipal();
		SimpleAuthorizationInfo authorizationInfo = new SimpleAuthorizationInfo();

		RoleBean role = adminDemandServiceImpl.getRole(userName);
		String roleName = null;
		if (role != null) {
			roleName = role.getRoleName();
			Set<String> roles = new HashSet<>();

			roles.add(roleName);

			authorizationInfo.setRoles(roles);
			authorizationInfo.setStringPermissions
                (roleDemandServiceImpl.getPermissions(role.getRoleName()));
		}
		return authorizationInfo;
	}

	/**
	 * 验证当前登录的用户
	 */
	@Override
	protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) throws AuthenticationException {
		// 1. 把AuthenticationToken转换为CustomizedToken
		CustomizedToken customizedToken = (CustomizedToken) token;

		String adminLoginName = (String) customizedToken.getPrincipal();

		AdministratorBean admin = adminDemandServiceImpl.
            findAdminByAdminLoginName(adminLoginName);
		if (admin != null) {
			AuthenticationInfo authcInfo = new SimpleAuthenticationInfo
                (admin.getLoginName(), admin.getPassword(), getName());
			return authcInfo;
		} else {
			return null;
		}
	}

}

```

1. AuthenticationInfo 授权信息，使用 SimpleAuthenticationInfo
2. PrincipalCollection 用于角色权限校验
3. AuthenticationToken 用于登录校验

## 过滤器 AuthenticatingFilter

做自定义Filter主要作用，在授权等 功能前后，进行一定的操作。

ShiroFilterFactoryBean

```java
   /**
     * ShiroFilterFactoryBean 处理拦截资源文件问题。
     * 注意：单独一个ShiroFilterFactoryBean配置是或报错的，以为在
     * 初始化ShiroFilterFactoryBean的时候需要注入：SecurityManager
     *
     * Filter Chain定义说明 1、一个URL可以配置多个Filter，使用逗号分隔 2、当设置多个过滤器时，全部验证通过，才视为通过
     * 3、部分过滤器可指定参数，如perms，roles
     *
     */
    @Bean
    public ShiroFilterFactoryBean shirFilter(SecurityManager securityManager) {
        ShiroFilterFactoryBean shiroFilterFactoryBean = new ShiroFilterFactoryBean();

        // 必须设置 SecurityManager
        shiroFilterFactoryBean.setSecurityManager(securityManager);

        // 如果不设置默认会自动寻找Web工程根目录下的"/login.jsp"页面
        shiroFilterFactoryBean.setLoginUrl("/login.html");

        // 拦截器.
        Map<String, String> filterChainDefinitionMap = new LinkedHashMap<String, String>();
        // 配置不会被拦截的链接 顺序判断
        filterChainDefinitionMap.put("/static/**", "anon");
        filterChainDefinitionMap.put("/user/login", "anon");
        //测试权限用
        filterChainDefinitionMap.put("/swagger-ui.html", "anon");

        // 配置退出过滤器,其中的具体的退出代码Shiro已经替我们实现了
        filterChainDefinitionMap.put("/logout", "logout");

        // 过滤链定义，从上向下顺序执行，一般将 /**放在最为下边 :这是一个坑呢，一不小心代码就不好使了;
        // ① authc:所有url都必须认证通过才可以访问; ② anon:所有url都都可以匿名访问
        filterChainDefinitionMap.put("/**", "authc");
        shiroFilterFactoryBean.setFilterChainDefinitionMap(filterChainDefinitionMap);
        return shiroFilterFactoryBean;
    }
```



```java
    /**
     * ShiroFilterFactoryBean配置
     *
     * @param securityManager
     * @param loginRedisService
     * @param shiroProperties
     * @param jwtProperties
     * @return
     */
    @Bean(SHIRO_FILTER_NAME)
    public ShiroFilterFactoryBean shiroFilterFactoryBean(
        SecurityManager securityManager, 
        LoginService loginService,  
        LoginRedisService loginRedisService, 
        SpringBootPlusFilterProperties filterProperties, 
        ShiroProperties shiroProperties, 
        JwtProperties jwtProperties) {
        
        ShiroFilterFactoryBean shiroFilterFactoryBean = new ShiroFilterFactoryBean();
        shiroFilterFactoryBean.setSecurityManager(securityManager);
        Map<String, Filter> filterMap = getFilterMap(loginService, loginRedisService, filterProperties, jwtProperties);
        shiroFilterFactoryBean.setFilters(filterMap);
        Map<String, String> filterChainMap = getFilterChainDefinitionMap(shiroProperties);
        shiroFilterFactoryBean.setFilterChainDefinitionMap(filterChainMap);
        return shiroFilterFactoryBean;
    }
```



## 授权属性源顾问 AuthorizationAttributeSourceAdvisor

```java
    /**
     * 安全管理器配置
     *
     * @return
     */
    @Bean
    public SecurityManager securityManager(LoginRedisService loginRedisService) {
        DefaultWebSecurityManager securityManager = new DefaultWebSecurityManager();
        securityManager.setRealm(jwtRealm(loginRedisService));
        securityManager.setSubjectDAO(subjectDAO());
        SecurityUtils.setSecurityManager(securityManager);
        return securityManager;
    }

    /**
     * JWT数据源验证
     *
     * @return
     */
    @Bean
    public JwtRealm jwtRealm(LoginRedisService loginRedisService) {
        JwtRealm jwtRealm = new JwtRealm(loginRedisService);
        jwtRealm.setCachingEnabled(false);
        jwtRealm.setCredentialsMatcher(credentialsMatcher());
        return jwtRealm;
    }

    @Bean
    public AuthorizationAttributeSourceAdvisor authorizationAttributeSourceAdvisor(SecurityManager securityManager) {
        AuthorizationAttributeSourceAdvisor authorizationAttributeSourceAdvisor = new AuthorizationAttributeSourceAdvisor();
        authorizationAttributeSourceAdvisor.setSecurityManager(securityManager);
        return authorizationAttributeSourceAdvisor;
    }
```

```xml
	<!-- 安全管理器 -->
	<bean id="securityManager" class="org.apache.shiro.web.mgt.DefaultWebSecurityManager">
		<property name="authenticator" ref="authenticator"></property>
		<property name="realms">
			<list>
				<ref bean="AdminRealm" />
				<ref bean="UserRealm" />
			</list>
		</property>
	</bean>	

<bean class="org.apache.shiro.spring.security.interceptor.AuthorizationAttributeSourceAdvisor">
		<property name="securityManager" ref="securityManager" />
	</bean>
```

## 身份验证令牌 AuthenticationToken

实现可以有很多，`UsernamePasswordToken` ，如果不满足，可以自己定义实现。

```java
public interface HostAuthenticationToken extends AuthenticationToken {
    String getHost();
}

public interface AuthenticationToken extends Serializable {
    Object getPrincipal();

    Object getCredentials();
}

```

```java
        // 创建AuthenticationToken
        JwtToken jwtToken = JwtToken.build(token, username, newSalt, expireSecond);
        // 从SecurityUtils里边创建一个 subject
        Subject subject = SecurityUtils.getSubject();
        // 执行认证登陆
        subject.login(jwtToken);
```

Subject -> DelegatingSubject

```java
    public void login(AuthenticationToken token) throws AuthenticationException {
        this.clearRunAsIdentitiesInternal();
        // 为 配置文件中的 DefaultWebSecurityManager 
        Subject subject = this.securityManager.login(this, token);
        String host = null;
        PrincipalCollection principals;
        if (subject instanceof DelegatingSubject) {
            DelegatingSubject delegating = (DelegatingSubject)subject;
            principals = delegating.principals;
            host = delegating.host;
        } else {
            principals = subject.getPrincipals();
        }

        if (principals != null && !principals.isEmpty()) {
            this.principals = principals;
            this.authenticated = true;
            if (token instanceof HostAuthenticationToken) {
                host = ((HostAuthenticationToken)token).getHost();
            }

            if (host != null) {
                this.host = host;
            }

            Session session = subject.getSession(false);
            if (session != null) {
                this.session = this.decorate(session);
            } else {
                this.session = null;
            }

        } else {
            String msg = "Principals returned from securityManager.login( token ) returned a null or empty value.  This value must be non null and populated with one or more elements.";
            throw new IllegalStateException(msg);
        }
    }
```





SecurityManager -> DefaultWebSecurityManager -> AuthenticatingSecurityManager 

通过配置文件中的DefaultWebSecurityManager  找到如下：

```java
public Subject login(Subject subject, AuthenticationToken token) throws AuthenticationException {
    AuthenticationInfo info;
    try {
        // 继续寻找 
        info = this.authenticate(token);
    } catch (AuthenticationException var7) {
        AuthenticationException ae = var7;

        try {
            this.onFailedLogin(token, ae, subject);
        } catch (Exception var6) {
            if (log.isInfoEnabled()) {
                log.info("onFailedLogin method threw an exception.  Logging and propagating original AuthenticationException.", var6);
            }
        }

        throw var7;
    }

    Subject loggedIn = this.createSubject(token, info, subject);
    this.onSuccessfulLogin(token, info, loggedIn);
    return loggedIn;
}
    public AuthenticationInfo authenticate(AuthenticationToken token) throws AuthenticationException {
        // 便是 AuthenticatingSecurityManager 中 authenticator
        return this.authenticator.authenticate(token);
    }
```

```java
public abstract class AuthenticatingSecurityManager extends RealmSecurityManager {
    private Authenticator authenticator = new ModularRealmAuthenticator();
    xxx
}
```

Authenticator -> AbstractAuthenticator

AbstractAuthenticator 的 具体身份验证工作交由 doAuthenticate

```java
protected abstract AuthenticationInfo doAuthenticate(AuthenticationToken var1) throws AuthenticationException;
```

AbstractAuthenticator的实现 只有 `ModularRealmAuthenticator`，也就符合了 `AuthenticatingSecurityManager` 注册的功能。

```java
public class ModularRealmAuthenticator extends AbstractAuthenticator {
    private static final Logger log = LoggerFactory.getLogger(ModularRealmAuthenticator.class);
    private Collection<Realm> realms;
    private AuthenticationStrategy authenticationStrategy = new AtLeastOneSuccessfulStrategy();

	xxxx

        // 可以看到，在注册 DefaultWebSecurityManager 时，的 各个Realm
        // 进行执行
    protected AuthenticationInfo doAuthenticate(AuthenticationToken authenticationToken) throws AuthenticationException {
        this.assertRealmsConfigured();
        Collection<Realm> realms = this.getRealms();
        return realms.size() == 1 ? this.doSingleRealmAuthentication((Realm)realms.iterator().next(), authenticationToken) : this.doMultiRealmAuthentication(realms, authenticationToken);
    }

    protected AuthenticationInfo doMultiRealmAuthentication(Collection<Realm> realms, AuthenticationToken token) {
        AuthenticationStrategy strategy = this.getAuthenticationStrategy();
        AuthenticationInfo aggregate = strategy.beforeAllAttempts(realms, token);
        if (log.isTraceEnabled()) {
            log.trace("Iterating through {} realms for PAM authentication", realms.size());
        }

        Iterator var5 = realms.iterator();

        while(var5.hasNext()) {
            Realm realm = (Realm)var5.next();
            aggregate = strategy.beforeAttempt(realm, token, aggregate);
            if (realm.supports(token)) {
                log.trace("Attempting to authenticate token [{}] using realm [{}]", token, realm);
                AuthenticationInfo info = null;
                Throwable t = null;

                try {
                    // 执行登录校验
                    info = realm.getAuthenticationInfo(token);
                } catch (Throwable var11) {
                    t = var11;
                    if (log.isDebugEnabled()) {
                        String msg = "Realm [" + realm + "] threw an exception during a multi-realm authentication attempt:";
                        log.debug(msg, var11);
                    }
                }

                aggregate = strategy.afterAttempt(realm, token, info, aggregate, t);
            } else {
                log.debug("Realm [{}] does not support token {}.  Skipping realm.", realm, token);
            }
        }

        aggregate = strategy.afterAllAttempts(token, aggregate);
        return aggregate;
    }
}

```

## 权限 校验

在登陆  `subject.login(jwtToken);` 跟踪后， ` info = realm.getAuthenticationInfo(token);` 得知进行了登录校验。

那么 权限校验呢？？

即使用 RequiresPermissions（需求权限）RequiresRoles （需求角色）注解

```java
 @RequiresPermissions({"insert"}) //没有的话 AuthorizationException
 @PostMapping("/insert")
```



```java
    /**
     * Shiro生命周期处理器
     * @return
     */
    @Bean
    public LifecycleBeanPostProcessor lifecycleBeanPostProcessor() {
        return new LifecycleBeanPostProcessor();
    }

    /**
     * 开启Shiro的注解(如@RequiresRoles,@RequiresPermissions),需借助SpringAOP扫描使用Shiro注解的类,并在必要时进行安全逻辑验证
     * 配置以下两个bean(DefaultAdvisorAutoProxyCreator(可选)和AuthorizationAttributeSourceAdvisor)即可实现此功能
     * @return
     */
    @Bean
    @DependsOn({ "lifecycleBeanPostProcessor" })
    public DefaultAdvisorAutoProxyCreator advisorAutoProxyCreator() {
        DefaultAdvisorAutoProxyCreator advisorAutoProxyCreator = new DefaultAdvisorAutoProxyCreator();
        advisorAutoProxyCreator.setProxyTargetClass(true);
        return advisorAutoProxyCreator;
    }

    @Bean
    public AuthorizationAttributeSourceAdvisor authorizationAttributeSourceAdvisor() {
        AuthorizationAttributeSourceAdvisor authorizationAttributeSourceAdvisor = new AuthorizationAttributeSourceAdvisor();
        authorizationAttributeSourceAdvisor.setSecurityManager(securityManager());
        return authorizationAttributeSourceAdvisor;
    }
```



