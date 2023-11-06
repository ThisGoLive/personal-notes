[[TOC]]

# 第七章 AOP

Spring 2.0 引入了 @AspectJ 注解 对POJO 进行标注。Spring即增强在横切面的处理能力。

## 7.1 动态AOP使用实例

测试bean

```java
public class TestBean {

	public void doing() {
		System.out.println("我是TestBean");
	}
}
```

Adcisor 执行类；对注解的执行

```java
@Aspect
public class AspectTest {

	// 所有包中 所有类中的doing名 的方法都会 被
	@Pointcut("execution(* *.doing(..))")
	public void master() {}
	
	@Before("master()")
	public void beforeTest() {
		System.out.println("执行所有的doing方法前执行Before");
	}
	@After("master()")
	public void afterTest() {
		System.out.println("执行所有的doing方法后执行after");
	}
	// Around 注解 会代理 doing 方法执行
	@Around("master()")
	public Object aroundTest(ProceedingJoinPoint pjp) throws Throwable {
		System.out.println("around开始代理 doing执行");
		Object  o = pjp.proceed();
		System.out.println("around代理 doing执行完成");
		return o;
	}
}
// 输出 
// around开始代理 doing执行
// 执行所有的doing方法前执行Before
// 我是TestBean
// around代理 doing执行完成
// 执行所有的doing方法后执行after

```

配置文件

```xml
	<!-- 开启切面支持 -->
	<aop:aspectj-autoproxy></aop:aspectj-autoproxy>
	<bean id="bean" class="SpringCode7.SpringCode7.TestBean"></bean>				
	<bean class="SpringCode7.SpringCode7.AspectTest"></bean>
```

## 7.2 动态AOP 自定义标签

[spring 自定义注解支持](https://www.cnblogs.com/zhuxiansheng/p/7805552.html)

### 自定义 注解

注解类

```java
@Retention(RetentionPolicy.RUNTIME) // 注解会在class字节码文件中存在，在运行时可以通过反射获取到  
@Target({ElementType.FIELD,ElementType.METHOD})//定义注解的作用目标**作用范围字段、枚举的常量/方法  
@Documented//说明该注解将被包含在javadoc中
@Inherited
public @interface MyAnnotation {

	String name() default "无名"; 
	
	String doing() default "做梦";
}

public class TestBean {

	@MyAnnotation(name = "TestBean",doing = "doing")
	public void doing() {
		System.out.println("我是TestBean");
	}
}
```

切面处理类

```java
@Aspect
public class DIYAnnotationAspect {

	@Pointcut(value = "execution(* SpringCode7.SpringCode7.TestBean.*(..))")
	public void master() {}
	
	// 必须是 TestBean的方法 并且时 有 MyAnnotation 注解的方法 
	@AfterReturning(pointcut="master()&&@annotation(myLog)",returning="ret")
	public void afterReturningAdvice(JoinPoint jp,MyAnnotation myLog, Object ret) {
		
		System.out.println(myLog.name() + "做了" + myLog.doing());
	}
}
```

配置

```xml
<!-- 开启切面支持 -->
	<aop:aspectj-autoproxy></aop:aspectj-autoproxy>
	<bean id="bean" class="SpringCode7.SpringCode7.TestBean"></bean>				
	<!-- <bean class="SpringCode7.SpringCode7.AspectTest"></bean> -->				
	<bean class="SpringCode7.SpringCode7.diyAnnotation.DIYAnnotationAspect"></bean>		
```

得到结果：

**我是TestBean**
**TestBean做了doing**

### 7.2.1 注册 对应的解析器

AopNamespaceHandler类 中 init 就是对应的注册方法。

```java
	@Override
	public void init() {
		// In 2.0 XSD as well as in 2.1 XSD.
		registerBeanDefinitionParser("config", new ConfigBeanDefinitionParser());
        // 遇到 Aspect-autoproxy 标签 就会执行 AspectJAutoProxyBeanDefinitionParser 注册AOP解析器
		registerBeanDefinitionParser("aspectj-autoproxy", new AspectJAutoProxyBeanDefinitionParser());
		registerBeanDefinitionDecorator("scoped-proxy", new ScopedProxyBeanDefinitionDecorator());

		// Only in 2.0 XSD: moved to context namespace as of 2.1
		registerBeanDefinitionParser("spring-configured", new SpringConfiguredBeanDefinitionParser());
	}
```

AspectJAutoProxyBeanDefinitionParser 是 实现 BeanDefinitionParser 接口的，而这个 接口中只有唯一的一个方法：`BeanDefinition parse(Element element, ParserContext parserContext);`；并且 所有的  解析器 都是从 parse 方法进入的。

所以自己看 AspectJAutoProxyBeanDefinitionParser  实现的 parse 方法：

```java
@Override
public BeanDefinition parse(Element element, ParserContext parserContext) {

 //注册 AnnotationAutoProxyCreator
       AopNamespaceUtils.registerAspectJAnnotationAutoProxyCreatorIfNecessary(parserContext, element);
    // 对注解中的子类 处理
		extendBeanDefinition(element, parserContext);
		return null;
	}
```



```java
	public static void registerAspectJAnnotationAutoProxyCreatorIfNecessary(
			ParserContext parserContext, Element sourceElement) {

        // 注册 升级 AutoProxyCreator 定义 beanName 为 BeanDefinition
		BeanDefinition beanDefinition = AopConfigUtils.
            registerAspectJAnnotationAutoProxyCreatorIfNecessary
            (parserContext.getRegistry(), parserContext.extractSource(sourceElement));
        // 对 proxy-target-class 和 expose-proxy
		useClassProxyingIfNecessary(parserContext.getRegistry(), sourceElement);
        // 注册组件并通知 监听器做进一步处理
        // 此时 beanDefinition 的类名 是AnnotationAutoProxyCreator
		registerComponentIfNecessary(beanDefinition, parserContext);
	}
```

#### 7.2.1.1 注册 升级 AnnotationAwareAspectJAutoProxyCreator

对于 AOP的实现 基本都是靠 AnnotationAwareAspectJAutoProxyCreator 类完成的。可以用 `@Point`注解定义切点，也可以自定义 注解来是实现。这里就是注册 该类的过程。

```java
	public static BeanDefinition registerAspectJAnnotationAutoProxyCreatorIfNecessary(BeanDefinitionRegistry registry, Object source) {
		return registerOrEscalateApcAsRequired(AnnotationAwareAspectJAutoProxyCreator.class, registry, source);
	}
// 调用
	private static BeanDefinition registerOrEscalateApcAsRequired(Class<?> cls, BeanDefinitionRegistry registry, Object source) {
		Assert.notNull(registry, "BeanDefinitionRegistry must not be null");
        // 如果 已经存在 自动代理创建器 并且 自动代理创建器 与现在的不一致 那么就需要判断优先级 来使用哪一个。
		if (registry.containsBeanDefinition(AUTO_PROXY_CREATOR_BEAN_NAME)) {
			BeanDefinition apcDefinition = 
                			registry.getBeanDefinition(AUTO_PROXY_CREATOR_BEAN_NAME);
            
			if (!cls.getName().equals(apcDefinition.getBeanClassName())) {
				int currentPriority = 
                    			findPriorityForClass(apcDefinition.getBeanClassName());
				int requiredPriority = findPriorityForClass(cls);
                // 改变bean 主要的就是 改变 bean 所对应的classname属性
				if (currentPriority < requiredPriority) {
					apcDefinition.setBeanClassName(cls.getName());
				}
			}
            // 如果已经存在 并且 与 要创建的 一致  就不需要 再创建类
			return null;
		}
		RootBeanDefinition beanDefinition = new RootBeanDefinition(cls);
		beanDefinition.setSource(source);
		beanDefinition.getPropertyValues().add("order", Ordered.HIGHEST_PRECEDENCE);
		beanDefinition.setRole(BeanDefinition.ROLE_INFRASTRUCTURE);
		registry.registerBeanDefinition(AUTO_PROXY_CREATOR_BEAN_NAME, beanDefinition);
		return beanDefinition;
	}
```

上面 就是 实现 自动注册 AnnotationAwareAspectJAutoProxyCreator 类的逻辑。并且在多个时 会判断 执行顺序。

#### 7.2.1.2 处理  proxy-target-class 和 expose-proxy属性

useClassProxyingIfNecessary 就是对以上两个属性的处理。

```java
	private static void useClassProxyingIfNecessary(BeanDefinitionRegistry registry, Element sourceElement) {
		if (sourceElement != null) {
            // 判断 proxy-target-class 属性
			boolean proxyTargetClass = Boolean.parseBoolean(sourceElement.getAttribute(PROXY_TARGET_CLASS_ATTRIBUTE));
			if (proxyTargetClass) {
				AopConfigUtils.forceAutoProxyCreatorToUseClassProxying(registry);
			}
            // expose-proxy 属性
			boolean exposeProxy = Boolean.parseBoolean(sourceElement.getAttribute(EXPOSE_PROXY_ATTRIBUTE));
			if (exposeProxy) {
				AopConfigUtils.forceAutoProxyCreatorToExposeProxy(registry);
			}
		}
	}

// AopConfigUtils类
	public static void forceAutoProxyCreatorToUseClassProxying(BeanDefinitionRegistry registry) {
		if (registry.containsBeanDefinition(AUTO_PROXY_CREATOR_BEAN_NAME)) {
			BeanDefinition definition = registry.getBeanDefinition(AUTO_PROXY_CREATOR_BEAN_NAME);
			definition.getPropertyValues().add("proxyTargetClass", Boolean.TRUE);
		}
	}
	public static void forceAutoProxyCreatorToExposeProxy(BeanDefinitionRegistry registry) {
		if (registry.containsBeanDefinition(AUTO_PROXY_CREATOR_BEAN_NAME)) {
			BeanDefinition definition = registry.getBeanDefinition(AUTO_PROXY_CREATOR_BEAN_NAME);
			definition.getPropertyValues().add("exposeProxy", Boolean.TRUE);
		}
	}
```

**proxy-target-class**：代理目标类

Spring AOP 使用 JDK 或者 CGLIB 动态代理。一般都是 JDK 。在 被代理 的对象 没有 实现任何接口，则会使用 CGLIB 代理。

JDK 本身有动态代理，如果强制 使用CGLIB 则需要 `<aop:config proxy-target-class="true">..</>`，并且还有注意一些问题。1. 无法通知（advise）final 方法 无法重写 2. 需要将CGBIL 的二进制包放在 classpath下

需要CGLIB 代理 和 @AspectJ 自动代理支持 需要： ``<aop:aspectj-autoproxy proxy-target-class="true" />`

**JDK 动态代理：**其代理的对象 必须是 某个接口的实现，它是通过 在运行期间创建一个 接口的实现类 来完成对目标对象的代理。

**CGBIL代理：**类似，它是在运行期间创建一个目标的子类。性能高。

**expose-proxy ： ** 暴露代理  切面增强



## 7.3 创建AOP 代理 `AnnotationAwareAspectJAutoProxyCreator ` ##

AnnotationAwareAspectJAutoProxyCreator 类中做了什么，完成AOP 操作？



AnnotationAwareAspectJAutoProxyCreator 的父类 AbstractAutoProxyCreator

```java
	@Override
	public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
		if (bean != null) {
			Object cacheKey = getCacheKey(bean.getClass(), beanName);
			if (!this.earlyProxyReferences.contains(cacheKey)) {
                // 如果 目标可以被代理 则封装指定bean
				return wrapIfNecessary(bean, beanName, cacheKey);
			}
		}
		return bean;
	}

	protected Object wrapIfNecessary(Object bean, String beanName, Object cacheKey) {
		// 如果已经处理过
        if (beanName != null && this.targetSourcedBeans.contains(beanName)) {
			return bean;
		}
        // 如果无需增强
		if (Boolean.FALSE.equals(this.advisedBeans.get(cacheKey))) {
			return bean;
		}
        // 给定的bean 是否是 基础设施类，或者配置类 不需要 自动代理
		if (isInfrastructureClass(bean.getClass()) || shouldSkip(bean.getClass(), beanName)) {
			this.advisedBeans.put(cacheKey, Boolean.FALSE);
			return bean;
		}

		// Create proxy if we have advice.
        // 7.3.1 2 存在 增强方法 则 创建代理
		Object[] specificInterceptors = getAdvicesAndAdvisorsForBean(bean.getClass(), beanName, null);
        // 如果 获取到了 增强方法 要针对 增强方法 创建代理
		if (specificInterceptors != DO_NOT_PROXY) {
			this.advisedBeans.put(cacheKey, Boolean.TRUE);
            // 7.3.3 创建代理
			Object proxy = createProxy(
					bean.getClass(), beanName, specificInterceptors, new SingletonTargetSource(bean));
			this.proxyTypes.put(cacheKey, proxy.getClass());
			return proxy;
		}

		this.advisedBeans.put(cacheKey, Boolean.FALSE);
		return bean;
	}
```



```java
	@Override
	protected Object[] getAdvicesAndAdvisorsForBean(Class<?> beanClass, String beanName, TargetSource targetSource) {
		List<Advisor> advisors = findEligibleAdvisors(beanClass, beanName);
		if (advisors.isEmpty()) {
			return DO_NOT_PROXY;
		}
		return advisors.toArray();
	}
	protected List<Advisor> findEligibleAdvisors(Class<?> beanClass, String beanName) {
        // 所有的的增强 
		List<Advisor> candidateAdvisors = findCandidateAdvisors();
        // 寻找所有增强中适用于bean的增强并应用
		List<Advisor> eligibleAdvisors = findAdvisorsThatCanApply(candidateAdvisors, beanClass, beanName);
		extendAdvisors(eligibleAdvisors);
		if (!eligibleAdvisors.isEmpty()) {
			eligibleAdvisors = sortAdvisors(eligibleAdvisors);
		}
		return eligibleAdvisors;
	}
```

对于指定bean的增强方法的获取一定包含两步：获取所有的的增强 和 寻找所有增强中适用于bean的增强并应用。分别 就对应 findCandidateAdvisors与 findAdvisorsThatCanApply.

### 7.3.1 获取增强器`findCandidateAdvisors`

由于是注解进行AOP，所以，`findCandidateAdvisors`的实现就是 AnnotationAwareAspectJAutoProxyCreator 中的。

```java
	@Override
	protected List<Advisor> findCandidateAdvisors() {
        // 使用注解方式配置 AOP 并不是 不用 XML 配置，这里 会调用父类 方法加载配置文件
		// Add all the Spring advisors found according to superclass rules.
        // 根据SuffCype规则添加所有的Spring顾问
		List<Advisor> advisors = super.findCandidateAdvisors();
		// Build Advisors for all AspectJ aspects in the bean factory.
        // 为bean工厂中的所有AspectJ方面建立顾问。
		advisors.addAll(this.aspectJAdvisorsBuilder.buildAspectJAdvisors());
		return advisors;
	}
```

`this.aspectJAdvisorsBuilder.buildAspectJAdvisors()`

逻辑基本：

1. 获取所有的beanName，这里 会将 BeanFactory中所有的bean提取出来。
2. 遍历 beanName，找到被@AspectJ 注解声明的类。
3. 对 找到类进行 增强器的提取。
4. 将提取结果 记录到缓存。

```java
	public List<Advisor> buildAspectJAdvisors() {
		List<String> aspectNames = this.aspectBeanNames;

		if (aspectNames == null) {
			synchronized (this) {
				aspectNames = this.aspectBeanNames;
				if (aspectNames == null) {
					List<Advisor> advisors = new LinkedList<Advisor>();
					aspectNames = new LinkedList<String>();
                    // 获取所有的beanName
					String[] beanNames = 
                        BeanFactoryUtils.beanNamesForTypeIncludingAncestors
                        				(this.beanFactory, Object.class, true, false);
                    // 遍历 beanName 寻找对应的增强方法
					for (String beanName : beanNames) {
                        // 不合法的bean 略过。
                        // 由BeanFactoryAspectJAdvisorsBuilder的子类自定义定义 过滤规则 ，
                        // 默认 都是 true
						if (!isEligibleBean(beanName)) {
							continue;
						}
                        // 获取对应bean的类型
						Class<?> beanType = this.beanFactory.getType(beanName);
						if (beanType == null) {
							continue;
						}
                        // 如果存在AspectJ注解
						if (this.advisorFactory.isAspect(beanType)) {
							aspectNames.add(beanName);
							AspectMetadata amd = new AspectMetadata(beanType, beanName);
							if (amd.getAjType().getPerClause().getKind() 
                                						== PerClauseKind.SINGLETON) {
								MetadataAwareAspectInstanceFactory factory =
											 new BeanFactoryAspectInstanceFactory
                                   						 (this.beanFactory, beanName);
								// 解析 标记AspectJ 注解中 的 增强方法
                                List<Advisor> classAdvisors = 
                                    			this.advisorFactory.getAdvisors(factory);
								if (this.beanFactory.isSingleton(beanName)) {
									this.advisorsCache.put(beanName, classAdvisors);
								}
								else {
									this.aspectFactoryCache.put(beanName, factory);
								}
								advisors.addAll(classAdvisors);
							}
							else {
								if (this.beanFactory.isSingleton(beanName)) {
									throw new IllegalArgumentException("Bean with name '" + beanName +
											"' is a singleton, but aspect instantiation model is not singleton");
								}
								MetadataAwareAspectInstanceFactory factory =
										new PrototypeAspectInstanceFactory(this.beanFactory, beanName);
								this.aspectFactoryCache.put(beanName, factory);
								advisors.addAll(this.advisorFactory.getAdvisors(factory));
							}
						}
					}
					this.aspectBeanNames = aspectNames;
					return advisors;
				}
			}
		}
        if (aspectNames.isEmpty()) {
			return Collections.emptyList();
		}
        // 记录在缓存中
		List<Advisor> advisors = new LinkedList<Advisor>();
		for (String aspectName : aspectNames) {
			List<Advisor> cachedAdvisors = this.advisorsCache.get(aspectName);
			if (cachedAdvisors != null) {
				advisors.addAll(cachedAdvisors);
			}
			else {
				MetadataAwareAspectInstanceFactory factory = this.aspectFactoryCache.get(aspectName);
				advisors.addAll(this.advisorFactory.getAdvisors(factory));
			}
		}
		return advisors;
    }
```

`List<Advisor> classAdvisors = this.advisorFactory.getAdvisors(factory);`增强器的获取。

```java
	public List<Advisor> getAdvisors(MetadataAwareAspectInstanceFactory aspectInstanceFactory) {
        // 获取 标记了 AspectJ 的类
		Class<?> aspectClass = aspectInstanceFactory.getAspectMetadata().getAspectClass();
		// 获取标记 AspectJ 的 name
        String aspectName = aspectInstanceFactory.getAspectMetadata().getAspectName();
		// 验证
        validate(aspectClass);

		MetadataAwareAspectInstanceFactory lazySingletonAspectInstanceFactory =
				new LazySingletonAspectInstanceFactoryDecorator(aspectInstanceFactory);

        // 存放 advisors 的集合
		List<Advisor> advisors = new LinkedList<Advisor>();
		for (Method method : getAdvisorMethods(aspectClass)) {
            // 对 Pointcut 注解的方法 不添加进集合
			Advisor advisor = getAdvisor(method, lazySingletonAspectInstanceFactory, advisors.size(), aspectName);
			if (advisor != null) {
				advisors.add(advisor);
			}
		}

		if (!advisors.isEmpty() && lazySingletonAspectInstanceFactory.
            							getAspectMetadata().isLazilyInstantiated()) {
			
            //如果 寻找的增强器步为空，有配置了增强延迟，那么就需要在首位加入同步实例化增强器
            Advisor instantiationAdvisor = 
                	new SyntheticInstantiationAdvisor(lazySingletonAspectInstanceFactory);
			advisors.add(0, instantiationAdvisor);
		}

		// 获取 DeclareParents 注解
		for (Field field : aspectClass.getDeclaredFields()) {
			Advisor advisor = getDeclareParentsAdvisor(field);
			if (advisor != null) {
				advisors.add(advisor);
			}
		}
		return advisors;
	}
```

#### 7.3.1.1 普通增强器的获取

```java
	public Advisor getAdvisor(Method candidateAdviceMethod, MetadataAwareAspectInstanceFactory aspectInstanceFactory,
			int declarationOrderInAspect, String aspectName) {

		validate(aspectInstanceFactory.getAspectMetadata().getAspectClass());

        // 切如点信息的获取
		AspectJExpressionPointcut expressionPointcut = getPointcut(candidateAdviceMethod, aspectInstanceFactory.getAspectMetadata().getAspectClass());
		if (expressionPointcut == null) {
			return null;
		}
        // 根据 切入点信息 生成增强器
		return new InstantiationModelAwarePointcutAdvisorImpl(expressionPointcut, candidateAdviceMethod,this, aspectInstanceFactory, declarationOrderInAspect, aspectName);
	}
```

##### 7.3.1.1.1 获取切入点 信息

```java
	private AspectJExpressionPointcut getPointcut(Method candidateAdviceMethod, Class<?> candidateAspectClass) {
        // 获取放上的 注解 类型 如 Before("test()") After()等
		AspectJAnnotation<?> aspectJAnnotation =
AbstractAspectJAdvisorFactory.findAspectJAnnotationOnMethod(candidateAdviceMethod);
		if (aspectJAnnotation == null) {
			return null;
		}

        // 用 AspectJExpressionPointcut 类实例 封装 切入点 信息
		AspectJExpressionPointcut ajexp =
				new AspectJExpressionPointcut(candidateAspectClass, new String[0], new Class<?>[0]);
        // 获取 Pointcut 注解 的内容
        // 如 @Pointcut(value = "execution(* SpringCode7.SpringCode7.TestBean.*(..))")
		ajexp.setExpression(aspectJAnnotation.getPointcutExpression());
		ajexp.setBeanFactory(this.beanFactory);
		return ajexp;
	}

	protected static AspectJAnnotation<?> findAspectJAnnotationOnMethod(Method method) {
		// 设置 敏感的 注解类型
        Class<?>[] classesToLookFor = new Class<?>[] 
       					 {Before.class, Around.class, After.class, AfterReturning.class, AfterThrowing.class, Pointcut.class};
		for (Class<?> c : classesToLookFor) {
            // 获取 指定方法上的注解 并用foundAnnotation 封装
			AspectJAnnotation<?> foundAnnotation = findAnnotation(method, (Class<Annotation>) c);
			if (foundAnnotation != null) {
				return foundAnnotation;
			}
		}
		return null;
	}
```

##### 7.3.1.1.2 根据返回的切入点信息 生成 增强器

```java
	public InstantiationModelAwarePointcutAdvisorImpl(AspectJExpressionPointcut declaredPointcut,
			Method aspectJAdviceMethod, AspectJAdvisorFactory aspectJAdvisorFactory,
			MetadataAwareAspectInstanceFactory aspectInstanceFactory, int declarationOrder, String aspectName) {

		this.declaredPointcut = declaredPointcut;
		this.declaringClass = aspectJAdviceMethod.getDeclaringClass();
		this.methodName = aspectJAdviceMethod.getName();
		this.parameterTypes = aspectJAdviceMethod.getParameterTypes();
		this.aspectJAdviceMethod = aspectJAdviceMethod;
		this.aspectJAdvisorFactory = aspectJAdvisorFactory;
		this.aspectInstanceFactory = aspectInstanceFactory;
		this.declarationOrder = declarationOrder;
		this.aspectName = aspectName;

		if (aspectInstanceFactory.getAspectMetadata().isLazilyInstantiated()) {
			Pointcut preInstantiationPointcut = Pointcuts.union(
					aspectInstanceFactory.getAspectMetadata().getPerClausePointcut(), this.declaredPointcut);

			this.pointcut = new PerTargetInstantiationModelPointcut(
					this.declaredPointcut, preInstantiationPointcut, aspectInstanceFactory);
			this.lazy = true;
		}
		else {
			this.pointcut = this.declaredPointcut;
			this.lazy = false;
            // 根据 注解信息 初始化增强器 
			this.instantiatedAdvice = instantiateAdvice(this.declaredPointcut);
		}
	}
```

```java
	private Advice instantiateAdvice(AspectJExpressionPointcut pcut) {
		return this.aspectJAdvisorFactory.getAdvice(this.aspectJAdviceMethod, pcut,
				this.aspectInstanceFactory, this.declarationOrder, this.aspectName);
	}
//  大逻辑
	public Advice getAdvice(Method candidateAdviceMethod, AspectJExpressionPointcut expressionPointcut,
			MetadataAwareAspectInstanceFactory aspectInstanceFactory, int declarationOrder, String aspectName) {

		Class<?> candidateAspectClass = aspectInstanceFactory.getAspectMetadata().getAspectClass();
		validate(candidateAspectClass);

		AspectJAnnotation<?> aspectJAnnotation =
				AbstractAspectJAdvisorFactory.findAspectJAnnotationOnMethod(candidateAdviceMethod);
		if (aspectJAnnotation == null) {
			return null;
		}

		// If we get here, we know we have an AspectJ method.
		// Check that it's an AspectJ-annotated class
		if (!isAspect(candidateAspectClass)) {
			throw new AopConfigException("Advice must be declared inside an aspect type: " +
					"Offending method '" + candidateAdviceMethod + "' in class [" +
					candidateAspectClass.getName() + "]");
		}

		if (logger.isDebugEnabled()) {
			logger.debug("Found AspectJ method: " + candidateAdviceMethod);
		}

		AbstractAspectJAdvice springAdvice;

        // 根据 不同 的注解类型 封装 不同 的 增强器
		switch (aspectJAnnotation.getAnnotationType()) {
			case AtBefore:
				springAdvice = new AspectJMethodBeforeAdvice(
						candidateAdviceMethod, expressionPointcut, aspectInstanceFactory);
				break;
			case AtAfter:
				springAdvice = new AspectJAfterAdvice(
						candidateAdviceMethod, expressionPointcut, aspectInstanceFactory);
				break;
			case AtAfterReturning:
				springAdvice = new AspectJAfterReturningAdvice(
						candidateAdviceMethod, expressionPointcut, aspectInstanceFactory);
				AfterReturning afterReturningAnnotation = (AfterReturning) aspectJAnnotation.getAnnotation();
				if (StringUtils.hasText(afterReturningAnnotation.returning())) {
					springAdvice.setReturningName(afterReturningAnnotation.returning());
				}
				break;
			case AtAfterThrowing:
				springAdvice = new AspectJAfterThrowingAdvice(
						candidateAdviceMethod, expressionPointcut, aspectInstanceFactory);
				AfterThrowing afterThrowingAnnotation = (AfterThrowing) aspectJAnnotation.getAnnotation();
				if (StringUtils.hasText(afterThrowingAnnotation.throwing())) {
					springAdvice.setThrowingName(afterThrowingAnnotation.throwing());
				}
				break;
			case AtAround:
				springAdvice = new AspectJAroundAdvice(
						candidateAdviceMethod, expressionPointcut, aspectInstanceFactory);
				break;
			case AtPointcut:
				if (logger.isDebugEnabled()) {
					logger.debug("Processing pointcut '" + candidateAdviceMethod.getName() + "'");
				}
				return null;
			default:
				throw new UnsupportedOperationException(
						"Unsupported advice type on method: " + candidateAdviceMethod);
		}

		// Now to configure the advice...
		springAdvice.setAspectName(aspectName);
		springAdvice.setDeclarationOrder(declarationOrder);
		String[] argNames = this.parameterNameDiscoverer.getParameterNames(candidateAdviceMethod);
		if (argNames != null) {
			springAdvice.setArgumentNamesFromStringArray(argNames);
		}
		springAdvice.calculateArgumentBindings();
		return springAdvice;
	}
```

上面可以看出，不同的注解 产生的 增强器就不同，AtAfter 就是 AspectJAfterAdvice。

**前置增强**

AspectJMethodBeforeAdvice 的实现：是需要 MethodBeforeAdviceInterceptor （拦截器）的。

在拦截器链中添加 MethodBeforeAdviceInterceptor ，而MethodBeforeAdviceInterceptor 中在添加AspectJMethodBeforeAdvice 。故而在 拦截器生效时，触发invokeAdviceMethod，方法前置增强器 也就是生效。

**后置增强**

AspectJAfterAdvice 就 没有提供中间类，直接在拦截器链中使用  后置增强器。

 AspectJAfterAdvice 实现了拦截器,故而在 拦截器链中 invoke 时，一定触发了，增强器的invokeAdviceMethod方法

#### 7.3.1.2 增加同步实例化增强器

如果 寻找的增强器步为空，有配置了增强延迟，那么就需要在首位加入同步实例化增强器
            Advisor instantiationAdvisor = 
                	new SyntheticInstantiationAdvisor(lazySingletonAspectInstanceFactory);

#### 7.3.1.3 获取DeclareParents 注解

DeclareParents  主要用于 引介增强的注解形式实现，实现方式与 普通 类似，不过创建的类 为 `DeclareParentsAdvise  `

### 7.3.2 寻找 匹配增强器 `findAdvisorsThatCanApply`

`List<Advisor> eligibleAdvisors = findAdvisorsThatCanApply(candidateAdvisors, beanClass, beanName);`

```java
	protected List<Advisor> findAdvisorsThatCanApply(
			List<Advisor> candidateAdvisors, Class<?> beanClass, String beanName) {

		ProxyCreationContext.setCurrentProxiedBeanName(beanName);
		try {
            // 下步
			return AopUtils.findAdvisorsThatCanApply(candidateAdvisors, beanClass);
		}
		finally {
			ProxyCreationContext.setCurrentProxiedBeanName(null);
		}
	}
```

寻找所有增强器中适用于当前class的增强器。

```java
	public static List<Advisor> findAdvisorsThatCanApply(List<Advisor> candidateAdvisors, Class<?> clazz) {
		if (candidateAdvisors.isEmpty()) {
			return candidateAdvisors;
		}
		List<Advisor> eligibleAdvisors = new LinkedList<Advisor>();
        // 首先处理 引介增强
		for (Advisor candidate : candidateAdvisors) {
			if (candidate instanceof IntroductionAdvisor && canApply(candidate, clazz)) {
				eligibleAdvisors.add(candidate);
			}
		}
		boolean hasIntroductions = !eligibleAdvisors.isEmpty();
		for (Advisor candidate : candidateAdvisors) {
            // 引介增强处理
			if (candidate instanceof IntroductionAdvisor) {
				// already processed
				continue;
			}
            // 正常bean处理
			if (canApply(candidate, clazz, hasIntroductions)) {
				eligibleAdvisors.add(candidate);
			}
		}
		return eligibleAdvisors;
	}
```



### 7.3.3 创建代理

创建好了增强器和匹配好后，就是该类的创建代理对象。

```java
	protected Object createProxy(
			Class<?> beanClass, String beanName, Object[] specificInterceptors, TargetSource targetSource) {

		if (this.beanFactory instanceof ConfigurableListableBeanFactory) {
			AutoProxyUtils.exposeTargetClass((ConfigurableListableBeanFactory) this.beanFactory, beanName, beanClass);
		}

		ProxyFactory proxyFactory = new ProxyFactory();
        // 获取当前类的 相关属性
		proxyFactory.copyFrom(this);

        // 检查 是否使用 ProxyTargetClass 而不是其他接口 
        // 以及设置ProxyTargetClass属性
		if (!proxyFactory.isProxyTargetClass()) {
			if (shouldProxyTargetClass(beanClass, beanName)) {
				proxyFactory.setProxyTargetClass(true);
			}
			else {
				evaluateProxyInterfaces(beanClass, proxyFactory);
			}
		}

        // 将拦截器 封装成 增强器 的逻辑 
		Advisor[] advisors = buildAdvisors(beanName, specificInterceptors);
		// 添加增强器
        proxyFactory.addAdvisors(advisors);
        // 设置代理的类
		proxyFactory.setTargetSource(targetSource);
        // 定制代理
		customizeProxyFactory(proxyFactory);

        // 设置 代理工厂配置后 是否 允许 修改通知 默认 不能修改
		proxyFactory.setFrozen(this.freezeProxy);
		if (advisorsPreFiltered()) {
			proxyFactory.setPreFiltered(true);
		}

        // 设置代理类 接下面
		return proxyFactory.getProxy(getProxyClassLoader());
	}
```

代理类的创建，spring 交于 ProxyFactory 类来创建。在这个方法中，主要是对 工厂类的初始化操作。

1. 获取需要代理的类的属性
2. 添加代理接口
3. 封装增强器（Advisor）到 代理工厂类中。
4. 设置代理类

#### 7.3.3.1 创建代理

由于spring 中 有许多的 拦截器 过滤器 增强方法等。这时就需要 同一封装成Advisor 来进行统一的 代理创建。

`proxyFactory.getProxy(getProxyClassLoader());`

```java
	public Object getProxy(ClassLoader classLoader) {
		return createAopProxy().getProxy(classLoader);
	}
```

创建：`createAopProxy()`

```java
	protected final synchronized AopProxy createAopProxy() {
		if (!this.active) {
			activate();
		}
        // 创建代理
		return getAopProxyFactory().createAopProxy(this);
	}

	public AopProxy createAopProxy(AdvisedSupport config) throws AopConfigException {
		// 看出 三个条件 关系 spring 对代理的创建
        if (config.isOptimize() || 
            config.isProxyTargetClass() || 
            hasNoUserSuppliedProxyInterfaces(config)) {
			Class<?> targetClass = config.getTargetClass();
			if (targetClass == null) {
				throw new AopConfigException("TargetSource cannot determine target class: " +
						"Either an interface or a target is required for proxy creation.");
			}
			if (targetClass.isInterface() || Proxy.isProxyClass(targetClass)) {
				return new JdkDynamicAopProxy(config);
			}
			return new ObjenesisCglibAopProxy(config);
		}
		else {
			return new JdkDynamicAopProxy(config);
		}
	}
```

spring 创建  代理的条件：

+ optimize ： 用来控制CGLIB创建代理是否使用激进的优化策略，JDK代理无效。而且 默认不建议使用。除非完全了解AOP代理如何处理优化。
+ proxyTargetClass：为true时，目标类本身被代理，而不是目标类的接口被代理，并且时CGLIB代理创建。`<aop:aspect-autoproxy proxy-target-class="true" />`
+ hasNoUserSuppliedProxyInterfaces : 是否存代理接口

说明：

1. 目标实现类接口：默认使用JDK代理
2. 目标实现类接口：可以设置CGLIB代理 条件二
3. 目标类没有实现接口：spring默认（强制）使用CGLIB 代理

使用CGLIB代理：

1. 引入 CGLIB 库：Spring_HOME/cglib/*.jar
2. 条件二  设置为true

区别：

JDK代理：只能实现接口类的代理，不是针对类

CGLIB代理：代理方式是生成该类的子类，覆盖方法。应为时继承 所以 方法 不能 用fianl

#### 7.3.3.2 获取代理

##### 7.3.3.2.1 JDK 代理

自定义 InvocationHandler  类的实现 就是JDK代理的核心，带参构造函数，invoke 方法 （代理执行时方法）， getProxy方法。

续接上面7.3.3.1 而spring中 `new JdkDynamicAopProxy(config);` 而 `JdkDynamicAopProxy` 便是实现了 `InvocationHandler `接口的。

```java
	public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
		MethodInvocation invocation;
		Object oldProxy = null;
		boolean setProxyContext = false;

		TargetSource targetSource = this.advised.targetSource;
		Class<?> targetClass = null;
		Object target = null;

		try {
			if (!this.equalsDefined && AopUtils.isEqualsMethod(method)) {
				// The target does not implement the equals(Object) method itself.
				return equals(args[0]);
			}
			else if (!this.hashCodeDefined && AopUtils.isHashCodeMethod(method)) {
				// The target does not implement the hashCode() method itself.
				return hashCode();
			}
			else if (method.getDeclaringClass() == DecoratingProxy.class) {
				// There is only getDecoratedClass() declared -> dispatch to proxy config.
				return AopProxyUtils.ultimateTargetClass(this.advised);
			}
			else if (!this.advised.opaque && method.getDeclaringClass().isInterface() &&
					method.getDeclaringClass().isAssignableFrom(Advised.class)) {
				// Service invocations on ProxyConfig with the proxy config...
				return AopUtils.invokeJoinpointUsingReflection(this.advised, method, args);
			}

			Object retVal;

			if (this.advised.exposeProxy) {
				// Make invocation available if necessary.
				oldProxy = AopContext.setCurrentProxy(proxy);
				setProxyContext = true;
			}

			// May be null. Get as late as possible to minimize the time we "own" the target,
			// in case it comes from a pool.
			target = targetSource.getTarget();
			if (target != null) {
				targetClass = target.getClass();
			}

			// Get the interception chain for this method.
            // 得到 当前方法的拦截器
			List<Object> chain = this.advised.getInterceptorsAndDynamicInterceptionAdvice(method, targetClass);

			// Check whether we have any advice. If we don't, we can fallback on direct
			// reflective invocation of the target, and avoid creating a MethodInvocation.
			if (chain.isEmpty()) {
				// 如果没有 就 用直接调用切点方法
				Object[] argsToUse = AopProxyUtils.adaptArgumentsIfNecessary(method, args);
				retVal = AopUtils.invokeJoinpointUsingReflection(target, method, argsToUse);
			}
			else {
				// We need to create a method invocation...
                // 创建 invocation （调用） 来 拦截器
				invocation = new ReflectiveMethodInvocation(proxy, target, method, args, targetClass, chain);
				// Proceed to the joinpoint through the interceptor chain.
                // 执行 拦截链
				retVal = invocation.proceed();
			}

			// Massage return value if necessary.
            // 返回结果
			Class<?> returnType = method.getReturnType();
			if (retVal != null && retVal == target &&
					returnType != Object.class && returnType.isInstance(proxy) &&
					!RawTargetAccess.class.isAssignableFrom(method.getDeclaringClass())) {
				// Special case: it returned "this" and the return type of the method
				// is type-compatible. Note that we can't help if the target sets
				// a reference to itself in another returned object.
				retVal = proxy;
			}
			else if (retVal == null && returnType != Void.TYPE && returnType.isPrimitive()) {
				throw new AopInvocationException(
						"Null return value from advice does not match primitive return type for: " + method);
			}
			return retVal;
		}
		finally {
			if (target != null && !targetSource.isStatic()) {
				// Must have come from TargetSource.
				targetSource.releaseTarget(target);
			}
			if (setProxyContext) {
				// Restore old proxy.
				AopContext.setCurrentProxy(oldProxy);
			}
		}
	}
```

上面主要就是创建拦截链，`invocation.proceed()`便是依次调用拦截器。

##### 7.3.3.2.2 CGLIB 代理

CGLIB  提供类一个Interception(拦截)方法，处理类实现 `MethodIntercept`。CGLIB 底层是通过 字节码处理框架 ASM，来转换字节码并生成新的类。Groovy 与 BeanShell 也都是使用这个。

`MethodInterceptionImpl`实现 `MethodInterception`，将方法intercept（）实现。

Enhancer 类实例hance，设置 要代理类的 类模板，在设置 impl 实例。hance创建被 代理类的实例。

而在spring中，CGLIB代理的类委托给`CglibAopProxy` 类实现的，该类的getProxy(),便实现了Enhancer的创建与接口封装。

```java
	public Object getProxy(ClassLoader classLoader) {
		if (logger.isDebugEnabled()) {
			logger.debug("Creating CGLIB proxy: target source is " + this.advised.getTargetSource());
		}

		try {
			Class<?> rootClass = this.advised.getTargetClass();
			Assert.state(rootClass != null, "Target class must be available for creating a CGLIB proxy");

			Class<?> proxySuperClass = rootClass;
			if (ClassUtils.isCglibProxyClass(rootClass)) {
				proxySuperClass = rootClass.getSuperclass();
				Class<?>[] additionalInterfaces = rootClass.getInterfaces();
				for (Class<?> additionalInterface : additionalInterfaces) {
					this.advised.addInterface(additionalInterface);
				}
			}

			// Validate the class, writing log messages as necessary.
            // 验证class
			validateClassIfNecessary(proxySuperClass, classLoader);

			// Configure CGLIB Enhancer...
            // 创建 与 配置 好 Enhancer
			Enhancer enhancer = createEnhancer();
			if (classLoader != null) {
				enhancer.setClassLoader(classLoader);
				if (classLoader instanceof SmartClassLoader &&
						((SmartClassLoader) classLoader).isClassReloadable(proxySuperClass)) {
					enhancer.setUseCache(false);
				}
			}
			enhancer.setSuperclass(proxySuperClass);
			enhancer.setInterfaces(AopProxyUtils.completeProxiedInterfaces(this.advised));
			enhancer.setNamingPolicy(SpringNamingPolicy.INSTANCE);
			enhancer.setStrategy(new ClassLoaderAwareUndeclaredThrowableStrategy(classLoader));

            // 设置拦截器
			Callback[] callbacks = getCallbacks(rootClass);
			Class<?>[] types = new Class<?>[callbacks.length];
			for (int x = 0; x < types.length; x++) {
				types[x] = callbacks[x].getClass();
			}
			// fixedInterceptorMap only populated at this point, after getCallbacks call above
			enhancer.setCallbackFilter(new ProxyCallbackFilter(
					this.advised.getConfigurationOnlyCopy(), this.fixedInterceptorMap, this.fixedInterceptorOffset));
			enhancer.setCallbackTypes(types);

			// Generate the proxy class and create a proxy instance.
            // 创建 代理 和 生成代理类
			return createProxyClassAndInstance(enhancer, callbacks);
		}
		catch (Throwable ex) {
			// TargetSource.getTarget() failed
			throw new AopConfigException("Unexpected AOP exception", ex);
		}
	}
```

主要是设置拦截器的过程：

```java
	private Callback[] getCallbacks(Class<?> rootClass) throws Exception {
		// Parameters used for optimization choices...
        // 对 exposeProxy 属性的处理
		boolean exposeProxy = this.advised.isExposeProxy();
		boolean isFrozen = this.advised.isFrozen();
		boolean isStatic = this.advised.getTargetSource().isStatic();

		// Choose an "aop" interceptor (used for AOP calls).
        // 将拦截器封装进DynamicAdvisedInterceptor 成为拦截器链
		Callback aopInterceptor = new DynamicAdvisedInterceptor(this.advised);

		// Choose a "straight to target" interceptor. (used for calls that are
		// unadvised but can return this). May be required to expose the proxy.
		Callback targetInterceptor;
		if (exposeProxy) {
			targetInterceptor = isStatic ?
					new StaticUnadvisedExposedInterceptor(this.advised.getTargetSource().getTarget()) :
					new DynamicUnadvisedExposedInterceptor(this.advised.getTargetSource());
		}
		else {
			targetInterceptor = isStatic ?
					new StaticUnadvisedInterceptor(this.advised.getTargetSource().getTarget()) :
					new DynamicUnadvisedInterceptor(this.advised.getTargetSource());
		}

		// Choose a "direct to target" dispatcher (used for
		// unadvised calls to static targets that cannot return this).
		Callback targetDispatcher = isStatic ?
				new StaticDispatcher(this.advised.getTargetSource().getTarget()) : new SerializableNoOp();

		Callback[] mainCallbacks = new Callback[] {
            // 将拦截器 封装进 Callback
				aopInterceptor,  // for normal advice
				targetInterceptor,  // invoke target without considering advice, if optimized
				new SerializableNoOp(),  // no override for methods mapped to this
				targetDispatcher, this.advisedDispatcher,
				new EqualsInterceptor(this.advised),
				new HashCodeInterceptor(this.advised)
		};

		Callback[] callbacks;

		// If the target is a static one and the advice chain is frozen,
		// then we can make some optimizations by sending the AOP calls
		// direct to the target using the fixed chain for that method.
		if (isStatic && isFrozen) {
			Method[] methods = rootClass.getMethods();
			Callback[] fixedCallbacks = new Callback[methods.length];
			this.fixedInterceptorMap = new HashMap<String, Integer>(methods.length);

			// TODO: small memory optimization here (can skip creation for methods with no advice)
			for (int x = 0; x < methods.length; x++) {
				List<Object> chain = this.advised.getInterceptorsAndDynamicInterceptionAdvice(methods[x], rootClass);
				fixedCallbacks[x] = new FixedChainStaticTargetInterceptor(
						chain, this.advised.getTargetSource().getTarget(), this.advised.getTargetClass());
				this.fixedInterceptorMap.put(methods[x].toString(), x);
			}

			// Now copy both the callbacks from mainCallbacks
			// and fixedCallbacks into the callbacks array.
			callbacks = new Callback[mainCallbacks.length + fixedCallbacks.length];
			System.arraycopy(mainCallbacks, 0, callbacks, 0, mainCallbacks.length);
			System.arraycopy(fixedCallbacks, 0, callbacks, mainCallbacks.length, fixedCallbacks.length);
			this.fixedInterceptorOffset = mainCallbacks.length;
		}
		else {
			callbacks = mainCallbacks;
		}
		return callbacks;
	}
```

上面考虑了许多情况，但主要的，还是 将advised 封装进 `DynamicAdvisedInterceptor`，在加入到 callbacks中。而 `DynamicAdvisedInterceptor`刚好就是实现了`MethodInterceptor`接口的。故而 `DynamicAdvisedInterceptor`也就实现了

`intercept()`方法。里面基本同JDK代理 中的 invoke 类似。

## 7.4 静态AOP实例

**加载时纺入（load-time weaving LTW）**：

​	指虚拟机在加载字节码时动态织入AspectJ切面。spring的值添加为AspectJ LTW在织入过程中提供类更细粒度的控制。

​	使用Java（5+）的代理使用一个叫"Vanilla"的Aspect LTW，这需要在启动JVM时将某个JVM参数设置打开,这种JVM范围设置一般没问题，但是粒度略粗。

​	使用Spring的LTW能让你在per-ClassLoader 的基础上打开LTW，这样粒度更细。并且在“单JVM多应用”的环境根据意义。另外在一定条件下，能直接使用LTW而不去修改服务的启动脚本，不去修改 `-javaagent:D:\spring-agent-2.5.6.jar`或者 `-javaagent:D:\aspectjweaver.jar`

以之前动态AOP为例子需要改变如下：

（1）spring全局配置：

```xml
	<!-- 开启切面支持 -->
	<aop:aspectj-autoproxy></aop:aspectj-autoproxy>
	<bean id="bean" class="SpringCode7.SpringCode7.TestBean"></bean>				
	<!--bean class="SpringCode7.SpringCode7.AspectTest"></bean--> 				
	<bean class="SpringCode7.SpringCode7.diyAnnotation.DIYAnnotationAspect"></bean>			
	<!-- 加入LTW 开关 -->
	<context:load-time-weaver/>
```

（2）加入aop.xml于META-INF文件下：

```xml
<!DOCTYPE aspectj PUBLIC "-//AspectJ//DTD//EN" "http://www.eclipse.org/aspectj/dtd/aspectj.dtd">  
<aspectj>  
    <weaver options="-showWeaveInfo -XmessageHandlerClass:org.springframework.aop.aspectj.AspectJWeaverMessageHandler">  
        <include within="com.yotexs..*" />  
    </weaver>  
    <aspects>  
        <aspect name="SpringCode7.SpringCode7.AspectTest" />  
        <!--定义抽象切面  
<concrete-aspect name="com.yotexs.aspectj.EntityFieldSecurityAspectJ"   
                         extends="com.yotexs.aspectj.AbstractEntityFieldSecurityAspectJ">  
            <pointcut name="atServiceLayerScope"   
              expression="execution(public * *.get*(..)) &#38;&#38;   
                @within(org.springframework.beans.factory.annotation.Configurable)" />  
        </concrete-aspect>-->  
    </aspects>  
</aspectj>  
```

（3）加入JVM启动参数：

``-javaagent:D:\spring-agent-2.5.6.jar``

这样我们自定义的 `DIYAnnotationAspect`切面处理器，在对应的 目标类 编译 或者说 加载到虚拟机时 织如 增强。而且效率优于动态AOP。

## 7.5 创建AOP 静态代理

AOP静态代理主要时在虚拟机启动时改变目标对象的字节码的方式来完成对目标对象的增强。在动态代理中，还需要动态创建代理类并代理目标对象的步骤，静态代理在启动时便完成类字节码增强。

### 7.5.1 Instrumentation 使用 修改字节码

在Java 1.5 引入了 `Java.lang.instrumentation`,可以根据它实现一个 Java agent，通过agent 来修改类的字节码，即改变一个类。[Instrumentation](https://blog.csdn.net/DorMOUSENone/article/details/81781131)

**instrument：** 这里举例 instrument 实现一个简单的 profiler。instrument还有许多功能，类似一个更低级、更松耦合的AOP，可以从底层改变一个类的行为。

    当 JVM 以指示一个代理类的方式启动时，将传递给代理类的 premain 方法一个 Instrumentation 实例。
    当 JVM 提供某种机制在 JVM 启动之后某一时刻启动代理时，将传递给代理代码的 agentmain 方法一个 Instrumentation 实例。
（1）ClassFileTransformer类实现  依赖JBoss的 `javassist`来修改字节码。

```java
public class MyClassFileTransFormer implements ClassFileTransformer {

	@Override
	public byte[] transform(ClassLoader loader, 
							String className, 
							Class<?> classBeingRedefined,
							ProtectionDomain protectionDomain, 
							byte[] classfileBuffer) throws IllegalClassFormatException {
		
		byte[] transformed = null;
		System.out.println("操作类：" + className);
		ClassPool pool =  ClassPool.getDefault();
		CtClass cl = null;
		try {
			cl = pool.makeClass(new ByteArrayInputStream(classfileBuffer));
			
			if ( !cl.isInterface()) {
				
				CtBehavior[] methods = cl.getDeclaredBehaviors();
				for (int i = 0; i < methods.length; i++) {
					CtBehavior moehod = methods[i];
					if (!moehod.isEmpty()) {
						moehod.insertBefore("System.out.println(\" 这个方法开始执行！\"); ");
						moehod.insertAfter("System.out.println(\" 这个方法结束执行！\"); ");
					}
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}finally {
			if (cl != null)
				cl.detach();
		}
		return transformed;
	}
}
```

（2）编写agent类

```java
public class MyAgent {

	private static Instrumentation inst = null; 
	
	public static void premain(String str, Instrumentation ins) {
		System.out.println("开始执行 MyAgent 中的 premain");
		inst = ins;
		ClassFileTransformer cftf = new MyClassFileTransFormer();
		inst.addTransformer(cftf);
	}
}
```

先执行MyAgent,将自定义的 Instrument 加载。

这样 应用中的类 加载时都会 执行 定义的方法改变。

（3）打包导出 maven 配置

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.gl.MyAgent</groupId>
  <artifactId>com.gl.MyAgent</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <packaging>jar</packaging>

  <name>com.gl.MyAgent</name>
  <url>http://maven.apache.org</url>

  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <aspect.version>1.8.9</aspect.version>
    <junit.version>4.11</junit.version>
  </properties>

  <dependencies>
	<dependency>
	    <groupId>org.aspectj</groupId>
	    <artifactId>aspectjrt</artifactId>
	    <version>${aspect.version}</version>
	</dependency>
    <dependency>
      <groupId>junit</groupId>
      <artifactId>junit</artifactId>
      <version>${junit.version}</version>
      <scope>test</scope>
    </dependency>
    <dependency>
	    <groupId>org.javassist</groupId>
	    <artifactId>javassist</artifactId>
	    <version>3.22.0-GA</version>
	</dependency>
  </dependencies>
  
	<build>
		<plugins>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-jar-plugin</artifactId>
				<version>2.3.1</version>
				<configuration>
					<archive>
						<manifestEntries>
							<Premain-Class>com.gl.MyAgent.MyAgent</Premain-Class>
							<Boot-Class>D:\AcpcheJar\org\javassist\javassist\3.22.0-GA\javassist-3.22.0-GA.jar</Boot-Class>
						</manifestEntries>
						<!-- <manifest>
							<mainClass>com.zhaifx.App</mainClass>
						</manifest> -->
					</archive>
				</configuration>
			</plugin>
			
			<plugin>
				<artifactId>maven-compiler-plugin</artifactId>
				<configuration>
					<source>1.6</source>
					<target>1.6</target>
				</configuration>
			</plugin>
		</plugins>
	</build>
</project>

```

（4）执行 

配置JVM参数 `-javaagent:D:\spring-framework-4.3.x\com.gl.MyAgent\target\com.gl.MyAgent-0.0.1-SNAPSHOT.jar`

```java
public class TestMain {

	public static void main(String[] args) {
		new TestMain().test();
	}
	
	public void test() {
		System.out.println("测试MyAgent");
	}
}

/* 输出：
 * 开始执行 MyAgent 中的 premain
 * 测试MyAgent
 */

```

可以得出 自定义的 `MyClassFileTransFormer` 在main执行前就把 test 修改了。

Spring中的静态AOP 也就相当于AspectJ提供的 方法。而AspectJ 则是在 Instrument 基础上封装自己的  `ClassFileTransformer`。Spring 也就将 代理交由 AspectJ 处理。

### 7.5.2 自定义标签 ` <context:load-time-weaver/>`的解析

前面提到，Spring 使用 AspectJ 的LTW 功能，就需要开启 LTW。即配置` <context:load-time-weaver/>`

之前的 自定义命名空间 。引入 AspectJ 也就是这里。Ecilpice 的 File Search 得到这个类。

```java
public class ContextNamespaceHandler extends NamespaceHandlerSupport {

	@Override
	public void init() {
		registerBeanDefinitionParser("property-placeholder", new PropertyPlaceholderBeanDefinitionParser());
		registerBeanDefinitionParser("property-override", new PropertyOverrideBeanDefinitionParser());
		registerBeanDefinitionParser("annotation-config", new AnnotationConfigBeanDefinitionParser());
		registerBeanDefinitionParser("component-scan", new ComponentScanBeanDefinitionParser());
        
        // 加载 时间 织入 bean定义 解析器
		registerBeanDefinitionParser("load-time-weaver", new LoadTimeWeaverBeanDefinitionParser());
        
		registerBeanDefinitionParser("spring-configured", new SpringConfiguredBeanDefinitionParser());
		registerBeanDefinitionParser("mbean-export", new MBeanExportBeanDefinitionParser());
		registerBeanDefinitionParser("mbean-server", new MBeanServerBeanDefinitionParser());
	}

}
```

`LoadTimeWeaverBeanDefinitionParser`继承了 `AbstractSingleBeanDefinitionParser` 得到 `doParse`,实现了 `BeanDefinitionParser`，的核心逻辑 `parse（）`。

```java
	@Override
	protected void doParse(Element element, ParserContext parserContext, BeanDefinitionBuilder builder) {
		builder.setRole(BeanDefinition.ROLE_INFRASTRUCTURE);

        // 1. 判断 context:load-time-weaver 的 属性 aspectj-weacing 的值
		if (isAspectJWeavingEnabled(element.getAttribute(ASPECTJ_WEAVING_ATTRIBUTE), parserContext)) {
            // 创建 org.springframework.context.weaving.AspectJWeavingEnabler
			if (!parserContext.getRegistry().containsBeanDefinition(ASPECTJ_WEAVING_ENABLER_BEAN_NAME)) {
				RootBeanDefinition def = 
                    new RootBeanDefinition(ASPECTJ_WEAVING_ENABLER_CLASS_NAME);
                
				parserContext.registerBeanComponent
                    (new BeanComponentDefinition(def, ASPECTJ_WEAVING_ENABLER_BEAN_NAME));
			}

			if (isBeanConfigurerAspectEnabled(parserContext.getReaderContext().getBeanClassLoader())) {
				new SpringConfiguredBeanDefinitionParser().parse(element, parserContext);
			}
		}
	}
```

非常类似 AOP 对 `<aop:aspectj-autoproxy>的`处理,`<context:load-time-weaver>`.

上面就是 创建一个 AspectJ 的 处理类（`org.springframework.context.weaving.AspectJWeavingEnabler`）。

（1） 开启 AspectJ

`context:load-time-weaver`配置好，还有一个  `aspect-weaving`属性，对应的值  为 on off  autodetect。默认就是autodetect，系统会自动判断 META-INF中是否有 aop.xml。

（2） 将创建好的 `AspectJWeavingEnabler` 封装进 `BeanDefinition`

将对应的 `AspectJWeavingEnabler`类路径注册到 `RootBeanDefinition`中，转换成对应的 class。

```java
	@Override
	protected String getBeanClassName(Element element) {
		if (element.hasAttribute(WEAVER_CLASS_ATTRIBUTE)) {
			return element.getAttribute(WEAVER_CLASS_ATTRIBUTE);
		}
		return DEFAULT_LOAD_TIME_WEAVER_CLASS_NAME;
	}

	@Override
	protected String resolveId(Element element, AbstractBeanDefinition definition, ParserContext parserContext) {
        // bean的 id  loadTimeWeaver
		return ConfigurableApplicationContext.LOAD_TIME_WEAVER_BEAN_NAME;
	}
```

Spring 解析该标签时 ，还是以 Bean的方式保存。这个bean的id 就是 `loadTimeWeaver` class为： `org.springframework.context.weaving.DefaultContextLoadTimeWeaver`

（3） 将 `LoadTimeWeaverBeanDefinitionParser` 封装进 ApplicationContext 中

`AbstractApplicationContext`中 的 prepareBeanFactory方法 

```java
		if (beanFactory.containsBean(LOAD_TIME_WEAVER_BEAN_NAME)) {
			beanFactory.addBeanPostProcessor(new LoadTimeWeaverAwareProcessor(beanFactory));
			// Set a temporary ClassLoader for type matching.
			beanFactory.setTempClassLoader(new ContextTypeMatchClassLoader(beanFactory.getBeanClassLoader()));
		}
```

该方法是在容器初始化时调用，只有注册了 ``LoadTimeWeaverBeanDefinitionParser` ` 才能激活整个 AspectJ 功能。

### 7.5.3 织入

开始织入 `LoadTimeWeaverAwareProcessor`（后置处理器）中，实现了 BeanPostProcessor接口，`postProcessBeforeInitialization方法`。

```java
	@Override
	public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
		if (bean instanceof LoadTimeWeaverAware) {
			LoadTimeWeaver ltw = this.loadTimeWeaver;
			if (ltw == null) {
				Assert.state(this.beanFactory != null,
						"BeanFactory required if no LoadTimeWeaver explicitly specified");
				ltw = this.beanFactory.getBean(
						ConfigurableApplicationContext.LOAD_TIME_WEAVER_BEAN_NAME, LoadTimeWeaver.class);
			}
			((LoadTimeWeaverAware) bean).setLoadTimeWeaver(ltw);
		}
		return bean;
	}
```

这个后置处理器只处理 `LoadTimeWeaverAware`类，而实现这个类的 就只有 `AspectJWeavingEnabler`.

在spring调用 `AspectJWeavingEnabler`时，若为空，会直接调用 beanFactory.getBean 得到 `loadTimeWeaver`ID ，类型`DefaultContextLoadTimeWeaver`的Bean，并被设置到 `LoadTimeWeaver`属性当中。

`DefaultContextLoadTimeWeaver`实现了 LoadTimeWeaver, BeanClassLoaderAware, DisposableBean（销毁时调用的 destory）三个接口。

```java
	@Override
	public void setBeanClassLoader(ClassLoader classLoader) {
		LoadTimeWeaver serverSpecificLoadTimeWeaver = createServerSpecificLoadTimeWeaver(classLoader);
		if (serverSpecificLoadTimeWeaver != null) {
			if (logger.isInfoEnabled()) {
				logger.info("Determined server-specific load-time weaver: " +
						serverSpecificLoadTimeWeaver.getClass().getName());
			}
			this.loadTimeWeaver = serverSpecificLoadTimeWeaver;
		}
		else if (InstrumentationLoadTimeWeaver.isInstrumentationAvailable()) {
			// 检查当前虚拟机 中 Instrumentation 实例是否可用
            logger.info("Found Spring's JVM agent for instrumentation");
			this.loadTimeWeaver = new InstrumentationLoadTimeWeaver(classLoader);
		}
		else {
			try {
				this.loadTimeWeaver = new ReflectiveLoadTimeWeaver(classLoader);
				if (logger.isInfoEnabled()) {
					logger.info("Using a reflective load-time weaver for class loader: " +
							this.loadTimeWeaver.getInstrumentableClassLoader().getClass().getName());
				}
			}
			catch (IllegalStateException ex) {
				throw new IllegalStateException(ex.getMessage() + " Specify a custom LoadTimeWeaver or start your " +
						"Java virtual machine with Spring's agent: -javaagent:org.springframework.instrument.jar");
			}
		}
	}
```

`this.loadTimeWeaver = new InstrumentationLoadTimeWeaver(classLoader);`这里不仅 创建了一个 Instrumentation 实例。还对之进行了初始化，并把 Instrumentation 实例注册为当前虚拟机实例。并添加修改函数



`AspectJWeavingEnabler`也是实现了 `BeanFactoryPostProcessor`接口，所以在 解析结束后也会执行 postProcessBeanFactory

```java
	@Override
	public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
		enableAspectJWeaving(this.loadTimeWeaver, this.beanClassLoader);
	}
	public static void enableAspectJWeaving(LoadTimeWeaver weaverToUse, ClassLoader beanClassLoader) {
		if (weaverToUse == null) {
			if (InstrumentationLoadTimeWeaver.isInstrumentationAvailable()) {
				weaverToUse = new InstrumentationLoadTimeWeaver(beanClassLoader);
			}
			else {
				throw new IllegalStateException("No LoadTimeWeaver available");
			}
		}
        // 属性注册转换
		weaverToUse.addTransformer(
				new AspectJClassBypassingClassFileTransformer(new ClassPreProcessorAgentAdapter()));
	}

// 作用 只是 告诉 AspectJ 不对 org.aspectj  org/aspectj 开头的类处理
	private static class AspectJClassBypassingClassFileTransformer implements ClassFileTransformer {

		private final ClassFileTransformer delegate;

		public AspectJClassBypassingClassFileTransformer(ClassFileTransformer delegate) {
			this.delegate = delegate;
		}

		@Override
		public byte[] transform(ClassLoader loader, String className, Class<?> classBeingRedefined,
				ProtectionDomain protectionDomain, byte[] classfileBuffer) throws IllegalClassFormatException {

			if (className.startsWith("org.aspectj") || className.startsWith("org/aspectj")) {
				return classfileBuffer;
			}
            // 委托 AspectJ 代理 继续处理
			return this.delegate.transform(loader, className, classBeingRedefined, protectionDomain, classfileBuffer);
		}
	}
```

