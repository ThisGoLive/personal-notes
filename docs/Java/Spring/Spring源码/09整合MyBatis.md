[[TOC]]

# 第九章 整合 MyBatis

MyBatis 消除乐几乎所有JDBC代码和参数的手动设置及结果集的检索。使用简单的XML或者注解用于配置和元素映射。

## 9.1 独立使用 MyBatis

（1） pojo （必须要有 无参构造）

（2）构建mapper 接口

（3）构建 MyBatis-config.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
  PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
  "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
	<properties resource="mysql.properties">
	    <property name="username" value="gl"/>
	    <property name="password" value="666777"/>
	</properties>
	<settings>
		<!-- 全局地开启或关闭配置文件中的所有映射器已经配置的任何缓存。  -->
		<setting name="cacheEnabled" value="false"/>
		<!-- 允许自动生成主键 -->
		<setting name="useGeneratedKeys" value="true"/>
		<!-- 配置默认的执行器。SIMPLE 就是普通的执行器；REUSE 执行器会重用预处理语句 -->
		<setting name="defaultExecutorType" value="REUSE"/>
	</settings>
	<typeAliases>
		<!-- 设置别名 -->
		<typeAlias alias="stu" type="SpringCode9MyBatis.SpringCode9MyBatis.onlyMyBatis.bean.StudentsBean"/>
	</typeAliases>
  <!-- 环境配置 -->
  <environments default="development">
    <!-- MyBatis环境配置 -->
    <environment id="development">
      <transactionManager type="JDBC"/>
      <!-- 数据源 -->
      <dataSource type="POOLED">
        <property name="driver" value="${mysql.driver}"/>
        <property name="url" value="${mysql.host}"/>
        <property name="username" value="${username}"/>
        <property name="password" value="${password}"/>
      </dataSource>
    </environment>
  </environments>
  <!-- 映射配置XML -->
  <mappers>
    <mapper resource="StudentsMapper.XML"/>
  </mappers>
</configuration>
```

（4） 构建映射SQL XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<!-- namespace 指向 mapper -->
<mapper namespace="SpringCode9MyBatis.SpringCode9MyBatis.onlyMyBatis.mapper.StudentsMapper">
	<update id="updateBean" parameterType="stu">
		update students set 
			stu_id = ${id} , 
			stu_name = '${name}' ,
			stu_age = ${age},
			stu_gender = ${gengder}
		where stu_id = ${id}
	</update>

	<select id="findByBean" parameterType="stu" resultType="stu">
		select 
			stu_id as id ,
			stu_name as name ,
			stu_age as age ,
			stu_gender as gengder
		from students where
			stu_id = ${id}
	</select>
</mapper>
```

使用maven 与 MyBatis 需要 注意路径问题。

## 9.2 spring整合 MyBatis

（1） 引入mybatis-spring支持包

（2） 配置spring文件，主要就是将 dataSource 配置进 SqlSessionFactory 中，而MyBatis中关于 dataSource 的配置不需要。Spring 管理 SqlSessionFactory 与 mapperFactoryBean

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
	<!-- <context:property-placeholder location="classpath:mysql.properties"
		ignore-unresolvable="true" ignore-resource-not-found="true" /> 与下面 效果相同-->
	<bean id="configurer" class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
		<property name="locations">
	    	<list>
	        	<value>classpath:mysql.properties</value>
	        </list>
	    </property>
	</bean>
	<!-- 配置数据源 连接池-->
	<bean id="dataSource" class="org.apache.commons.dbcp2.BasicDataSource" destroy-method="close">
		<property name="driverClassName" value="${mysql.driver}"></property>
		<property name="url" value="${mysql.host}"></property>
		<property name="username" value="${mysql.user}"></property>
		<property name="password" value="${mysql.pwd}"></property>
		<!-- 初始连接数 -->
		<property name="initialSize" value="1"></property>
		<!-- 最大连接数  dbcp2 这个版本没有？-->
		<!-- <property name="maxActive maxActive" value="70"></property> -->
		<!-- 连接数 保持最大 -->
		<property name="maxIdle" value="10"></property>
		<!-- 连接数 保持最小 -->
		<property name="minIdle" value="1"></property>
	</bean>
	
	<bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
		<property name="configLocation" value="classpath:mybatis-config-spring.xml"></property>
		<property name="dataSource" ref="dataSource" ></property>
	</bean>
	
	<bean id="stuMapper" class="org.mybatis.spring.mapper.MapperFactoryBean">
		<property name="mapperInterface" value="SpringCode9MyBatis.SpringCode9MyBatis.onlyMyBatis.mapper.StudentsMapper"></property>
		<property name="sqlSessionFactory" ref="sqlSessionFactory"></property>
	</bean>
</beans>

```

```java
public void testAfterSp() {
		StudentsBean bean = new StudentsBean();
		bean.setId(2);
		StudentsMapper iss = (StudentsMapper) context.getBean("stuMapper");
//		iss.save(bean);
		bean = iss.findByBean(bean);
		bean.setAge(16);
		bean.setGengder(0);
		bean.setName("王老妹");
		iss.updateBean(bean);
//		事务 需要管理
		StudentsBean bae = iss.findByBean(bean);
		System.out.println(bae);
	}
```

## 9.3 源码

由于 spring没有做 MyBatis 的兼容，MyBatis 开发团队 开发的 MyBatis—spring 的包来进行 兼容。

### 9.3.1 创建 SqlSessionFactoryBean

主要是创建类 `org.mybatis.spring.SqlSessionFactoryBean`来进行，整合。

主要实现了两个接口：

+ InitializingBean：实现后 bean在初始化时调用 `afterPropertiesSet`方法，进行bean的初始化。
+ `FactoryBean<SqlSessionFactory>`：可以通过 `getBean`方法获取 `SqlSessionFactory`实例。

#### 9.3.1.1 初始化 

数据，例如 dataSource 都是在配置文件中位置好了，configLocation 属性 也已经读取。

```java
  public void afterPropertiesSet() throws Exception {
    notNull(dataSource, "Property 'dataSource' is required");
    notNull(sqlSessionFactoryBuilder, "Property 'sqlSessionFactoryBuilder' is required");
    state((configuration == null && configLocation == null) || !(configuration != null && configLocation != null),
              "Property 'configuration' and 'configLocation' can not specified with together");

      // 创建 SqlSessionFactory 实例
    this.sqlSessionFactory = buildSqlSessionFactory();
  }
```

#### 9.3.1.2 获取SQLSessionFactory实例

```java
  public SqlSessionFactory getObject() throws Exception {
    if (this.sqlSessionFactory == null) {
      afterPropertiesSet();
    }

    return this.sqlSessionFactory;
  }
```

### 9.3.2 MapperFactoryBean创建

实现MyBatis功能，除了SQLSessionFactoryBean,还有 创建映射 实例的 `org.mybatis.spring.mapper.MapperFactoryBean` ;

还是同 `SqlSessionFactoryBean`类似，实现了两接口  InitializingBean 和 FactoryBean

#### 9.3.2.1 初始化

父类 `DaoSupport`实现

```java
	public final void afterPropertiesSet() throws IllegalArgumentException, BeanInitializationException {
		// Let abstract subclasses check their configuration.
		checkDaoConfig();

		// Let concrete implementations initialize themselves.
		try {
			initDao();
		}
		catch (Exception ex) {
			throw new BeanInitializationException("Initialization of DAO failed", ex);
		}
	}
```

1. 父类中 对 sqlSession验证不能为空；配置文件中，`<property name="sqlSessionFactory" ref="sqlSessionFactory"></property>`
2. 映射接口验证：sqlSession 会根据 接口动态创建对应的代理类。
3. 映射文件存在验证：...

### 9.3.3 MapperScannerConfigurer

在使用 MapperFactoryBean ，userMapper。需要配置映射的 接口。比较麻烦。这里就引入类 `MapperScannerConfigurer`；

```xml
<!-- MapperFactoryBean的配置 改为： -->
	<bean id="stuMapper" class="org.mybatis.spring.mapper.MapperFactoryBean">
		<property name="mapperInterface" value="SpringCode9MyBatis.SpringCode9MyBatis.onlyMyBatis.mapper.StudentsMapper"></property>
		<property name="sqlSessionFactory" ref="sqlSessionFactory"></property>
	</bean>

<bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
    
    <!-- 映射接口 所在的包 多个 用 ；或者 ，  -->
	<property name="basePackage" value="SpringCode9MyBatis.SpringCode9MyBatis.onlyMyBatis.mapper；"></property>
    <!-- 将session与程序中的sqlmapper配置文件进行关联，为SQLMapper接口在spring容器中，产生对应的动态代理实例 -->
	<property name="sqlSessionFactoryBeanName" value="sessionFactory"></property>
</bean>
```

MapperScannerConfigurer 虽然有 `afterPropertiesSet`但是逻辑没有什么重要的。

看看 后置处理器 PostProcessor；

```java
// BeanFactoryPostProcessor  
public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) {
    // left intentionally blank
  }
```

```java
// BeanDefinitionRegistryPostProcessor的 bean定义记录后置处理器 实现 
public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) {
    if (this.processPropertyPlaceHolders) {
        // 9.3.3.1
      processPropertyPlaceHolders();
    }

    ClassPathMapperScanner scanner = new ClassPathMapperScanner(registry);
    scanner.setAddToConfig(this.addToConfig);
    scanner.setAnnotationClass(this.annotationClass);
    scanner.setMarkerInterface(this.markerInterface);
    scanner.setSqlSessionFactory(this.sqlSessionFactory);
    scanner.setSqlSessionTemplate(this.sqlSessionTemplate);
    scanner.setSqlSessionFactoryBeanName(this.sqlSessionFactoryBeanName);
    scanner.setSqlSessionTemplateBeanName(this.sqlSessionTemplateBeanName);
    scanner.setResourceLoader(this.applicationContext);
    scanner.setBeanNameGenerator(this.nameGenerator);
    // 9.3.3.2
    scanner.registerFilters();
    // 9.3.3.3
    scanner.scan(StringUtils.tokenizeToStringArray(this.basePackage, ConfigurableApplicationContext.CONFIG_LOCATION_DELIMITERS));
  }
```

#### 9.3.3.1 processPropertyPlaceHolders  属性处理器

processPropertyPlacHolders 属性比较少见

```java
 /*
   * BeanDefinitionRegistries are called early in application startup, before
   * BeanFactoryPostProcessors. This means that PropertyResourceConfigurers will not have been
   * loaded and any property substitution of this class' properties will fail. To avoid this, find
   * any PropertyResourceConfigurers defined in the context and run them on this class' bean
   * definition. Then update the values.
   */
  private void processPropertyPlaceHolders() {
    Map<String, PropertyResourceConfigurer> prcs = applicationContext.getBeansOfType(PropertyResourceConfigurer.class);

    if (!prcs.isEmpty() && applicationContext instanceof ConfigurableApplicationContext) {
      BeanDefinition mapperScannerBean = ((ConfigurableApplicationContext) applicationContext)
          .getBeanFactory().getBeanDefinition(beanName);

      // PropertyResourceConfigurer does not expose any methods to explicitly perform
      // property placeholder substitution. Instead, create a BeanFactory that just
      // contains this mapper scanner and post process the factory.
      DefaultListableBeanFactory factory = new DefaultListableBeanFactory();
      factory.registerBeanDefinition(beanName, mapperScannerBean);

      for (PropertyResourceConfigurer prc : prcs.values()) {
        prc.postProcessBeanFactory(factory);
      }

      PropertyValues values = mapperScannerBean.getPropertyValues();

      this.basePackage = updatePropertyValue("basePackage", values);
      this.sqlSessionFactoryBeanName = updatePropertyValue("sqlSessionFactoryBeanName", values);
      this.sqlSessionTemplateBeanName = updatePropertyValue("sqlSessionTemplateBeanName", values);
    }
  }

```

该函数主要作用就是，在spring配置文件中有PropertyPlaceholderConfigurer时，提前调用，得到 文件中的数据。

防止 `BeanDefinitionRegistry`调用时，配置文件中的 加载文件 数据没有得到。

```xml
	<bean id="configurer" class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
		<property name="locations">
	    	<list>
	        	<value>classpath:mapperClassPath.properties</value>
	        </list>
	    </property>
	</bean>
<bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
	<property name="basePackage" value="SpringCode9MyBatis.SpringCode9MyBatis.onlyMyBatis.mapper；"></property>
	<property name="sqlSessionFactoryBeanName" value="${classPathPackage}"></property>
</bean>
```

1. 找到所有已经注册的 PropertyPlaceholderConfigurer
2. 模拟Spring环境 用处理器。

#### 9.3.3.2 根据配置属性生成过滤器

```java
  public void registerFilters() {
    boolean acceptAllInterfaces = true;

    // if specified, use the given annotation and / or marker interface
      // 对 annotationClass 属性 处理
    if (this.annotationClass != null) {
      addIncludeFilter(new AnnotationTypeFilter(this.annotationClass));
      acceptAllInterfaces = false;
    }

    // override AssignableTypeFilter to ignore matches on the actual marker interface
    if (this.markerInterface != null) {
      addIncludeFilter(new AssignableTypeFilter(this.markerInterface) {
        @Override
        protected boolean matchClassName(String className) {
          return false;
        }
      });
      acceptAllInterfaces = false;
    }

    if (acceptAllInterfaces) {
      // default include filter that accepts all classes
      addIncludeFilter(new TypeFilter() {
        @Override
        public boolean match(MetadataReader metadataReader, MetadataReaderFactory metadataReaderFactory) throws IOException {
          return true;
        }
      });
    }

    // exclude package-info.java
      // 不扫描 package-info.java
    addExcludeFilter(new TypeFilter() {
      @Override
      public boolean match(MetadataReader metadataReader, MetadataReaderFactory metadataReaderFactory) throws IOException {
        String className = metadataReader.getClassMetadata().getClassName();
        return className.endsWith("package-info");
      }
    });
  }
```

**annotationClass 注释属性** 

用户设置了 annotationClass 属性，根据此属性生成过滤器以保证达到用户想要的效果。`AnnotationTypeFilter`过滤器：保证在扫描对应的Java文件时只接受注解 annotationClass 的接口；

**markerInterface 标记接口属性**

使用 `AssignableTypeFilter`过滤器：只扫描 实现 `markerInterface` 接口的接口。

**默认**

如果上面两个过滤器都没有设置，则设置默认过滤器，只扫描 路径中的接口。

**不用 package-info**

#### 9.3.3.3 扫描Java文件



```java
	public int scan(String... basePackages) {
		int beanCountAtScanStart = this.registry.getBeanDefinitionCount();

		doScan(basePackages);

		// Register annotation config processors, if necessary.
		if (this.includeAnnotationConfig) {
			AnnotationConfigUtils.registerAnnotationConfigProcessors(this.registry);
		}

		return (this.registry.getBeanDefinitionCount() - beanCountAtScanStart);
	}
```

文件扫描；4.3.x 与 3.x 这里又有出入 3.x 会先获取父类的该方法返回结果

```java
	protected Set<BeanDefinitionHolder> doScan(String... basePackages) {
		Assert.notEmpty(basePackages, "At least one base package must be specified");
		Set<BeanDefinitionHolder> beanDefinitions = new LinkedHashSet<BeanDefinitionHolder>();
		for (String basePackage : basePackages) {
            // 扫描 basePackage 路径下的Java文件
			Set<BeanDefinition> candidates = findCandidateComponents(basePackage);
            
			for (BeanDefinition candidate : candidates) {
                // 解析 scope 属性
				ScopeMetadata scopeMetadata = this.scopeMetadataResolver.resolveScopeMetadata(candidate);
				candidate.setScope(scopeMetadata.getScopeName());
				String beanName = this.beanNameGenerator.generateBeanName(candidate, this.registry);
				if (candidate instanceof AbstractBeanDefinition) {
					postProcessBeanDefinition((AbstractBeanDefinition) candidate, beanName);
				}
				if (candidate instanceof AnnotatedBeanDefinition) {
					// 如果 是 AnnotatedBeanDefinition，需要检查 常用注解 Primary Lazy等
                    AnnotationConfigUtils.
                        processCommonDefinitionAnnotations((AnnotatedBeanDefinition) candidate);
				}
                // 检查当前bean是否被注册
				if (checkCandidate(beanName, candidate)) {
					BeanDefinitionHolder definitionHolder = new BeanDefinitionHolder(candidate, beanName);
					definitionHolder =
							AnnotationConfigUtils.applyScopedProxyMode(scopeMetadata, definitionHolder, this.registry);
					beanDefinitions.add(definitionHolder);
					registerBeanDefinition(definitionHolder, this.registry);
				}
			}
		}
		return beanDefinitions;
	}
```

`Set<BeanDefinition> candidates = findCandidateComponents(basePackage);`

```java
	public Set<BeanDefinition> findCandidateComponents(String basePackage) {
		Set<BeanDefinition> candidates = new LinkedHashSet<BeanDefinition>();
		try {
			String packageSearchPath = ResourcePatternResolver.CLASSPATH_ALL_URL_PREFIX +
					resolveBasePackage(basePackage) + '/' + this.resourcePattern;
			Resource[] resources = this.resourcePatternResolver.getResources(packageSearchPath);
			boolean traceEnabled = logger.isTraceEnabled();
			boolean debugEnabled = logger.isDebugEnabled();
			for (Resource resource : resources) {
				if (traceEnabled) {
					logger.trace("Scanning " + resource);
				}
				if (resource.isReadable()) {
					try {
						MetadataReader metadataReader = this.metadataReaderFactory.getMetadataReader(resource);
                        // 使用过滤器
						if (isCandidateComponent(metadataReader)) {
							ScannedGenericBeanDefinition sbd = new ScannedGenericBeanDefinition(metadataReader);
							sbd.setResource(resource);
							sbd.setSource(resource);
							if (isCandidateComponent(sbd)) {
								if (debugEnabled) {
									logger.debug("Identified candidate component class: " + resource);
								}
								candidates.add(sbd);
							}
							else {
								if (debugEnabled) {
									logger.debug("Ignored because not a concrete top-level class: " + resource);
								}
							}
						}
						else {
							if (traceEnabled) {
								logger.trace("Ignored because not matching any filter: " + resource);
							}
						}
					}
					catch (Throwable ex) {
						throw new BeanDefinitionStoreException(
								"Failed to read candidate component class: " + resource, ex);
					}
				}
				else {
					if (traceEnabled) {
						logger.trace("Ignored because not readable: " + resource);
					}
				}
			}
		}
		catch (IOException ex) {
			throw new BeanDefinitionStoreException("I/O failure during classpath scanning", ex);
		}
		return candidates;
	}
```

`findCandidateComponents` 作用就是，根据传人的 包路径 结合类文件路径拼成绝对路径，同时生成对应的bean。