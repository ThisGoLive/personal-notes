# 6 Uri 与 Ant 

## 6.1 Ant 风格

主要用来对`uri`的匹配。其实跟正则表达式作用是一样的，只不过正则表达式适用面更加宽泛，`Ant`仅仅用于路径匹配

 `Ant` 中的通配符有三种：

- `?`  匹配任何单字符

- `*`匹配0或者任意数量的 **字符**

- `**` 匹配0或者更多的 **目录**

  这里注意了单个`*` 是在一个目录内进行匹配。 而`**` 是可以匹配多个目录
  
  | 通配符 | 示例           | 说明                                                         |
  | :----- | :------------- | :----------------------------------------------------------- |
  | `?`    | `/ant/p?ttern` | 匹配项目根路径下 `/ant/pattern` 和 `/ant/pXttern`,**但是不包括**`/ant/pttern` |
  | `*`    | `/ant/*.html`  | 匹配项目根路径下所有在`ant`路径下的`.html`文件               |
  | `*`    | `/ant/*/path`  | `/ant/path`、`/ant/a/path`、`/ant/bxx/path` 都匹配，不匹配 `/ant/axx/bxx/path` |
  | `**`   | `/ant/**/path` | `/ant/path`、`/ant/a/path`、`/ant/bxx/path` 、`/ant/axx/bxx/path`都匹配 |
  
  因为字符越长信息越多就越具体。比如 `/ant/a/path` 同时满足 `/**/path` 和 `/ant/*/path` 那么走`/ant/*/path`

| URL路径            | 说明                                                         |
| ------------------ | ------------------------------------------------------------ |
| /app/*.x           | 匹配(Matches)所有在app路径下的.x文件                         |
| /app/p?ttern       | 匹配(Matches) /app/pattern 和 /app/pXttern,但是不包括/app/pttern |
| /**/example        | 匹配(Matches) /app/example, /app/foo/example, 和 /example    |
| /app/**/dir/file.* | 匹配(Matches) /app/dir/file.jsp, /app/foo/dir/file.html,/app/foo/bar/dir/file.pdf, 和 /app/dir/file.java |
| /**/*.jsp          | 匹配(Matches)任何的.jsp 文件                                 |

一旦一个`uri` 同时符合两个`Ant`匹配那么走匹配规则字符最多的。为什么走最长？因为字符越长信息越多就越具体。比如 `/ant/a/path` 同时满足 `/**/path` 和 `/ant/*/path` 那么走`/ant/*/path`

## 6.2 Spring MVC 中 Ant 风格

```java

public class TestContol {
    @GetMpping("/?param")
	public Object getData() {
        
    }    
}
```



## 6.3 Spring Security 中 Ant 风格

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    // /resources/static 路径下的资源不拦截
    @Override
    public void configure(WebSecurity web) throws Exception {
        web.ignoring().antMatchers("/resources/static/**");
    }
}
```

Spring Security 使用 `antMatchers` 设置