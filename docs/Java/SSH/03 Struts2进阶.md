# 第三章： Struts 2 进阶

2019年4月12日 - 2019年4月13日

## 3.1 Struts 2 的常规配置

虽然 Struts 提供了 Convention 插件管理 Action与 result，但通常还是使用 xml 配置文件。struts.xml 除了配置映射关系，还可以配置 bean 常量 与 导入的其他配置文件。

### 3.1.1 常量

常量的 覆盖顺序 依次： struts.xml 、sruts.properties 、 web.xml。如果同一个常量，都有配置，则最后 在web.xml 中 体现。

| 属性                             | 功能说明                                                     |
| -------------------------------- | ------------------------------------------------------------ |
| struts.configuration             | 指定加载 struts2配置文件的配置管理器，该常量默认值：com.opensymphony.xwork2.config.impl.DefaultConfiguration (默认配置文件管理器) |
| struts.locale                    | 指定Web应用的默认Locale，默认值为en_US,中文环境下为 zh_CN    |
| struts.i18n.encoding             | 指定Web应用的默认编码集，默认值 UTF-8                        |
| struts.objectFactory             | 指定 Struts2 的默认 ObjectFactory Bean                       |
| struts.multipart.parser          | 指定处理 multipart/form-data的MIME(文件上传)类型请求框架，默认值是jakarta,可以支持 cos、pell及common-fileupload等文件上传框架。 |
| struts.multipart.saveDir         | 指定上传文件的临时保存路径，默认值是 javax.servlet.context.tempdir |
| struts.multipart.maxSize         | 上传文件的最大字节数                                         |
| struts.custom.properties         | 指定 struts2 加载用户自定义的 常量文件，多个文件用 ","隔开。 |
| struts.mapper.class              | 指定 将 HTTP请求映射到指定的Action的映射器，Struts 2提供了 默认映射器 ：org.apache.struts2.dispatcher.mapper.DefaultActionMapper |
| struts.action.extension          | 指定 Struts 2 处理的请求后置，默认 *.action配置请求。        |
| struts.sreve.static.browserCache | 设置浏览器 是否缓存静态内容，开发阶段设置为 false            |
| struts.configuration.xml.reload  | 当 struts.xml 有修改时，是否自动重新加载该文件，默认 false   |
| struts.devMode                   | 是否使用开发者模式，默认false 开发 设置为 true               |
| struts.xslt.nocache              | 指定 XSLT Result 是否使用样式表缓存，开发阶段通常设置为 true |
| struts.custom.i18n.resources     | 国际化资源文件，多个 用 ","隔开                              |

xml 中配置 常量

```xml
<constant name="struts.multipart.saveDir" value="D:\\AsimsTemp"></constant> 
```

properties

```properties
struts.multipart.saveDir = /temp
```

wen.xml

```xml
  <filter>
  	<filter-name>struts2</filter-name>
  	<filter-class>org.apache.struts2.dispatcher.filter.StrutsPrepareAndExecuteFilter</filter-class>
  	<init-param> 
        <param-name>struts.custom.i18n.resources</param-name> 
        <param-value>国际化 文件名</param-value>
    </init-param>
  </filter>
  <filter-mapping>
  	<filter-name>struts2</filter-name>
  	<url-pattern>/path/*</url-pattern>
  </filter-mapping>
```

### 3.1.2 包

struts2中的包：为struts.xml中配置文件中每个包。由多个 action 、多个 拦截器、多个拦截器引用组成的集合，通过包可以非常方便对struts2框架进行组织 与管理。

**Struts 2 中的 package 组成**：

| 属性名称  | 功能描述                                                   |
| --------- | ---------------------------------------------------------- |
| name      | 指定包的名称，必填，用于指明该包被其他包引用的key          |
| extends   | 指定包继承的其他包，继承其他包的 action 拦截器等定义。选填 |
| namespace | 包的命名空间，选填                                         |
| abstract  | 是否为抽象包，抽象包 不能有action 定义                     |

1. 抽象包 不能有action 定义。
2. 由于读取 Struts.xml 是从上到下读取，故而 被继承的包 必须在 继承包之前。
3. 包与包之间。名词不能相同。
4. 同一包下，同名action 时，后者覆盖前者。

### 3.1.3 命名空间

**namespace 命名空间**

1. 不填时，为默认值

2. 填 "/",根请求

3. 当配置时，如 某个包 配置namespace="/find", 当请求为  /find/*.action   时，便会监听到。
4. "/find/get.action" 时，find命名空间包 下，没有get action时，会去默认包中寻找，并且也可以使用。

同第二章一样 2.3.1 一样。

#### 3.1.3.1 默认监听根目录时

web.xml:

```xml
  <filter>
  	<filter-name>struts2</filter-name>
  	<filter-class>org.apache.struts2.dispatcher.filter.StrutsPrepareAndExecuteFilter</filter-class>
  	<init-param> 
        <param-name>config</param-name> 
        <param-value>struts-default.xml,struts-plugin.xml,struts.xml</param-value>
    </init-param>
  </filter>
  <filter-mapping>
  	<filter-name>struts2</filter-name>
  	<url-pattern>/*</url-pattern>
  </filter-mapping>
```

starts.xml 配置

```xml
	<package name="default" extends="struts-default">
		<action name="defult"
			class="struts2.depth.demo.action.DefaultSpaceAction">
			<result name="ok">/default.jsp</result>
            <result name="ok1">/space/default.jsp</result>
		</action>
	</package>
	<package name="space" namespace="/space" extends="struts-default">
		<action name="defult"
			class="struts2.depth.demo.action.DefaultSpaceAction">
			<result name="ok">/spaceDefault.jsp</result>
		</action>
	</package>
```

1. 项目URL ： http://192.168.0.200:8080/Struts2Depth/
2. http://192.168.0.200:8080/Struts2Depth/defult.action
3. http://192.168.0.200:8080/Struts2Depth/space/defult.action

访问成功。得到的都是 **webapp** 目录下 相对的路径。

#### 3.1.3.2 默认监听非根目录时

web.xml:

```xml
  <filter>
  	<filter-name>struts2</filter-name>
  	<filter-class>org.apache.struts2.dispatcher.filter.StrutsPrepareAndExecuteFilter</filter-class>
  	<init-param> 
        <param-name>config</param-name> 
        <param-value>struts-default.xml,struts-plugin.xml,struts.xml</param-value>
    </init-param>
  </filter>
  <filter-mapping>
  	<filter-name>struts2</filter-name>
  	<url-pattern>/path/*</url-pattern>
  </filter-mapping>
```

struts.xml

```xml
<package name="default" extends="struts-default">
	<action name="defult"
		class="struts2.depth.demo.action.DefaultSpaceAction">
		<result name="ok">/default.jsp</result>
        <result name="ok1">/space/default.jsp</result>
	</action>
</package>
<package name="space" namespace="/space" extends="struts-default">
	<action name="defult"
		class="struts2.depth.demo.action.DefaultSpaceAction">
		<result name="ok">/spaceDefault.jsp</result>
	</action>
</package>
```
1. 项目URL ： http://192.168.0.200:8080/Struts2Depth/path
2. http://192.168.0.200:8080/Struts2Depth/path/defult.action 这个路径居然能识别? 但是在 第二章中，在没有开启 第二个 命名空间包，是无法找到 `/default.jsp`。然后，我现在再去复习 第二章 代码，居然没法复现！
3. 而且 http://192.168.0.200:8080/Struts2Depth/path/space/defult.action ，居然无法 识别 命名空间。会默使用第一个 包。

第三点： action class 为 `struts2.depth.demo.action.HaveSpaceAction` 后， 没有出现，无法识别space的状态。

第二点：无论 怎么都没有出现那个问题。而且`../default.jsp` `/default.jsp` `default.jsp`三者都可以访问到！！

### 3.1.4 其他配置文件

使用 `<include>`元素

```xml
<struts>
	<include file="struts-part1.xml"></include> ...
</struts>
```

struts-part1.xml 是 完整的 struts.xml 文件。DTD完整。因为 每个 都是单独 解析。

通常 struts的所有配置文件  默认都在 web应用的 WEB-INF/classes 类路径下。

## 3.2 Action 的实现

 POJO 、 自定义接口 execute 、继承 struts 提供的类 `ActionSupport`

如果在配置文件时，action 没有 配置 class，系统也会默认 `ActionSupport`作为处理类。

### 3.2.1 访问ActionContext

struts 2中 Context 不再与 Servlet API 耦合。也就是 说 可以脱离容器。

但是有些时候 Action 类 步范围 Servlet API 是步能实现业务逻辑的。如Session 状态，此时 就需要访问 Servlet API 的HttpSession。

ActionContext 的 常用方法：

| 方法                              | 功能描述                                                     |
| --------------------------------- | ------------------------------------------------------------ |
| Object get(Object key)            | 获取属性值，与HttpServletRequest的 getAttribute(String name)类似 |
| Map getApplication()              | 返回一个 Map，模拟 Web中的 ServletContext                    |
| static ActionContext getContext() | 获取 系统中 的 ActionContext                                 |
| Map getParameters()               | 获取请求参数，类似调用 HttpServletRequest 对象的 getParametersMap() |
| Map getSession()                  | 模拟 HttpSession 实例                                        |
| void setApplication(Map app)      | 将参数中的 K/V 转换为 Application 中的 属性 属性值           |
| void setSession(Map session)      | 将参数中的 K/V 转换为 Session 中的 属性 属性值               |

### 3.2.2 访问 Servlet API

访问 Servlet API 接口

| 接口名               | 描述                                                        |
| -------------------- | ----------------------------------------------------------- |
| ServletContextAware  | 实现该接口的Action，可以直接访问Web应用的ServletContext实例 |
| ServletRequestAware  | ...                                                         |
| ServletResponseAware | ...                                                         |

或者 使用 工具类 ： `ServletActionContext`

| 方法                                      | 描述                            |
| ----------------------------------------- | ------------------------------- |
| static PageContext getPageContext()       | 获取 web应用的 PageContext 实例 |
| static HttpServletRequest getRequest()    |                                 |
| static HttServletResponse getResponse()   |                                 |
| static ServletContext getServletContext() |                                 |

## 3.3 配置 Action

### 3.3.1 基本配置

```xml
<package name="" namespace="/" extends="struts-default">
	<action name=" " class="">
    	<result name="">...</result>
    </action>
</package>
```

### 3.3.2 动态方法调用

Struts 2 一个 action 多个 逻辑操作。

请求同一个 action 中的不同处理逻辑，DMI 动态方法调用。

> actionName!methodName.action  // 将原本的  actionName.action 变为

例如 ：

```java
public class HandlerAction {
    public String remove() {
        return "remove";
    }
    public String edit() {
        return "edit";
    }
}
```

execute方法可以步出现，handler!remove.action 时，系统 逻辑 执行 remove方法。

### 3.3.3 使用 method 属性 及 通配符

 除了动态方法调用之外，Struts 2 还可以用另外一种处理方法。Action 处理类定义成多个逻辑 action。

在配置 action 时，还需要 配置 method 属性，如：

```xml
<action name="remHandler" class="" method="remove">
	<result name="remove">...</result>
</action>
```

多个时就比较麻烦，于是：

```xml
<action name="*Handler" class="" method="{1}">
	<result name="remove">...</result>
    <result name="edit">...</result>
</action>
```

`*`表示一个 或者 多个字符任意字符串。`{N}` 表示 第N个出现的 `*`的值。

`{N}` 还可以表示在 class属性中，如：

```xml
<action name="*_*" class="com.xxx.action.{1}" method="{2}">
	<result name="remove">...</result>
    <result name="edit">...</result>
</action>
```

## 3.4 result

逻辑视图 与 物理视图的映射关系

### 3.4.1 result 处理流程

用户请求到达 action 后，控制返回逻辑视图，Struts 2 返回一个 String。然后将请求转发到 物理视图。

可以执行 jsp freeMarker 或者 其他 action 逻辑，形成连锁。

### 3.4.2 配置 result

在配置文件中，通过result 标签的位置，分为 两种：全局 （global-results 的子元素） 与 局部 （action 的子元素）

1. 两者同名，局部覆盖全局
2. 先匹配局部，没有再匹配全局

属性： name 与 type  （type 默认 dispatcher 即支持 jsp）

### 3.4.3 result 类型 

| 类型值         | 说明                                       |
| -------------- | ------------------------------------------ |
| chain          | 进行action链                               |
| chart          | 整合 JFreeChart技术                        |
| dispatcher     | 整合 jsp技术                               |
| freemarker     | 整合 freemarker 技术                       |
| httpheader     | 用于控制特殊的 http 行为                   |
| jasper         | 整合 JasperReport 报表技术                 |
| jsf            | 整合 jsf 技术                              |
| redirect       | 重定向 到 其他URL                          |
| redirectAction | 重定向 到 其他 action                      |
| stream         | 向浏览器返回 InputStream，一般用于文件下载 |
| tiles          | 整合 tiles 技术                            |
| velocity       | 整合 Velocity 技术                         |
| xslt           | 整合 XML/XSLT                              |
| plainText      | 显示某页面的源码                           |

dispatcher 为 转发，redirect 为 重定向。

redirect

```xml
<result type="redirect">/index.jsp</result>
```

redirectAction

```xml
<result type="redirectAction">
	<param name="actionName">...</param>
    <param name="namespace"></param>
</result>
```

然后，关于 Struts 2 对 Ajax 支持：

1. 是在 action 中，处理逻辑中，调用，使用 Stream 方式，然后对 返回 的String 不做处理。
2. 使用第三方包，result 的 type类型 为 json

### 3.4.4 动态 result

还是 使用 `{n}`进行

## 3.5 异常处理

### 3.5.1 异常处理机制

当 action 出现异常时，系统 转入 与之对应的 视图资源，同时 在该视图资源上 输出服务器错误提示。

## 3.5.2 配置异常

需要 配置文件中， 加入 `<exception-mapping>` 标签。 该标签 有两个属性：`exception` 、 `result`

+ exception 指定 异常的类型
+ result 指定 该异常 对应 返回的 String 映射值。
+ 局部异常配置 在 `<action>` 下
+ 全局异常 配置在 `<global-exception-mappings>` 下

例子：

```xml
<action name="findFile" class="">
    <exception-mapping exception="FileNotFindException" result="notFind" />
    <result type="stream"></result>
    <result name="notFind">/error.jsp</result>
</action>
```



