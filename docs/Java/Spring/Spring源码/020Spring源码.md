[[TOC]]

# Spring 的大致逻辑

1. Bean的定义信息（如XML） 
2. 抽象定义规范接口解析定义信息（BeanDefintionReader）
3. 加载Bean的定义信息（BeanDefinition）到容器 IOC Container 中
4. BeanFactory Bean 工厂，通过 BeanDefinition 
5. BeanFactoryPostprocessor（后置处理器、增强器）扩展实现
   1. 例如 解析BeanDefinition 中，表达式进行解析，进行设值
6. 反射实例化：
7. 实例化 开辟内存空间
8. 初始化 给属性赋值 （AbstractAutowireCapableBeanFactory#populateBean）
   1. 属性填充 set
9. 执行Aware接口需要的实现方法
   1. Aware 接口存在的意义，方便Spring中的Bean对象获取对应容器中的相关属性值
10. BeanPostprocessor Bean对象的动态代理 （AbstractAutoProxyCreator）
    1. postProcessBeforeInitialization
    2. 执行初始化方法（init-method）
    3. postProcessAfterInitialization （创建代理对象）
11. 完整代理对象
12. Environment接口的系统参数获取
13. spring生命周期不同阶段做不同的处理工作
    1. 观察者模式：监听器 监听事件 多播器

AbstractApplicationContext#refresh

# 循环依赖

DefaultSingletonBeanRegistry 中的三级缓存

实例化和初始化分开处理（set） 提前暴露对象

```java
    /** Cache of singleton objects: bean name to bean instance. */
    // 一级缓存
    private final Map<String, Object> singletonObjects = new ConcurrentHashMap<>(256);

    /** Cache of singleton factories: bean name to ObjectFactory. */
    // 三级缓存
    private final Map<String, ObjectFactory<?>> singletonFactories = new HashMap<>(16);

    /** Cache of early singleton objects: bean name to bean instance. */
    // 二级缓存
    private final Map<String, Object> earlySingletonObjects = new ConcurrentHashMap<>(16);
```

## 为什么要三级缓存？

泛型不同

ObjectFactory是一个函数式接口，这个类的实现通常被作为API提供给其他Bean（通过注入）。

RuntimeBeanReference 运行时Bean引用

```java
    protected Object getSingleton(String beanName, boolean allowEarlyReference) {
        // Quick check for existing instance without full singleton lock
        // 获取一级缓存中
        Object singletonObject = this.singletonObjects.get(beanName);
        // 一级不存在 并且 这个是正在创建中的Bean
        if (singletonObject == null && isSingletonCurrentlyInCreation(beanName)) {
            // 获取二级缓存中
            singletonObject = this.earlySingletonObjects.get(beanName);
            // 二级不存在 并且允许 早期引用
            if (singletonObject == null && allowEarlyReference) {
                synchronized (this.singletonObjects) {
                    // Consistent creation of early reference within full singleton lock
                    // 创建 早期引用
                    singletonObject = this.singletonObjects.get(beanName);
                    if (singletonObject == null) {
                        singletonObject = this.earlySingletonObjects.get(beanName);
                        if (singletonObject == null) {
                            // 一级二级都为空时 调用三级
                            ObjectFactory<?> singletonFactory = this.singletonFactories.get(beanName);
                            if (singletonFactory != null) {
                                singletonObject = singletonFactory.getObject();
                                this.earlySingletonObjects.put(beanName, singletonObject);
                                this.singletonFactories.remove(beanName);
                            }
                        }
                    }
                }
            }
        }
        return singletonObject;
    }
// lambda
    protected Object getEarlyBeanReference(String beanName, RootBeanDefinition mbd, Object bean) {
        Object exposedObject = bean;
        if (!mbd.isSynthetic() && hasInstantiationAwareBeanPostProcessors()) {
            for (BeanPostProcessor bp : getBeanPostProcessors()) {
                if (bp instanceof SmartInstantiationAwareBeanPostProcessor) {
                    SmartInstantiationAwareBeanPostProcessor ibp = (SmartInstantiationAwareBeanPostProcessor) bp;
                    exposedObject = ibp.getEarlyBeanReference(exposedObject, beanName);
                }
            }
        }
        return exposedObject;
    }
```

为什么三级缓存？ 

AbstractAutowireCapableBeanFactory#doCreateBean 可以大致看出流程

BeanWrapper 反射构建bean,

addSingletonFactory(beanName, () -> getEarlyBeanReference(beanName, mbd, bean)); 将该bean 放置到第三级中，当需要获取的时候，执行，逻辑是 获取所有 advisor ，进行代理构建。

当代理构建完成被使用，后放置到第二层缓存中。直到 构建该bean时，填充完属性 放置到 第一层缓存中。

A 对象创建

三级其实 创建工厂，获取lambda半成品的Bean 此时可以被代理，二级 是 存储该类型的实例 获取存放半成品的Bean 实例，一级是存储该类型的实例

B 对象创建

由于A的创建，B已经创建完成，直接取用

在创建代理对象的时候，代理 

# Spring 启动流程
