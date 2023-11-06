[[TOC]]

# Maven 笔记

## 1.目录结构

### bin

启动脚本（window 和 shell）。与 m2.conf (classworlds)

### boot

只有 一个文件（maven 3.3.9中） `plexus-classworlds-2.5.2.jar` 类加载器。一般用不到。

### conf

主要的 就是 `settings.xml`文件，maven 的全局配置。也可以 在 用户名/.m2/  文件下的 settings.xml，配置。

### lib

主要是 包含 maven 运行时需要的依赖 类库。

以及一些 安装 说明，开源协议等。

## 2.POM

### 2.1 编写 pom

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
  	<!-- 当前 使用的model 版本 -->
    <modelVersion>4.0.0</modelVersion>
    <!-- groupId artifactId version 定义项目的基本坐标 -->
  	<groupId>Struts2Base</groupId>
    <!-- artifactId 项目 唯一Id  -->
  	<artifactId>Struts2Base</artifactId>
  	<packaging>war</packaging>
  	<version>0.0.1</version>
  	<name>Struts2Base Maven Webapp</name>
  	<url>http://maven.apache.org</url>
    
  	<properties>
		<spring.version>4.3.18</spring.version>
		<struts2.version>2.5.20</struts2.version>
	</properties>

	<dependencies>
		<dependency>
			<groupId>org.apache.struts</groupId>
			<artifactId>struts2-core</artifactId>
			<version>${struts2.version}</version>
		</dependency>
		<dependency>
			<groupId>junit</groupId>
			<artifactId>junit</artifactId>
			<version>4.11</version>
		</dependency>
	</dependencies>
  	<build>
    	<finalName>Struts2Base</finalName>
  	</build>
</project>

```

### 2.2 基本使用

编译

> mvn clean compile  (编译代码  src/main/java)
>
> clean 清理 target 中的旧文件，compile  编译主代码。 
>
> 以及会执行 resources ： resources  定义项目资源

测试

>mvn clean test

打包

> maven clean package (pom文件中没有定义打包类型，默认打包为 jar)
>
> 与编译 类似。

### 2.3 使用archetype 生成项目骨架

maven 3

>  mvn archetype:generate

### 2.4 m2eclipse

maven build 定义 命令

ecilpse 默认 运行在 jre上，m2需要用jdk.

```ini
-- launcher.XXMaxxPermSize 256m
-vm C:\Program Files\Java\jdk1.8.0_171\bin\javaw.exe
-vmargs
-Dosgi,reguiredJavaVersion=1.5
-Xms128m
-Xmx256m
```

## 3. 坐标与依赖

### 3.1 坐标详解

#### groupId

当前 项目隶属于实际项目。maven项目与实际项目 不是一对一关系。例子：SpringFarmework，子项目 有 spring-core ...

#### artifactId

maven项目唯一 id

#### version

当前版本

#### packaging

打包方式

#### classifier

附属

### 3.2 account-Email

### 3.3 依赖配置

```xml
<project>
    ...
	<dependencies>
    	<groupId></groupId>
        <artifactId></artifactId>
        <type></type>
        <scope></scope>
        <optional></optional>
        <exclusions>
        	<exxclusion></exxclusion>
            ...
        </exclusions>
    </dependencies>
    ...
</project>
```

type： 依赖的类型。默认 为 jar

scope：依赖范围

optional : 标记依赖是否 可选

exclusions : 排除传递性依赖

### 3.4 依赖范围 scope

+ compile 编译依赖范围 （编译 测试 运行 都有效） 例如 spring-core （默认）
+ test 测试依赖范围 例如 Junit
+ provided 以提供依赖范围 （编译 测试 有效）例如 spring - api，测试时需要，运行时，容器已经提供
+ runtime 运行时依赖，（测试 运行 有效）
+ system 系统依赖范围。与系统绑定，本地的，Maven 仓库 之外的类库文件

### 3.5 传递性依赖 optional 

```xml
<project>
    <modelVersion>4.0.0</modelVersion>
  	<groupId>exp</groupId>
  	<artifactId>project 1</artifactId>
  	<packaging>jar</packaging>
  	<version>0.0.1</version>
  
	<dependencies>
		<dependency>
			<groupId>mysql</groupId>
			<artifactId>mysql</artifactId>
			<version>5.1</version>
            <optional>true</optional>
		</dependency>
		<dependency>
			<groupId>postgresql</groupId>
			<artifactId>postgresql</artifactId>
			<version>9.6</version>
            <optional>true</optional>
		</dependency>
	</dependencies>
</project>
```

在项目 依赖 project 1 时，可以选择，而不是 都依赖两个。

### 3.6 依赖排除 exclusions 

```xml
<project>
    <modelVersion>4.0.0</modelVersion>
  	<groupId>exp</groupId>
  	<artifactId>project 1</artifactId>
  	<packaging>jar</packaging>
  	<version>0.0.1</version>
  
	<dependencies>
		<dependency>
			<groupId>exp</groupId>
			<artifactId>project 2</artifactId>
			<version>1.0</version>
            <exclusions >
                <exclusion>
                    <groupId>exp</groupId>
                    <artifactId>project 3</artifactId>
                    <version>1.0</version>
                </exclusion>
            </exclusions >
		</dependency>
		<dependency>
			<groupId>exp</groupId>
            <artifactId>project 3</artifactId>
			<version>1.1/version>
            <optional>true</optional>
		</dependency>
	</dependencies>
</project>
```

项目1 依赖了 项目2，项目2 依赖 3，但是 项目1，选择传递依赖 项目3.而是 自己选择版本 1.1

## 4. 仓库

本地 与 远程。 远程 ： Maven 中央仓库，私服， java.net maven库 Jboss Maven 库。

### 4.1 本地

一般默认在 用户名/.m2/repository 下。可以通过 修改 setting.xml

```xml
<settings>
	<localRepository>D:\AcpcheJar</localRepository> 
</settings>
```

mvn install，项目打包到本地库，

### 4.2 远程库

pom 配置可以多个远程库，

```xml
<project>
	<repositories>
    	<repositry>
        	<id>jboss</id>
            <name>JBoss Repository</name>
            <url></url>
            <releases>
            	<enable>true</enable>
            </releases>
            <snapshots>
            	<enable>false</enable>
                <!-- 默认就是 天-->
                <updatePolicy>daily</updatePolicy>
                <!-- 部署到远程时 校验 默认 warn-->
                <checksumPolicy>ignore</checksumPolicy>
            </snapshots>
            <layout>default</layout>
        </repositry>
    </repositories>
</project>
```

#### 4.2.1 远程库认证

配置setting

```xml
  <servers>
    <server>
      <id>deploymentRepo</id>
      <username>repouser</username>
      <password>repopwd</password>
    </server>
  </servers>
```

#### 4.2.2 部署到远程仓库

pom

```xml
<project>
	<distributionManagement>
        <!-- （稳定）发布版本仓库 -->
        <repository>
        	<id></id>
            <name></name>
            <url>http:192.168.</url>
        </repository>
        <!-- 快照版本仓库 -->
        <snapshotRepository>
        	<id></id>
            <name></name>
            <url>http:192.168.</url>
        </snapshotRepository>
    </distributionManagement>
</project>
```

mvn clean deploy ,部署到远程库。

## 5 生命周期和插件



## profile

Profile能让你为一个特殊的环境自定义一个特殊的构建；profile使得不同环境间构建 的可移植性成为可能

### 常见使用

```xml
    <profiles>
        <profile>
            <id>local</id>
            <properties>
                <profileActive>local</profileActive>
                
            </properties>
            <!-- 激活条件 -->
            <activation>
                <activeByDefault>true</activeByDefault>
            </activation>
        </profile>
</profiles>
```

profiles 下有多个 profile ，代表多个不同环境

其中 id 为 唯一标识

如果 配置 properties 标签，即 键值 配置到 pom 中。

**application.yml 中 只需要 '@profileActive@'  即可引用** 

还可以使用 build 配置

```xml
    <profiles>
        <profile>
            <id>local</id>
            <build>
            	<filters>
                    <!-- 配置 加载的文件 properties路径 -->
                	<filter></filter>
                </filters>
            </build>
            <!-- 激活条件 -->
            <activation>
                <activeByDefault>true</activeByDefault>
            </activation>
        </profile>
</profiles>
```

**application.yml 中 也是直接引用 properties 中的键即可 ${}** 



也可以直接 进行 文件夹配置

```xml
 <profiles>
        <profile>  
            <!-- 开发环境 -->  
            <id>dev</id>  
            <properties>  
                <env>dev</env>
            </properties>  
            <activation>  
                <!-- 默认激活该profile节点-->
                <activeByDefault>true</activeByDefault>  
            </activation> 
            <build>
                <resources>
                    <resource>
                        <directory>src/main/resources/dev</directory>
                    </resource>
                    <resource>
                        <directory>src/main/resources</directory>
                    </resource>
                </resources>
            </build>
        </profile>  
        <profile>  
            <!-- 测试环境 -->  
            <id>test</id>  
            <properties>  
                <env>qa</env>
            </properties>
            <build>
                <resources>
                    <resource>
                        <directory>src/main/resources/test</directory>
                    </resource>
                    <resource>
                        <directory>src/main/resources</directory>
                    </resource>
                </resources>
            </build>
        </profile>    
</profiles>
```



### 激活 profile

**通过ID激活**

激活一个

`mvn clean install -P id`

激活多个 使用 逗号隔开

`mvn clean install -P id1,id2`

**激活特定的 属性 值**

`Mvn clean install -D profileProperty=dev`

profileProperty 为键  dev 为值

构建maven项目 
https://blog.csdn.net/qjyong/article/details/9098213

依赖导出
https://blog.csdn.net/wyljz/article/details/54314221

设置编码集
https://blog.csdn.net/qq_39979373/article/details/78278113
