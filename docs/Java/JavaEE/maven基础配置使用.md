#  构建工具  maven
2018/2/1 星期四 下午 9:59:33 

原版：项目中的文件混乱，导包复杂，

1. 1
2. 将java编译成java代码，加载到
### settings.xml操作 ###
217行
```xml
	<profile>  
		<id>jdk-1.8</id>  
		<activation>  
			<activeByDefault>true</activeByDefault>  
			<jdk>1.8</jdk>  
		</activation>  
		<properties>  
			<maven.compiler.source>1.8</maven.compiler.source>  
			<maven.compiler.target>1.8</maven.compiler.target>  
			<maven.compiler.compilerVersion>1.8</maven.compiler.compilerVersion>  
		</properties>  
	</profile>   
```
#### 建立maven 本地仓库 （即先会到这里来找）
```xml
	<localRepository>d:/mavenpage/repositorys</localRepository>
```
#### 建立远程仓库
```xml
	 <mirror>
	  <id>alimaven</id>
	  <name>aliyun maven</name>
	  <MirrorOF>central</MirrorOF>
	  <url>http://maven.aliyun.com/nexus/content/groups/public</url>
	</mirror>
```
Group Id : 一般是包名的前两层
Artifact Id ： 项目名
verSion ： 初始版本号

### pom.xml操作 ###
```xml
	<properties>
	<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
	<jdbc.version>5.1.38</jdbc.version>
 	</properties>
```
	下面就直接调用 ${jdbc.version}
	
导入，架包 mvnrepository.com  加到pom.xml的\<dependencies>内

关联的包会自动管理下载


设置jdk版本  在dependencies下
```xml
	<build>
	  	<finalName>mybatis</finalName>
	  	<plugins>
		  	<plugin>
			 <groupId>org.apache.maven.plugins</groupId>
			  <artifactId>maven-compiler-plugin</artifactId>
			  <version>3.5.1</version>
			  <configuration>
			   <source>1.8</source>
			   <target>1.8</target>
			   <encoding>UTF8</encoding>
			  </configuration>
			</plugin>	
		</plugins>
	 </build>
```

