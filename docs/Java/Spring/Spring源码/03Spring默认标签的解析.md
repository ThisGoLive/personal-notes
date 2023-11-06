[[TOC]]

# 3 默认标签的解析

接第一章的 `DefaultBeanDefinitionDocumentReader`类

```java
private void parseDefaultElement(Element ele, BeanDefinitionParserDelegate delegate) {
    // import 标签
		if (delegate.nodeNameEquals(ele, IMPORT_ELEMENT)) {
			importBeanDefinitionResource(ele);
		}
    // alias 标签
		else if (delegate.nodeNameEquals(ele, ALIAS_ELEMENT)) {
			processAliasRegistration(ele);
		}
    // bean 标签
		else if (delegate.nodeNameEquals(ele, BEAN_ELEMENT)) {
			processBeanDefinition(ele, delegate);
		}
    // beans 标签
		else if (delegate.nodeNameEquals(ele, NESTED_BEANS_ELEMENT)) {
			// recurse
			doRegisterBeanDefinitions(ele);
		}
	}
```

## 3.1 bean 标签的解析

bean 是较为复杂的，主要这开始：

```java
protected void processBeanDefinition(Element ele, BeanDefinitionParserDelegate delegate) {
    // 得到 Holder 实例。持有 配置文件中 配置的各个属性：class name alias 等标签属性
		BeanDefinitionHolder bdHolder = delegate.parseBeanDefinitionElement(ele);
    // holder 不为空时
		if (bdHolder != null) {
            // 装饰  必填 
			bdHolder = delegate.decorateBeanDefinitionIfRequired(ele, bdHolder);
			try {
				// Register the final decorated instance.
				BeanDefinitionReaderUtils.registerBeanDefinition(bdHolder, getReaderContext().getRegistry());
			}
			catch (BeanDefinitionStoreException ex) {
				getReaderContext().error("Failed to register bean definition with name '" +
						bdHolder.getBeanName() + "'", ele, ex);
			}
			// Send registration event.
			getReaderContext().
                fireComponentRegistered(new BeanComponentDefinition(bdHolder));
		}
	}
```

1. 得到 Holder 实例。持有 配置文件中 配置的各个属性：class name alias 等标签属性
2. 判断是否为空
3. 解析完成，对holder进行注册，由 `BeanDefinitionReaderUtils.registerBeanDefinition(bdHolder, getReaderContext().getRegistry());`完成
4. 发出响应事件，通知对应的监听器，这个bean加载完成，`getReaderContext().fireComponentRegistered(new BeanComponentDefinition(bdHolder));`，就是将承载好数据的BeanDefinition实例，放在BeanDefinitionRegistry中，需要就直接从BeanDefinitionRegistry中获取，map。

### 3.1.1 解析 BeanDefinition

解析为holder：`BeanDefinitionHolder bdHolder = delegate.parseBeanDefinitionElement(ele);`

`BeanDefinitionParserDelegate`类中

```java
public BeanDefinitionHolder parseBeanDefinitionElement(Element ele) {
		return parseBeanDefinitionElement(ele, null);
	}

public BeanDefinitionHolder parseBeanDefinitionElement(Element ele, BeanDefinition containingBean) {
    // 解析ID 属性
		String id = ele.getAttribute(ID_ATTRIBUTE);
    // 解析 name属性
		String nameAttr = ele.getAttribute(NAME_ATTRIBUTE);

    // 对 name 属性的分割
		List<String> aliases = new ArrayList<String>();
		if (StringUtils.hasLength(nameAttr)) {
			String[] nameArr = StringUtils.
                tokenizeToStringArray(nameAttr, MULTI_VALUE_ATTRIBUTE_DELIMITERS);
			aliases.addAll(Arrays.asList(nameArr));
		}

		String beanName = id;
		if (!StringUtils.hasText(beanName) && !aliases.isEmpty()) {
			beanName = aliases.remove(0);
			if (logger.isDebugEnabled()) {
				logger.debug("No XML 'id' specified - using '" + beanName +
						"' as bean name and " + aliases + " as aliases");
			}
		}

		if (containingBean == null) {
			checkNameUniqueness(beanName, aliases, ele);
		}
	// 对标签的其他属性解析
		AbstractBeanDefinition beanDefinition = 
            parseBeanDefinitionElement(ele, beanName, containingBean);
		if (beanDefinition != null) {
			if (!StringUtils.hasText(beanName)) {
				try {
					if (containingBean != null) {
						beanName = BeanDefinitionReaderUtils.generateBeanName
                            (beanDefinition, this.readerContext.getRegistry(), true);
					}
					else {
						beanName = 
                            this.readerContext.generateBeanName(beanDefinition);
						
						String beanClassName = beanDefinition.getBeanClassName();
						if (beanClassName != null &&
                            beanName.startsWith(beanClassName) &&
                            beanName.length() > beanClassName.length() &&
						!this.readerContext.getRegistry().
                            isBeanNameInUse(beanClassName)) {
							aliases.add(beanClassName);
						}
					}
					if (logger.isDebugEnabled()) {
						logger.debug("Neither XML 'id' nor 'name' specified - " +
								"using generated bean name [" + beanName + "]");
					}
				}
				catch (Exception ex) {
					error(ex.getMessage(), ele);
					return null;
				}
			}
			String[] aliasesArray = StringUtils.toStringArray(aliases);
			return new BeanDefinitionHolder(beanDefinition, beanName, aliasesArray);
		}

		return null;
	}
```

1. 提取 ID 和 name属性
2. 对其他属性解析。由 `AbstractBeanDefinition beanDefinition = parseBeanDefinitionElement(ele, beanName, containingBean);`完成
3. 如果没有检查到beanName，使用默认规则生成。`!StringUtils.hasText(beanName)`
4. 将获取的ID beanName 以及其他属性 返回封装到返回的holder中 `new BeanDefinitionHolder(beanDefinition, beanName, aliasesArray);**`**

**对其他属性的解析：**`parseBeanDefinitionElement(ele, beanName, containingBean)`

```java
public AbstractBeanDefinition parseBeanDefinitionElement(
			Element ele, String beanName, BeanDefinition containingBean) {

		this.parseState.push(new BeanEntry(beanName));

		String className = null;
    // 解析 class 熟悉 
		if (ele.hasAttribute(CLASS_ATTRIBUTE)) {
			className = ele.getAttribute(CLASS_ATTRIBUTE).trim();
		}

		try {
			String parent = null;
            // 解析 parent 熟悉
			if (ele.hasAttribute(PARENT_ATTRIBUTE)) {
				parent = ele.getAttribute(PARENT_ATTRIBUTE);
			}
            // 通过 类名 和parent 创建 用于承载 Javabean属性的类型AbstractBeanDefinition
			AbstractBeanDefinition bd = createBeanDefinition(className, parent);

            // 强制 获取  对属性 
			parseBeanDefinitionAttributes(ele, beanName, containingBean, bd);
            // 提取description 
			bd.setDescription(DomUtils.getChildElementValueByTagName(ele, DESCRIPTION_ELEMENT));

            // 解析元数据
			parseMetaElements(ele, bd);
            // 解析lookup-methon 属性
			parseLookupOverrideSubElements(ele, bd.getMethodOverrides());
            // 解析 replaced-method 属性
			parseReplacedMethodSubElements(ele, bd.getMethodOverrides());

            // 解析构造函数
			parseConstructorArgElements(ele, bd);
            // 解析 prorperty 子标签
			parsePropertyElements(ele, bd);
            // 解析 qualifier 子标签
			parseQualifierElements(ele, bd);

			bd.setResource(this.readerContext.getResource());
			bd.setSource(extractSource(ele));

			return bd;
		}
		catch (ClassNotFoundException ex) {
			error("Bean class [" + className + "] not found", ele, ex);
		}
		finally {
			this.parseState.pop();
		}

		return null;
	}
```

以上就解析完了 bean 标签，常见的 就是 id 属性 class 属性 以及 property 子元素。

#### 1. 创建 用于属性承载的BeanDefinition 

`AbstractBeanDefinition bd` 就是其实现。

BeanDefinition 接口，再Spring由三个实现：RootBeanDefinition、ChildBeanDefinition、GenericBeanDefinition。这三个实现运继承AbstractBeanDefinition 。

**BeanDefinition**是bean标签在在容器中的内部 表示形式，bean 标签有 ：class 、scope、 lazy-init等配置属性，BeanDefinition也有：beanClass 、scope 、lazyinit属性。而且一一对应。

`RootBeanDefinition`代表一般的 bean标签。

`GenericBeanDefinition`是2.5版本以后新加入的定义类，一站式服务类。

如果父子bean标签，那么RootBeanDefinition存放父Bean，ChildBeanDefinition存放子bean。



最后所有的BeanDefinition就通过之前 `getReaderContext().fireComponentRegistered(new BeanComponentDefinition(bdHolder));`存放在内存中。

创建承载：

```java
protected AbstractBeanDefinition createBeanDefinition(String className, String parentName)
			throws ClassNotFoundException {

		return BeanDefinitionReaderUtils.createBeanDefinition(
				parentName, className, this.readerContext.getBeanClassLoader());
	}

```
BeanDefinitionReaderUtils 类中
```java

public static AbstractBeanDefinition createBeanDefinition(
			String parentName, String className, ClassLoader classLoader) throws ClassNotFoundException {

		GenericBeanDefinition bd = new GenericBeanDefinition();
    // parentName 可能为空
		bd.setParentName(parentName);
		if (className != null) {
            // 如果 classLoader 不为空 就使用同一classLoader加载类对象（类模板），否则记录className
			if (classLoader != null) {
				bd.setBeanClass(ClassUtils.forName(className, classLoader));
			}
			else {
				bd.setBeanClassName(className);
			}
		}
		return bd;
	}

```

#### 2 解析 各种属性

创建好类承载bean的EeanDefinition，开始承载。

`parseBeanDefinitionAttributes(ele, beanName, containingBean, bd);`

```java
public AbstractBeanDefinition parseBeanDefinitionAttributes(Element ele, String beanName,
			BeanDefinition containingBean, AbstractBeanDefinition bd) {

    // 解析 singleton 属性
		if (ele.hasAttribute(SINGLETON_ATTRIBUTE)) {
			error("Old 1.x 'singleton' attribute in use - upgrade to 'scope' declaration", ele);
		}
    // 解析 scope 属性
		else if (ele.hasAttribute(SCOPE_ATTRIBUTE)) {
			bd.setScope(ele.getAttribute(SCOPE_ATTRIBUTE));
		}
		else if (containingBean != null) {
			// Take default from containing bean in case of an inner bean definition.
			bd.setScope(containingBean.getScope());
		}

    // 解析 abstract 属性
		if (ele.hasAttribute(ABSTRACT_ATTRIBUTE)) {
			bd.setAbstract(TRUE_VALUE.equals(ele.getAttribute(ABSTRACT_ATTRIBUTE)));
		}

    // 解析 lazy-init 属性
		String lazyInit = ele.getAttribute(LAZY_INIT_ATTRIBUTE);
		if (DEFAULT_VALUE.equals(lazyInit)) {
			lazyInit = this.defaults.getLazyInit();
		}
    // 若没有 或者设置类其他字符 都是false
		bd.setLazyInit(TRUE_VALUE.equals(lazyInit));

    // 解析 autowire 属性
		String autowire = ele.getAttribute(AUTOWIRE_ATTRIBUTE);
		bd.setAutowireMode(getAutowireMode(autowire));

    // 解析 dependency-check 属性
		String dependencyCheck = ele.getAttribute(DEPENDENCY_CHECK_ATTRIBUTE);
		bd.setDependencyCheck(getDependencyCheck(dependencyCheck));

    // 解析 depends-on 属性
		if (ele.hasAttribute(DEPENDS_ON_ATTRIBUTE)) {
			String dependsOn = ele.getAttribute(DEPENDS_ON_ATTRIBUTE);
			bd.setDependsOn(StringUtils.tokenizeToStringArray
                            (dependsOn, MULTI_VALUE_ATTRIBUTE_DELIMITERS));
		}

    // 解析 autowire-candidate 属性
		String autowireCandidate = ele.getAttribute(AUTOWIRE_CANDIDATE_ATTRIBUTE);
		if ("".equals(autowireCandidate) || DEFAULT_VALUE.equals(autowireCandidate)) {
			String candidatePattern = this.defaults.getAutowireCandidates();
			if (candidatePattern != null) {
				String[] patterns = StringUtils.
                    commaDelimitedListToStringArray(candidatePattern);
				bd.setAutowireCandidate
                    (PatternMatchUtils.simpleMatch(patterns, beanName));
			}
		}
		else {
			bd.setAutowireCandidate(TRUE_VALUE.equals(autowireCandidate));
		}

    // 解析 primary 属性
		if (ele.hasAttribute(PRIMARY_ATTRIBUTE)) {
			bd.setPrimary(TRUE_VALUE.equals(ele.getAttribute(PRIMARY_ATTRIBUTE)));
		}

    // 解析 init-method 属性
		if (ele.hasAttribute(INIT_METHOD_ATTRIBUTE)) {
			String initMethodName = ele.getAttribute(INIT_METHOD_ATTRIBUTE);
			if (!"".equals(initMethodName)) {
				bd.setInitMethodName(initMethodName);
			}
		}
		else {
			if (this.defaults.getInitMethod() != null) {
				bd.setInitMethodName(this.defaults.getInitMethod());
				bd.setEnforceInitMethod(false);
			}
		}

    // 解析 destory-method 属性
		if (ele.hasAttribute(DESTROY_METHOD_ATTRIBUTE)) {
			String destroyMethodName = ele.getAttribute(DESTROY_METHOD_ATTRIBUTE);
			bd.setDestroyMethodName(destroyMethodName);
		}
		else {
			if (this.defaults.getDestroyMethod() != null) {
				bd.setDestroyMethodName(this.defaults.getDestroyMethod());
				bd.setEnforceDestroyMethod(false);
			}
		}

    // 解析 factory-method 属性
		if (ele.hasAttribute(FACTORY_METHOD_ATTRIBUTE)) {
			bd.setFactoryMethodName(ele.getAttribute(FACTORY_METHOD_ATTRIBUTE));
		}
    // 解析 factory-bean 属性
		if (ele.hasAttribute(FACTORY_BEAN_ATTRIBUTE)) {
			bd.setFactoryBeanName(ele.getAttribute(FACTORY_BEAN_ATTRIBUTE));
		}

		return bd;
	}
```

spring框架中主要有四种标签bean、alias、import、beans，其中bean标签是其他标签的基础。

一、bean标签的属性

1）scope：用来配置spring bean的作用域

2）singleton：表示bean为单例的

3）abstract：设置为true，将该bean仅仅作为模板使用，应用程序上下文不会试图预先初始化它

4）lazy-init：设为true，延迟加载，该bean不会在ApplicationContext启动时提前被实例化，而是第一次向容器通过getBean索取bean时实例化

注：只对singleton的bean起作用

5）autowire：自动装配

6）dependency-check：依赖检查

7）depends-on：表示一个bean的实例化依靠另一个bean先实例化

8）autowire-candidate：设为false，容器在查找自动装配对象时，将不考虑该bean，即它不会被考虑作为其他bean自动装配的候选者，但是该bean本身可以使用自动装配来注入其他bean

9）primary：该bean优先被注入

10）init-method：初始化bean时调用的方法

11）destory-method：容器销毁之前所调用的方法

12）factory-method：当调用factory-method所指向的方法时，才开始实例化bean

13）factory-bean：调用静态工厂方法的方式创建bean

二、bean的子元素

1）meta：元数据，当需要使用里面的信息时可以通过key获取

2）lookup-method：获取器注入，是把一个方法声明为返回某种类型的bean但实际要返回的bean是在配置文件里面配置的

3）replaced-method：可以在运行时调用新的方法替换现有的方法，还能动态的更新原有方法的逻辑

4）constructor-arg：对bean自动寻找对应的构造函数，并在初始化的时候将设置的参数传入进去

5）property：基本数据类型赋值

6）qualifier：通过Qualifier指定注入bean的名称

#### 3 解析子元素 meta

当bean标签下拥有一个meta（例如：`<meta key="key" value="va">`）标签时：不会出现在实例化的bean对象中，当需要用时 `BeanDefinition`的 `getAttribate(key)获取`。

`parseMetaElements(ele, bd);`

```java
public void parseMetaElements(Element ele, BeanMetadataAttributeAccessor attributeAccessor) {
    // 获取当前节点 的所有元素
		NodeList nl = ele.getChildNodes();
		for (int i = 0; i < nl.getLength(); i++) {
			Node node = nl.item(i);
           // 判断 并获取
			if (isCandidateElement(node) && nodeNameEquals(node, META_ELEMENT)) {
				Element metaElement = (Element) node;
				String key = metaElement.getAttribute(KEY_ATTRIBUTE);
				String value = metaElement.getAttribute(VALUE_ATTRIBUTE);
                // 用 key value 构造
				BeanMetadataAttribute attribute = new BeanMetadataAttribute(key, value);
				attribute.setSource(extractSource(metaElement));
                // 记录信息
				attributeAccessor.addMetadataAttribute(attribute);
			}
		}
	}
```

#### 4 解析子元素 lookup-method

`parseLookupOverrideSubElements(ele, bd.getMethodOverrides());`

lookup-method，获取器注入，容器实现。指：

```xml
<bean id="getTest" class="com.gl.test.GetTest" >
		<lookup-method name="getBean" bean="accs" />
</bean>
<bean id="acc" class="com.gl.test.Acc"></bean>
<bean id="accs" class="com.gl.test.Account"></bean>
```

这种情况下：`com.gl.test.GetTest` 为抽象类，`getTest`是以`acc和account`的父类为返回类型的未实现抽象方法。BeanFactory 可以直接获取GetTest的实例，并调用getBean该方法。实现返货accs。

```java
public void parseLookupOverrideSubElements(Element beanEle, MethodOverrides overrides) {
		NodeList nl = beanEle.getChildNodes();
		for (int i = 0; i < nl.getLength(); i++) {
			Node node = nl.item(i);
            // 只有上默认标签bean 且子元素为lookup-methor
			if (isCandidateElement(node) && nodeNameEquals(node, LOOKUP_METHOD_ELEMENT)) {
				Element ele = (Element) node;
                // 获取方法名
				String methodName = ele.getAttribute(NAME_ATTRIBUTE);
                // 获取返回的bean
				String beanRef = ele.getAttribute(BEAN_ELEMENT);
				LookupOverride override = new LookupOverride(methodName, beanRef);
				override.setSource(extractSource(ele));
				overrides.addOverride(override);
			}
		}
	}
```

#### 5. 解析子元素 replaced-method

`parseReplacedMethodSubElements(ele, bd.getMethodOverrides());`

可以在运行过程中，用新的方法替换掉原本的方法。与lookup不同，replaced 不仅动态返回对象，还可以改变方法的逻辑。

```xml
<bean id="getBeanMethod" class="com.gl.test.Acc">
		<replaced-method name="showMe" replacer="acc"></replaced-method>
</bean>
<bean id="acc" class="com.gl.test.GetBean"></bean>
```

`com.gl.test.GetBean`实现 `MethodReplacer`接口，重写reiplement方法。当获取com.gl.test.Acc的实例，调用showMe方法时，其实就是调用reiplement。reiplement有返会类型Object，从而可以动态获取实例。

```java
public void parseReplacedMethodSubElements(Element beanEle, MethodOverrides overrides) {
		NodeList nl = beanEle.getChildNodes();
		for (int i = 0; i < nl.getLength(); i++) {
			Node node = nl.item(i);
            // 条件 默认标签且为replaced 
			if (isCandidateElement(node) && 
                nodeNameEquals(node, REPLACED_METHOD_ELEMENT)) {
				Element replacedMethodEle = (Element) node;
                // 提取要替换的方法名
				String name = replacedMethodEle.getAttribute(NAME_ATTRIBUTE);
                
                // 提取新的方法
				String callback = replacedMethodEle.
                    getAttribute(REPLACER_ATTRIBUTE);
				ReplaceOverride replaceOverride = 
                    new ReplaceOverride(name, callback);
				// Look for arg-type match elements.
				List<Element> argTypeEles = DomUtils.
                    getChildElementsByTagName(replacedMethodEle, ARG_TYPE_ELEMENT);
				for (Element argTypeEle : argTypeEles) {
                    // 记录参数
					String match = argTypeEle.
                        getAttribute(ARG_TYPE_MATCH_ATTRIBUTE);
					match = (StringUtils.hasText(match) ? 
                             match : DomUtils.getTextValue(argTypeEle));
					if (StringUtils.hasText(match)) {
						replaceOverride.addTypeIdentifier(match);
					}
				}
				replaceOverride.setSource(extractSource(replacedMethodEle));
				overrides.addOverride(replaceOverride);
			}
		}
	}
```

replaced 和lookup 都构造了一个 MethodOverride，并最终记录在AbstractBeanDefiniton 中该属性中。

#### 6. 解析constructor-arg  带参数的构造函数

`parseConstructorArgElements(ele, bd);`

```java
public void parseConstructorArgElements(Element beanEle, BeanDefinition bd) {
		NodeList nl = beanEle.getChildNodes();
    // 遍历 得到所有的constructor-arg 
		for (int i = 0; i < nl.getLength(); i++) {
			Node node = nl.item(i);
			if (isCandidateElement(node) && nodeNameEquals(node, CONSTRUCTOR_ARG_ELEMENT)) {
                // 通过该函数来解析constructor-age 表签
				parseConstructorArgElement((Element) node, bd);
			}
		}
	}
```

具体解析过程：

```java
public void parseConstructorArgElement(Element ele, BeanDefinition bd) {
		// 获取index属性
    	String indexAttr = ele.getAttribute(INDEX_ATTRIBUTE);
    	// 属性
		String typeAttr = ele.getAttribute(TYPE_ATTRIBUTE);
    	// 属性
		String nameAttr = ele.getAttribute(NAME_ATTRIBUTE);
    	// 有index属性时
		if (StringUtils.hasLength(indexAttr)) {
			try {
				int index = Integer.parseInt(indexAttr);
				if (index < 0) {
					error("'index' cannot be lower than 0", ele);
				}else {
					try {
						this.parseState.push(new ConstructorArgumentEntry(index));
                        // 解析ele元素
						Object value = parsePropertyValue(ele, bd, null);
						ConstructorArgumentValues.ValueHolder valueHolder = 
                            new ConstructorArgumentValues.ValueHolder(value);
						if (StringUtils.hasLength(typeAttr)) {
							valueHolder.setType(typeAttr);
						}
						if (StringUtils.hasLength(nameAttr)) {
							valueHolder.setName(nameAttr);
						}
						valueHolder.setSource(extractSource(ele));
                        // 判断index 参数值之前是否出现
						if (bd.getConstructorArgumentValues().
                            hasIndexedArgumentValue(index)) {
							error("Ambiguous constructor-arg entries for index " + index, ele);
						}
                        // 在只出现一次的情况下
                        else {
						// 核心 封装进bd
                            bd.getConstructorArgumentValues().
                                addIndexedArgumentValue(index, valueHolder);
						}
					}
					finally {
						this.parseState.pop();
					}
				}
			}catch (NumberFormatException ex) {
				error("Attribute 'index' of tag 'constructor-arg' must be an integer", ele);
			}
		}else {
            // 没有index属性时 自动寻找
			try {
				this.parseState.push(new ConstructorArgumentEntry());
				Object value = parsePropertyValue(ele, bd, null);
				ConstructorArgumentValues.ValueHolder valueHolder = new ConstructorArgumentValues.ValueHolder(value);
				if (StringUtils.hasLength(typeAttr)) {
					valueHolder.setType(typeAttr);
				}
				if (StringUtils.hasLength(nameAttr)) {
					valueHolder.setName(nameAttr);
				}
				valueHolder.setSource(extractSource(ele));
                // 核心 封装进bd
				bd.getConstructorArgumentValues().
                    addGenericArgumentValue(valueHolder);
			}
			finally {
				this.parseState.pop();
			}
		}
	}
```

+ 获取指定的几个属性：index type name
+ 判断是否有index属性
  + 有的话
    + 解析constructor-arg的子元素
    + 用 `ConstructorArgumentValues.ValueHolder`类封装解析出来的元素
    + index type name都封装进去，并添加进bd的ConstructorArgumentValues的IndexedArgumentValue属性中
  + 没有的话
    + 解析constructor-arg的子元素
    + 用 `ConstructorArgumentValues.ValueHolder`类封装解析出来的元素
    + index type name都封装进去，并添加进bd的ConstructorArgumentValues的GenericArgumentValue属性中

唯一不同就是保存的位置属性不同。

解析constructor-arg的子元素：`Object value = parsePropertyValue(ele, bd, null);`

```java
public Object parsePropertyValue(Element ele, BeanDefinition bd, String propertyName) {
		String elementName = (propertyName != null) ?
						"<property> element for property '" + propertyName + "'" :
						"<constructor-arg> element";

		// Should only have one child element: ref, value, list, etc.
    	// 一个属性需要唯一的子类型： ref, value, list, etc.
    	// 最终目的 只能有一个 ref属性 或者只能有一个 value属性 或者有一个 子节点
    	// 获取ele(即constructor-arg) 上的所有子节点
		NodeList nl = ele.getChildNodes();
		Element subElement = null;
    	// 遍历子节点
		for (int i = 0; i < nl.getLength(); i++) {
			Node node = nl.item(i);
            // 对description 或者 mate 不处理
			if (node instanceof Element && 
                !nodeNameEquals(node, DESCRIPTION_ELEMENT) &&
                !nodeNameEquals(node, META_ELEMENT)) {
				// Child element is what we're looking for.
				if (subElement != null) {
					error(elementName + " must not contain more than one sub-element", ele);
				}
				else {
					subElement = (Element) node;
				}
			}
		}
		// 解析ele(即constructor-arg) 上的ref属性
		boolean hasRefAttribute = ele.hasAttribute(REF_ATTRIBUTE);
    	// 解析ele(即constructor-arg) 上的value属性
		boolean hasValueAttribute = ele.hasAttribute(VALUE_ATTRIBUTE);
    
    	/* constructor-arg不能有的情况：
    	 * 	1. 同有ref 和 value属性
    	 * 	2. 有一个ref或者value属性，但又有子元素
    	 **/
		if ((hasRefAttribute && hasValueAttribute) ||
            ((hasRefAttribute || hasValueAttribute) && subElement != null)) {
			error(elementName +
					" is only allowed to contain either 'ref' attribute OR 'value' attribute OR sub-element", ele);
		}

		if (hasRefAttribute) {
            // 对 ref 属性进行处理 封装进 RuntimeBeanReference
			String refName = ele.getAttribute(REF_ATTRIBUTE);
			if (!StringUtils.hasText(refName)) {
				error(elementName + " contains empty 'ref' attribute", ele);
			}
			RuntimeBeanReference ref = new RuntimeBeanReference(refName);
			ref.setSource(extractSource(ele));
			return ref;
		}
		else if (hasValueAttribute) {
            // 对value属性进行处理 封装进 TypedStringValue
			TypedStringValue valueHolder = 
                new TypedStringValue(ele.getAttribute(VALUE_ATTRIBUTE));
			valueHolder.setSource(extractSource(ele));
			return valueHolder;
		}
		else if (subElement != null) {
            // 解析子元素
			return parsePropertySubElement(subElement, bd);
		}
		else {
			// Neither child element nor "ref" or "value" attribute found.
			error(elementName + " must specify a ref or value", ele);
			return null;
		}
	}
```

1. 略过description 和 mate 

2. 提取ref 和 value属性

3. 判断不允许的情况

   + ```java
     /* constructor-arg不能有的情况：
         	 * 	1. 同有ref 和 value属性
         	 * 	2. 有一个ref或者value属性，但又有子元素
         	 **/
     ```

4. 对各个情况处理：

```xml
<!-- RuntimeBeanReference 封装 ref -->
<constructor-arg ref='a'></constructor-arg>
<!-- TypedStringValue 封装 value -->
<constructor-arg value='a'></constructor-arg>
<!-- 子元素处理 -->
<constructor-arg value='a'>
	<map>
    	<entry key="key" value="value"></entry>
    </map>
</constructor-arg>
```

解析 constructor-arg 的子元素：`parsePropertySubElement(subElement, bd);`

```java
public Object parsePropertySubElement(Element ele, BeanDefinition bd) {
    	// 对各种子元素进行解析
		return parsePropertySubElement(ele, bd, null);
	}

public Object parsePropertySubElement(Element ele, BeanDefinition bd, 
                                      String defaultValueType) {
		if (!isDefaultNamespace(ele)) {
			return parseNestedCustomElement(ele, bd);
		}
    	// bean 子元素
		else if (nodeNameEquals(ele, BEAN_ELEMENT)) {
			BeanDefinitionHolder nestedBd = parseBeanDefinitionElement(ele, bd);
			if (nestedBd != null) {
				nestedBd = decorateBeanDefinitionIfRequired(ele, nestedBd, bd);
			}
			return nestedBd;
		}
    	// ref 子元素
		else if (nodeNameEquals(ele, REF_ELEMENT)) {
			// A generic reference to any name of any bean.
			String refName = ele.getAttribute(BEAN_REF_ATTRIBUTE);
			boolean toParent = false;
			if (!StringUtils.hasLength(refName)) {
				// A reference to the id of another bean in the same XML file.
                 // 解析 local 属性
				refName = ele.getAttribute(LOCAL_REF_ATTRIBUTE);
				if (!StringUtils.hasLength(refName)) {
					// A reference to the id of another bean in a parent context.
                    // 解析 PARENT 属性
					refName = ele.getAttribute(PARENT_REF_ATTRIBUTE);
					toParent = true;
					if (!StringUtils.hasLength(refName)) {
						error("'bean', 'local' or 'parent' is required for <ref> element", ele);
						return null;
					}
				}
			}
			if (!StringUtils.hasText(refName)) {
				error("<ref> element contains empty target attribute", ele);
				return null;
			}
			RuntimeBeanReference ref = new RuntimeBeanReference(refName, toParent);
			ref.setSource(extractSource(ele));
			return ref;
		}
    	// IDREF 子元素
		else if (nodeNameEquals(ele, IDREF_ELEMENT)) {
			return parseIdRefElement(ele);
		}
    	// IDREF 子元素
		else if (nodeNameEquals(ele, VALUE_ELEMENT)) {
			return parseValueElement(ele, defaultValueType);
		}
		else if (nodeNameEquals(ele, NULL_ELEMENT)) {
			// It's a distinguished null value. Let's wrap it in a TypedStringValue
			// object in order to preserve the source location.
			TypedStringValue nullHolder = new TypedStringValue(null);
			nullHolder.setSource(extractSource(ele));
			return nullHolder;
		}
		else if (nodeNameEquals(ele, ARRAY_ELEMENT)) {
			return parseArrayElement(ele, bd);
		}
		else if (nodeNameEquals(ele, LIST_ELEMENT)) {
			return parseListElement(ele, bd);
		}
		else if (nodeNameEquals(ele, SET_ELEMENT)) {
			return parseSetElement(ele, bd);
		}
		else if (nodeNameEquals(ele, MAP_ELEMENT)) {
			return parseMapElement(ele, bd);
		}
		else if (nodeNameEquals(ele, PROPS_ELEMENT)) {
			return parsePropsElement(ele);
		}
		else {
			error("Unknown property sub-element: [" + ele.getNodeName() + "]", ele);
			return null;
		}
	}
```

#### 7.解析property

`parsePropertyElements(ele, bd);`

```java
public void parsePropertyElements(Element beanEle, BeanDefinition bd) {
		NodeList nl = beanEle.getChildNodes();
		for (int i = 0; i < nl.getLength(); i++) {
			Node node = nl.item(i);
            // 必须有元素 名字上property
			if (isCandidateElement(node) && nodeNameEquals(node, PROPERTY_ELEMENT)) {
				parsePropertyElement((Element) node, bd);
			}
		}
	}

public void parsePropertyElement(Element ele, BeanDefinition bd) {
    	// 得到name属性名
		String propertyName = ele.getAttribute(NAME_ATTRIBUTE);
		if (!StringUtils.hasLength(propertyName)) {
			error("Tag 'property' must have a 'name' attribute", ele);
			return;
		}
		this.parseState.push(new PropertyEntry(propertyName));
		try {
            // 不能多次对同一属性名赋值
			if (bd.getPropertyValues().contains(propertyName)) {
				error("Multiple 'property' definitions for property '" + propertyName + "'", ele);
				return;
			}
            // 得到值
			Object val = parsePropertyValue(ele, bd, propertyName);
			PropertyValue pv = new PropertyValue(propertyName, val);
			parseMetaElements(ele, pv);
			pv.setSource(extractSource(ele));
            // 添加到bd的property属性中
			bd.getPropertyValues().addPropertyValue(pv);
		}
		finally {
			this.parseState.pop();
		}
	}
```



#### 8.解析qualifier

`parseQualifierElements(ele, bd);`

```java
	public void parseQualifierElements(Element beanEle, AbstractBeanDefinition bd) {
		NodeList nl = beanEle.getChildNodes();
		for (int i = 0; i < nl.getLength(); i++) {
			Node node = nl.item(i);
            // 必须有元素 名字上QUALIFIER
			if (isCandidateElement(node) && nodeNameEquals(node, QUALIFIER_ELEMENT)) {
				parseQualifierElement((Element) node, bd);
			}
		}
	}
```

Qualifier 注解形式。使用spring进行自动注入时，spring容器中匹配的候选Bean数目必须有且仅有一个。否则抛出异常 `BeanCreationException`。

所有Spring允许用Qualifier指定注入bean的名称。配置：

```xml
<bean id="" class="">
	<qualifier type="需要注入的bean的类全路径" value="bean的名称"></qualifier>
</bean>
```

### 3.1.2 AbstractBeanDefinition 属性

前面已经把XML文档中的数据加载到 `GenericBeanDefinition`中。`GenericBeanDefinition`为实现类，实际到了 `AbstractBeanDefinition `中。

`AbstractBeanDefinition beanDefinition = parseBeanDefinitionElement(ele, beanName, containingBean);`

AbstractBeanDefinition 类中用于存放数据的属性：

```java
	// volatile 线程。让每次变化可见，
	private volatile Object beanClass;

// bean的作用范围 对应bean标签的 scope 属性
	private String scope = SCOPE_DEFAULT;

// 是否抽象  对应bean的abstract 属性
	private boolean abstractFlag = false;

// 是否延迟加载 对应bean标签的 lazy-init 属性
	private boolean lazyInit = false;

// 自动注入 对应bean标签 autowire 属性
	private int autowireMode = AUTOWIRE_NO;

// 依赖检查 3.0 后没用类
	private int dependencyCheck = DEPENDENCY_CHECK_NONE;

// 用来表示一个bean实例化依靠另外一个bean先实例化，对应 depend-on属性
	private String[] dependsOn;

// autowire-candidate 属性设置为false，这样容器在查找自动装配对象时，
// 将不考虑该bean，即它不会被考虑作为其他bean自动装配的候选者，
// 但是该bean本身还是可以使用自动装配其他bean
// 对应autowire-candidate属性
	private boolean autowireCandidate = true;

// 自动装配时出现多个候选者时，将首个作为，对应 primary 属性
	private boolean primary = false;

// 用于记录 Qualifier ，对应子元素 qualifier
	private final Map<String, AutowireCandidateQualifier> qualifiers =
			new LinkedHashMap<String, AutowireCandidateQualifier>(0);

// 允许范围非公开的构造器和方法 程序设置
	private boolean nonPublicAccessAllowed = true;

// 是否以宽松的模式解析构造函数，默认为true
// 为false时，构造器的参数不能为同一大类 程序设置
	private boolean lenientConstructorResolution = true;

// 对应 属性 factory-bean
// <bean id="beanFactory" class="" />
// <bean id="bean" factory-bean="beanFactory" factory-method="getbean" />
	private String factoryBeanName;

// 同上
	private String factoryMethodName;

// 记录构造函数的参数类型，对应 constructor-arg 
	private ConstructorArgumentValues constructorArgumentValues;

// 普通属性集合 对应 子元素 property
	private MutablePropertyValues propertyValues;

// 方法重写的持有者，记录 lookup-method replaced-method
	private MethodOverrides methodOverrides = new MethodOverrides();

// 初始化 对应init-method 属性
	private String initMethodName;

// 销毁 对应destory-method
	private String destroyMethodName;

// 是否执行 init-method 系统设置
	private boolean enforceInitMethod = true;

// 是否执行 destroy-method 系统设置
	private boolean enforceDestroyMethod = true;

// 是否时用户定义的而不是应用程序本身定义的，创建aop时为true 系统设置
	private boolean synthetic = false;

// 定义这个bean的应用范围
// application ： 用户
// infrastructure ： 内部完全使用
	private int role = BeanDefinition.ROLE_APPLICATION;

// bean的描述信息
	private String description;

// bean 的定义资源
	private Resource resource;

// 4.3x中  原型 proptotype   单例 singleton 没有这些属性 而是在方法中

	public boolean isSingleton() {
		return SCOPE_SINGLETON.equals(scope) || SCOPE_DEFAULT.equals(scope);
	}

	public boolean isPrototype() {
		return SCOPE_PROTOTYPE.equals(scope);
	}
```

### 3.1.3 解析默认标签中的自定义标签元素

回到 最初 解析的地方：

```java
protected void processBeanDefinition(Element ele, BeanDefinitionParserDelegate delegate) {
    // 之前那全部都是对这段的解析
		BeanDefinitionHolder bdHolder = delegate.parseBeanDefinitionElement(ele);
   
		if (bdHolder != null) {
           // 现在时这段代码
			bdHolder = delegate.decorateBeanDefinitionIfRequired(ele, bdHolder);
			try {
				// Register the final decorated instance.
				BeanDefinitionReaderUtils.registerBeanDefinition(bdHolder, getReaderContext().getRegistry());
			}
			catch (BeanDefinitionStoreException ex) {
				getReaderContext().error("Failed to register bean definition with name '" +
						bdHolder.getBeanName() + "'", ele, ex);
			}
			// Send registration event.
			getReaderContext().
                fireComponentRegistered(new BeanComponentDefinition(bdHolder));
		}
	}
```

之前提到过：Spring解析 分为 默认Bean 和 自定义Ban 。但是这里的自定义标签，是以默认Bean标签的子元素，也就是属性出现的。

```xml
<bean id="" class="" >
	<mybean:user username=""></mybean:user>
</bean>
```

解析代码： `bdHolder = delegate.decorateBeanDefinitionIfRequired(ele, bdHolder);`

```java
public BeanDefinitionHolder decorateBeanDefinitionIfRequired(Element ele, BeanDefinitionHolder definitionHolder) {
    // 第三个参数： 父类的bd 对象 需要 调用父类的 scope 属性。由于时顶层就不需要。
		return decorateBeanDefinitionIfRequired(ele, definitionHolder, null);
	}

public BeanDefinitionHolder decorateBeanDefinitionIfRequired(
			Element ele, BeanDefinitionHolder definitionHolder, BeanDefinition containingBd) {

		BeanDefinitionHolder finalDefinition = definitionHolder;

		// Decorate based on custom attributes first.
		NamedNodeMap attributes = ele.getAttributes();
    	// 遍历所有的属性  是否有用于修饰的属性
		for (int i = 0; i < attributes.getLength(); i++) {
			Node node = attributes.item(i);
			finalDefinition = decorateIfRequired(node, finalDefinition, containingBd);
		}

		// Decorate based on custom nested elements.
		NodeList children = ele.getChildNodes();
    	// 遍历所有的子节点 是否有用于修饰的子元素。
		for (int i = 0; i < children.getLength(); i++) {
			Node node = children.item(i);
			if (node.getNodeType() == Node.ELEMENT_NODE) {
				finalDefinition = decorateIfRequired(node, finalDefinition, containingBd);
			}
		}
		return finalDefinition;
	}


public BeanDefinitionHolder decorateIfRequired(Node node,
    BeanDefinitionHolder originalDef,  BeanDefinition containingBd) {

    // 获取 自定义标签的命名空间
		String namespaceUri = getNamespaceURI(node);
    
    // 判断是否时默认标签 对不是默认的标签修饰
		if (!isDefaultNamespace(namespaceUri)) {
            // 根据命名空间 对非默认标签  找到对应的处理器
			NamespaceHandler handler = this.
                readerContext.getNamespaceHandlerResolver().resolve(namespaceUri);
            
			if (handler != null) {
                // 对非默认标签进行修饰
				return handler.decorate(node, originalDef, 
                                        new ParserContext(this.readerContext, 
                                                          this, containingBd));
			}
			else if (namespaceUri != null &&
                     namespaceUri.startsWith("http://www.springframework.org/")) {
				error("Unable to locate Spring NamespaceHandler for XML schema namespace [" + namespaceUri + "]", node);
			}
			else {
				// A custom namespace, not to be handled by Spring - maybe "xml:...".
				if (logger.isDebugEnabled()) {
					logger.debug("No Spring NamespaceHandler found for XML schema namespace [" + namespaceUri + "]");
				}
			}
		}
		return originalDef;
	}

```

以上逻辑：

+ 遍历所有的属性和子元素
+ 判断是否时自定义标签（因为 默认的在之前的一步已经处理完了）
+ 去寻找该非自定义标签的处理器 handler
+ 有就解析 （按照自定义标签处理 后面） 没有就抛出

### 3.1.4 注册解析的BeanDefinition

```java
protected void processBeanDefinition(Element ele, BeanDefinitionParserDelegate delegate) {
    // 3.1.2 解析默认的
		BeanDefinitionHolder bdHolder = delegate.parseBeanDefinitionElement(ele);
   
		if (bdHolder != null) {
           // 3.1.3 解析 自定义标签
			bdHolder = delegate.decorateBeanDefinitionIfRequired(ele, bdHolder);
			try {
				// Register the final decorated instance.
                // 现在到这步： 注册BeanDefinition
				BeanDefinitionReaderUtils.registerBeanDefinition(
                    bdHolder, getReaderContext().getRegistry());
			}
			catch (BeanDefinitionStoreException ex) {
				getReaderContext().error("Failed to register bean definition with name '" +
						bdHolder.getBeanName() + "'", ele, ex);
			}
			// Send registration event.
			getReaderContext().
                fireComponentRegistered(new BeanComponentDefinition(bdHolder));
		}
	}
```

注册解析： `BeanDefinitionReaderUtils.registerBeanDefinition(bdHolder, getReaderContext().getRegistry());`

```java
public static void registerBeanDefinition(
			BeanDefinitionHolder definitionHolder, BeanDefinitionRegistry registry)
			throws BeanDefinitionStoreException {

		// Register bean definition under primary name.
    // 用beanName 作唯一标识
		String beanName = definitionHolder.getBeanName();
    // 用beanName 注册
		registry.registerBeanDefinition(beanName, definitionHolder.getBeanDefinition());

		// Register aliases for bean name, if any.
    // 获取所有的别名
		String[] aliases = definitionHolder.getAliases();
		if (aliases != null) {
			for (String alias : aliases) {
                // 别名注册
				registry.registerAlias(beanName, alias);
			}
		}
	}
```

#### 1. 用beanName 注册BeanDefinition

`BeanDefinitionReaderUtils`中 `registry.registerBeanDefinition(beanName, definitionHolder.getBeanDefinition());`

`registry `为这个类中 `DefaultListableBeanFactory` 比较难找

```java
public void registerBeanDefinition(String beanName, BeanDefinition beanDefinition)
			throws BeanDefinitionStoreException {

		Assert.hasText(beanName, "Bean name must not be empty");
		Assert.notNull(beanDefinition, "BeanDefinition must not be null");

		if (beanDefinition instanceof AbstractBeanDefinition) {
			try {
                // 注册前 最后一次 校验 而且与之前不同
                // 主要时对 AbstractBeanDefinition 属性中的 methodOverrides 校验
                // 校验 methodOverrides 是否与工厂方法并存 或者 methodOverrides 不存在
				((AbstractBeanDefinition) beanDefinition).validate();
			}
			catch (BeanDefinitionValidationException ex) {
				throw new BeanDefinitionStoreException(
                    beanDefinition.getResourceDescription(), beanName,
						"Validation of bean definition failed", ex);
			}
		}

		BeanDefinition oldBeanDefinition;

    // beanDefinitionMap为全局变量  
    // 获取旧的 BeanDefinition 对象
		oldBeanDefinition = this.beanDefinitionMap.get(beanName);
    // 判断对应的beanName 有旧BeanDefinition时
		if (oldBeanDefinition != null) {
            // 是否 正在重写 旧BeanDefinition
            // 抛出异常 该beanName 已经 和旧BeanDefinition 绑定 终止
			if (!isAllowBeanDefinitionOverriding()) {
				throw new BeanDefinitionStoreException(beanDefinition.
                     getResourceDescription(), beanName,"Cannot register bean definition [" + 
                      beanDefinition + "] for bean '" + beanName +"': There is already [" + 
                                                       oldBeanDefinition + "] bound.");
			}
            // 
			else if (oldBeanDefinition.getRole() < beanDefinition.getRole()) {
				// e.g. was ROLE_APPLICATION, now overriding with ROLE_SUPPORT or ROLE_INFRASTRUCTURE
				if (logger.isWarnEnabled()) {
					logger.warn("Overriding user-defined bean definition for bean '" + 
                      beanName +"' with a framework-generated bean definition: replacing [" +
							oldBeanDefinition + "] with [" + beanDefinition + "]");
				}
			}
			else if (!beanDefinition.equals(oldBeanDefinition)) {
				if (logger.isInfoEnabled()) {
					logger.info("Overriding bean definition for bean '" + 
                                beanName +"' with a different definition: replacing [" + 
                                oldBeanDefinition +"] with [" + beanDefinition + "]");
				}
			}
			else {
				if (logger.isDebugEnabled()) {
					logger.debug("Overriding bean definition for bean '" +
                            beanName +"' with an equivalent definition: replacing [" + 
                                 oldBeanDefinition +"] with [" + beanDefinition + "]");
				}
			}
            // 重写 将新的覆盖
			this.beanDefinitionMap.put(beanName, beanDefinition);
		}
    // 没有 对应beanNaem 的旧 BeanDefinition
		else {
            // 如果是 开始 创建 bean
			if (hasBeanCreationStarted()) {
				// Cannot modify startup-time collection elements anymore (for stable iteration)
                // 由于是全局 需要 锁线程
				synchronized (this.beanDefinitionMap) {
                    // 注册BeanDefinition
					this.beanDefinitionMap.put(beanName, beanDefinition);
					List<String> updatedDefinitions = 
                        new ArrayList<String>(this.beanDefinitionNames.size() + 1);
					updatedDefinitions.addAll(this.beanDefinitionNames);
                    
                    // 记录 beanName
					updatedDefinitions.add(beanName);
					this.beanDefinitionNames = updatedDefinitions;
					if (this.manualSingletonNames.contains(beanName)) {
						Set<String> updatedSingletons = 
                            new LinkedHashSet<String>(this.manualSingletonNames);
						updatedSingletons.remove(beanName);
						this.manualSingletonNames = updatedSingletons;
					}
				}
			}
            // 不是开始创建bean
			else {
				// Still in startup registration phase
                 // 注册BeanDefinition
				this.beanDefinitionMap.put(beanName, beanDefinition);
                
                 // 记录 beanName
				this.beanDefinitionNames.add(beanName);
				this.manualSingletonNames.remove(beanName);
			}
			this.frozenBeanDefinitionNames = null;
		}

    // 重写 所有beanName对应的缓存
		if (oldBeanDefinition != null || containsSingleton(beanName)) {
			resetBeanDefinition(beanName);
		}
	}
```

**4.3.x 为以上逻辑，3.x.x 这里只是 对 开始新增 BeanDefinition做的处理，没有对其他的判断。**

逻辑：

+ 最后一次判断 并且是对methodOverrides判断
+ 判断Map中beanName 的情况
+ 依情况而定执行 新增注册
+ 清除之前的缓存

#### 2. 通过别名注册 BeanDefinition

`BeanDefinitionRegistry registry`而实现类是： `SimpleAliasRegistry`，``BeanDefinitionRegistry ` 继承了AliasRegistry 接口

XMLBeanFactory 时以上两个的实现，但是实现类两次AliasRegistry

`registry.registerAlias(beanName, alias);`

```java
public void registerAlias(String name, String alias) {
		Assert.hasText(name, "'name' must not be empty");
		Assert.hasText(alias, "'alias' must not be empty");
    // 线程锁 同样 4.3.x中有的
		synchronized (this.aliasMap) {
            
			if (alias.equals(name)) {
				this.aliasMap.remove(alias);
			}
			else {
				String registeredName = this.aliasMap.get(alias);
                // 如果alis 有值时
				if (registeredName != null) {
                    // 值与新的相同时 直接返回
					if (registeredName.equals(name)) {
						// An existing alias - no need to re-register
						return;
					}
                    // alis 不允许 被覆盖重写时
					if (!allowAliasOverriding()) {
						throw new IllegalStateException(
                            "Cannot register alias '" + alias + "' for name '" +
							name + "': It is already registered for name '" + 
                            	registeredName + "'.");
					}
				}
                // 检查
				checkForAliasCircle(name, alias);
                // 注册
				this.aliasMap.put(alias, name);
			}
		}
	}
```

### 3.1.5 通知监听器解析及 注册完成

`getReaderContext().fireComponentRegistered(new BeanComponentDefinition(bdHolder));`目前没有任何逻辑处理。待开发人员需要对注册BeanDefinition事件做处理时，自己写。

## 3.2 alis 标签的解析

```java
private void parseDefaultElement(Element ele, BeanDefinitionParserDelegate delegate) {
    // import 标签
		if (delegate.nodeNameEquals(ele, IMPORT_ELEMENT)) {
			importBeanDefinitionResource(ele);
		}
    // alias 标签
		else if (delegate.nodeNameEquals(ele, ALIAS_ELEMENT)) {
			processAliasRegistration(ele);
		}
    // bean 标签
		else if (delegate.nodeNameEquals(ele, BEAN_ELEMENT)) {
			processBeanDefinition(ele, delegate);
		}
    // beans 标签
		else if (delegate.nodeNameEquals(ele, NESTED_BEANS_ELEMENT)) {
			// recurse
			doRegisterBeanDefinitions(ele);
		}
	}
```

在spring配置文件中，`<alias>`标签可以问bean设置别名：

```xml
<bean id="" class="" name="testBean1,testBean2" ></bean>

<!-- 用alias 就是 -->
<bean id="testBean" class="" ></bean>
<alias name="testBean" alias="testBean1,testBean2" ></alias>
```

用处：多模块需要区别名字定义同一个bean

解析过程类似bean标签解析时对name属性的解析

```java
protected void processAliasRegistration(Element ele) {
    // 获取 name 
		String name = ele.getAttribute(NAME_ATTRIBUTE);
    // 获取 alias 
		String alias = ele.getAttribute(ALIAS_ATTRIBUTE);
		boolean valid = true;
		if (!StringUtils.hasText(name)) {
			getReaderContext().error("Name must not be empty", ele);
			valid = false;
		}
		if (!StringUtils.hasText(alias)) {
			getReaderContext().error("Alias must not be empty", ele);
			valid = false;
		}
		if (valid) {
			try {
               // 对 alias 进行注册
				getReaderContext().getRegistry().registerAlias(name, alias);
			}
			catch (Exception ex) {
				getReaderContext().error("Failed to register alias '" + alias +
						"' for bean with name '" + name + "'", ele, ex);
			}
            // 别名注册后 通知监听器进行处理
			getReaderContext().fireAliasRegistered(name, alias, extractSource(ele));
		}
	}

```

## 3.3 import标签的解析

import 作用就是导入 其他模块的Spring XML文件，在次文件进行统一注册。

```xml
<import resource="xxx.xml" >
```



```java
protected void importBeanDefinitionResource(Element ele) {
    // 获取 resource 属性
		String location = ele.getAttribute(RESOURCE_ATTRIBUTE);
    // 如果没有resource属性 不处理
		if (!StringUtils.hasText(location)) {
			getReaderContext().error("Resource location must not be empty", ele);
			return;
		}

		// Resolve system properties: e.g. "${user.dir}"
    // 通过 resource属性的值 获取对应的路径 ： ${user.dir}
		location = getReaderContext().getEnvironment().resolveRequiredPlaceholders(location);

		Set<Resource> actualResources = new LinkedHashSet<Resource>(4);

		// Discover whether the location is an absolute or relative URI
    // 用于判断 location 是 绝对URL 还是 相对 URI 
		boolean absoluteLocation = false;
		try {
			absoluteLocation = ResourcePatternUtils.isUrl(location) || 
                ResourceUtils.toURI(location).isAbsolute();
		}
		catch (URISyntaxException ex) {
			// cannot convert to an URI, considering the location relative
			// unless it is the well-known Spring prefix "classpath*:"
		}

		// Absolute or relative?
    // 如果时绝对 URL
		if (absoluteLocation) {
			try {
                // 直接全路径 进行解析XML 得到Set集合  
				int importCount = getReaderContext().getReader().
                    loadBeanDefinitions(location, actualResources);
				if (logger.isDebugEnabled()) {
					logger.debug("Imported " + importCount 
                                 + " bean definitions from URL location [" + location + "]");
				}
			}
			catch (BeanDefinitionStoreException ex) {
				getReaderContext().error(
						"Failed to import bean definitions from URL location [" 
                    + location + "]", ele, ex);
			}
		}
    // 相对URI  用相对路径 通过解析器 计算出绝对路径
		else {
			// No URL -> considering resource location as relative to the current file.
			try {
				int importCount;
                // 由于 resource 实现类很多 子类的createRelative方法实现又不同 
                // 先用 子类进行解析 
				Resource relativeResource = getReaderContext().
                    getResource().createRelative(location);
                // 是否 解析成功 得到绝对路径
				if (relativeResource.exists()) {
					importCount = getReaderContext().
                        getReader().loadBeanDefinitions(relativeResource);
					actualResources.add(relativeResource);
				}
				else {
                    // 没有解析成功时 再用默认的解析器进行解析
					String baseLocation = getReaderContext().
                        getResource().getURL().toString();
					importCount = getReaderContext().getReader().
                        loadBeanDefinitions(StringUtils.
                                            applyRelativePath(baseLocation, location), 
                                            actualResources);
				}
				if (logger.isDebugEnabled()) {
					logger.debug("Imported " + importCount + 
                                 " bean definitions from relative location [" + location + "]");
				}
			}
			catch (IOException ex) {
				getReaderContext().error("Failed to resolve current resource location", ele, ex);
			}
			catch (BeanDefinitionStoreException ex) {
				getReaderContext().error("Failed to import bean definitions from relative location [" + location + "]",ele, ex);
			}
		}
    // 最后进行 监听器激活处理
		Resource[] actResArray = actualResources.
            toArray(new Resource[actualResources.size()]);
		getReaderContext().fireImportProcessed(location, actResArray, extractSource(ele));
	}

```

大致逻辑：

+ 先获取resource 属性（没有，就不处理）
+ 解析resource属性，获取路径
+ 是否时 绝对路径
+ 如果时绝对路径 使用递归 解析bean
+ 相对路径，就需要先 把相对路径 解析成 绝对路径，再进行 递归 即系bean
+ 调用监听器，完成解析

## 3.4 嵌入式 beans 标签的解析

和import 解析类似。

```xml
<beans>
	<beans>
    </beans>
</beans>
```

`doRegisterBeanDefinitions(ele);`

```java
protected void doRegisterBeanDefinitions(Element root) {
		// Any nested <beans> elements will cause recursion in this method. In
		// order to propagate and preserve <beans> default-* attributes correctly,
		// keep track of the current (parent) delegate, which may be null. Create
		// the new (child) delegate with a reference to the parent for fallback purposes,
		// then ultimately reset this.delegate back to its original (parent) reference.
		// this behavior emulates a stack of delegates without actually necessitating one.
		BeanDefinitionParserDelegate parent = this.delegate;
		this.delegate = createDelegate(getReaderContext(), root, parent);

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

		preProcessXml(root);
		parseBeanDefinitions(root, this.delegate);
		postProcessXml(root);

		this.delegate = parent;
	}
```

再一次进行递归，解析beans标签。