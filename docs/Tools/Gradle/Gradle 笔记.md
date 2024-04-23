[[TOC]]

# Gradle

不再使用 xml

结构灵活，兼容 多个 

扩展方便

## 1.初试Gradle

build.gradle 脚本。当前运行的目录下，默认有个。

```groovy
task sayHello{
    doLast { println 'hello world'}
}
task sayAnt <<{
    ant.echo(emssage : "123")
}
3.times{
    task "testTask$it" <<{
        println '123'
    }
}
testTask1.dependsOn sayHello
testTask0.dependsOn testTask1,testTask2
task groupTask(dependsOn : testTask0)
```

```shell
// 查看 全部 task
gradle task --all 
// 执行 task
gradle task名称
```

<< 就是指 doLast

## 2 学习构建

### 2.1 包位置

默认情况为 **Users\(用户名)\.gradle\caches\modules-2\files-2.1**

自定义的话 添加环境变量

**GRADLE_USER_HOME** 对应 的文件路径 **E:\GradleStorage**

### 2.2 数据源

USER_HOME/.gradle/init.gradle

```groovy
allprojects {
    repositories {
        def REPOSITORY_URL = 'http://maven.aliyun.com/nexus/content/groups/public/'
        all { ArtifactRepository repo ->
            if (repo instanceof MavenArtifactRepository && repo.url != null) {
                def url = repo.url.toString()
                if (url.startsWith('https://repo1.maven.org/maven2') || url.startsWith('https://jcenter.bintray.com/')) {
                    project.logger.lifecycle "Repository ${repo.url} replaced by $REPOSITORY_URL."
                    remove repo
                }
            }
        }
        maven {
            url REPOSITORY_URL
        }
    }
}
```

init.gradle.kts
<https://gist.github.com/bennyhuo/af7c43cc4831661193605e124f539942>

```kts
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

<https://gist.github.com/Jacknic/61b2b576f66993149cc57c504c7ed609>

<<< ./init.gradle.kts

## 3 插件

可以理解为 许多 task 的集合

应用插件

```groovy
plugins {
   id 'java'
}

apply plugin: 'java'
```


