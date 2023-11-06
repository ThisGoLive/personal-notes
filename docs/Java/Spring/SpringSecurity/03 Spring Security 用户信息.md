

# 3 用户信息

**UserDetailsService**

```java
public interface UserDetailsService {
    UserDetails loadUserByUsername(String var1) throws UsernameNotFoundException;
}
```

通过 用户名 ，加载得到用户 **UserDetails**

## 3.1 用户接口 UserDetails

通过上面的接口，返回的的 **UserDetail**

```java
public interface UserDetails extends Serializable {
    // 获取权限集合
    Collection<? extends GrantedAuthority> getAuthorities();
    // 密码
    String getPassword();
    // 用户名
    String getUsername();
    // 是否过期
    boolean isAccountNonExpired();

    // 是否锁定
    boolean isAccountNonLocked();
	// 凭证是否过期
    boolean isCredentialsNonExpired();
	// 是否可用
    boolean isEnabled();
}

```

该接口 主要 存储用户信息，后续 会将 用户信息封装进 **Authentication** 认证

默认实现为： `org.springframework.security.core.userdetails.User`

如果 该实现的用户信息 不够使用，可以实现自定义

## 3.2 用户服务自动配置 UserDetailsServiceAutoConfiguration

```java
@Configuration
// 当前类路径下 有 AuthenticationManager 类
@ConditionalOnClass({AuthenticationManager.class})
// 当前容器中 有 ObjectPostProcessor 实例
@ConditionalOnBean({ObjectPostProcessor.class})
// 当前容器中 没有 这三个类的实例时
@ConditionalOnMissingBean({AuthenticationManager.class, 
                           AuthenticationProvider.class, 
                           UserDetailsService.class})
public class UserDetailsServiceAutoConfiguration {
    // 无操作 密码前缀，即不使用加密的密码前缀
    private static final String NOOP_PASSWORD_PREFIX = "{noop}";
    // 默认密码加密模式
    private static final Pattern PASSWORD_ALGORITHM_PATTERN = Pattern.compile("^\\{.+}.*$");
    private static final Log logger = LogFactory.getLog(UserDetailsServiceAutoConfiguration.class);

    public UserDetailsServiceAutoConfiguration() {
    }

    // 如果 当前容器中没有如下类型的实例存在，就创建一个 在内存中管理 UserDetails的管理器
    // 并且动态生成一个 User， 密码随机
    @Bean
    @ConditionalOnMissingBean(
        type = {"org.springframework.security.oauth2.client.registration.ClientRegistrationRepository"}
    )
    @Lazy
    public InMemoryUserDetailsManager inMemoryUserDetailsManager(SecurityProperties properties, ObjectProvider<PasswordEncoder> passwordEncoder) {
        User user = properties.getUser();
        List<String> roles = user.getRoles();
        return new InMemoryUserDetailsManager(new UserDetails[]{org.springframework.security.core.userdetails.User.withUsername(user.getName()).password(this.getOrDeducePassword(user, (PasswordEncoder)passwordEncoder.getIfAvailable())).roles(StringUtils.toStringArray(roles)).build()});
    }

    // 这里即打印出 随机生成 User的密码
    private String getOrDeducePassword(User user, PasswordEncoder encoder) {
        String password = user.getPassword();
        if (user.isPasswordGenerated()) {
            logger.info(String.format("%n%nUsing generated security password: %s%n", user.getPassword()));
        }

        return encoder == null && !PASSWORD_ALGORITHM_PATTERN.matcher(password).matches() ? "{noop}" + password : password;
    }
}
```

以上条件， 就是为了 初始化一个 `InMemoryUserDetailsManager` 内存用户管理器，生成 一个 `user` 作为用户，密码动态生成。



```java
    public class SecurityConfig extends WebSecurityConfigurerAdapter 
	// 向内存中添加 两个用户
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        // 由于 spring security 5.0 后 存储密码的格式发生了改变。 {id}encodedPassword
        // There is no PasswordEncoder mapped for the id "null"

        auth.inMemoryAuthentication()
                .passwordEncoder(new BCryptPasswordEncoder())
                .withUser("test1")
                .password(new BCryptPasswordEncoder().encode("123"))
            	.roles("USER")
                .and()
                .withUser("test2")
            	.password(new BCryptPasswordEncoder().encode("123"))
            	.roles("USER");
    }
```

内存管理用户即 UserDetailsManager 的接口。

```java
public class InMemoryUserDetailsManager implements UserDetailsManager, UserDetailsPasswordService {
```

UserDetailsManager 便是 对 实体用户的增删改查

## 3.3 自定义 UserDetailsManager

```java
// 主要就是 用户的增删改查
public interface UserDetailsManager extends UserDetailsService {
    void createUser(UserDetails var1);

    void updateUser(UserDetails var1);

    void deleteUser(String var1);

    void changePassword(String var1, String var2);

    boolean userExists(String var1);
}

public static class MyUserDetailsManager implements UserDetailsManager{
	xxx    
}

@Bean
    public UserDetailsManager userDetailsManager(UserDetailsRepository userDetailsRepository) {
        // 具体实现，可以 更加 JDBC NOSQL缓存 等等
        return new MyUserDetailsManager() ;
    }
```

**注意 ：** 如果 

```java
// 为了让我们的登录能够运行 这里我们初始化一个用户 密码采用明文 当你在密码12345上使用了前缀{noop} 意味着你的密码不使用加密，authorities 一定不能为空 这代表用户的角色权限集合
private static final String NOOP_PASSWORD_PREFIX = "{noop}";
UserDetails user = User.withUsername("").password("{noop}12345").authorities(AuthorityUtils.NO_AUTHORITIES).build();
```

