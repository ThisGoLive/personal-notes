AnnotationAwareAspectJAutoProxyCreator 的父类 AbstractAutoProxyCreator#wrapIfNecessary 
开始beanname 与类名 进行查找
AbstractAdvisorAutoProxyCreator#getAdvicesAndAdvisorsForBean 

## 1.获取Advisor
先通过 findCandidateAdvisors 查找到Bean定义里面 备选的 Advisor， 默认 名称 是 default
findAdvisorsThatCanApply （AopUtils.findAdvisorsThatCanApply）IntroductionAdvisor 类型的classFilter 有这个Bean类型，PointcutAdvisor类型的
AopUtils#canApply(candidate, clazz, hasIntroductions)

## 2.使用adviosr 近创建代理
得到的 Advisor[] 被封装到ProxyFactory的实现AdvisedSupport中 给 AopProxy
ProxyFactory#getProxy createAopProxy->createAopProxy 获取AopProxy 具体的实现 并给 advised属性，
```java
if (introductionAwareMethodMatcher != null ?
						introductionAwareMethodMatcher.matches(method, targetClass, hasIntroductions) :
						methodMatcher.matches(method, targetClass)) { TransactionAttributeSourcePointcut#matches 判断当前方法是否需要代理
					return true;
				}

-------CglibAopProxy

```
AopProxy#getProxy  封装成 filter 给 enhancer，CallbackFilter filter 下advised属性，  Enhancer#emitMethods 使用

## 3 创建代理对象类型
```java
ObjenesisCglibAopProxy#createProxyClassAndInstance 构建 
Class<?> proxyClass = enhancer.createClass()
构建的新类 分别对应 FIELD_0 - 6
Object key = KEY_FACTORY.newInstance(
                (superclass != null) ? superclass.getName() : null,
				ReflectUtils.getNames(interfaces),
				filter == ALL_ZERO ? null : new WeakCacheKey<CallbackFilter>(filter), // 对应的封装的filter 
				callbackTypes,
				useFactory,
				interceptDuringConstruction,
				serialVersionUID);
类型创建加载 
Object result = Enhancer super.create(key); 
//创建类实例  key 的 field_2 referent 下 唯一使用的地方 AbstractClassGenerator#generateClassName
Object obj = data.get(this, getUseCache());
Object cachedValue = generatedClasses.get(gen);
this.createEntry(key, cacheKey, v)
Enhancer#generate  构建类名
super.generate(data);
//AbstractClassGenerator#generateClassName  原始类名$$Enhancer$$随机字符串 ，key 只用来 取HASH
byte[] b = strategy.generate(this);
return super.generate(cg);
....
Enhancer#emitMethods

```

## 4.选择 方法与 filter 匹配的下表
```java

int index = filter.accept(actualMethod); 判断
AdvisedSupport List<?> chain = this.advised.getInterceptorsAndDynamicInterceptionAdvice(method, targetClass); 
cached = this.advisorChainFactory.getInterceptorsAndDynamicInterceptionAdvice(
					this, method, targetClass);

默认的AdvisorChainFactory
DefaultAdvisorChainFactory#getInterceptorsAndDynamicInterceptionAdvice
```
### 4.1如果 匹配了，就会 添加 拦截器到 interceptorList 返回

```java
match = mm.matches(method, actualClass); 
--- 事务
TransactionAttributeSourcePointcut#matches 判断当前方法是否需要代理 再次调用
AbstractFallbackTransactionAttributeSource#computeTransactionAttribute  方法必须是公共的 后面JtaTransactionAnnotationParser#parseTransactionAnnotation就看有没有 事务注解，有就

然后对 方法 还有时机进行分组
Enhancer 详解
```

[代理8 cglib demo以及Enhancer源码解析](https://www.jianshu.com/p/20203286ccd9

```java

// 获取方法拦截器
MethodInterceptor[] interceptors = registry.getInterceptors(advisor);
回调过滤器 CallbackFilter ： Spring 自己实现的。类似CGLib，只不过 实现过滤不同
拦截器 MethodInterceptor ：Spring 的实现 AdvisorAdapterRegistry # getInterceptors，是将 Advisor.Advice 是否也是 MethodInterceptor。 AdvisorAdapter 的三个实现 判断 Advice 的执行时机，然后根据 Advice 创建对应的MethodInterceptor实现。

MethodInterceptorGenerator#generate
```

[AOP 流程](https://my.oschina.net/jiagouzhan/blog/5567086)