# Spring 常见问题
### BeanFactory 和 FactoryBean区别

都可以创建对象，不过流程不同

BeanFactory ：根接口，用于访问Bean 对象，必须严格遵守Bean 的生命周期，

FactoryBean：用户可以自定义Bean的创建流程，不需要按照生命周期来创建，接口包含三个方法 isSingleton getObjectType getObject，随意创建对象

### Spring 使用的代理模式
[设计模式](/DesignPatterns/)

单例模式：spring 中的Bean

工程模式：BeanFactory

模板方法：postProcessorBeanFactory onRefresh

观察者模式：listener event multicast

适配器模式：Adapter

装饰器模式：BeanWrapper

责任链模式：使用aop的时候回有一个责任链

代理模式：aop 动态代理

委托模式：delegate

建造者模式：builder

策略模式：xmlbeanDefinitionReader, propertiesBeanDefinitonReader

### applicationContext和BeanFactory区别

BeanFactory是spring 容器的根接口，里面提供某些基本方法的约束与规范。

ApplicationContext实现了该接口并扩展

### AOP底层实现原理
[[Spring Boot Advice 流程|Spring Boot Advice 流程]]

是IOC的一个扩展功能。即扩展点：BeanPostProcessor 后置处理器

AOP 本身是一个扩展功能，所以BeanPostProcessor 的后置处理方法中进行实现

1. 代理对象过程 （**advice**，**切面**，那些方法上 即 **切点**）
2. 通过jdk 或者 cglib 近生成代理对象
3. 在执行方法调用的时候，会调用到生成字节码文件中，直接找到 **动态建议拦截器** **DynamicAdvisedInterceptor** 的 **intercept()** 方法
4. 根据之前定义好的通知，生成拦截器链
5. 从拦截器链中一次获取每一个通知的执行开始，

### Spring 事务如何回滚

即spring事务管理如何实现的

总：spring事务是由aop实现的，首先生成具体代理对象，然后按照AOP的全部流程执行具体的操作逻辑，正常情况下要通过通知 **Advice**来完成核心功能，但是 事务不是通过 通知来实现的。

而是通过 **TransactionInterceptor** 实现的，然后调用 invoke 实现具体的逻辑