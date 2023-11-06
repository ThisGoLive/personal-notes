[[TOC]]

# 5.  bean的加载

回到最开始：

```java
// 第一章内容 一直到 XML 的解析
Resource resource = new ClassPathResource("./META-INF/test.xml");
// 第二章 第三章 对各个标签的解析
BeanFactory bf = new XmlBeanFactory(resource);
// 加载bean  开始
GetTest gt = (GetTest) bf.getBean("na23");
```

`bf.getBean（）`有很多实现，而这里其实是调用的 AbstractBeanFactory的 GetBean（String）方法，是由于参数不同，

DefaultListableBeanFactory: 

```java
public <T> T getBean(Class<T> requiredType) throws BeansException {
		return getBean(requiredType, (Object[]) null);
	}
public <T> T getBean(Class<T> requiredType, Object... args) throws BeansException {
		// nameBean 
    	NamedBeanHolder<T> namedBean = resolveNamedBean(requiredType, args);
		if (namedBean != null) {
			return namedBean.getBeanInstance();
		}
		BeanFactory parent = getParentBeanFactory();
		if (parent != null) {
			return parent.getBean(requiredType, args);
		}
		throw new NoSuchBeanDefinitionException(requiredType);
	}
```

`BeanFactory parent = getParentBeanFactory();`是调用的 AbstractBeanFactory的 GetBean（String,Object[]）方法

```Java
public Object getBean(String name) throws BeansException {
		return doGetBean(name, null, null, false);
	}
public Object getBean(String name, Object... args) throws BeansException {
		return doGetBean(name, null, args, false);
	}
	
protected <T> T doGetBean(final String name, final Class<T> requiredType, 
                          final Object[] args, boolean typeCheckOnly)throws BeansException {

/* 第一点：转换对应的beanName */
		// 通过传入的bean的名称  获取对应的 beanName
		final String beanName = transformedBeanName(name);
		Object bean;
    
/* 第二点：尝试从缓存中加载单例 */
    // 从缓存中 或者 是单例模式的ObjectFactory中 获取实例。
    // 在创建bean的时候会存在依赖注入的情况，而在创建依赖的时候为了避免循环依赖
    // Spring创建bean的原则是不等创建完成就会将bean的ObjectFactory提前曝光
    // 也就是将ObjectFactory加入到缓存中，一旦下一个Bean创建的时候需要依赖上一个bean 
    // 则直接用ObjectFactory
		Object sharedInstance = getSingleton(beanName);
    // 有的bean 或者 对应ObjectFactory时 并且 参数数组 为空时
		if (sharedInstance != null && args == null) {
            // 记录日志 的Debug 是激活状态时
			if (logger.isDebugEnabled()) {
                // bean名 集合中 有唯一的 beanName时
				if (isSingletonCurrentlyInCreation(beanName)) {
                    // 记录 快速实例化 一个单例bean 可能还没有初始化完成
					logger.debug("Returning eagerly cached instance of singleton bean '" + 
                   					beanName +"' that is not fully initialized yet - a 													consequence of a circular reference");
				}
				else {
                    // 记录 缓慢 实例化 一个 单例 的Bean
					logger.debug("Returning cached instance of singleton bean '" + 
                                 	beanName + "'");
				}
			}
/* 第三点：bean的实例化*/
            // 返回对应的实例，有的时候在诸如BeanFactory的情况下 
            // 并不是直接返回实例本身 而是返回指定的方法的实例
			bean = getObjectForBeanInstance(sharedInstance, name, beanName, null);
		}
		// 有对应的bean 或者 对应ObjectFactory时 或者 参数 不为空时
/* 逻辑 有点长  在之后 的除去9 都是 这个else里面  
	即 可能有对应的bean 或者工厂类实例 或者参数不为空时
*/
		else {
/* 第四点：原型模式 依赖检查*/
            // 只有在单例情况下才会去尝试 解决循环依赖  原型模式下，
            // 如果存在A中有B的属性，B中有A的属性，那么当依赖注入时，
            // 就会产生当A 还有没完成创建时，因为对于B的创建再次返回创建A，造成循环依赖
            // 即一些 为True 的情况
			if (isPrototypeCurrentlyInCreation(beanName)) {
				throw new BeanCurrentlyInCreationException(beanName);
			}

			// Check if bean definition exists in this factory.
            
 /* 第五点：检测 parentBeanFactory */
            // 获取工厂实例
			BeanFactory parentBeanFactory = getParentBeanFactory();
            // parentBeanFactory 不为空
            // 并且 在BeanDefinitionMap（即已经加载的类中）中没有找到 beanName 
            // 尝试从 parentBeanFactory 查找
			if (parentBeanFactory != null && !containsBeanDefinition(beanName)) {
				// Not found -> check parent.
                // 递归到 Beanfactory中查找
				String nameToLookup = originalBeanName(name);
				if (args != null) {
					// Delegation to parent with explicit args.
					return (T) parentBeanFactory.getBean(nameToLookup, args);
				}
				else {
					// No args -> delegate to standard getBean method.
					return parentBeanFactory.getBean(nameToLookup, requiredType);
				}
			}

            // 如果不是 只做类型检测  就是创建bean 需要进行记录
			if (!typeCheckOnly) {
				markBeanAsCreated(beanName);
			}

/*第六点：将解析XML后用于存储数据的GernericBeanDefinition 转换为 rootBeanDefinition*/
			try {
                // 将解析XML配置文件得到的GernericBeanDefinition 转换为 rootBeanDefinition 
                // 如果指定的Beanname 是子bean 则同时会合并到 父bean的相关属性
				final RootBeanDefinition mbd = getMergedLocalBeanDefinition(beanName);
				checkMergedBeanDefinition(mbd, beanName, args);

/*第七点：寻找依赖*/
				// Guarantee initialization of beans that the current bean depends on.
                // 得到依赖 需要递归实例化依赖的bean 名
				String[] dependsOn = mbd.getDependsOn();
                // 如果有时
				if (dependsOn != null) {
                    // 遍历
					for (String dep : dependsOn) {
                        // 判断 beanName是否又是依赖dep关系
						if (isDependent(beanName, dep)) {
							throw new BeanCreationException(mbd.getResourceDescription(), 
                                             beanName,"Circular depends-on 	
                                             relationship between '"
                                             + beanName + "' and '" + dep + "'");
						}
                        // 缓存依赖调用
						registerDependentBean(dep, beanName);
						try {
                            // 递归 调用 得到对应依赖 于缓存
							getBean(dep);
						}
						catch (NoSuchBeanDefinitionException ex) {
							throw new BeanCreationException(mbd.getResourceDescription(),
                             	 beanName,"'" + beanName + "' depends on missing bean '" + 
                                                            dep + "'", ex);
						}
					}
				}

/*第八点：针对不同的scope进行bean的创建*/
				// Create bean instance. 创建bean实例
                // 实例化依赖的bean后便可以 实例化 mbd自己
                // 单例模式创建
				if (mbd.isSingleton()) {
					sharedInstance = getSingleton(beanName, new ObjectFactory<Object>() {
						@Override
						public Object getObject() throws BeansException {
							try {
                                // 创建 
								return createBean(beanName, mbd, args);
							}
							catch (BeansException ex) {
								destroySingleton(beanName);
								throw ex;
							}
						}
					});
					bean = getObjectForBeanInstance(sharedInstance, name, beanName, mbd);
				}

                // Prototype 原型模式创建
				else if (mbd.isPrototype()) {
					// It's a prototype -> create a new instance.
					Object prototypeInstance = null;
					try {
						beforePrototypeCreation(beanName);
                        // 创建
						prototypeInstance = createBean(beanName, mbd, args);
					}
					finally {
						afterPrototypeCreation(beanName);
					}
					bean = getObjectForBeanInstance(prototypeInstance, name, beanName, mbd);
				}

                // 指定scope上实例化bean
				else {
					String scopeName = mbd.getScope();
					final Scope scope = this.scopes.get(scopeName);
					if (scope == null) {
						throw new IllegalStateException
                            ("No Scope registered for scope name '" + scopeName + "'");
					}
					try {
						Object scopedInstance = scope.get(beanName, 
                                                          new ObjectFactory<Object>() {
							@Override
							public Object getObject() throws BeansException {
								beforePrototypeCreation(beanName);
								try {
									return createBean(beanName, mbd, args);
								}
								finally {
									afterPrototypeCreation(beanName);
								}
							}
						});
						bean = getObjectForBeanInstance(scopedInstance, name, beanName, mbd);
					}
					catch (IllegalStateException ex) {
						throw new BeanCreationException
                            (beanName,"Scope '" + scopeName + 
                             "' is not active for the current thread; consider " +
                             "defining a scoped proxy for this bean if you "
                            +" intend to refer to it from a singleton",ex);
					}
				}
			}
			catch (BeansException ex) {
				cleanupAfterBeanCreationFailure(beanName);
				throw ex;
			}
		}
/*第九点：类型转换*/
		// Check if required type matches the type of the actual bean instance.
    // 检查需要的类型是否符合bean的实际类型
		if (requiredType != null && bean != null && !requiredType.isInstance(bean)) {
			try {
				return getTypeConverter().convertIfNecessary(bean, requiredType);
			}
			catch (TypeMismatchException ex) {
				if (logger.isDebugEnabled()) {
					logger.debug("Failed to convert bean '" + 
                                 name + "' to required type '" +
							ClassUtils.getQualifiedName(requiredType) + "'", ex);
				}
				throw new BeanNotOfRequiredTypeException
                    (name, requiredType, bean.getClass());
			}
		}
		return (T) bean;
	}
```

#### 大致逻辑：

##### 1. 转换对应的beanName

因为对应参数可以不是beanName（id属性）而是别名（name、alias），或者是FactoryBean，所以需要解析。解析内容：

- 去除FactoryBean的修饰符，也就是 `name="&aa"`，那么首先去除&得到 `name="aa"`
- 取指定alias所表示的最终beanName，如别名A指向名称为B的bean，则返回B，A指向B指向C的bean，返回C

##### 2.尝试从缓存中加载 **单例**

​	单例在spring容器中只会被创建一次，后续如再需要该实例，是直接从单例缓存中获取。这里只是尝试加载，第一次时加载不出单例，就会尝试从 `singletonFactories`中加载。

​	在创建单例bean时，会存在循环依赖，而在创建依赖的时候为了避免循环依赖，在spring中创建bean的原则是不等bean创建完成，就提前将ObjectFactory提前曝光到缓存中。下一个bean依赖上一个bean时，直接调用ObjectFactory。

例如：A单例与B单例互为依赖关系。创建A时，才创建到一半，就把A的ObjectFactory，缓存下来。当创建B时需要依赖A时，直接用就是。

##### 3. bean的实例化

​	如果从缓存中得到类bean的原始状态，则需要对bean进行实例化。

​	这里必要强调一下，缓存中的原始状态bean，不一定就是我们需要的bean。例如：需要对工厂bean进行处理，得到的是工厂bean的初始状态，但是为们真正需要的是工厂bean的factory-method方法返回的bean，而getObjectForBeanInstance就是完成这个工作的

##### 4. 原型模式的依赖检查

​	只有在单例情况下才会尝试解决循环依赖。`isPrototypeCurrentlyInCreation(beanName)`判断非单例情况下该beanName 是否有循环依赖，有就抛出异常。

##### 5. 检测 parentBeanFactory

​	parentBeanFactory 不为空，并且 在BeanDefinitionMap（即已经加载的类中）中没有找到 beanName尝试从 parentBeanFactory 查找。

​	检测当前加载的XML 配置文件中不包含beanName 所对应的配置，就只能到parentBeanFactory 找，再递归调用getBean

##### 6. 将解析XML后用于存储数据的GernericBeanDefinition 转换为 rootBeanDefinition

​	在转换过程中，如果父类bean（或者说属主对象bean）不为空时，会合并到父类属性

##### 7. 选择依赖

​	bean在初始化中可能会用到一些属性，而这些属性可能是动态配置的，并且配置成依赖于其他的bean，那么这时，就必须先初始化这个 bean所对应的依赖 子bean

##### 8. 针对不同的scope进行bean的创建

​	Spring中存在不同的scope，其中默认的singleton，还有其他的配置如：prototype request 。Spring会根据不同配置进行不同的初始化。

##### 9. 类型转换

一般情况requiredType 为空，单需要转换类型时，这里requiredType就可以时转换的类型对象，也可以自己扩展。

## 5.1 FactoryBean 的使用

虽然spring提供了许多（70多）自己实现的FactoryBean，单是缺乏灵活性，因为按照这些bean需要`<bean>`中提供大量的配置文件。

这时可以 `org.springframework.beans.factory.FactoryBean<T>`接口实现自己的工厂实例。3.0开始支持泛型。

```java
public interface FactoryBean<T> {

    // 返回创建的bean实例 如果 isSingleton 是true，则创建的实例会放在spring单例缓存池中
	T getObject() throws Exception;

    // 返回创建的 factoryBean创建的实例的类型
	Class<?> getObjectType();
	
    // 是否单例
	boolean isSingleton();
}
```

使用：

在`<bean>`中的class属性配置为 自定义实现的 factoryBean 的类路径。

```xml
<bean id="testF" class="com.myTestFacBean.MyTestFacBean" >
	<property name="testFInfo" value="91"></property>
</bean>
<!-- 这里相当于给 工厂类 添加属性 添加数据 数据随意 自己再在getObject中 随意操作 -->
```

```java
public class MyTestFacBean implements FactoryBean<TsetEntity> {

	private String testFInfo;
	@Override
	public TsetEntity getObject() throws Exception {
		TsetEntity t = new TsetEntity();
		t.setAa(testFInfo);
		return t;
	}

	@Override
	public Class<?> getObjectType() {
		return TsetEntity.class;
	}

	@Override
	public boolean isSingleton() {
		return true;
	}
	public String toString() {
		try {
			return "工厂"+getObject().toString();
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}
}

public class TsetEntity {
	private String aa;
}
```

在getBean时，分别 bf.getBean("testF") 和 bf.getBean("&testF") 获取实例bean 和实例工厂bean。自定义getObject()相当于代理了 bf.getBean；

## 5.2 缓存中获取单例Bean

续接主干：

`Object sharedInstance = getSingleton(beanName);`

这里是尝试加载单例bean。

```java
public Object getSingleton(String beanName) {
    // true 表示 允许早期依赖
		return getSingleton(beanName, true);
	}
protected Object getSingleton(String beanName, boolean allowEarlyReference) {
    // 尝试加载
		Object singletonObject = this.singletonObjects.get(beanName);
    // 判断缓存中 加载出是否 有单例bean 并且 beanName 为有效的（即不能有一些标点啥的）
		if (singletonObject == null && isSingletonCurrentlyInCreation(beanName)) {
            // 如果没有 就锁定 并进行处理
			synchronized (this.singletonObjects) {
                
                // 如果bean此时正在被加载 就不处理
				singletonObject = this.earlySingletonObjects.get(beanName);
                // 如果bean此时 不是在被加载 并且 允许早期依赖时 要处理
				if (singletonObject == null && allowEarlyReference) {
                    
                    // 当某些方法需要提前初始化时,会调用 addSingletonFactory方法，
                    // 将对应的ObjectFactory初始化策略存储在singletonFactoriesz中
					ObjectFactory<?> singletonFactory = 
                        this.singletonFactories.get(beanName);
                    
					if (singletonFactory != null) {
                        // 调用 预先设定的getObject
						singletonObject = singletonFactory.getObject();
                        // 记录在缓存中，earlySingletonObjects 与 singletonFactories 互斥
						this.earlySingletonObjects.put(beanName, singletonObject);
						this.singletonFactories.remove(beanName);
					}
                    
				}
                
			}
		}
		return (singletonObject != NULL_OBJECT ? singletonObject : null);
	}
```

先在 singletonObjects 中找，没找到

再在 earlySingletonObjects 中找，还没找到

最后在 singletonFactories 中找，找到的情况下，拿出来放在 earlySingletonObjects 中。

+ singletonObjects  用于保存BeanName 和创建的 bean实例的关系 （kv）
+ singletonFactories 用于存放 BeanName 和 工厂bean 的关系 （kv）
+ earlySingletonObjects 也是 BeanName  与实例bean的关系。当一个bean创建完成后，放在这里。又需要创建bean时，可以直接从这里 getBean获取。目的是检查循环依赖。
+ registeredSingletons 在 addSingletonFactory方法中保存 实例好的Bean

## 5.3 从bean的实例中获取对象

续接主干： 

​	在获取有效的 beanName （即可能 自定义 factoryBean 获取 加& ）后

​	尝试从缓存中加载 单例bean 

​	到第三步：从  **bean的实例 **中获取对象

​	 `bean = getObjectForBeanInstance(sharedInstance, name, beanName, null);`

在本章中（getBean方法中）`getObjectForBeanInstance`使用类许多次：从缓存中加载bean、根据不同的scope加载bean；但是次方法 获取 的不一定就是为们需要的最终bean（可能时 bean的 工厂类实例）。

```java
protected Object getObjectForBeanInstance(
			Object beanInstance, String name, String beanName, RootBeanDefinition mbd) {

    // 如果 name 与工厂相关（有&） 并且 beanInstance 不是 工厂bean 抛出异常 不继续
		if (BeanFactoryUtils.isFactoryDereference(name) && !(beanInstance instanceof FactoryBean)) {
			throw new BeanIsNotAFactoryException(transformedBeanName(name), beanInstance.getClass());
		}
    
    // 现在 我们有了 bean 的实例，可能是 我们要的bean 也可能 是工厂bean
		if (!(beanInstance instanceof FactoryBean) || 
            BeanFactoryUtils.isFactoryDereference(name)) {
            // 如果 beanInstance 不是工厂实例  或者 name 没有& 就肯定时 我们要的bean 直接返回
			return beanInstance;
		}

    // beanInstance 肯定时 工厂实例 且 用户需要获取的 不是 工厂bean
		Object object = null;
		if (mbd == null) {
            // 尝试在缓存中获取
			object = getCachedObjectForFactoryBean(beanName);
		}
    // 如果没有加载出来 需要 的实例 再调用 工厂实例 创建 bean
		if (object == null) {
            // 强转 成工厂bean
			FactoryBean<?> factory = (FactoryBean<?>) beanInstance;
            // containsBeanDefinition 判断 beanName 对应的 BD 是否存在
			if (mbd == null && containsBeanDefinition(beanName)) {
				mbd = getMergedLocalBeanDefinition(beanName);
			}
            // 判断 是否 时用户定义 而不是 程序定义的
			boolean synthetic = (mbd != null && mbd.isSynthetic());
            // 调用 方法 传人 工厂bean 和 bd 
			object = getObjectFromFactoryBean(factory, beanName, !synthetic);
		}
		return object;
	}
```

`object = getObjectFromFactoryBean(factory, beanName, !synthetic);`获取bean 从 工厂类实例

```java
protected Object getObjectFromFactoryBean(FactoryBean<?> factory, String beanName, boolean shouldPostProcess) {
    // 如果是 单例模式
		if (factory.isSingleton() && containsSingleton(beanName)) {
			synchronized (getSingletonMutex()) {
                // 进锁  并且再次判断 缓存中 bean
				Object object = this.factoryBeanObjectCache.get(beanName);
				if (object == null) {
                    // 调用 创建bean
					object = doGetObjectFromFactoryBean(factory, beanName);
                    // 再次 进缓存 
					Object alreadyThere = this.factoryBeanObjectCache.get(beanName);
                    
					if (alreadyThere != null) {
						object = alreadyThere;
					}
					else {
						if (object != null && shouldPostProcess) {
							if (isSingletonCurrentlyInCreation(beanName)) {
								return object;
							}
							beforeSingletonCreation(beanName);
							try {
                                // 最后处理
								object = postProcessObjectFromFactoryBean
                                    (object, beanName);
							}
							catch (Throwable ex) {
								throw new BeanCreationException(beanName,
						"Post-processing of FactoryBean's singleton object failed", ex);
							}
							finally {
								afterSingletonCreation(beanName);
							}
						}
						if (containsSingleton(beanName)) {
                            // 单例 添加进缓存
							this.factoryBeanObjectCache.put
                                (beanName, (object != null ? object : NULL_OBJECT));
						}
					}
				}
                // 缓存中 已经有时 或者 创建完成 时
				return (object != NULL_OBJECT ? object : null);
                // 出锁
			}
		}
    // 不是单例模式
		else {
             // 直接调用 创建bean 
			Object object = doGetObjectFromFactoryBean(factory, beanName);
			if (object != null && shouldPostProcess) {
				try {
                    // 最后处理
					object = postProcessObjectFromFactoryBean(object, beanName);
				}
				catch (Throwable ex) {
					throw new BeanCreationException(beanName, "Post-processing of FactoryBean's object failed", ex);
				}
			}
			return object;
		}
	}

private Object doGetObjectFromFactoryBean(final FactoryBean<?> factory, final String beanName)throws BeanCreationException {

		Object object;
		try {
            // 权限验证
			if (System.getSecurityManager() != null) {
				AccessControlContext acc = getAccessControlContext();
				try {
					object = AccessController.doPrivileged
                        (new PrivilegedExceptionAction<Object>() {
						@Override
						public Object run() throws Exception {
                            // 调用 创建
								return factory.getObject();
							}
						}, acc);
				}
				catch (PrivilegedActionException pae) {
					throw pae.getException();
				}
			}
			else {
                
                // 这里才 开始调用 工厂类 的getObject 方法
                // 并不是 实例bean的 创建 或许 是 通过工厂类获取 已经创建到一般的 实例bean
				object = factory.getObject();
			}
		}
		catch (FactoryBeanNotInitializedException ex) {
			throw new BeanCurrentlyInCreationException(beanName, ex.toString());
		}
		catch (Throwable ex) {
			throw new BeanCreationException
                (beanName, "FactoryBean threw exception on object creation", ex);
		}

		// Do not accept a null value for a FactoryBean that's not fully
		// initialized yet: Many FactoryBeans just return null then.
		if (object == null && isSingletonCurrentlyInCreation(beanName)) {
			throw new BeanCurrentlyInCreationException(beanName, 
                "FactoryBean which is currently in creation returned null from getObject");
		}
		return object;
	}
```

在上面 完成类`object = factory.getObject();` 调用后 并没有 自己返回 而是进入 下面的方法

尽可能 保证所有bean初始化后 都会调用注册的BeanPostProcessor的postProessAfterInitialization进行处理

```java
protected Object postProcessObjectFromFactoryBean(Object object, String beanName) {
		return applyBeanPostProcessorsAfterInitialization(object, beanName);
	}
public Object applyBeanPostProcessorsAfterInitialization(Object existingBean, String beanName)throws BeansException {

		Object result = existingBean;
		for (BeanPostProcessor beanProcessor : getBeanPostProcessors()) {
			result = beanProcessor.postProcessAfterInitialization(result, beanName);
			if (result == null) {
				return result;
			}
		}
		return result;
	}
```

## 5.4 获取单例

经过第三步的 bean的实例化，正式得到了bean的实例。但是条件是：

“**缓存中预加载 出了对应的bean 或者 工厂实例，并且参数数组 不为空时**”，

可能 才会调用第三节的 `getObjectForBeanInstance(sharedInstance, name, beanName, null);`。

那么，满足条件“**缓存中 有对应的bean 或者 工厂实例 但是参数数组 必须不为空  或者 没有时 参数数组不确定 **”就会执行 4-8 点步骤。到第8 点时 也会 调用第三节的 `getObjectForBeanInstance(scopedInstance, name, beanName, mbd)`。

4步：非单例模式 单循环依赖判断 抛出异常

5步：获取工厂类实例：不为空，并且 没有找到 加载好的实例时，递归找到依赖bean（即 当前bean 被依赖了，需要通过先创建它的父bean，才会创建它，即是缓存有了，或者 它的父Bean构造工厂 已经被加载，都是被预加载的说明）

6步：获取mbd

7步：判断依赖 有依赖 再递归

8步：**加载单例** 或者 加载非循环依赖的原型

### 加载单例

获取共享实例？ 在进入 3 步中 方法？  没看懂

`sharedInstance = getSingleton(beanName, new ObjectFactory<Object>() {...}）；`

重载getSingLeton方法：

```java
public Object getSingleton(String beanName, ObjectFactory<?> singletonFactory) {
		Assert.notNull(beanName, "'beanName' must not be null");
    
		synchronized (this.singletonObjects) {
			Object singletonObject = this.singletonObjects.get(beanName);
             // 1. 再次判断 是否有 单例bean已经加载到 缓存中了。
			if (singletonObject == null) {
				if (this.singletonsCurrentlyInDestruction) {
					throw new BeanCreationNotAllowedException
                        (beanName,"Singleton bean creation not allowed while singletons of this factory are in destruction " +"(Do not request a bean from a BeanFactory in a destroy method implementation!)");
				}
                // 2.记录 beanName 的正在加载状态
				if (logger.isDebugEnabled()) {
					logger.debug("Creating shared instance of singleton bean '" +
                                 beanName + "'");
				}
                // 3.开始单例创建 再次确认beanName 是否有问题 并且标记beanName 为正在加载状态
				beforeSingletonCreation(beanName);
				boolean newSingleton = false;
				boolean recordSuppressedExceptions = (this.suppressedExceptions == null);
				if (recordSuppressedExceptions) {
                    // 控制意外情况？
					this.suppressedExceptions = new LinkedHashSet<Exception>();
				}
				try {
                    // 4. 通过传人的工厂类实例 创建单例bean
					singletonObject = singletonFactory.getObject();
					newSingleton = true;
				}
				catch (IllegalStateException ex) {
					// Has the singleton object implicitly appeared in the meantime ->
					// if yes, proceed with it since the exception indicates that state.
					singletonObject = this.singletonObjects.get(beanName);
					if (singletonObject == null) {
						throw ex;
					}
				}
				catch (BeanCreationException ex) {
					if (recordSuppressedExceptions) {
						for (Exception suppressedException : this.suppressedExceptions) {
							ex.addRelatedCause(suppressedException);
						}
					}
					throw ex;
				}
				finally {
					if (recordSuppressedExceptions) {
						this.suppressedExceptions = null;
					}
                    // 6. 结束创建单例bean 与 3对应 ，移除beanName正在被加载状态
					afterSingletonCreation(beanName);
				}
				if (newSingleton) {
                    // 加入缓存
					addSingleton(beanName, singletonObject);
				}
			}
            // 7. 返回处理结果
			return (singletonObject != NULL_OBJECT ? singletonObject : null);
		}
	}
```

`singletonObject = singletonFactory.getObject();`中就是调用参数中 内部类重写的creatBean方法。

## 5.5 准备创建bean

承接第 4 步：抽象类 AbstractAutowireCapableBeanFactory 的 creatBean方法。

```Java
protected Object createBean(String beanName, RootBeanDefinition mbd, Object[] args) throws BeanCreationException {
		if (logger.isDebugEnabled()) {
			logger.debug("Creating instance of bean '" + beanName + "'");
		}
		RootBeanDefinition mbdToUse = mbd;

		// Make sure bean class is actually resolved at this point, and
		// clone the bean definition in case of a dynamically resolved Class
		// which cannot be stored in the shared merged bean definition.
    // 1.根据beanName返回 类模板
		Class<?> resolvedClass = resolveBeanClass(mbd, beanName);
		if (resolvedClass != null && !mbd.hasBeanClass() && mbd.getBeanClassName() != null) {
			mbdToUse = new RootBeanDefinition(mbd);
			mbdToUse.setBeanClass(resolvedClass);
		}

		// Prepare method overrides.
    // 2.准备 重写方法
    // 在spring中并没有 override-method 标签 这里时对 lookup-method replace-method 进行处理
		try {
			mbdToUse.prepareMethodOverrides();
		}
		catch (BeanDefinitionValidationException ex) {
			throw new BeanDefinitionStoreException(mbdToUse.getResourceDescription(),
					beanName, "Validation of method overrides failed", ex);
		}

		try {
			// Give BeanPostProcessors a chance to return a proxy instead of the target bean instance.
            // 3. 给BeanPostProcessors一个机会返回代理实例  实例化的前置处理
			Object bean = resolveBeforeInstantiation(beanName, mbdToUse);
			if (bean != null) {
				return bean;
			}
		}
		catch (Throwable ex) {
			throw new BeanCreationException(mbdToUse.getResourceDescription(), beanName,
					"BeanPostProcessor before instantiation of bean failed", ex);
		}

    // 4.真正开始创建bean
		Object beanInstance = doCreateBean(beanName, mbdToUse, args);
		if (logger.isDebugEnabled()) {
			logger.debug("Finished creating instance of bean '" + beanName + "'");
		}
		return beanInstance;
	}
```

### 5.5.1 处理ovverride

```java
public void prepareMethodOverrides() throws BeanDefinitionValidationException {
		// Check that lookup methods exists.
    // 检查 lookup method 是否存在
		MethodOverrides methodOverrides = getMethodOverrides();
		if (!methodOverrides.isEmpty()) {
			Set<MethodOverride> overrides = methodOverrides.getOverrides();
			synchronized (overrides) {
				for (MethodOverride mo : overrides) {
					prepareMethodOverride(mo);
				}
			}
		}
	}
protected void prepareMethodOverride(MethodOverride mo) throws BeanDefinitionValidationException {
    // 获取该类中 配置了 lookup method 个数
		int count = ClassUtils.getMethodCountForName(getBeanClass(), mo.getMethodName());
		if (count == 0) {
			throw new BeanDefinitionValidationException(
					"Invalid method override: no method with name '" + mo.getMethodName() +
					"' on class [" + getBeanClassName() + "]");
		}
		else if (count == 1) {
			// Mark override as not overloaded, to avoid the overhead of arg type checking.
            // 标记 这个方法未必覆盖
			mo.setOverloaded(false);
		}
	}
```

lookup-method 和 replace-method两个，就是放在类bean定义中的methodOvverides属性中。

### 5.5.2 实例化的前置处理

`Object bean = resolveBeforeInstantiation(beanName, mbdToUse);`

在调用 doCreatBean前用了这个方法。

```java
	protected Object resolveBeforeInstantiation(String beanName, RootBeanDefinition mbd) {
		Object bean = null;
        // 如果没有在事先解析
		if (!Boolean.FALSE.equals(mbd.beforeInstantiationResolved)) {
			// Make sure bean class is actually resolved at this point.
            // 确保 beanclass 在这里 被解析
			if (!mbd.isSynthetic() && hasInstantiationAwareBeanPostProcessors()) {
                // 确定类型
				Class<?> targetType = determineTargetType(beanName, mbd);
				if (targetType != null) {
                    // 实例化 之前 的后置处理器
					bean = applyBeanPostProcessorsBeforeInstantiation(targetType, beanName);
					if (bean != null) {
                        // 应用 
						bean = applyBeanPostProcessorsAfterInitialization(bean, beanName);
					}
				}
			}
			mbd.beforeInstantiationResolved = (bean != null);
		}
		return bean;
	}
```

#### 1. 实例化之前的后置处理器

将AbstractBeanDefinition 转换为 BeanWrapper之前的处理。

给子类修改bean的机会，经过这个方法后，bean或许模式已经改变，或许成为代理bean，或许通过CGLIB（代码生成库）生成；[CGLIB](https://blog.csdn.net/danchu/article/details/70238002)

```java
protected Object applyBeanPostProcessorsBeforeInstantiation(Class<?> beanClass, String beanName) {
		for (BeanPostProcessor bp : getBeanPostProcessors()) {
			if (bp instanceof InstantiationAwareBeanPostProcessor) {
				InstantiationAwareBeanPostProcessor ibp = (InstantiationAwareBeanPostProcessor) bp;
				Object result = ibp.postProcessBeforeInstantiation(beanClass, beanName);
				if (result != null) {
					return result;
				}
			}
		}
		return null;
	}
```

#### 2.实例化之后的后置处理器

创建bean后尽可能保证postProcessAfterInitialization方法 应用到bean中，如果返回的bean不为空，这里就是注册进bean。

```java
public Object applyBeanPostProcessorsAfterInitialization(Object existingBean, String beanName)throws BeansException {

		Object result = existingBean;
		for (BeanPostProcessor beanProcessor : getBeanPostProcessors()) {
			result = beanProcessor.postProcessAfterInitialization(result, beanName);
			if (result == null) {
				return result;
			}
		}
		return result;
	}
```

## 5.6 循环依赖

spring中的循环依赖：

#### 1 有参构造循环依赖

即A类的有参构造需要B类实例，B类的有参构造需要A类的实例。这中时无法创建的。

另，bean配置构造器：

```xml 
<bean id="" class="">
    <constructor-arg name="" value=""></constructor-arg>
    <constructor-arg index="0" ref="指向其他bean的id 或别名" ></constructor-arg>
</bean>
```

#### 2 setter注入（必须单例）

即A类用无参构造，创建，属性需要set方法注入B类bean时，需要**单例**，并且此时的Abean被放在了 ”**bean池**“中，在取B类的无参创建B类bean，需要setter注入A类的实例，在 bean池 中找到A类半成品实例，注入。再将B实例注入A实例。

```xml 
<bean id="" class=""  scope="prototype">
    <property name="" value=""></property>
    <property name="" ref="别名"></property>
</bean>
```

#### 3 prototype范围的依赖注入

即非单例模式 的 setter 注入 ，无法完成，因为Spring容器不会缓存prototype（原型模式）的对象。

```xml
<bean id="" class=""  scope="prototype">
    <property name="" value=""></property>
    <property name="" ref="别名"></property><!-- 引用的会是同一个 -->
    <property name="" bean="别名"></property><!-- 引用的 是新 创建出的 -->
</bean>
```

## 5.7 创建bean

[spring依赖注入的方式](https://www.cnblogs.com/xiaoxi/p/5865330.html)

在经过5节，标记重写方法，和 

代理实例后 ``Object bean = resolveBeforeInstantiation(beanName, mbdToUse);` ，若里面改变了bean直接返回，没有的话,

就到了 `Object beanInstance = doCreateBean(beanName, mbdToUse, args);`

```java
protected Object doCreateBean(final String beanName, final RootBeanDefinition mbd, final Object[] args) throws BeanCreationException {

		// Instantiate the bean.
    // 1. 实例化包装器
		BeanWrapper instanceWrapper = null;
		if (mbd.isSingleton()) {
			instanceWrapper = this.factoryBeanInstanceCache.remove(beanName);
		}
		if (instanceWrapper == null) {
            // 2.根据bean的对应策略 简单创建实例
			instanceWrapper = createBeanInstance(beanName, mbd, args);
		}
    // 初步获取 简单创建的实例 
		final Object bean = (instanceWrapper != null ? instanceWrapper.getWrappedInstance() : null);
    // 创建实例的类型
		Class<?> beanType = (instanceWrapper != null ? instanceWrapper.getWrappedClass() : null);
    // 将 类型放在 mbd的 解析目标类型
		mbd.resolvedTargetType = beanType;

		// Allow post-processors to modify the merged bean definition.
		synchronized (mbd.postProcessingLock) {
			if (!mbd.postProcessed) {
				try {
                    // 3. 应用程序定义后置处理器
					applyMergedBeanDefinitionPostProcessors(mbd, beanType, beanName);
				}
				catch (Throwable ex) {
					throw new BeanCreationException(mbd.getResourceDescription(), beanName,
							"Post-processing of merged bean definition failed", ex);
				}
				mbd.postProcessed = true;
			}
		}

		// Eagerly cache singletons to be able to resolve circular references
		// even when triggered by lifecycle interfaces like BeanFactoryAware.
    // 4. 是否提前曝光 ： 单例 并且 允许循环依赖 并且 单例bean是当前正在创建的bean
		boolean earlySingletonExposure = (mbd.isSingleton() && 
                                          this.allowCircularReferences && 
                                          isSingletonCurrentlyInCreation(beanName));
    // 提前曝光 true 
		if (earlySingletonExposure) {
			if (logger.isDebugEnabled()) {
				logger.debug("Eagerly caching bean '" + beanName +
						"' to allow for resolving potential circular references");
			}
            // 为避免循环依赖，可以在bean初始化前 将 创建实例的工厂类加入 工厂中
			addSingletonFactory(beanName, new ObjectFactory<Object>() {
				@Override
				public Object getObject() throws BeansException {
                    
                    // aop就是在这里将advice动态植入bean中， 没有直接返回bean
					return getEarlyBeanReference(beanName, mbd, bean);
				}
			});
		}

		// Initialize the bean instance.
		Object exposedObject = bean;
		try {
            // 5. 对bean进行填充，将各个属性注入，其中可能有依赖的其他bean 所以会去递归初始化bean
			populateBean(beanName, mbd, instanceWrapper);
			if (exposedObject != null) {
				exposedObject = initializeBean(beanName, exposedObject, mbd);
			}
		}
		catch (Throwable ex) {
			if (ex instanceof BeanCreationException && 
                beanName.equals(((BeanCreationException) ex).getBeanName())) {
				throw (BeanCreationException) ex;
			}
			else {
				throw new BeanCreationException(mbd.getResourceDescription(), beanName, 
                    "Initialization of bean failed", ex);
			}
		}

    // 6. 提前曝光 
		if (earlySingletonExposure) {
			Object earlySingletonReference = getSingleton(beanName, false);
            // earlySingletonReference在有循环依赖时 才不为空 这里就是 有循环依赖时
			if (earlySingletonReference != null) {
                // exposedObject如果 没有在初始化方法中改变 也就没有被增强
				if (exposedObject == bean) {
					exposedObject = earlySingletonReference;
				}else if (!this.allowRawInjectionDespiteWrapping && 
                         hasDependentBean(beanName)) {
					String[] dependentBeans = getDependentBeans(beanName);
                    
					Set<String> actualDependentBeans = 
                        new LinkedHashSet<String>(dependentBeans.length);
                    
					for (String dependentBean : dependentBeans) {
                        // 检查依赖
						if (!removeSingletonIfCreatedForTypeCheckOnly(dependentBean)) {
							actualDependentBeans.add(dependentBean);
						}
					}
                    // 因为当bean创建 好时，它所依赖的bean一定的创建好了的；
                    // actualDependentBeans 不为空 说明，所依赖的bean 没有完全创建完成，有循环依赖
					if (!actualDependentBeans.isEmpty()) {
						throw new BeanCurrentlyInCreationException(beanName,
                                         "Bean with name '" + beanName + 
                                          "' has been injected into other beans [" +StringUtils.collectionToCommaDelimitedString(actualDependentBeans) +"] in its raw version as part of a circular reference, but has eventually been " +"wrapped. This means that said other beans do not use the final version of the " +"bean. This is often the result of over-eager type matching - consider using " +"'getBeanNamesOfType' with the 'allowEagerInit' flag turned off, for example.");
					}
				}
			}
		}

		// Register bean as disposable.
		try {
            // 7. 根据scope 创建bean
			registerDisposableBeanIfNecessary(beanName, bean, mbd);
		}
		catch (BeanDefinitionValidationException ex) {
			throw new BeanCreationException(
					mbd.getResourceDescription(), beanName, 
                "Invalid destruction signature", ex);
		}
    // 8.返回
		return exposedObject;
	}

```

逻辑过程：

1. 如果是单例 需要先清除缓存
2. 实例化bean，将BeanDefinition转换为BeanWrapper
   + 如果存在工厂方法则使用工厂方法进行初始化
   + 一个类有多个构造函数，根据构造函数的参数进行初始化
   + 没有工厂，没有多参数构造，就直接用默认构造。
3. MergedBeanDefinitionPostProcessors的应用：“bean合并后，Autowired注解 通过此方法实现 类型的预解析”
4. 依赖处理：只能处理 单例 setter 循环依赖。
5. 属性填充：
6. 判断 是否出现了 原型模式（prototype） 循环依赖
7. 注册DisposableBean：如果配置类destroy-method,这里需要注册，便于销毁时调用
8. 返回

### 5.7.1创建bean的实例

即上面逻辑中的第二步：`instanceWrapper = createBeanInstance(beanName, mbd, args);`

```java
protected BeanWrapper createBeanInstance(String beanName, RootBeanDefinition mbd, Object[] args) {
		// Make sure bean class is actually resolved at this point.
    // 获取创建的类型
		Class<?> beanClass = resolveBeanClass(mbd, beanName);

		if (beanClass != null 
            && !Modifier.isPublic(beanClass.getModifiers()) 
            && !mbd.isNonPublicAccessAllowed()) {
            
			throw new BeanCreationException(mbd.getResourceDescription(), 
                   beanName,"Bean class isn't public, and non-public access not allowed: " 
                                            + beanClass.getName());
		}

    // 如果 该bean的构造工厂方法 不为空  直接用工厂方法创建实例
		if (mbd.getFactoryMethodName() != null)  {
			return instantiateUsingFactoryMethod(beanName, mbd, args);
		}

		// Shortcut when re-creating the same bean...
		boolean resolved = false;
		boolean autowireNecessary = false;
		if (args == null) {
			synchronized (mbd.constructorArgumentLock) {
                // 多个有参构造 根据参数 调用构造
				if (mbd.resolvedConstructorOrFactoryMethod != null) {
					resolved = true;
					autowireNecessary = mbd.constructorArgumentsResolved;
				}
			}
		}
    // 如果已经解析过 则直接使用解析好的 构造函数
		if (resolved) {
			if (autowireNecessary) {
                // 构造函数 自动注入
				return autowireConstructor(beanName, mbd, null, null);
			}
			else {
                // ，默认构造函数
				return instantiateBean(beanName, mbd);
			}
		}

		// Need to determine the constructor...
    // 需要参数解析构造函数
		Constructor<?>[] ctors = determineConstructorsFromBeanPostProcessors(beanClass, beanName);
		if (ctors != null ||
			mbd.getResolvedAutowireMode() == RootBeanDefinition.AUTOWIRE_CONSTRUCTOR ||
			mbd.hasConstructorArgumentValues() || 
            !ObjectUtils.isEmpty(args))  {
            
            // 构造函数 自动注入
			return autowireConstructor(beanName, mbd, ctors, args);
            
		}

		// No special handling: simply use no-arg constructor.
    // ，默认构造函数
		return instantiateBean(beanName, mbd);
	}
```

1. 如果mbd中有factoryMethodName属性，即在配置bean中有factory-method属性，直接用
2. 解析构造函数，得到构造函数的实例 们，再判断，判断耗性能，直接用缓存，

#### 5.7.1.1 autowireConstructor

多参数构造；判断很复杂 `return autowireConstructor(beanName, mbd, ctors, args);`

```java
protected BeanWrapper autowireConstructor(
			String beanName, RootBeanDefinition mbd, Constructor<?>[] ctors, Object[] explicitArgs) {

		return new ConstructorResolver(this).autowireConstructor(beanName, mbd, ctors, explicitArgs);
	}
/***************************************************************************************
* 近200 行代码 
***************************************************************************************/

public BeanWrapper autowireConstructor(final String beanName, final RootBeanDefinition mbd,
			Constructor<?>[] chosenCtors, final Object[] explicitArgs) {

		BeanWrapperImpl bw = new BeanWrapperImpl();
		this.beanFactory.initBeanWrapper(bw);

		Constructor<?> constructorToUse = null;
		ArgumentsHolder argsHolderToUse = null;
		Object[] argsToUse = null;

    // 构造器参数 数组 不为空 就需要判断 具体的构造器
		if (explicitArgs != null) {
			argsToUse = explicitArgs;
		}else {
            // 没有默认的构造参数 即getBean时没有传人 指定方法的参数
			Object[] argsToResolve = null;
            // 尝试从缓存中 获取
			synchronized (mbd.constructorArgumentLock) {
				constructorToUse = (Constructor<?>) mbd.resolvedConstructorOrFactoryMethod;
                
				if (constructorToUse != null && mbd.constructorArgumentsResolved) {
                    // 缓存中有 就直接从缓存中拿取
					argsToUse = mbd.resolvedConstructorArguments;
					if (argsToUse == null) {
                        // 构造函数 参数
						argsToResolve = mbd.preparedConstructorArguments;
					}
				}
			}
            // 从缓存中 拿到了 想要的参数 
			if (argsToResolve != null) {
				argsToUse = resolvePreparedArguments(beanName, mbd, bw, constructorToUse, argsToResolve);
			}
		}
    
/***************************************************************************************
* 第一个判断结束 获取参数

* 如果 构造函数实例 为空时  或者 没能获取到参数 就需要从配置文件中获取了
***************************************************************************************/

    // 没有缓存的情况 即 没有确定 构造函数
		if (constructorToUse == null) {
			// 需要解决 构造函数的问题
			boolean autowiring = (chosenCtors != null ||
                                  mbd.getResolvedAutowireMode() == 
                                  RootBeanDefinition.AUTOWIRE_CONSTRUCTOR);
            
			ConstructorArgumentValues resolvedValues = null;

			int minNrOfArgs;
            // 构造函数中参数的个数
			if (explicitArgs != null) {
				minNrOfArgs = explicitArgs.length;
			}else {
                // 提前配置文件 配置的构造函数 参数
				ConstructorArgumentValues cargs = mbd.getConstructorArgumentValues();
                // 用于保存构造函数参数 的值
				resolvedValues = new ConstructorArgumentValues();
                // 解析到参数的个数
				minNrOfArgs = resolveConstructorArguments(
                    beanName, mbd, bw, cargs, resolvedValues);
			}
/*********************** 构造函数的个数确定了 **************************/
            
            // 获取全部的构造函数 进行判断
			Constructor<?>[] candidates = chosenCtors;
			if (candidates == null) {
				Class<?> beanClass = mbd.getBeanClass();
				try {
					candidates = (mbd.isNonPublicAccessAllowed() ?
							beanClass.getDeclaredConstructors() : 
                                  beanClass.getConstructors());
				}catch (Throwable ex) {
					throw new BeanCreationException(mbd.getResourceDescription(), beanName,
							"Resolution of declared constructors on bean Class [" + 
                                               beanClass.getName() +"] from ClassLoader [" + 
                                               beanClass.getClassLoader() + "] failed", ex);
				}
			}
            // 将通过 类目模板 获取的 构造函数 们 进排序 按照public中 参数数量 多到少 在非公共
			AutowireUtils.sortConstructors(candidates);
			
            int minTypeDiffWeight = Integer.MAX_VALUE;
			Set<Constructor<?>> ambiguousConstructors = null;
			
            LinkedList<UnsatisfiedDependencyException> causes = null;

            // 遍历 判断 构造器
			for (Constructor<?> candidate : candidates) {
				Class<?>[] paramTypes = candidate.getParameterTypes();

                // constructorToUse 找到了 并且 该构造器参数 小于 之前配置得到的个数 直接结束
				if (constructorToUse != null && argsToUse.length > paramTypes.length) {
					// Already found greedy constructor that can be satisfied ->
					// do not look any further, there are only less greedy constructors left.
					break;
				}
                // 参数 不等 跳过
				if (paramTypes.length < minNrOfArgs) {
					continue;
				}

				ArgumentsHolder argsHolder;
                // 解析值
				if (resolvedValues != null) {
					try {
                        // 如果有 参数 根据参数的 类型结构 构造对应结构
						String[] paramNames = ConstructorPropertiesChecker.
                            					evaluate(candidate, paramTypes.length);
						if (paramNames == null) {
                            // 获取参数名称探索器
							ParameterNameDiscoverer pnd = this.beanFactory.
                                						getParameterNameDiscoverer();
							if (pnd != null) {
                                // 获取指定构造函数的参数名称
								paramNames = pnd.getParameterNames(candidate);
							}
						}
                        // 根据名称 和数据结构 创建 参数持有者
						argsHolder = createArgumentArray(beanName,mbd, resolvedValues, 
                                           bw, paramTypes, paramNames,
   									getUserDeclaredConstructor(candidate), autowiring);
					}catch (UnsatisfiedDependencyException ex) {
						if (this.beanFactory.logger.isTraceEnabled()) {
							this.beanFactory.logger.trace(
									"Ignoring constructor [" + candidate 
                                		+ "] of bean '" + beanName + "': " + ex);
						}
						// Swallow and try next constructor.
						if (causes == null) {
							causes = new LinkedList<UnsatisfiedDependencyException>();
						}
						causes.add(ex);
						continue;
					}
				}else {
                    //构造函数 没有参数的情况
					if (paramTypes.length != explicitArgs.length) {
						continue;
					}
					argsHolder = new ArgumentsHolder(explicitArgs);
				}
                
/*********************** 确定构造函数 **************************/
                
                // 探测是否有不确定性的函数构造存在，例如不同构造函数，参数类型为父子关系
				int typeDiffWeight = (mbd.isLenientConstructorResolution() ?
								argsHolder.getTypeDifferenceWeight(paramTypes) : 
                                   argsHolder. getAssignabilityWeight(paramTypes));
				// Choose this constructor if it represents the closest match.
                // 如果 paramTypes 代表当前最接近的匹配则选择它为构造函数
				if (typeDiffWeight < minTypeDiffWeight) {
					constructorToUse = candidate;
					argsHolderToUse = argsHolder;
					argsToUse = argsHolder.arguments;
					minTypeDiffWeight = typeDiffWeight;
					ambiguousConstructors = null;
				}
				else if (constructorToUse != null && typeDiffWeight == minTypeDiffWeight) {
					if (ambiguousConstructors == null) {
						ambiguousConstructors = new LinkedHashSet<Constructor<?>>();
						ambiguousConstructors.add(constructorToUse);
					}
					ambiguousConstructors.add(candidate);
				}
			}

            // 当前构造函数 对象
			if (constructorToUse == null) {
				if (causes != null) {
					UnsatisfiedDependencyException ex = causes.removeLast();
					for (Exception cause : causes) {
						this.beanFactory.onSuppressedException(cause);
					}
					throw ex;
				}
				throw new BeanCreationException(mbd.getResourceDescription(), beanName,
						"Could not resolve matching constructor " +
						"(hint: specify index/type/name arguments for simple parameters to avoid type ambiguities)");
			}else if (ambiguousConstructors != null && 			
                      !mbd.isLenientConstructorResolution()) {
                
				throw new BeanCreationException(mbd.getResourceDescription(), beanName,
						"Ambiguous constructor matches found in bean '" + beanName + "' " +
						"(hint: specify index/type/name arguments for simple parameters to avoid type ambiguities): " + ambiguousConstructors);
			}

            // 明确的参数
			if (explicitArgs == null) {
                // 将解析的构造函数 加入到缓存
				argsHolderToUse.storeCache(mbd, constructorToUse);
			}
		}
/***************************************************************************************
* 第二个判断 
* 
***************************************************************************************/
		try {
			Object beanInstance;

			if (System.getSecurityManager() != null) {
				final Constructor<?> ctorToUse = constructorToUse;
				final Object[] argumentsToUse = argsToUse;
				beanInstance = AccessController.
                    doPrivileged(new PrivilegedAction<Object>() {
					@Override
					public Object run() {
						return beanFactory.getInstantiationStrategy().instantiate(
								mbd, beanName, beanFactory, ctorToUse, argumentsToUse);
					}
				}, beanFactory.getAccessControlContext());
			}
			else {
				beanInstance = this.beanFactory.getInstantiationStrategy().instantiate(
						mbd, beanName, this.beanFactory, constructorToUse, argsToUse);
			}

            // 将构造的实例加入BeanWrapper 中
			bw.setBeanInstance(beanInstance);
			return bw;
		}
		catch (Throwable ex) {
			throw new BeanCreationException(mbd.getResourceDescription(), beanName,
					"Bean instantiation via constructor failed", ex);
		}
	}
```
（1）构造函数的判断：

+ 根据传人的参数 `explicitArgs`判断，不为空是，就可以直接确定参数。因为，用户在获取bean时，除了指定名称获取，还可以，指定bean对应的构造函数、工厂方法。
+ 当 `explicitArgs`为空时，就需要从缓存中获取。
+ 以上都么有获取到，就从配置文件（BD）中获取; `mbd.getConstructorArgumentValues();`

（2）构造函数的确定：根据 构造函数、参数名称、参数类型、参数值都确定后，锁定构造函数对象。

（3）根据确定的构造函数 转换 对应的参数类型

（4）构造函数 参数的不确定性

（5）实例化bean

#### 5.7.1.2 instantiateBean（实例化bean）

无参构造： 实例 `return instantiateBean(beanName, mbd);`

```java
protected BeanWrapper instantiateBean(final String beanName, final RootBeanDefinition mbd) {
		try {
			Object beanInstance;
			final BeanFactory parent = this;
			if (System.getSecurityManager() != null) {
				beanInstance = 
                    AccessController.doPrivileged(new PrivilegedAction<Object>() {
					@Override
					public Object run() {
						return getInstantiationStrategy().instantiate(mbd, beanName, parent);
					}
				}, getAccessControlContext());
			}
			else {
				beanInstance = getInstantiationStrategy().instantiate(mbd, beanName, parent);
			}
			BeanWrapper bw = new BeanWrapperImpl(beanInstance);
			initBeanWrapper(bw);
			return bw;
		}
		catch (Throwable ex) {
			throw new BeanCreationException(
					mbd.getResourceDescription(), beanName, "Instantiation of bean failed", ex);
		}
	}
```

没什么特别的，就是进行了 实例化策略

#### 5.7.1.3 实例化策略

在有参构造 无参构造() 实例化bean 中 都进行类实例化bean 

`this.beanFactory.getInstantiationStrategy().instantiate(mbd, beanName, this.beanFactory, constructorToUse, argsToUse);`

`getInstantiationStrategy().instantiate(mbd, beanName, parent);`

```java
public Object instantiate(RootBeanDefinition bd, String beanName, BeanFactory owner) {
		// Don't override the class with CGLIB if no overrides.
		if (bd.getMethodOverrides().isEmpty()) {
			Constructor<?> constructorToUse;
			synchronized (bd.constructorArgumentLock) {
				constructorToUse = (Constructor<?>) bd.resolvedConstructorOrFactoryMethod;
				if (constructorToUse == null) {
					final Class<?> clazz = bd.getBeanClass();
					if (clazz.isInterface()) {
						throw new BeanInstantiationException(clazz, "Specified class is an interface");
					}
					try {
						if (System.getSecurityManager() != null) {
							constructorToUse = AccessController.doPrivileged(new PrivilegedExceptionAction<Constructor<?>>() {
								@Override
								public Constructor<?> run() throws Exception {
									return clazz.getDeclaredConstructor((Class[]) null);
								}
							});
						}
						else {
							constructorToUse =	clazz.getDeclaredConstructor((Class[]) null);
						}
						bd.resolvedConstructorOrFactoryMethod = constructorToUse;
					}
					catch (Throwable ex) {
						throw new BeanInstantiationException(clazz, "No default constructor found", ex);
					}
				}
			}
			return BeanUtils.instantiateClass(constructorToUse);
		}
		else {
			// Must generate CGLIB subclass.
			return instantiateWithMethodInjection(bd, beanName, owner);
		}
	}
```

`bd.getMethodOverrides().isEmpty()`主要的。判断当前类是否使用了 replace-method 或者 lookup-method 属性。

没有：直接根据前面已经有的数据进行bean的创建。

如果有：就必须使用动态代理的方式将两个特性对应的逻辑的拦截增强器设置进去。拦截器（AOP中）

### 5.7.2 记录创建bean的ObjectFactory  

回到本章主线第4点：

```java
// 4. 是否提前曝光 ： 单例 并且 允许循环依赖 并且 单例bean是当前正在创建的bean
		boolean earlySingletonExposure = (mbd.isSingleton() && 
                                          this.allowCircularReferences && 
                                          isSingletonCurrentlyInCreation(beanName));
    // 提前曝光 true 
		if (earlySingletonExposure) {
			if (logger.isDebugEnabled()) {
				logger.debug("Eagerly caching bean '" + beanName +
						"' to allow for resolving potential circular references");
			}
            // 为避免循环依赖，可以在bean初始化前 将 创建实例的工厂类加入 工厂中
			addSingletonFactory(beanName, new ObjectFactory<Object>() {
				@Override
				public Object getObject() throws BeansException {
                    
                    // aop就是在这里将advice动态植入bean中， 没有直接返回bean
					return getEarlyBeanReference(beanName, mbd, bean);
				}
			});
		}
```

单例 允许循环依赖 正在创建中 就允许类提前曝光，记录该BeanFactory。`addSingletonFactory`

### 5.7.3 属性注入 得到属性实例 保存到 pvs中

回到主线第5点：属性注入 `populateBean(beanName, mbd, instanceWrapper);`

经过前面，已经得到了一个，不完善的bean实例。

```java
protected void populateBean(String beanName, RootBeanDefinition mbd, BeanWrapper bw) {
		PropertyValues pvs = mbd.getPropertyValues();

		if (bw == null) {
			if (!pvs.isEmpty()) {
				throw new BeanCreationException(
						mbd.getResourceDescription(), beanName, 
                    "Cannot apply property values to null instance");
			}
			else {
				// 忽略属性填充阶段 在 空实例时
				return;
			}
		}

	// 给 InstantiationAwareBeanPostProcessors 最后一次机会 在化学设置前 改变 bean
    // 如 可用来支持属性注入的类型
		boolean continueWithPropertyPopulation = true;

    // mdb不是合成的 并且 有后置处理器
		if (!mbd.isSynthetic() && hasInstantiationAwareBeanPostProcessors()) {
            // 遍历全部后置处理器
			for (BeanPostProcessor bp : getBeanPostProcessors()) {
				if (bp instanceof InstantiationAwareBeanPostProcessor) {
					InstantiationAwareBeanPostProcessor ibp = 
                        (InstantiationAwareBeanPostProcessor) bp;
                    // 返回 是否 继续填充bean
					if (!ibp.postProcessAfterInstantiation(
                        bw.getWrappedInstance(), beanName)) {
                        
						continueWithPropertyPopulation = false;
						break;
					}
				}
			}
		}

    // 后置处理器 发出停止填充命令 终止本次属性注入
		if (!continueWithPropertyPopulation) {
			return;
		}

		if (mbd.getResolvedAutowireMode() == RootBeanDefinition.AUTOWIRE_BY_NAME ||
				mbd.getResolvedAutowireMode() == RootBeanDefinition.AUTOWIRE_BY_TYPE) {
			MutablePropertyValues newPvs = new MutablePropertyValues(pvs);

            // 根据名称 注入
			if (mbd.getResolvedAutowireMode() == RootBeanDefinition.AUTOWIRE_BY_NAME) {
				autowireByName(beanName, mbd, bw, newPvs);
			}

            // 根据类型注入
			if (mbd.getResolvedAutowireMode() == RootBeanDefinition.AUTOWIRE_BY_TYPE) {
				autowireByType(beanName, mbd, bw, newPvs);
			}

			pvs = newPvs;
		}

    // 后置处理器已经初始化
		boolean hasInstAwareBpps = hasInstantiationAwareBeanPostProcessors();
    // 需要检查依赖
		boolean needsDepCheck = (mbd.getDependencyCheck() != 
                                 RootBeanDefinition.DEPENDENCY_CHECK_NONE);

		if (hasInstAwareBpps || needsDepCheck) {
			PropertyDescriptor[] filteredPds = filterPropertyDescriptorsForDependencyCheck
                								(bw, mbd.allowCaching);
			if (hasInstAwareBpps) {
				for (BeanPostProcessor bp : getBeanPostProcessors()) {
					if (bp instanceof InstantiationAwareBeanPostProcessor) {
						InstantiationAwareBeanPostProcessor ibp = 
                            (InstantiationAwareBeanPostProcessor) bp;
						// 对所有需要依赖检查的属性 进行后置处理
                        pvs = ibp.postProcessPropertyValues
                            (pvs, filteredPds, bw.getWrappedInstance(), beanName);
						
                        if (pvs == null) {
							return;
						}
					}
				}
			}
			if (needsDepCheck) {
                // 检查依赖 3.0后放弃类depends-on属性
				checkDependencies(beanName, mbd, filteredPds, pvs);
			}
		}

    // 属性注入到bean中
		applyPropertyValues(beanName, mbd, bw, pvs);
	}

```

流程：

1. `ibp.postProcessAfterInstantiation`是否继续属性填充
2. 根据注入类型（byName/byType），提取依赖bean，同一存入PropertyValues
3. 再次判断是否 后置处理
4. 将propertyValues中所有的属性注入到BeanWapper中。

#### 5.7.3.1 autowireByName 

`<bean id="customer" class="com.lei.common.Customer" autowire="byName" />`

```java
protected void autowireByName(String beanName, AbstractBeanDefinition mbd, BeanWrapper bw, MutablePropertyValues pvs) {

    // 寻找bw中需要依赖注入的属性
		String[] propertyNames = unsatisfiedNonSimpleProperties(mbd, bw);
		for (String propertyName : propertyNames) {
			if (containsBean(propertyName)) {
                // 递归得到相关 的bean
				Object bean = getBean(propertyName);
                // 添加经pvs
				pvs.add(propertyName, bean);
                // 依赖注册
				registerDependentBean(propertyName, beanName);
				if (logger.isDebugEnabled()) {
					logger.debug("Added autowiring by name from bean name '" + beanName +
							"' via property '" + propertyName + "' to bean named '" + propertyName + "'");
				}
			}
			else {
				if (logger.isTraceEnabled()) {
					logger.trace("Not autowiring property '" + propertyName + "' of bean '" + beanName +
							"' by name: no matching bean found");
				}
			}
		}
	}
```

#### 5.7.3.2 autowireByType

autowireByType 与 autowireByName 相似但却复杂。

`<bean id="customer" class="com.lei.common.Customer" autowire="byType" />`

```java
protected void autowireByType(String beanName, AbstractBeanDefinition mbd, BeanWrapper bw, MutablePropertyValues pvs) {

		TypeConverter converter = getCustomTypeConverter();
		if (converter == null) {
			converter = bw;
		}

		Set<String> autowiredBeanNames = new LinkedHashSet<String>(4);
    // 还是 找到 bw 需要依赖注入的 属性
		String[] propertyNames = unsatisfiedNonSimpleProperties(mbd, bw);
		for (String propertyName : propertyNames) {
			try {
				PropertyDescriptor pd = bw.getPropertyDescriptor(propertyName);
				// 不要尝试为Object 类型注入，没有意义
				if (Object.class != pd.getPropertyType()) {
                    // 探测 指定属性 的set方法
					MethodParameter methodParam = BeanUtils.getWriteMethodParameter(pd);
					// 在后置处理器的情况下，不允许过早得进行类型匹配
					boolean eager = !PriorityOrdered.class.
                        isAssignableFrom(bw.getWrappedClass());
                    
					DependencyDescriptor desc = 
                        new AutowireByTypeDependencyDescriptor(methodParam, eager);
                    
                    // 解析 beanName 所匹配的值，并把值保存到 autowiredBeanNames 中
                    // @Autowire private List<A> alist; 会匹配所有的A类型bean，并自动注入
					Object autowiredArgument = 
                        resolveDependency(desc, beanName, autowiredBeanNames, converter);
                    
					if (autowiredArgument != null) {
						pvs.add(propertyName, autowiredArgument);
					}
					for (String autowiredBeanName : autowiredBeanNames) {
                        // 依赖注入
						registerDependentBean(autowiredBeanName, beanName);
						if (logger.isDebugEnabled()) {
							logger.debug("Autowiring by type from bean name '" + 
                                         beanName + "' via property '" +
                                         propertyName + "' to bean named '" +
                                         autowiredBeanName + "'");
						}
					}
					autowiredBeanNames.clear();
				}
			}
			catch (BeansException ex) {
				throw new UnsatisfiedDependencyException(mbd.getResourceDescription(), beanName, propertyName, ex);
			}
		}
	}
```

1. 根据名称寻找bw中需要依赖注入的属性名
2. 属性名得到类型，进行类型匹配判断，得到需要注入的属性
3. 遍历这些类型，寻找类型匹配的bean。
   + spring提供了对集合类型的支持：`@Autowire private List<A> alist;`也就会把所有找到的A类型bean注入到集合中

对类型匹配的逻辑：` resolveDependency(desc, beanName, autowiredBeanNames, converter);`

```java
public Object resolveDependency(DependencyDescriptor descriptor, String requestingBeanName,
			Set<String> autowiredBeanNames, TypeConverter typeConverter) throws BeansException {

		descriptor.initParameterNameDiscovery(getParameterNameDiscoverer());
		if (javaUtilOptionalClass == descriptor.getDependencyType()) {
           // javaUtilOptionalClass类型 特殊处理
			return new OptionalDependencyFactory().createOptionalDependency(descriptor, requestingBeanName);
		}
		else if (ObjectFactory.class == descriptor.getDependencyType() ||
				ObjectProvider.class == descriptor.getDependencyType()) {
            // ObjectFactory ObjectProvider 类型 特殊处理
			return new DependencyObjectProvider(descriptor, requestingBeanName);
		}
		else if (javaxInjectProviderClass == descriptor.getDependencyType()) {
             // javaxInjectProviderClass 类型 特殊处理
			return new Jsr330ProviderFactory().createDependencyProvider(descriptor, requestingBeanName);
		}
		else {
			Object result = getAutowireCandidateResolver().
                	getLazyResolutionProxyIfNecessary(descriptor, requestingBeanName);
			if (result == null) {
                // 进行逻辑处理
				result = doResolveDependency(descriptor, 
                                    requestingBeanName, autowiredBeanNames, typeConverter);
			}
			return result;
		}
	}

```

逻辑处理：这段代码在4.x 与 3.x 区别很大

```java
public Object doResolveDependency(DependencyDescriptor descriptor, String beanName,
			Set<String> autowiredBeanNames, TypeConverter typeConverter) throws BeansException {

		InjectionPoint previousInjectionPoint = ConstructorResolver.
            									setCurrentInjectionPoint(descriptor);
		try {
			Object shortcut = descriptor.resolveShortcut(this);
			if (shortcut != null) {
				return shortcut;
			}

			Class<?> type = descriptor.getDependencyType();
            // 新增的注解Value 的支持
			Object value = getAutowireCandidateResolver().getSuggestedValue(descriptor);
			if (value != null) {
				if (value instanceof String) {
					String strVal = resolveEmbeddedValue((String) value);
					BeanDefinition bd = (beanName != null && containsBean(beanName) ?
                                         getMergedBeanDefinition(beanName) : null);
					value = evaluateBeanDefinitionString(strVal, bd);
				}
				TypeConverter converter = (typeConverter != null ? typeConverter : 
                                           getTypeConverter());
				return (descriptor.getField() != null ?
						converter.convertIfNecessary(value, type, descriptor.getField()) :
						converter.convertIfNecessary
                        (value, type, descriptor.getMethodParameter()));
			}

            // 处理 多个 bean 即 数组 集合  map 情况的属性
			Object multipleBeans = resolveMultipleBeans
                (descriptor, beanName, autowiredBeanNames, typeConverter);
			if (multipleBeans != null) {
				return multipleBeans;
			}

            // 类型 为正常的 非多个 bean的属性类型时
            // 匹配到合适 可以注入的 bean
			Map<String, Object> matchingBeans = findAutowireCandidates(beanName, type, descriptor);
			if (matchingBeans.isEmpty()) {
				if (isRequired(descriptor)) {
					raiseNoMatchingBeanFound(type, descriptor.getResolvableType(), descriptor);
				}
				return null;
			}

            // 注入属性 的名称
			String autowiredBeanName;
            // 注入属性 的实例
			Object instanceCandidate;

			if (matchingBeans.size() > 1) {
                // 确定 注入的名称
				autowiredBeanName = determineAutowireCandidate(matchingBeans, descriptor);
				if (autowiredBeanName == null) {
                    // matchingBeans 没有需要的 注入的实例
					if (isRequired(descriptor) || !indicatesMultipleBeans(type)) {
						return descriptor.resolveNotUnique(type, matchingBeans);
					}
					else {
                        //如果可选 Collection/map ,就默认忽略唯一情况
                        // 它可能时一个含有多个空实例 的集合
                        // 在 4.3 之前没有 spring甚至没有寻找收集bean
						return null;
					}
				}
				instanceCandidate = matchingBeans.get(autowiredBeanName);
			}
			else {
				// 只有一个时 直接获取
				Map.Entry<String, Object> entry = matchingBeans.entrySet().
                    								iterator().next();
				autowiredBeanName = entry.getKey();
				instanceCandidate = entry.getValue();
			}

			if (autowiredBeanNames != null) {
                // 将属性名添加进去
				autowiredBeanNames.add(autowiredBeanName);
			}
			return (instanceCandidate instanceof Class ?
					descriptor.resolveCandidate(autowiredBeanName, type, this) : 
                    instanceCandidate);
		}
		finally {
			ConstructorResolver.setCurrentInjectionPoint(previousInjectionPoint);
		}
	}
```

`Object multipleBeans = resolveMultipleBeans(descriptor, beanName, autowiredBeanNames, typeConverter);`多个时

判断类型匹配：

```java
private Object resolveMultipleBeans(DependencyDescriptor descriptor, String beanName,
			Set<String> autowiredBeanNames, TypeConverter typeConverter) {

		Class<?> type = descriptor.getDependencyType();
    // 属性 是 数组类型
		if (type.isArray()) {
			Class<?> componentType = type.getComponentType();
           
			ResolvableType resolvableType = descriptor.getResolvableType();
			Class<?> resolvedArrayType = resolvableType.resolve();
			if (resolvedArrayType != null && resolvedArrayType != type) {
				type = resolvedArrayType;
				componentType = resolvableType.getComponentType().resolve();
			}
			if (componentType == null) {
				return null;
			}
            // 根据属性类型 找到FactoryBean中所有匹配的 bean
            // 返回值K-V结构，V为实例化Bean（通过getBean返回的） ,
			Map<String, Object> matchingBeans = findAutowireCandidates(beanName, componentType,new MultiElementDescriptor(descriptor));
			if (matchingBeans.isEmpty()) {
				return null;
			}
			if (autowiredBeanNames != null) {
				autowiredBeanNames.addAll(matchingBeans.keySet());
			}
			TypeConverter converter = (typeConverter != null ?
                                       typeConverter : getTypeConverter());
            
            // 通过转换器将bean转换成对应的类型
			Object result = converter.convertIfNecessary(matchingBeans.values(), type);
            
			if (getDependencyComparator() != null && result instanceof Object[]) {
				Arrays.sort((Object[]) result, adaptDependencyComparator(matchingBeans));
			}
			return result;
		}
    // 属性 是 Collection 类型 即 list set 等
		else if (Collection.class.isAssignableFrom(type) && type.isInterface()) {
			Class<?> elementType = descriptor.getResolvableType().
                					asCollection().resolveGeneric();
			if (elementType == null) {
				return null;
			}
			Map<String, Object> matchingBeans = findAutowireCandidates(beanName, elementType,
					new MultiElementDescriptor(descriptor));
			if (matchingBeans.isEmpty()) {
				return null;
			}
			if (autowiredBeanNames != null) {
				autowiredBeanNames.addAll(matchingBeans.keySet());
			}
			TypeConverter converter = (typeConverter != null ? typeConverter : getTypeConverter());
			Object result = converter.convertIfNecessary(matchingBeans.values(), type);
			if (getDependencyComparator() != null && result instanceof List) {
				Collections.sort((List<?>) result, adaptDependencyComparator(matchingBeans));
			}
			return result;
		}
    // 属性 是 Map类型
		else if (Map.class == type) {
			ResolvableType mapType = descriptor.getResolvableType().asMap();
			Class<?> keyType = mapType.resolveGeneric(0);
			if (String.class != keyType) {
				return null;
			}
			Class<?> valueType = mapType.resolveGeneric(1);
			if (valueType == null) {
				return null;
			}
			Map<String, Object> matchingBeans = findAutowireCandidates(beanName, valueType,
					new MultiElementDescriptor(descriptor));
			if (matchingBeans.isEmpty()) {
				return null;
			}
			if (autowiredBeanNames != null) {
				autowiredBeanNames.addAll(matchingBeans.keySet());
			}
			return matchingBeans;
		}
    // 其他 即在doResolveDependency中 继续往下走
		else {
			return null;
		}
	}
```

#### 5.7.3.3 applyPropertyValues pvs 到 bw中

将属性注入到bean中：

到这里，已经完成了属性的获取。

```java
protected void applyPropertyValues(String beanName, BeanDefinition mbd, BeanWrapper bw, PropertyValues pvs) {
		if (pvs == null || pvs.isEmpty()) {
			return;
		}

		if (System.getSecurityManager() != null && bw instanceof BeanWrapperImpl) {
			((BeanWrapperImpl) bw).setSecurityContext(getAccessControlContext());
		}

		MutablePropertyValues mpvs = null;
		List<PropertyValue> original;

		if (pvs instanceof MutablePropertyValues) {
			mpvs = (MutablePropertyValues) pvs;
            // 如果mpvs中的属性 已经转换成 对应的类型时，直接 注入 bw 中。
			if (mpvs.isConverted()) {
				// Shortcut: use the pre-converted values as-is.
				try {
					bw.setPropertyValues(mpvs);
					return;
				}
				catch (BeansException ex) {
					throw new BeanCreationException(
							mbd.getResourceDescription(), 
                        	beanName, "Error setting property values", ex);
				}
			}
			original = mpvs.getPropertyValueList();
		}
		else {
            // 如果没有 不是用工具类转，而是直接使用原始的属性获取方法
			original = Arrays.asList(pvs.getPropertyValues());
		}

		TypeConverter converter = getCustomTypeConverter();
		if (converter == null) {
			converter = bw;
		}
    // 获取对应解析器
		BeanDefinitionValueResolver valueResolver = new BeanDefinitionValueResolver(this, beanName, mbd, converter);

		// Create a deep copy, resolving any references for values.
		List<PropertyValue> deepCopy = new ArrayList<PropertyValue>(original.size());
		boolean resolveNecessary = false;
    // 遍历属性 将属性转换为对应类型 
		for (PropertyValue pv : original) {
            // 是转换的
			if (pv.isConverted()) {
				deepCopy.add(pv);
			}
			else {
				String propertyName = pv.getName();
				Object originalValue = pv.getValue();
				Object resolvedValue = valueResolver.resolveValueIfNecessary(pv, originalValue);
				Object convertedValue = resolvedValue;
				boolean convertible = bw.isWritableProperty(propertyName) &&
						!PropertyAccessorUtils.isNestedOrIndexedProperty(propertyName);
				if (convertible) {
					convertedValue = convertForProperty(resolvedValue, propertyName, bw, converter);
				}
				// Possibly store converted value in merged bean definition,
				// in order to avoid re-conversion for every created bean instance.
				if (resolvedValue == originalValue) {
					if (convertible) {
						pv.setConvertedValue(convertedValue);
					}
					deepCopy.add(pv);
				}
				else if (convertible && originalValue instanceof TypedStringValue &&
						!((TypedStringValue) originalValue).isDynamic() &&
						!(convertedValue instanceof Collection || ObjectUtils.isArray(convertedValue))) {
					pv.setConvertedValue(convertedValue);
					deepCopy.add(pv);
				}
				else {
					resolveNecessary = true;
					deepCopy.add(new PropertyValue(pv, convertedValue));
				}
			}
		}
		if (mpvs != null && !resolveNecessary) {
			mpvs.setConverted();
		}

		// Set our (possibly massaged) deep copy.
    // 真正将 属性 设置经 bw 中
		try {
			bw.setPropertyValues(new MutablePropertyValues(deepCopy));
		}
		catch (BeansException ex) {
			throw new BeanCreationException(
					mbd.getResourceDescription(), beanName, "Error setting property values", ex);
		}
	}
```

### 5.7.4 初始化bean

配置bean时有一个 init-method 属性 以及 distory-method，就在这里指向。即bean 实例化之前调用。

```xml
 <bean id="stu" class="cn.demo.service.impl.StudentServiceImpl" init-method="inits" destroy-method="shutdown"></bean>
```

回到本章主线： 属性注入后 `exposedObject = initializeBean(beanName, exposedObject, mbd);`

```java
	protected Object initializeBean(final String beanName, final Object bean, RootBeanDefinition mbd) {
		if (System.getSecurityManager() != null) {
			AccessController.doPrivileged(new PrivilegedAction<Object>() {
				@Override
				public Object run() {
				// 
					invokeAwareMethods(beanName, bean);
					return null;
				}
			}, getAccessControlContext());
		}
		else {
			invokeAwareMethods(beanName, bean);
		}

		Object wrappedBean = bean;
		if (mbd == null || !mbd.isSynthetic()) {
		// 应用后置处理器
			wrappedBean = applyBeanPostProcessorsBeforeInitialization
							(wrappedBean, beanName);
		}

		try {
		// 调用 用户设置的 initMethod 方法
			invokeInitMethods(beanName, wrappedBean, mbd);
		}
		catch (Throwable ex) {
			throw new BeanCreationException(
					(mbd != null ? mbd.getResourceDescription() : null),
					beanName, "Invocation of init method failed", ex);
		}
		if (mbd == null || !mbd.isSynthetic()) {
		// 应用后置处理器
			wrappedBean = applyBeanPostProcessorsAfterInitialization
							(wrappedBean, beanName);
		}
		return wrappedBean;
	}
```
虽然 这个方法 是 在初始化方法 有时，才会调用，但还有其他逻辑会调用！
#### 5.7.4.1 激活Aware方法
首先了解Aware的用法：Spring提供的Aware 相关接口（BeanFactoryAware，ApplicationContextAware，ResourceLoaderAware，ServletContextAware），实现这些接口的bean被初始化后，可以获取一些资源。实现BeanFactoryAware，就会获取容器的BeanFactory实例。
```java
public class TestBean implements BeanFactoryAware{
    
    private BeanFactory fac;
    
    @Oerride
    public void setBeanFactory(BeanFactory beanFactory) throws BeanException{
    // Aware 就会 执行这个方法，将fac赋值。
        this.fac = beanFactory;
    }
}
```
代码：`invokeAwareMethods(beanName, bean);`
```java
	private void invokeAwareMethods(final String beanName, final Object bean) {
		if (bean instanceof Aware) {
			if (bean instanceof BeanNameAware) {
				((BeanNameAware) bean).setBeanName(beanName);
			}
			if (bean instanceof BeanClassLoaderAware) {
				((BeanClassLoaderAware) bean).setBeanClassLoader(getBeanClassLoader());
			}
			if (bean instanceof BeanFactoryAware) {
				((BeanFactoryAware) bean).setBeanFactory(AbstractAutowireCapableBeanFactory.this);
			}
		}
	}
```
#### 5.7.4.2 处理器的运用
`BeanPostProcessor`是spring框架给用户自己 去更改 或者 扩展的，除类`BeanPostProcessor`还有其他的`PostProessor`，基本都是继承自`PostProcessor`。
PostProcessor们的使用我位置就在这里，并且分前后。

```java
// 基本使用类似 Aware
public class BeanPostProessor implements BeanPostProcessor {

	@Override
	public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
		// TODO Auto-generated method stub
		return null;
	}

}
```

`applyBeanPostProcessorsBeforeInitialization(wrappedBean, beanName);`
```java
// 前置处理器
	public Object applyBeanPostProcessorsBeforeInitialization(Object existingBean, String beanName)
			throws BeansException {

		Object result = existingBean;
		for (BeanPostProcessor beanProcessor : getBeanPostProcessors()) {
		// 调用 我们实现 的前置处理器，进行处理
			result = beanProcessor.
					postProcessBeforeInitialization(result, beanName);
			if (result == null) {
				return result;
			}
		}
		return result;
	}
// 后置处理器
	public Object applyBeanPostProcessorsAfterInitialization(Object existingBean, String beanName)
			throws BeansException {

		Object result = existingBean;
		for (BeanPostProcessor beanProcessor : getBeanPostProcessors()) {
			result = beanProcessor.postProcessAfterInitialization(result, beanName);
			if (result == null) {
				return result;
			}
		}
		return result;
	}
```
#### 5.7.4.3 激活自定义的initMethod方法
出了在配置文件中 添加 init-method 属性 ，还可以 实现 InitalizingBean 接口
```java
public class InitBean implements InitializingBean {

	@Override
	public void afterPropertiesSet() throws Exception {
		// TODO Auto-generated method stub

	}

}
```
不过 `afterPropertiesSet` 先执行，而自定义的init-method 放后执行。
`invokeInitMethods(beanName, wrappedBean, mbd);`
```java
	protected void invokeInitMethods(String beanName, final Object bean, RootBeanDefinition mbd) throws Throwable {

// 先检查是否实现类 InitializeBean ，是的化 先调用
		boolean isInitializingBean = (bean instanceof InitializingBean);
		if (isInitializingBean && (mbd == null || 
			!mbd.isExternallyManagedInitMethod("afterPropertiesSet"))) {
			if (logger.isDebugEnabled()) {
				logger.debug("Invoking afterPropertiesSet() on bean with name '" + beanName + "'");
			}
			if (System.getSecurityManager() != null) {
				try {
					AccessController.doPrivileged(new PrivilegedExceptionAction<Object>() {
						@Override
						public Object run() throws Exception {
							((InitializingBean) bean).afterPropertiesSet();
							return null;
						}
					}, getAccessControlContext());
				}
				catch (PrivilegedActionException pae) {
					throw pae.getException();
				}
			}
			else {
			// 属性初始化 后 执行
				((InitializingBean) bean).afterPropertiesSet();
			}
		}

		if (mbd != null) {
			String initMethodName = mbd.getInitMethodName();
			if (initMethodName != null && 
							!(isInitializingBean && "afterPropertiesSet".
											equals(initMethodName)) &&
					!mbd.isExternallyManagedInitMethod(initMethodName)) {
				// 执行 自定义的 初始化方法
				invokeCustomInitMethod(beanName, bean, mbd);
			}
		}
	}
```
### 5.7.5 注册 DisposableBean

`registerDisposableBeanIfNecessary(beanName, bean, mbd);`

spring中不单提供类初始化方法扩展，还有销毁方法扩展的入口，除了 `destroy-method`方属性配置外，还可以实现 `DestructionAwareBeanPostProcessor`,在以下执行

```java
	protected void registerDisposableBeanIfNecessary(String beanName, Object bean, RootBeanDefinition mbd) {
        
		AccessControlContext acc = (System.getSecurityManager() != null ? getAccessControlContext() : null);
		if (!mbd.isPrototype() && requiresDestruction(bean, mbd)) {
			if (mbd.isSingleton()) {
				// 注册执行所有销毁的DisposableBean实现
				// 给所有的bean 使用 DestructionAwareBeanPostProcessors,
				// DisposableBean接口，自定义destroy方法。
                // 单例模式下， 注册需要销毁的bean， 此方法中会处理 实现DisposableBean 的bean
				registerDisposableBean(beanName,
						new DisposableBeanAdapter(bean, beanName, mbd, getBeanPostProcessors(), acc));
			}
			else {
				// A bean with a custom scope...
				// 自定义的 scope 时
				Scope scope = this.scopes.get(mbd.getScope());
				if (scope == null) {
					throw new IllegalStateException("No Scope registered for scope name '" + mbd.getScope() + "'");
				}
				scope.registerDestructionCallback(beanName,
						new DisposableBeanAdapter(bean, beanName, mbd, getBeanPostProcessors(), acc));
			}
		}
	}
```

