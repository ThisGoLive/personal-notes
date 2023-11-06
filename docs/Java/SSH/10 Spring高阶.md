[[TOC]]

# 第十章 ： Spring 高级

线程池、 任务调度

# 10.1 Spring 线程池

服务器程序，经常需要处理大量短小的任务，并且处理单个任务时间比较短，但任务数量巨大。为了不阻塞后续任务，为每个任务都开一个线程处理，为简单的解决方案。如果线程多了，资源浪费。

### 10.1.1 线程池概述

池化是一种将资源统一管理，为需要资源的任务自动调度分配资源，以提高性能并实现资源重用的技术。

### 10.1.2 Java SE 线程池

Java 1.5 开始有并发库 `java.util.concurrent`

| 接口 类 名                 | 描述                                                        |
| -------------------------- | ----------------------------------------------------------- |
| ExecutorService            | 线程池接口                                                  |
| ThreadPoolExecutor         | 线程池接口的默认实现                                        |
| ScheduledExecutorService   | 可实现任务调度的线程池接口，为ExecutorService的子接口       |
| SheduledThreadPoolExecutor | 可实现任务调度的线程池，实现了 SheduledExecutorService 接口 |
| Executors                  | 线程池的静态工厂类                                          |

ExecutorService 接口表示一个线程池，主要方法：

+ Future<?> submit(Runnable task)   提交一个任务到线程池
+ void shutdown（）  关闭线程池

可以 通过 构造直接 创建 ThreadPoolExecutor 线程实例，但一般使用 Executors 线程工厂创建线程池。

**Executor 概述**

| 方法                                     | 描述                                                         |
| ---------------------------------------- | ------------------------------------------------------------ |
| newSingleThreadExecutor()                | 创建一个单线程的线程池。该线程池只有一个线程在工作，即单线程 串行 化完成所有任务。如果这个唯一的线程因为异常结束，则会自动创建 一个新的线程接替它。此线程 保证 所有的任务 执行顺序安装任务的提交顺序执行 |
| newFixedThreadPool(int nThreads)         | 根据 nThreads 值，创建 对应个数大小的线程池。每次提交一个任务就创建一个线程，直到达到线程池的最大。线程池的大小一旦到达最大就保持不变。如果有新任务，则会等待。异常时，创建一个新的线程替代 |
| newCachedThreadPool()                    | 创建一个可以环存的线程池。如果线程池的大小超出处理任务所需要的线程，那么就会被回收部分（超过 60 秒不执行任务）的线程，当任务增加时，此线程池有可以智能地添加新线程来处理任务。线程池的大小不会被限制，取决于平台 |
| newSingleThreadSheduledExecutor()        | 创建单线程的线程池，支持任务调度，可以在指定的延迟或者周期性执行线程任务。 |
| newScheduledThreadPool(int corePoolSize) | 创建 corePoolSize 参数指定大小的线程池，支持任务调度，可以在指定延迟后 或者 周期性执行线程任务，任务执行完毕后即使线程是空闲，也会被保存到线程池内 |

### 10.1.3 Spring 线程池

Spring 框架主要 是 `TaskExecutor` 接口实现。实际 就是 Executor 接口一样。

Spring 根据 TaskExecutor 不同实现，任务会以 同步 或者异步的方式进行。

**同步**， 调用者 会一直处于阻塞状态，直到任务被完成，此时 调用者同目标任务的执行处于统一线程中，因此上下文信息能够传播到目标任务的执行过程中。

**异步** 则一但提交完任务，调用者即可返回，并继续进行自身的操作，此时 两者处在不同的线程中，上下文信息不能共用。

**TaskExecutor**  常用实现类

| 实现类                       | 描述                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| SyncTaskExecutor             | 用于同步执行任务，每次调用都在发起调用线程中执行，主要用于不需要多线程的场景 |
| SimpleAsyncTaskExecutor      | 不会使用线程池，没吃执行任务都会启动一个新的线程，但支持设定并发数的最大值，当超过线程并发数时，会阻塞新的调用，直到有位置被释放 |
| ThreadPoolTaskExecutor       | 实际 就是 对 ThreadPoolExecutor 的封装，将参数封装为bean，以运行 IOC 注入 |
| SimpleThreadPoolTaskExecutor | Quartz 的 SimpleThreadPool 的子类，它会监听Spring的生命周期回调。 |

`ThreadPoolTaskExecutor` 常用配置：

+ corePoolSize    核心线程数，即线程池 维护的最小 线程数， 默认值 1
+ maxPoolSize  最大线程数 默认值 Integer.MAX_VALUE
+ queueCapacity   缓冲队列的最大长度，当任务 超过 maxPoolSize  时，任务被放进 缓冲队列
+ keepAliveSeconds  线程保存活动时间（毫秒），超过这个时间，将关闭 大于 corePoolSize   的线程
+ rejectedExecutionHandler   新任务被线程池拒绝后的具体操作
  1. ThreadPoolExecutor.AbortPolicy   抛出异常 默认
  2. ThreadPoolExecutor.CallerRunsPolicy   线程调用运行该任务的execute 本身，
  3. ThreadPoolExecutor.DiscardPolicy   删除 不能执行的任务
  4. ThreadPoolExecutor.DiscardOldestPolicy   如果执行尚未关闭，则位于工作队列头部任务被删除，然后重试执行程序

```xml
<bean id="executor" class="org.springframewrek.scheduling.concurrent.ThreadPoolTaskExecutor">
	<property name="corePoolSize" value="10"></property>
    <property name="keepAliveSeconds" value="6000"></property>
</bean>
```

## 10.2 任务调度

任务调度是指定时执行狗哥任务的能力，可以在指定时间执行，也可以 周期性执行。

Java 1.3  的 `java.util.Timer`  提供了基本任务调度能力，实际上 `SchediledThreadPoolExecutor` 完全可以体代 `Timer`

以及 实现开源框架 `Quartz` ， Spring 也集成了

### 10.2.1 SchediledExecutorService

Timer 是有缺陷的，调度基于绝对时间，系统时间改变会有印象，异常时也有

Java 并发库 提供的 `SchediledExecutorService` 与其实现 `SchediledThreadPoolExecutor` 

**SchediledExecutorService**  接口方法：

+ ScheduledFuture<?>  schedule (Runnable task, long delay, TimeUnit unit)  在延时 delay 后执行 task 任务，unit 为 时间单位
+ < V >  ScheduledFuture< V > scheule(Callable< V >  callable, long delay, long preiod , TimeUnit unit)     以固定频率 执行 任务，在 延迟 delay 后 以 preiod  周期 执行任务
+ ScheduledFuture<?> scheduleWithFixedDelay (Runnable task, long initDelay,long delay, TimeUnit unit)  延迟 initDelay 后 执行任务，完成后 延迟 delay 执行任务。

### 10.2.2 Spring 集成 Quartz

使用 SchediledExecutorService 可以简单的完成任务调度，复杂时 就 比较麻烦。就可以使用 **Quartz** 

Quartz 使用的UNIX cron 表达式表示 任务时间，

Quartz 的 cron 表达式：

| 名称 | 是否必要 | 允许值               | 特殊符号        |
| ---- | -------- | -------------------- | --------------- |
| 秒   | 是       | 0-59                 | , - * /         |
| 分   | 是       | 0-59                 | , - * /         |
| 时   | 是       | 0-23                 | , - * /         |
| 日   | 是       | 1-31                 | , - * ? / L W C |
| 月   | 是       | 1-12 或者 JAN 到 DEC | , - * /         |
| 周   | 是       | 1-7 或者 SUN 到 SAT  | , - * ? / L C # |
| 年   | 否       | 1970-2099            | , - * /         |

特殊符号意义：

| 符号 | 意义                                                         |
| ---- | ------------------------------------------------------------ |
| ,    | 指定 列表                                                    |
| -    | 指定范围                                                     |
| *    | 用于指定 该域 上 允许的任何值                                |
| /    | 表示 时间 递增                                               |
| ?    | 只能用于 周 日 表示 对值 不做任何的限制，？ 只能出现一次，即 周 日 只能用一个 |
| L    | 之能用于 周 日 表示 该域上 允许的最后一个值                  |
| W    | 只能用于日 表示最近的工作日                                  |
| C    | 指 和 calendar 联系后计算过的值                              |
| #    | 只能用于周，表示 当月 的第几周                               |

Spring 使用 Quratz 需要三个东西：

**1 表达式配置**

`org.springframework.scheduling.quartz.CronTriggerFactoryBean` 

```xml
    <bean id="cronTriggerday" class="org.springframework.scheduling.quartz.CronTriggerFactoryBean">
        <!-- 指定Trigger的名称 -->
        <property name="name" value="day_trigger"/>
        <!-- 指定Trigger的名称 -->
        <property name="group" value="day_trigger_group"/>
        <!-- 上面不是必须 -->
        
        <!-- 指定Tirgger绑定的Job -->
        <property name="jobDetail" ref="dayJob"/>
        <!-- 指定Cron 的表达式 ，每天晚上运行 59 59 23 ? * *-->
        <property name="cronExpression" value="0 0/1 * * * ?" />
    </bean>
```

**2 调度工厂**

`org.springframework.scheduling.quartz.SchedulerFactoryBean`

```xml
    <bean id="scheduler" class="org.springframework.scheduling.quartz.SchedulerFactoryBean">
         
       <property name="triggers">
            <list>
                <!-- <ref bean="simpleTrigger"/> -->
                <ref bean="cronTriggerday"/>
            </list>
       </property>
         <!-- 所有Scheduler 延迟5s 启动 -->
       <property name="startupDelay" value="5"/>
        <!-- 可以不必重写，重写 是为了 将 SchedulerFactoryBean 默认创建的 JobFactory  写入到 Spring的对象池中 -->
       <property name="jobFactory">
            <bean class="com.alibaba.NetCTOSS.quartz.JobFactory" />
        </property>
    </bean>
```

**3 任务**

直接调度任务类的方法，由 框架 创建实例进行代理，此时 cron 表达式 绑定的 jobDetail 也就为 该工厂实力

```xml
<bean id="task" class="自定义任务的类"></bean>

<!-- 调度任务工厂实例 -->
<bean id ="job" class="org.springframework.scheduling.quartz.MethodInvokingJobDetailFactoryBean">
    <!-- 代理的类 -->
	<properties name="targetObject">
    	<ref bean="task"></ref>
    </properties>
    <!-- 代理的类的任务方法 -->
    <propereties name="targetMethod">
    	<value>xxx</value>
    </propereties>
</bean>
```

不适用 工厂，而是 实现 Quartz 框架的 Job 接口

```xml
    <bean name="dayJob" class="org.springframework.scheduling.quartz.JobDetailFactoryBean">
        <!-- 指定job的名称 -->
        <property name="name" value="day_job"/>
        <!-- 指定job的分组 -->
        <property name="group" value="day_group"/>
        <!-- 指定具体的job类  即自定义 实现的 Job类 -->
        <property name="jobClass" value="xxx"/>
        <!-- 必须设置为true，如果为false，当没有活动的触发器与之关联时会在调度器中会删除该任务  -->
        <property name="durability" value="true"/>
        <!-- 指定spring容器的key，如果不设定在job中的jobmap中是获取不到spring容器的 -->
        <property name="applicationContextJobDataKey" value="applicationContext"/>
    </bean>
```

### 10.2.3 Spring 的 任务调度框架

Spring 3.0 开始 就实现了一个 可用性非常高的任务调度框架，能够 替代 Quartz ，并且无需 引入 Quartz。

Spring 配置 文件 需要引入 命名空间 ： `xmlns:task="www.springframework,org/schema/task"`

```xml
<bean id ="task" class="xxx"></bean>

<!-- 调度器 -->
<task:scheduler id="sch" pool-size="10"></task:scheduler>

<!-- 调度任务 -->
<task:scheduled-tasks cheduler="sch">
	<tasl:scheduleded ref="task" mthod="xxx" cron="xxx"></tasl:scheduleded>
</task:scheduled-tasks>

```

