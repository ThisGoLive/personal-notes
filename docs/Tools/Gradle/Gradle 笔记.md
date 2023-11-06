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

```json
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

## 3 插件

可以理解为 许多 task 的集合

应用插件

```groovy
plugins {
   id 'java'
}

apply plugin: 'java'
```


