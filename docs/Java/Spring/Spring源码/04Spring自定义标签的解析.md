[[TOC]]

# 4 自定义标签解析

接第一章末尾：

```java
protected void parseBeanDefinitions(Element root, BeanDefinitionParserDelegate delegate) {
		if (delegate.isDefaultNamespace(root)) {
			NodeList nl = root.getChildNodes();
			for (int i = 0; i < nl.getLength(); i++) {
				Node node = nl.item(i);
				if (node instanceof Element) {
					Element ele = (Element) node;
					if (delegate.isDefaultNamespace(ele)) {
                        // 第二章内容 解析spring默认的标签
						parseDefaultElement(ele, delegate);
					}
					else {
						delegate.parseCustomElement(ele);
					}
				}
			}
		}
		else {
			delegate.parseCustomElement(root);
		}
	}
```

`delegate.parseCustomElement(ele);`开始解析 自定义标签。

## 4.1 自定义标签的使用

很多情况下，其实使用spring 默认的标签，完成能够进行。

但是遇到有的复杂或者需要更多控制的时候，默认标签往往会比较麻烦，或者说配置的XML 非常复杂时，解析工作繁琐。

spring提供类可扩展的Schema支持，择中解决！

Spring自定义标签配置步骤（项目中，依赖spring的code包）：

+ 创建一个需要扩展的组件
+ 定义一个xsd文件描述组件内容
+ 创建一个文件，实现BeanDefinitionParser接口。用来解析xsd文件中 定义和组件定义
+ 创建一个Handler文件，扩展NamespaceHandlerSupport，目的时将组件注册到spring容器中
+ 编写spring.handler 和 spring.schemas文件

### 4.1.1 创建普通 pojo

```java
public class User {

	private String userName;
	
	private String password;
    // get /set 
}

```

创建POJO ，没有其他特殊的。

### 4.1.2 自定义 XML Schema

```xml
<?xml version="1.0"?>
<schema xmlns="http://www.w3.org/2001/XMLSchema"
		targetNamespace="http://www.asd.com/schema/gl"
		elementFormDefault="qualified" >
<!-- <schema> 标签如果 是<xs:schema> 则下面的全部标签都要时<xs:xxx>
	targetNamespace="http://www.asd.com/schema/gl" 网站可以随便写 末尾的gl可以随便写
	xmlns:tns="http://www.asd.com/schema/gl" 不知道什么用 就没有写
	elementFormDefault="qualified" 也不知道什么用 没写
-->
    
<element name="guol">
  <complexType>
      <attribute name="id" type="string" />
      <!-- 下面的属性名 必须和 类中属性相同 -->
      <attribute name="userName" type="string" />
      <attribute name="password" type="string" />
  </complexType>
</element>
<element name="ggl">
  <complexType>
      <attribute name="id" type="string" />
      <attribute name="userName" type="string" />
      <attribute name="password" type="string" />
  </complexType>
</element>

</schema>
```

XSD即XML Schema，本身也是一个XML，相较于DTD ，更加灵活，易学习。也是XML 发展的必然。

### 4.1.3 创建文件，实现BeanDefinitionParser接口

解析自定义的xsd 文件

创建用于解析 xsd 文件中的定义 和组件定义

```java
public class MyBeanDefinition extends AbstractSingleBeanDefinitionParser {
	protected Class getClass(Element el) {
		return User.class;
	}
	protected void doParse(Element el,BeanDefinitionBuilder bd) {
		String name = el.getAttribute("userName");
		String passwd = el.getAttribute("password");
		if(StringUtils.hasText(passwd)) {
			bd.addPropertyValue("userName", name);
		}
		if(StringUtils.hasText(passwd)) {
			bd.addPropertyValue("password", passwd);
		}
	}
}
```

### 4.1.4 创建handler 将组件注册到容器

```java
public class MyHandler extends NamespaceHandlerSupport {
	@Override
	public void init() {
        // guol ggl 代表 标签名字
		registerBeanDefinitionParser("guol", new MyBeanDefinition());
       	registerBeanDefinitionParser("ggl", new MyBeanDefinition());
	}
}
```

即 遇到note 开头的 元素直接给MyBeanDefinition处理。

### 4.1.5 编写Spring.handlers 和 spring.schemas

```
## 注意 gl必须同 xsd中的 命名空间相同 且要放在项目同级别的META-INF文件夹下 其他路径需要修改 网上没有找到 看看下面 源码时能否找到
http\://www.lexueba.com/schema/gl.xsd=META-INF/glDelement.xsd
http\://www.lexueba.com/schema/gl=com.guol.testSpring.myDelement.MyHandler

```

### 4.1.6 spring配置文件

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
	xmlns:p="http://www.springframework.org/schema/p"
	xmlns:aop="http://www.springframework.org/schema/aop" 
	xmlns:tx="http://www.springframework.org/schema/tx"
	xmlns:mvc="http://www.springframework.org/schema/mvc" 
	xmlns:context="http://www.springframework.org/schema/context"
	xmlns:jpa="http://www.springframework.org/schema/data/jpa" 
	xmlns:cache="http://www.springframework.org/schema/cache"
	xmlns:guo="http://www.asd.com/schema/gl"
	xsi:schemaLocation="http://www.springframework.org/schema/beans
						http://www.springframework.org/schema/beans/spring-beans-3.0.xsd 
						http://www.springframework.org/schema/context
						http://www.springframework.org/schema/context/spring-context-3.0.xsd 
						http://www.springframework.org/schema/aop
						http://www.springframework.org/schema/aop/spring-aop-3.0.xsd 
						http://www.springframework.org/schema/tx
						http://www.springframework.org/schema/tx/spring-tx-3.0.xsd 
						http://www.springframework.org/schema/mvc
						http://www.springframework.org/schema/mvc/spring-mvc-3.0.xsd
						http://www.springframework.org/schema/cache
       					http://www.springframework.org/schema/cache/spring-cache.xsd
       					http://www.springframework.org/schema/data/jpa
						http://www.springframework.org/schema/data/jpa/spring-jpa.xsd
						http://www.asd.com/schema/gl
						http://www.asd.com/schema/gl.xsd" >
	<guo:guol id="ggg" userName="dd" password="123"  ></guo:guol>
	<guo:ggl id="lll" userName="aaa" password="asd"  ></guo:ggl>
	<!-- 注意：guo 是 导入xsd 前面 xmlns:guo 相对应。而后面对应element名-->	
</beans>

```

### 4.1.7 测试

```java
public class Test {

	public static void main(String[] args) throws IOException {
		
		Resource resource = new ClassPathResource("./META-INF/test.xml");
		BeanFactory bf = new XmlBeanFactory(resource);

		User us = (User) bf.getBean("ggg");
		System.out.println(us.getUserName() + "    " +us.getPassword());
		us = (User) bf.getBean("lll");
		System.out.println(us.getUserName() + "    " +us.getPassword());
	}
}
```

## 4.2 自定义标签的解析

`delegate.parseCustomElement(ele);`

```java
public BeanDefinition parseCustomElement(Element ele) {
		return parseCustomElement(ele, null);
	}

// containingBd 为父类bean 对顶层元素解析时，设置为null
public BeanDefinition parseCustomElement(Element ele, BeanDefinition containingBd) {
    // 获取对应的 命名空间
		String namespaceUri = getNamespaceURI(ele);
    // 通过名称空间 获取对应的 命名空间handler 即 MyHandler extends NamespaceHandlerSupport
		NamespaceHandler handler = this.readerContext.
            getNamespaceHandlerResolver().resolve(namespaceUri);
		if (handler == null) {
			error("Unable to locate Spring NamespaceHandler for XML schema namespace [" + namespaceUri + "]", ele);
			return null;
		}
    // 调用自定义的handler进行解析 即 
    // MyBeanDefinition extends AbstractSingleBeanDefinitionParser
		return handler.parse(ele, new ParserContext(this.readerContext, this, containingBd));
	}
```

逻辑：

+ 根据bean 获取 对应的命名空间
+ 根据命名空间获取对应的处理器
+ 然后根据用户的自定义处理器解析

### 4.2.1 获取取标签的命名空间

`getNamespaceURI(ele)`

```java
public String getNamespaceURI(Node node) {
    // org.w3c.dom.Node 中直接获取 命名空间其实就是 
    // spring配置文档中，
    // xmlns:guo="http://www.asd.com/schema/gl" 
    // 或者说是xsd中的命名空间 
    // targetNamespace="http://www.asd.com/schema/gl"
		return node.getNamespaceURI();
	}
```

### 4.2.2 提取自定义标签处理器

获取类命名空间，就可以得到 命名空间处理器 handler了。

`NamespaceHandler handler = this.readerContext.getNamespaceHandlerResolver().resolve(namespaceUri);`

在readerContext初始化时，namespaceHandlerResolver属性被初始化为DefaultNamespaceHandlerResolver类了。

```Java
public NamespaceHandler resolve(String namespaceUri) {
    // 获取 所有已经配置的 handler 映射
		Map<String, Object> handlerMappings = getHandlerMappings();
    // 根据命名空间获取 对应的handler
		Object handlerOrClassName = handlerMappings.get(namespaceUri);
		if (handlerOrClassName == null) {
			return null;
		}
    // 已经做过解析的情况 直接读取缓存
		else if (handlerOrClassName instanceof NamespaceHandler) {
			return (NamespaceHandler) handlerOrClassName;
		}
    // 没有做过 解析  则会得到 类路径
		else {
            // 获取类路径 即 spring.handlers 中
            // http\://www.lexueba.com/schema/gl=com.guol.testSpring.myDelement.MyHandler
			String className = (String) handlerOrClassName;
			try {
                // 通过反射创建 类模板
				Class<?> handlerClass = ClassUtils.forName(className, this.classLoader);
				if (!NamespaceHandler.class.isAssignableFrom(handlerClass)) {
					throw new FatalBeanException("Class [" + 
                               className + "] for namespace [" + namespaceUri +
							"] does not implement the [" + 
                               NamespaceHandler.class.getName() + "] interface");
				}
                // 调用 Constructor类的 newInstance 构造对象
				NamespaceHandler namespaceHandler = (NamespaceHandler) 
                    BeanUtils.instantiateClass(handlerClass);
                // 调用初始化 也就是自定义 的
				namespaceHandler.init();
                // 添加到缓存
				handlerMappings.put(namespaceUri, namespaceHandler);
				return namespaceHandler;
			}
			catch (ClassNotFoundException ex) {
				throw new FatalBeanException("NamespaceHandler class [" + className + "] for namespace [" +
						namespaceUri + "] not found", ex);
			}
			catch (LinkageError err) {
				throw new FatalBeanException("Invalid NamespaceHandler class [" + className + "] for namespace [" +
						namespaceUri + "]: problem with handler class file or dependent class", err);
			}
		}
	}
```

反射：

1 使用Class类的newInstance方法

可以使用Class类的newInstance方法创建对象。这个newInstance方法调用无参的构造函数创建对象。

```java
// 只能调用默认 无参构造器
User user = (User)Class.forName("根路径.User").newInstance();　
User user = User.class.newInstance();
```

2 使用Constructor类的newInstance方法

和Class类的newInstance方法很像， java.lang.reflect.Constructor类里也有一个newInstance方法可以创建对象。我们可以通过这个newInstance方法调用有参数的和私有的构造函数。

```java
// 可以通过getConstructor(Class1,Class2);的参数，调用 对应参数的 构造
Constructor<User> constructor = User.class.getConstructor();
User user = constructor.newInstance();
```

这两种newInstance方法就是大家所说的反射。事实上Class的newInstance方法内部调用Constructor的newInstance方法

```java
// 读取我们配置的 spring.handlers
private Map<String, Object> getHandlerMappings() {
		if (this.handlerMappings == null) {
			synchronized (this) {
				if (this.handlerMappings == null) {
					try {
                        // this.handlerMappingsLocation 在构造时 已经读取了 spring.handlers
                        // public static final String DEFAULT_HANDLER_MAPPINGS_LOCATION = "META-INF/spring.handlers";
						Properties mappings = PropertiesLoaderUtils.
                            loadAllProperties
                            (this.handlerMappingsLocation, this.classLoader);
						if (logger.isDebugEnabled()) {
							logger.debug("Loaded NamespaceHandler mappings: " + mappings);
						}
						Map<String, Object> handlerMappings = 
                            new ConcurrentHashMap<String, Object>(mappings.size());
                        
						CollectionUtils.mergePropertiesIntoMap(mappings, handlerMappings);
						this.handlerMappings = handlerMappings;
					}
					catch (IOException ex) {
						throw new IllegalStateException(
								"Unable to load NamespaceHandler mappings from location [" + this.handlerMappingsLocation + "]", ex);
					}
				}
			}
		}
		return this.handlerMappings;
	}
```

### 4.2.3 标签解析

得到类 命名空间处理器handler `return handler.parse(ele, new ParserContext(this.readerContext, this, containingBd));`就开始解析。此时的handler 便是为们实力化的 MyHandler ，即抽象父类中：

```java
public BeanDefinition parse(Element element, ParserContext parserContext) {
    // 寻找解析器 并进行解析操作
		return findParserForElement(element, parserContext).parse(element, parserContext);
	}

private BeanDefinitionParser findParserForElement(Element element, ParserContext parserContext) {
    // 获取元素名称 也就是配置文件中 <guo:guol> <guo:ggl> 中的guol ggl
		String localName = parserContext.getDelegate().getLocalName(element);
    // 此时得到的parser 便是 在handler init 中 new 创建的对象
		BeanDefinitionParser parser = this.parsers.get(localName);
		if (parser == null) {
			parserContext.getReaderContext().fatal(
					"Cannot locate BeanDefinitionParser for element [" + localName + "]", element);
		}
		return parser;
	}

```

在parser中，由于我们自己实现的 `AbstractSingleBeanDefinitionParser`；所以在此

```java
public final BeanDefinition parse(Element element, ParserContext parserContext) {
    // 同 默认标签 获取 用于存放数据 BeanDefinition
		AbstractBeanDefinition definition = parseInternal(element, parserContext);
		if (definition != null && !parserContext.isNested()) {
			try {
                // 获取唯一标识 id属性的值
				String id = resolveId(element, definition, parserContext);
				if (!StringUtils.hasText(id)) {
					parserContext.getReaderContext().error(
							"Id is required for element '" + 
                        parserContext.getDelegate().getLocalName(element)
                        + "' when used as a top-level tag", element);
				}
                // 别名
				String[] aliases = null;
				if (shouldParseNameAsAliases()) {
                    // 按照name属性 获取别名
					String name = element.getAttribute(NAME_ATTRIBUTE);
					if (StringUtils.hasLength(name)) {
						aliases = StringUtils.trimArrayElements
                            (StringUtils.commaDelimitedListToStringArray(name));
					}
				}
                // 将AbstractBeanDefinition 转换为 BeanDefinitionHolder 并注册
				BeanDefinitionHolder holder = new BeanDefinitionHolder
                    (definition, id, aliases);
                
				registerBeanDefinition(holder, parserContext.getRegistry());
                
				if (shouldFireEvents()) {
                    // 需要通知监听器进行处理
					BeanComponentDefinition componentDefinition = 
                        new BeanComponentDefinition(holder);
					postProcessComponentDefinition(componentDefinition);
					parserContext.registerComponent(componentDefinition);
				}
			}
			catch (BeanDefinitionStoreException ex) {
				parserContext.getReaderContext().error(ex.getMessage(), element);
				return null;
			}
		}
		return definition;
	}
```

上面基本逻辑是 对 转换后的BeanDefinitionHolder进行处理，而真正解析是`AbstractBeanDefinition definition = parseInternal(element, parserContext);`AbstractSingleBeanDefinitionParser

```java
protected final AbstractBeanDefinition parseInternal(Element element, ParserContext parserContext) {
    // 还是 创建 存放数据的 builder
		BeanDefinitionBuilder builder = BeanDefinitionBuilder.genericBeanDefinition();
    // 获取父类名称 
		String parentName = getParentName(element);
		if (parentName != null) {
			builder.getRawBeanDefinition().setParentName(parentName);
		}
    // 获取类模板 调用 我们重写的方法
		Class<?> beanClass = getBeanClass(element);
		if (beanClass != null) {
			builder.getRawBeanDefinition().setBeanClass(beanClass);
		}
		else {
            // 当获取的类模板 无效时 调用这个 反正getBeanClass getBeanClassName 我们最少重写一个
			String beanClassName = getBeanClassName(element);
			if (beanClassName != null) {
				builder.getRawBeanDefinition().setBeanClassName(beanClassName);
			}
		}
		builder.getRawBeanDefinition().setSource(parserContext.extractSource(element));
   // 若父类存在 则使用 scope 属性 作用范围
		if (parserContext.isNested()) {
			builder.setScope(parserContext.getContainingBeanDefinition().getScope());
		}
    // 配置延迟加载
		if (parserContext.isDefaultLazyInit()) {
			builder.setLazyInit(true);
		}
    // 调用 为们实现类写的 方法进行赋值
		doParse(element, parserContext, builder);
		return builder.getBeanDefinition();
	}
protected void doParse(Element element, ParserContext parserContext, BeanDefinitionBuilder builder) {
		doParse(element, builder);
	}
```

到此，完成关于配置文件的全部读取。

