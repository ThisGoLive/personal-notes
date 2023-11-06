[[TOC]]

# 1. Spring 的整体架构

#### Core Container（核心容器）

包含

- Core：spring 核心工具类。Spring 的其它组件都需要调用它
- Beans ：所有应用要用。包含访问的配置文件，创建 和管理bean。 IOC—Inversion of Control，即“控制反转” 。 DI—Dependency Injection，即“依赖注入” 。[ IOC/DI](http://jinnianshilongnian.iteye.com/blog/1413846)
- Context ：提供了一种类型JNDI注册器的框架式访问方法。并继承了Bean的特性，为核心提供了大量扩展。
- Experession Language：提供一个强大的表达式语言用于在运行时查询和操作对象。

#### Data Access/Integration

包含

+ JDBC：提供JDBC抽象层，包含了Spring对JDBC数据访问进行封装的所有类。
+ ORM：对象-关系映射。提供了一个交互层。
+ OXM：对Object/XML映射实现的抽象层，包含实现：JAXB Castor XMLBeans JiBX XStream
+ JMS：制造 和消费消息 的 特性
+ Transaction：支持编程和声明性的事务管理，这些事务必须实现特定的接口，并且对所有的POJO（普通Java类）都适用。

#### Web

+ Web：提供基础的面向Web的集成特性，
+ Web Servlet：包含Spring的MVC实现
+ Web Struts：提供对Struts的支持，在3.0中 反对的
+ Web Porlet：提供用于Portlet 环境 和web servlet 模块的mvc实现。

#### AOP

+ Aspects ：对Aspect J的集成支持
+ Instrumentation ： 

# 2. 容器的基本实现

## 2.1 容器的基本用法

管理Bean。让Bean脱离原本的代码，有容器来进行创建。就有了BeanFactory作为所管理bean的工厂。

## 2.2功能分析

1. 读取配置文件 xx.xml （ConfigReader 读取配置文件 存放再内存中）
2. 根据配置文件中的信息，找到信息，实例化对象。（ReflectionUtil 根据配置文件 反射创建出实例）
3. 调用返回。（App 逻辑调用）

## 2.3 工程搭建

必须Core

## 2.4 结构 

### 2.4.1 结层级构

### 2.4.2 核心类介绍

最核心的连个类：

#### DefaultListableBeanFactory

XmlBeanFactory 继承 DefaultListableBeanFactory。DefaultListableBeanFactory是整个bean加载的核心部分，是Sping注册加载bean的实现。

而XmlBeanFactory 使用了自定义的XML 读取器。主要用于对xml文档中读取BeanDefinition，其余的对bean的注册和获取都是继承至父类DefaultListableBeanFactory，唯一不同就是有reader属性。

#### XmlBeanDefinitionReder

1. 通过继承AbstractBeanDefinitionReader方法，来使用ResourLoader将资源文件路径转化为Resource文件。
2. 通过DocumentLoader对Resource文件进行转化成Document文件。
3. 通过实现接口BeanDefinitionDocumentReader的DefaultBeanDefinitionDocumentReader类，对Document进行解析，并使用BeanDefinitionParserDelegate对Element解析。

## 2.5 容器的基础 XmlBeanFactory

`BeanFactory fb = new XmlBeanFactory( new ClassPathResource( " beanxxx.xml" ) )`

运行顺序一目了然：new ClassPathResource( " beanxxx.xml" ) 创建了Rserource ,再构造工厂类。

### 2.5.1 配置文件封装

#### Rserource 创建

`new ClassPathResource( " beanxxx.xml" )`做了什么？

在Java中，把不同来源的资源抽象成为 **URL** ，通过注册不同的handler（URL StreamHandler）来处理和操作这些资源，一般handler 的类型使用不同前缀（协议、protocol）来识别，如：“file:”、“http:”、 "jar:"。但是URL没有默认的定义 于Classpath 或者ServletContext等资源的handler，虽然可以自己实现，但需要了解URL实现机制。

而Spring对其内部使用到的资源实现了自己抽象结构：Resource。

Resource的实现：FileSystemResource、。。。ClassPathResource

我们自己也可以调用,使用得到inputStream，照一般使用。

#### 初始化 XmlBeanFactory (在4.3.x 中被标记为过时)

```java
	public XmlBeanFactory(Resource resource) throws BeansException {
		this(resource, null);
	}

	
	public XmlBeanFactory(Resource resource, BeanFactory parentBeanFactory) throws BeansException {
		super(parentBeanFactory);
		this.reader.loadBeanDefinitions(resource);
	}
```

当Spring加载A的bean时，A中B属性若没有初始化，Spring也会对之初始化。但有例外，若B实现了BeanNameAware接口就不会。

#### 加载 bean

`this.reader.loadBeanDefinitions(resource);`这句就是，XMLBeanFactory的不同点，XmlBeanDefinitionReader类，来获取Document。

1. 封装文件。进入XmlBeanDefinitionReader后，将Resource封装经EncodeResource.
2. 获取输入流。从传入的Resource中获取InputResource 并构造带有 编码的的 InputResource
3. 通过构造的InputSource 实例和Resource实例调用doLoadBeanDefinitions

```java

public int loadBeanDefinitions(Resource resource) throws BeanDefinitionStoreException{
    // 构造 带编码的 Resource
	return loadBeanDefinitions(new EncodedResource(resource));
}

public int loadBeanDefinitions(EncodedResource encodedResource) throws BeanDefinitionStoreException {
		Assert.notNull(encodedResource, "EncodedResource must not be null");
		if (logger.isInfoEnabled()) {
			logger.info("Loading XML bean definitions from " + encodedResource.getResource());
		}

		Set<EncodedResource> currentResources = this.resourcesCurrentlyBeingLoaded.get();
		if (currentResources == null) {
			currentResources = new HashSet<EncodedResource>(4);
			this.resourcesCurrentlyBeingLoaded.set(currentResources);
		}
		if (!currentResources.add(encodedResource)) {
			throw new BeanDefinitionStoreException(
					"Detected cyclic loading of " + encodedResource + " - check your import definitions!");
		}
		try {
			InputStream inputStream = encodedResource.getResource().getInputStream();
			try {
				InputSource inputSource = new InputSource(inputStream);
				if (encodedResource.getEncoding() != null) {
					inputSource.setEncoding(encodedResource.getEncoding());
				}
                // 前面构造好了 带编码的 Resource  现在 进入真正的核心逻辑
				return doLoadBeanDefinitions(inputSource, encodedResource.getResource());
			}
			finally {
				inputStream.close();
			}
		}
		catch (IOException ex) {
			throw new BeanDefinitionStoreException(
					"IOException parsing XML document from " + encodedResource.getResource(), ex);
		}
		finally {
			currentResources.remove(encodedResource);
			if (currentResources.isEmpty()) {
				this.resourcesCurrentlyBeingLoaded.remove();
			}
		}
	}
```
###### **核心逻辑部分**

```java
// 核心逻辑部分
protected int doLoadBeanDefinitions(InputSource inputSource, Resource resource)
			throws BeanDefinitionStoreException {
		try {
            // 获取Document
			Document doc = doLoadDocument(inputSource, resource);
			return registerBeanDefinitions(doc, resource);
		}
		catch (Exception ex) {
			throw ex;
		}
	}

protected Document doLoadDocument(InputSource inputSource, Resource resource) throws Exception {
		return this.documentLoader.loadDocument(inputSource, getEntityResolver(), this.errorHandler,getValidationModeForResource(resource), isNamespaceAware());
	}
```

1. 获取对XML文件的验证模式。(在getValidationModeForResource(resource) )。
2. 加载XML ，并得到Document。（）
3. 根据返回的Document 注册Bean信息。

## 2.6 获取XML 验证模式

### 2.6.1 DTD 和 XSD

#### DTD （Document type Definition 文档类型定义）

`<! DOCTYPE ...>`

#### SXD （XML Schema）

标签 引入

### 2.6.2 验证模式的读取

```java
protected int getValidationModeForResource(Resource resource) {
		int validationModeToUse = getValidationMode();
		if (validationModeToUse != VALIDATION_AUTO) {
			return validationModeToUse;
		}
		int detectedMode = detectValidationMode(resource);
		if (detectedMode != VALIDATION_AUTO) {
			return detectedMode;
		}
		return VALIDATION_XSD;
	}
```

通过 `detectValidationMode(resource)`判断是否包含 DOCTYPE 。

## 2.7 获取 Document

`Document doc = doLoadDocument(inputSource, resource);` 貌似也可以 拿来用。

其实就是SAX 解析XML 。

先创建 DocumentBuilderFactory

再 工厂出 DocumentBuilder

解析inputSource 返回 Document。

### 2.7.1 EntityResolver 

```java
protected EntityResolver getEntityResolver() {
		if (this.entityResolver == null) {
			// Determine default EntityResolver to use.
			ResourceLoader resourceLoader = getResourceLoader();
			if (resourceLoader != null) {
				this.entityResolver = new ResourceEntityResolver(resourceLoader);
			}
			else {
				this.entityResolver = new DelegatingEntityResolver(getBeanClassLoader());
			}
		}
		return this.entityResolver;
	}
```

SAX首先读取XML文档上的声明，根据声明去找DTD定义，再进行验证。默认上同URI从网上下载。

作用就是：给项目本身提供一个如何寻找DTD声明的方法。由程序来寻找DTD，可以放在项目中。

## 2.8 解析及注册

`return registerBeanDefinitions(doc, resource);`

```java
public int registerBeanDefinitions(Document doc, Resource resource) throws BeanDefinitionStoreException {
    // 创建 解析 
	BeanDefinitionDocumentReader documentReader = createBeanDefinitionDocumentReader();
    // 4.3.x 这里没看到 设置环境变量 Environment
    
    // 记录之前的 加载个数
	int countBefore = getRegistry().getBeanDefinitionCount();
    // 加载 和 注册
	documentReader.registerBeanDefinitions(doc, createReaderContext(resource));
	// 记录本次加载bean 的个数。
    return getRegistry().getBeanDefinitionCount() - countBefore;
	}
```

BeanDefinitionDocumentReader 实现类

```java 
public void registerBeanDefinitions(Document doc, XmlReaderContext readerContext) {
		this.readerContext = readerContext;
		logger.debug("Loading bean definitions");
		Element root = doc.getDocumentElement();
		doRegisterBeanDefinitions(root);
	}

protected void doRegisterBeanDefinitions(Element root) {
		BeanDefinitionParserDelegate parent = this.delegate;
		this.delegate = createDelegate(getReaderContext(), root, parent);

    // 处理 profile 属性
		if (this.delegate.isDefaultNamespace(root)) {
			String profileSpec = root.getAttribute(PROFILE_ATTRIBUTE);
			if (StringUtils.hasText(profileSpec)) {
				String[] specifiedProfiles = StringUtils.tokenizeToStringArray(
						profileSpec, BeanDefinitionParserDelegate.MULTI_VALUE_ATTRIBUTE_DELIMITERS);
				if (!getReaderContext().getEnvironment().acceptsProfiles(specifiedProfiles)) {
					if (logger.isInfoEnabled()) {
						logger.info("Skipped XML bean definition file due to specified profiles [" + profileSpec +
								"] not matching: " + getReaderContext().getResource());
					}
					return;
				}
			}
		}
		/* 解析前处理 但是这两个前后方法上空的，目的上为继承 需要再解析bean 做处理而设计的
		 * 面向对象方法设计中，方法 一类上面向继承 一类上final修饰
		 */
		preProcessXml(root);
    	// 
		parseBeanDefinitions(root, this.delegate);
    	// 解析后处理
		postProcessXml(root);

		this.delegate = parent;
	}
```

### 2.8.1 profile 属性使用

`String profileSpec = root.getAttribute(PROFILE_ATTRIBUTE);`

使用了Profile之后，我们就可以分别定义3个配置文件，一个用于开发、一个用户测试、一个用户生产，其分别对应于3个Profile。当在实际运行的时候，只需给定一个参数来激活对应的Profile即可，那么容器就会只加载激活后的配置文件，这样就可以大大省去我们修改配置信息而带来的烦恼。

 

```xml
<?xml version="1.0" encoding="UTF-8"?> 
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:context="http://www.springframework.org/schema/context" xmlns:util="http://www.springframework.org/schema/util" xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.2.xsd http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context-4.2.xsd http://www.springframework.org/schema/util http://www.springframework.org/schema/util/spring-util-4.2.xsd">
    <!-- 定义开发的profile --> 
    <beans profile="development"> 
        <!-- 只扫描开发环境下使用的类 --> 
        <context:component-scan base-package="com.panlingxiao.spring.profile.service.dev" /> 
        <!-- 加载开发使用的配置文件 --> 
        <util:properties id="config" location="classpath:dev/config.properties"/> 		</beans> 
    
    <!-- 定义生产使用的profile --> 
    <beans profile="produce"> 
        <!-- 只扫描生产环境下使用的类 --> 
        <context:component-scan base-package="com.panlingxiao.spring.profile.service.produce" /> 
        <!-- 加载生产使用的配置文件 --> 
        <util:properties id="config" location="classpath:produce/config.properties"/> </beans>
</beans>

```



```xml
    <context-param>
        <param-name>spring.profiles.default</param-name>
        <param-value>development</param-value>
    </context-param>
 
    <context-param>
        <param-name>spring.profiles.active</param-name>
        <param-value>smart</param-value>
    </context-param>
    <context-param>
        <param-name>spring.liveBeansView.mbeanDomain</param-name>
        <param-value>development</param-value>
    </context-param>
```

### 2.8.2 解析 注册 BeanDefinition

```java
	protected void parseBeanDefinitions(Element root, BeanDefinitionParserDelegate delegate) {
        //是否是默认的 命名空间  默认标签
		if (delegate.isDefaultNamespace(root)) {
			NodeList nl = root.getChildNodes();
			for (int i = 0; i < nl.getLength(); i++) {
				Node node = nl.item(i);
				if (node instanceof Element) {
					Element ele = (Element) node;
					if (delegate.isDefaultNamespace(ele)) {
                        // 解析默认 子标签
						parseDefaultElement(ele, delegate);
					}
					else {
                        // 解析自定义 子标签
						delegate.parseCustomElement(ele);
					}
				}
			}
		}
		else {
            // 解析自定义标签
			delegate.parseCustomElement(root);
		}
	}
```

在 XML 中 有两种类声明：

1. 默认`<bean id = "" class="" />`
2. 自定义`<tx:annotation-driven / >`



