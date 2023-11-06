[[TOC]]

# 1 核心组件

Log4j中有三个主要的组件，它们分别是 Logger、Appender和Layout。

#### Log4j

允许开发人员定义多个Logger，每个Logger拥有自己的名字，Logger之间通过名字来表明隶属关系。有一个Logger称为Root，它永远存在，且不能通过名字检索或引用，可以通过Logger.getRootLogger()方法获得，其它Logger通过 Logger.getLogger(String name)方法。

#### Appender

则是用来指明将所有的log信息存放到什么地方，Log4j中支持多种appender，如 console、files、GUI components、NT Event Loggers等，一个Logger可以拥有多个Appender，也就是你既可以将Log信息输出到屏幕，同时存储到一个文件中。

#### Layout

的作用是控制Log信息的输出方式，也就是格式化输出的信息。

Log4j中将要输出的Log信息定义了5种级别，依次为DEBUG、INFO、WARN、ERROR和FATAL，当输出时，只有级别高过配置中规定的级别的信息才能真正的输出，这样就很方便的来配置不同情况下要输出的内容，而不需要更改代码。

# 2 Logger

A：off 最高等级，用于关闭所有日志记录。
B：fatal 指出每个严重的错误事件将会导致应用程序的退出。
**C：error 指出虽然发生错误事件，但仍然不影响系统的继续运行。**
**D：warm 表明会出现潜在的错误情形。**
**E：info 一般和在粗粒度级别上，强调应用程序的运行全程。**
**F：debug 一般用于细粒度级别上，对调试应用程序非常有帮助。**
G：all 最低等级，用于打开所有日志记录。

上面这些级别是定义在org.apache.log4j.Level类中。Log4j只建议使用4个级别，优先级从高到低分别是error,warn,info和debug。通过使用日志级别，可以控制应用程序中相应级别日志信息的输出。例如，如果使用b了info级别，则应用程序中所有低于info级别的日志信息(如debug)将不会被打印出来。

`static Logger logger = Logger.getLogger(test.class); `

# 3 Appender

公共接口Appender，负责控制日志记录操作的输出。



下面是API中提供的输出方式（前五个常见），也可以自己实现Appender接口，创建以自己的方式进行日志输出的Appender：	

| ConsoleAppender          | 使用用户指定的布局(layout)输出日志事件到System.out或者 System.err。默认的目标是System.out |
| ------------------------ | ------------------------------------------------------------ |
| FileAppender             | 把日志事件写入一个文件                                       |
| DailyRollingFileAppender | 扩展FileAppender，因此多个日志文件可以以一个用户选定的频率进行循环日志记录 |
| RollingFileAppender      | 扩展FileAppender，备份容量达到一定大小的日志文件             |
| WriterAppender           | 根据用户的选择把日志事件写入到Writer或者OutputStream         |
| SMTPAppender             | 当特定的日志事件发生时，一般是指发生错误或者重大错误时，发送一封邮件 |
| SocketAppender           | 给远程日志服务器（通常是网络套接字节点）发送日志事件（LoggingEvent）对象 |
| SocketHubAppender        | 给远程日志服务器群组（通常是网络套接字节点）发送日志事件（LoggingEvent）对象 |
| SyslogAppender           | 给远程异步日志记录的后台精灵程序(daemon)发送消息             |
| TelnetAppender           | 一个专用于向只读网络套接字发送消息的log4j appender           |



# 4 Layout

公共抽象类，负责格式化Appender的输出。

Appender必须使用一个与之相关联的 Layout，这样它才能知道怎样格式化它的输出。

常见的三种：

| HTMLLayout    | 格式化日志输出为HTML表格                                     |
| ------------- | ------------------------------------------------------------ |
| PatternLayout | 根据指定的转换模式格式化日志输出，或者如果没有指定任何转换模式，就使用默认的转换模式 |
| SimpleLayout  | 以一种非常简单的方式格式化日志输出，它打印级别 Level，然后跟着一个破折号“-“ ，最后才是日志消息 |

# 5 log4j 配置文件

## 5.1 properties配置文件

### 5.1.1、根 Logger

log4j.rootLogger = level

level  优先级，ALL < DEBUG < INFO < WARN < ERROR < FATAL < OFF 

### 5.1.2、某个包或类的 Logger

log4j.logger.xxx.xxx.xxx=level

例如：`log4j.logger.com.guol.tools=level`,也可以是具体的类

```java
/*全局的 都遵守 a D E 有点类似变量，
	分别对应下面 log4j.appender.*。只要满足 就会执行相关的
	log4j.appender.D.Threshold 就是这个级别 及 以上的满足
*/
log4j.rootLogger = level,a,D,E
// 创建 这个包/类 下 单独 logger
log4j.logger.com.guol.tools = debug,a,E
//不受 tootlogger 的 管理  默认是true 意思 这个包下面 不会去执行全局的
log4j.additivity.com.guol.tools=false

log4j.appender.a = org.apache.log4j.ConsoleAppender
log4j.appender.a.Target = System.out
log4j.appender.a.layout = org.apache.log4j.PatternLayout
log4j.appender.a.layout.ConversionPattern = [%-5p] %d{yyyy-MM-dd HH:mm:ss,SSS} method:%l%n%m%n

log4j.appender.D = org.apache.log4j.DailyRollingFileAppender
log4j.appender.D.File = D://logs.log
log4j.appender.D.Append = true
log4j.appender.D.Threshold = info 
log4j.appender.D.layout = org.apache.log4j.PatternLayout
log4j.appender.D.layout.ConversionPattern = %-d{yyyy-MM-dd HH:mm:ss}  [ %t:%r ] - [ %p ]  %m%n

log4j.appender.E = org.apache.log4j.DailyRollingFileAppender
log4j.appender.E.File =D://logg.log 
log4j.appender.E.Append = true
log4j.appender.E.Threshold = ERROR 
log4j.appender.E.layout = org.apache.log4j.PatternLayout
log4j.appender.E.layout.ConversionPattern = %-d{yyyy-MM-dd HH:mm:ss}  [ %t:%r ] - [ %p ]  %m%n
```

### 5.1.3、日志输出地址 Appender

log4j.appender.appenderName = 

+ org.apache.log4j.ConsoleAppender（控制台）
+ org.apache.log4j.FileAppender（文件）
+ org.apache.log4j.DailyRollingFileAppender（每天产生一个日志文件）
+ org.apache.log4j.RollingFileAppender（文件大小到达指定尺寸的时候产生一个新的文件）
+ org.apache.log4j.WriterAppender（将日志信息以流格式发送到任意指定的地方）

### 5.1.4、日志输出格式 Layout

log4j.appender.E.layout = 

org.apache.log4j.HTMLLayout（以HTML表格形式布局）
org.apache.log4j.PatternLayout（可以灵活地指定布局模式）
org.apache.log4j.SimpleLayout（包含日志信息的级别和信息字符串）
org.apache.log4j.TTCCLayout（包含日志产生的时间、线程、类别等等信息）

```
log4j.appender.E.layout.ConversionPattern = %-d{yyyy-MM-dd HH:mm:ss}  [ %t:%r ] - [ %p ]  %m%n
```

%m   输出代码中指定的消息
%p   输出优先级，即DEBUG，INFO，WARN，ERROR，FATAL
%r   输出自应用启动到输出该log信息耗费的毫秒数
%c   输出所属的类目，通常就是所在类的全名
%t   输出产生该日志事件的线程名
%n   输出一个回车换行符，Windows平台为“/r/n”，Unix平台为“/n”
%d   输出日志时间点的日期或时间。默认格式为ISO8601，也可以在其后指定格式。比如：%d{yyy MMM dd HH:mm:ss , SSS}，输出类似：2002年10月18日 22:10:28, 921
%l   输出日志事件的发生位置，包括类目名、发生的线程，以及在代码中的行数

## 5.2 xml 配置

```xml
<?xml version="1.0" encoding="UTF-8"?>  
<!DOCTYPE log4j:configuration SYSTEM "log4j.dtd">    
<log4j:configuration xmlns:log4j="http://jakarta.apache.org/log4j/">    
    <appender name="appender1"  
        class="org.apache.log4j.RollingFileAppender">  
        <param name="File" value="logfile08.html" />  
        <param name="MaxFileSize" value="1MB" />  
        <param name="MaxBackupIndex" value="5" />  
        <layout class="org.apache.log4j.HTMLLayout">  
        </layout>  
    </appender>    
    
    <appender name="DEMO" class="com.XXXXX.RollingFileAppender">
        <param name="file" value="${loggingRoot}/xxx.log" />
        <param name="append" value="true" />
        <param name="encoding" value="utf-8" />
        <param name="threshold" value="info" />
        <param name="MaxFileSize" value="50MB" />
        <param name="MaxBackupIndex" value="10" />
    	<layout class="org.apache.log4j.PatternLayout">
    	<param name="ConversionPattern" value="%d [%X{requestURIWithQueryString}] %-5p %c{2} - %m%n" />
    	</layout>
	</appender>
    
    <!-- 自定义logger 不受 root管理 --> 
    <logger name="XXXX.XXXX.XXXX" additivity="false">
        <level value="${loggingLevel}" />
        <!-- 配置对应的显示策略 --> 
        <appender-ref ref="DEMO" />
    </logger>
    <!-- 配置默认root logger的策略  --> 
    <root>  
        <level value="debug" />  
        <appender-ref ref="appender1" />  
        <appender-ref ref="DEMO" />  
    </root>  
</log4j:configuration>
```

之前例子：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE log4j:configuration SYSTEM "log4j.dtd" >
<log4j:configuration>
	<!-- 控制台输出 appender appender名字STDOUT -->
	<appender name="STDOUT" class="org.apache.log4j.ConsoleAppender">
		<layout class="org.apache.log4j.PatternLayout">
			<!-- %c代表哪个类，%d代表哪一天，%p代表日志级别，%m代表日志信息，%n代表换行 -->
			<param name="conversionPattern" value="%c %d{yyyy-MM-dd hh:mm:ss} %p %m%n" />
		</layout>
       	<!-- 级别 -->
		<filter class="org.apache.log4j.varia.LevelRangeFilter">
			<param name="levelMin" value="STDOUT" />
			<param name="levelMax" value="STDOUT" />
		</filter>
	</appender>
    
	<!-- 文件输出 appender appender名字 DUBUG -->
	<appender name="DEBUG" class="org.apache.log4j.RollingFileAppender">
		<param name="file" value="${NetCTOSS.root}logs/debug.log"/>
		<!-- maxFileSize:可以配置数值 + "单位"的方式，来完成对文件大小控制，单位，例如：KB，MB -->
		<param name="maxFileSize" value="20MB"/>
		<param name="maxBackupIndex" value="10"/>
		<param name="append" value="true"/>
		<layout class="org.apache.log4j.PatternLayout">
			<!-- %c代表哪个类，%d代表哪一天，%p代表日志级别，%m代表日志信息，%n代表换行 -->
			<param name="conversionPattern" value="%c %d{yyyy-MM-dd hh:mm:ss} %p %m%n" />
		</layout>
		<filter class="org.apache.log4j.varia.LevelRangeFilter">
			<param name="levelMin" value="DUBUG" />
			<param name="levelMax" value="DUBUG" />
		</filter>
	</appender>
	
	<root>
		<!-- 开发或调试阶段，使用DEBUG，上线阶段，需要修改成INFO -->
		<priority value="INFO"></priority>
		<appender-ref ref="STDOUT"/>
		<appender-ref ref="DEBUG"/>
		<appender-ref ref="INFO"/>
		<appender-ref ref="WARN"/>
		<appender-ref ref="ERROR"/>
	</root>
</log4j:configuration>
```

[log4j 基本使用：](https://www.cnblogs.com/deng-cc/p/6739419.html)

[按日志文件大小、日期切分日志文件](https://blog.csdn.net/daybreak1209/article/details/54020497/)

[详细](https://www.cnblogs.com/drizzlewithwind/p/6041229.html)