[Spring Boot 2.4 与 之前的区别](https://my.oschina.net/giegie/blog/4720687)

## 第三方构建插件

spotify 、fabric8

[dockerfile-maven-version](https://hub.fastgit.org/spotify/dockerfile-maven)

```xml
<plugin>
  <groupId>com.spotify</groupId>
  <artifactId>docker-maven-plugin</artifactId>
  ...  -配置通过 xml 定义出 Dockerfile 或者挂载外部 Dockerfile
</plugin>


<plugin>
  <groupId>io.fabric8</groupId>
  <artifactId>docker-maven-plugin</artifactId>
   ...  -配置通过 xml 定义出 Dockerfile 或者挂载外部 Dockerfile
</plugin>
```

[分层构建](https://my.oschina.net/giegie/blog/4289643)

docker pull bellsoft/liberica-openjdk-alpine:11.0.9.1-1

docker pull adoptopenjdk/openjdk11:jre-11.0.9_11-alpine