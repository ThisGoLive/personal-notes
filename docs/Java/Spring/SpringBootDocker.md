# SpringBootDocker

2024年3月2日

## 1 参考文档

[体验SpringBoot(2.3)应用制作Docker镜像(官方方案)-CSDN博客](https://blog.csdn.net/boling_cavalry/article/details/106597358)

[详解SpringBoot(2.3)应用制作Docker镜像(官方方案)-CSDN博客](https://blog.csdn.net/boling_cavalry/article/details/106598189)

[SpringBoot（中文）容器镜像](https://springdoc.cn/spring-boot/container-images.html#container-images)

[SpringBoot3.2官方PDF文档](https://docs.spring.io/spring-boot/docs/3.2.0/reference/pdf/spring-boot-reference.pdf)

[SpringBoot(2.4)应用制作Docker镜像(Gradle版官方方案)-CSDN博客](https://blog.csdn.net/boling_cavalry/article/details/115451129)

## 2 基于layertools

插件配置，新版本都是默认开启的

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <layers>
            <enabled>true</enabled>
        </layers>
    </configuration>
</plugin>
```

dockerfile

```yaml
# 基础镜像 分段构建
FROM eclipse-temurin:17-jre as builder
# 执行工作的目录
WORKDIR application
# 配置参数
ARG JAR_FILE=target/*.jar
# 将springboot的jar 复制
COPY ${JAR_FILE} application.jar
# 通过 layertools 拆分
RUN java -Djarmode=layertools -jar application.jar extract

# 构建镜像
FROM eclipse-temurin:17-jre
WORKDIR application
# 将上一个阶段的 进行复制
COPY --from=builder application/dependencies/ ./
COPY --from=builder application/spring-boot-loader/ ./
COPY --from=builder application/snapshot-dependencies/ ./
COPY --from=builder application/application/ ./
ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]
```

```shell
docker build --build-arg JAR_FILE=path/to/myapp.jar .
docker build -t xxx:`date "+%Y%m%d%D%M%S"` .
```
