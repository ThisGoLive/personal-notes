[[TOC]]

# 第 十 章 开发部署 与 测试

## 10.1 开发的热部署

### 10.1.1 模板引擎热部署

各个引擎模板都有参数设置

```properties
spring.thymeleaf.cache=false
spring.freemarker.cache=false
spring.groovy.template.cache=false
spring.velocity.cache=false
```

### 10.1.2 Spring Loaded

Spring Loaded 可以实现修改类文件的热部署

下载后 配置 启动参数

`-javaagent: xxx\springloadedxxx.jar -noverify`

### 10.1.3 JRebel

JRebel  Java开发热部署的最佳，spring boot 也有对应支持

不过收费

### 10.1.4 spring-boot-devtools

添加依赖即可完成热部署

## 10.2 常规部署

基本没啥说的

主要是 Linux 下，为服务注册

依赖中的 插件

```xml
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <executable>true</executable>
                </configuration>
            </plugin>
```

然后 将打好的包 以到Linux 下。

注册服务 init.d   

```shell
# 主要 为 init.d  
sudo ln -s xxx/xxx.jar  /etc/init.d/服务名
```

然后就可以 service 服务名 操作  完成 对应的启动

注册服务Systemd

/etc/systemd.system/服务名.service 

```
[Unit]
Description=服务名
After=syslog.target

[Service]
ExecStart= xxx/java -jar xxx/xx.jar

[Install]
WantedBy=multi-user.target
```

war 部署 略

## 10.3 云部署 Docker 

主要就是 Dockerfile 的编写

## 10.4 Spring Boot 的测试

Spring Boot 测试 与 之前的 Spring MVC 的测试类似。

Spring Boot 提供了一个 **@SpringApplicationConfiguration** 替代 **@ContextConfiguration** 用来配置 Application Context

```java
@RunWith(SpringJunit4ClassRunner.class)
@SpringApplicationCOnfiguration(classes = TestApplication.calss)
@WebAppConfiguration
@Transactional
public class TestApplication {
    
    @Autowired
    WebApplicationContext context;
    MockMvc mvc;
}
```





