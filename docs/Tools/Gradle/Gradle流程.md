# 流程

2024-02-03

## 1 初始化

项目下
gradle/wrapper/gradle-wrapper.jar

包含 启动类 GradleWrapperMain 从服务器中下载 gradle wrapper 到 HOME/.gradle/wrapper/dists

## 2 构建开始

根项目下

1. init.gradle 编译执行
2. buildSrc 编译 交由 classloader
3. gradle.properties 读取键值对
4. settings.gradle
5. build.gradle

### 2.1 settings.gradle

```gradle
include 'app', 'module1'
```

将include包装为子项目，给根项目

### 2.2 build.gradle

在 根目录的环境下编译执行为 ProjectScript 执行

1. buildScipt{}
   1. ProjectScript.buildScipt
2. apply plugin xxx
   1. Plugin.apply()
3. gradle.addListener
   1. Gradle.addListener  ListenerManager
4. task{doLast{}}
   1. Project.task()  TaskContainer
   2. Task.doLast() TaskActions

## init.gradle.kts 修改代理

```gradle
fun RepositoryHandler.enableMirror() {
    all {
        if (this is MavenArtifactRepository) {
            val originalUrl = this.url.toString().removeSuffix("/")
            urlMappings[originalUrl]?.let {
                logger.lifecycle("Repository[$url] is mirrored to $it")
                this.setUrl(it)
            }
        }
    }
}

val urlMappings = mapOf(
    "https://repo.maven.apache.org/maven2" to "https://mirrors.tencent.com/nexus/repository/maven-public/",
    "https://dl.google.com/dl/android/maven2" to "https://mirrors.tencent.com/nexus/repository/maven-public/",
    "https://plugins.gradle.org/m2" to "https://mirrors.tencent.com/nexus/repository/gradle-plugins/"
)

gradle.allprojects {
    buildscript {
        repositories.enableMirror()
    }
    repositories.enableMirror()
}

gradle.beforeSettings { 
    pluginManagement.repositories.enableMirror()
    dependencyResolutionManagement.repositories.enableMirror()
}
```