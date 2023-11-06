[[TOC]]

# 第四章 ： Struts 2  标签库

2019年4月14日 - 2019年6月5日

由于重复创建demo项目，里面实质没有多数，标签库的demo，也放在了 Struts2Depth 项目中。

## 4.1 标签库概述

jsp 标签库能简化 jsp的编写，并且将Java 代码 与 显示分离。而 jsp 除了自己的标签库 `<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>`

 还支持，自定义标签库。而现在常见的 Web框架，包含 Struts 2 都有自己的 标签库。

### 4.1.1 标签库优势

开发自定义标签：

1. 自定义标签的处理类，标签同一处理继承 `javax.servlet.jsp.tagext.SimpleTagSupport`
2. 在 jsp 中使用 `taglib` 编译导入指定的 标签库，然后才能使用标签

优势：

+ 开发更简单
+ 可维护性强
+ 复用性高

### 4.1.2 Struts 2 的标签分类

Struts 2的标签不仅能用在 jsp 中，而且能使用在 Velocity FreeMarker 中。

所有的标签都定义在 URL为 `/struts-tags` 的空间下。

Struts 2标签 分类：

1. UI标签
   1. 非表单标签
   2. 表单标签
2. 非UI标签
   1. 流程控制标签
   2. 数据访问标签
3. Ajax标签

### 4.1.3 Struts 2 标签库的导入

标签的描述文件，在 `struts2-core-xx.jar`下可以找到。 `META-INF`下的 `struts-tags.tld`.

```xml
<%@ page language="java" contentType="text/html; charset=utf-8"
	pageEncoding="utf-8"%>
<%@ page isELIgnored="false"%>
<%@ taglib prefix="s" uri="/struts-tags"%>
<%-- <%@ page isELEnabled ="false"%> --%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>struts 2 - tags - demo</title>
</head>
<body>

</body>
</html>
```

由于 tomcat 8.5.24的 jsp 规范 为2.3(2.3 及一下)，需要在web.xml 中配置

```xml
	<taglib>
		<taglib-uri>/struts-tags</taglib-uri>
		<taglib-location>/WEB-INF/lib/struts2-core-2.5.20.jar</taglib-location>
	</taglib>
```

才能使用。

## 4.2 OGNL(对象图导航语言)表达式

OGNL 是 Struts 2 包含的 表达式语言。提供了 存取对象属性，调用对象方法、遍历对象结构图、对象类型转换的特定语法。

而其中 的 取值，是依赖了对象 的 `getter`.

```java
String teacherName = (String)Ognl.getValue("grade.teacher.name",studentEntity);
String teacherName = studentEntity.getGrade().getTeacher().getName();
```

### 4.2.1 OGNL 上下文 和 值栈

其实 OGNL 取值，还需要一个上下文环境。上面 `studentEntity`为root对象。而 root 对象的放在什么位置？

上下文环境，规定了 OGNL 操作在哪里进行。

```java
    public static void setRoot(Map context, Object root)
    {
        context.put(OgnlContext.ROOT_CONTEXT_KEY, root);
    }
```

OGNL 中：`OgnlContext` 来处理 OGNL 表达式，而且是一个 Map。 而Root对象 在 `OgnlContext` 就是一个 顶级对象或者根对象。

在使用中，自由 `root` 对象，属性访问是不需要任何标记与前缀的，而其他的 对象 则需要使用 "#" 标记。

```java
Map ognlContext = {"stu":studentEntity , "teacher":teacherEntity};
String value = (String)Ognl.getValue("grade.teacher.name + ',' + #teacher.name,ognlContext,studentEntity);
```

虽然 在 Struts 2 中 脱离容器，但是提交的action 还是需要与 Web 容器交互的，Struts 2 是构造类一个 action 的上下文环境 `ActionContext`。

并且使用 `ThreadLocale` (本地线程副本变量工具类)模式对每一次请求 实例化一个新的 `ActionContext`与当前线程绑定。故而线程安全。在这个环境中 请求数据存储传输 交给了 `ValueStack`

`ValueStack` (值栈)，是对 OGNL 的扩展，Struts 2 正是通过 `ValueStack` 使用 OGNL 进行赋值 取值操作。

`ValueStack` 不仅封装了  OGNL 的 所有功能，还对 root 对象 进行类扩展，`CompoundRoot`类型的对象作为 root对象。

`CompoundRoot`是个 继承 `ArrayList` 的存储结构。 所有 被压入 到 `值栈` 中的对象，都会被认为 是 OGNL 的root 对象。而在使用过程中，会将压入到  CompoundRoot 中的对象 依次作为 OGNL的 root 执行，进行 表达式匹配，直达第一个匹配成功。

当提交一个请求，就会创建 `ActionContext`,并且 创建 对应的 `ValueStack`，并放于 `ActionCotext`中。

而实例化 的action后，就会将这个action对象压如 valueStack 中。

请求 "映射"过程中，Struts 2 通过 `ParametersInterceptor`拦截器 将提交的参数值封装进对应 action 属性中。故而 Action 对象 可以作为 root 对象。

 ```java
	public String execute() throws Exception {

		final ValueStack vs = ServletActionContext.getContext().getValueStack();

		final CompoundRoot root = vs.getRoot();
		// Ognl.getValue(null, null)
		TeacherEntity teacher = new TeacherEntity(name, age); 
		TeacherEntity teacher1 = new TeacherEntity("优先", 1);
		root.clear();
		root.add(teacher1);
		root.add(teacher);
		return "ok";
	}
 ```

```xml
<body>
	<h3>teacher</h3>
	名字：${name}
	<br /> 年龄：${age}
	<br /> 性别：${param.gender}
	<br />
</body>
```

### 4.2.2 OGNL 常用符号的用法

#### **#** 号

1. 访问非根对象 属性

`#` 其实就相当于，AactionContext.getContext();  而 `#s1.name` 表示 AactionContext.getContext().get("s1").getName()

比如：

> parameters 对象， 用于 http 请求的参数， # parameters.name   就是 使用的 HttpServletRequest 对象的 getParameter("name")

> request 对象 ， 访问 HttpServletRequest 的属性， #request.name  相当与 使用 getAttribute("name")

> session 对象， 访问 HttpSession 对象，#session.name 相当与 使用 getAttribute("name")

>Application 对象，访问 ServletContext 对象， #application.name 相当与 使用 getAttribute("name")

> attr 对象，依次访问 各个 空间的中属性（page-request-session-application）

2. 用于 过滤 和投影集合，4.2.3 
3. 用于构造Map对象，4.2.3 

#### **%** 号

1.

在字符串中，是否按照 普通字符串处理。

即在标签使用时，`"#session.name"`  与  `"%{#session.name}"`   前者直接显示，后者解析。

2.

在jsp中 表示 OGNL表达式 的开始 与结束： `%{` `}`

3.

以及 取出 值栈 中 Action 对象的方法，`%{getName()}`

#### **$** 号

1. 在国际化资源文件中，引用 OGNL 表达式，`title = 今天日期 ${date}`
2. 在 Struts 配置文件中 ，引用 OGNL 表达式，使用与上面类似

### 4.2.3 OGNL集合表达式

直接生成 List 集合： `{a,b,c}` 用英文`,` 隔开

生成Map 集合 ： `#{key1:a,key2:b,key3:c}`

in 与 not in

```xml
<!-- in 与 not in 基本一样 -->
<s:if test="'a' in {'a','b','c'}"> 
	...
</s:if>
<s:else>
    ...
</s:else>
```

还有获得 集合 的 规则子集，

？ 符合逻辑的 所有元素

^  符合逻辑的 第一个元素

$  符合逻辑的 最后一个元素

## 4.3 数据标签

| 标签       | 描述                                                         |
| ---------- | ------------------------------------------------------------ |
| action   | Jsp 文件直接调用一个 Action，通过 指定的 executeResult 参数，还可以将该action的 处理结果 包含到当前页面中 |
| bean     | 用于创建一个 JavaBean 实例，如果指定类 id 属性 则可以将创建的JavaBean实例放入到StackContext中。 |
| date     | 用于 将时间 格式化 输入。                                    |
| debug    | 用于在页面上 生成 一个链接，可以查看值栈 与 StackContext 的值 |
| i18n     | 指定 国际化资源文件 中的  baseName                           |
| include  | 用于 jsp 页面 中包含其他的 jsp 页面 或者 Servlet 资源        |
| param    | 用于设置一个参数，通常时用作 bean 标签的 子标签              |
| property | 用于输出某个值包含 ValueStack、StackContext、ActionContext 中的值 |
| push     | 将指定的值放入到 ValueStack 的栈顶                           |
| set      | 用于设置一个新的变量，并将其存放找到指定的范围内             |
| text     | 输出 国际化信息                                              |
| url      | 生成一个 URL 地址                                            |

### 4.3.1 bean 标签

创建一个 JavaBean实例。可以使用 `<param>`   为 该实例设置 或者 访问 属性，但是需要 get/set。

**bean标签属性**：

| 属性名 | 是否 必填 | 说明                                                   |
| ------ | --------- | ------------------------------------------------------ |
| name   | 是        | 值 为实例化的 Java 实现类                              |
| id     | 否        | 如果有值，则 可以通过 该值在 StackContext中 访问该对象 |

`bean 标签内时，该标签创建的 实例 会被放在 值栈的栈顶，但如果除去了，该实例就会被移除，除非 指定了id`

```xml
<%@ taglib prefix="s" uri="/struts-tags"%>
<s:bean name="xx.xxx.xxx">
    <!--- 设置属性 -->
	<s:param name="userName" value="张三" ></s:param>
    <s:param name="gender" value="男" ></s:param>
    <!--- 调用属性 -->
    <s:property  value="userName" ></s:property>
</s:bean>
```

### 4.3.2 include 标签

Struts 2 与 Jsp 中 Include 非常类似，用于将一个`JSP 页面` 或者 一个`Servlet` 或者其他`任何资源` 包含到当前页面中，并且 允许将参数传递给包含的文件， 是Struts 2框架的一部分。

| 属性名 | 是否 必填 | 说明                         |
| ------ | --------- | ---------------------------- |
| value  | 是        | 设置所包含的Jsp 或者 Servlet |
| id     | 否        | 该标签的标识                 |

```xml
<%@ taglib prefix="s" uri="/struts-tags"%>
<s:include value = "xx.jsp"></s:include>
```

在标签内部 可以 使用多个 `param` 标签 向 包含的 jsp Servlet 中传人参数。

### 4.3.3 param 标签

就是 为 `bean` `include` 标签 设置参数的。

| 属性名 | 是否 必填 | 说明                            |
| ------ | --------- | ------------------------------- |
| name   | 否        | 指定 被设置参数的 参数名        |
| value  | 否        | 设定参数的数据 这里为Object类型 |
| id     | 否        | 引用标识                        |

### 4.3.4 property 标签

`property`用于输出 value 的值，如果 value 属性指定输出的值，则默认输出 值栈 的顶值

| 属性名           | 是否 必填 | 说明                                        |
| ---------------- | --------- | ------------------------------------------- |
| default          | 否        | 当需要输出的值为 null 时，显示 default 的值 |
| escape           | 否        | 是否转义 HTML，默认为 true                  |
| escapeJavaScript | 否        | 是否转义 为 JavaScript 默认为 false         |
| value            | 否        | 指定 输出的值                               |

### 4.3.5 set 标签

设置一个变量，到 OGNLContext 中。

| 属性名 | 是否 必填 | 说明                                                         |
| ------ | --------- | ------------------------------------------------------------ |
| name   | 是        | 设置变量的名称                                               |
| scope  | 否        | 用于 设置变量的作用域，可选 ： application 、session 、request、page、action。如果没有设置 就 会到 OgnlContext 中 |
| value  | 否        | 如果没有设置值，默认 将 值栈中 顶端数据设置进                |

### 4.3.6 URL 标签

用于创建一个 URL 地址，但不显示到页面上，需要其他的标签引用它，比如 `<a>`标签。 URL 标签 可以包含 param 标签，通过 param 设置 URL 要传递的参数。

| 属性名         | 是否 必填 | 说明                                                         |
| -------------- | --------- | ------------------------------------------------------------ |
| action         | 否        | 指定 URL地址为哪个 action，如果action没有提供值，就使用value作为 URL的值 |
| value          | 否        | 如果 value 没有值，会使用 action属性指定的action 作为 URL    |
| includeParams  | 否        | 指定 是否包含 请求参数，该属性的值 为 none、get、或all       |
| scheme         | 否        | 用于设置 scheme 属性                                         |
| namespace      | 否        | 设置命名空间，与action 结合，与action 没用                   |
| method         | 否        | 用于指定 action 的方法                                       |
| encode         | 否        | 指定 是否需要对请求参数进行编码                              |
| includeContext | 否        | 是否需要将当前上下文 包含在 URL地址中                        |
| anchor         | 否        | 指定 URL 的 锚点                                             |
| id             | 否        | 引用id， 使用该属性时，不会在页面上 输出，但可以被引用       |
| escapeAmp      | 否        | 指定 是否 将 特殊符号 “&”解析成实体 “&amp”                   |

```xml
	<h3>url 使用例子</h3>
	<!-- 单独 value 不显示全路径  -->
	<s:url value="defult.action">
		<s:param name="id" value="123"></s:param>
	</s:url>
	<hr/>
	<!-- 这里应该指的是 stats中 action的 name 并且会显示全路径 -->
	<s:url action="defult">
		<s:param name="id" value="123"></s:param>
	</s:url>
	<hr/>
	<!--  都使用时 以value 为准 不显示全路径  -->
	<s:url value="defult.action" action="defult">
		<s:param name="id" value="123"></s:param>
	</s:url>
	<hr/>
	<!--  都不使用时   显示当前页面的全路径   并且可以使用 includeParams 传递参数  -->
	<s:url includeParams="get">
		<s:param name="id" value="123"></s:param>
	</s:url>
```

## 4.4 控制标签

| 标签      | 描述                                                   |
| --------- | ------------------------------------------------------ |
| append    | 用于将多个集合 拼接为一个结合                          |
| else      |                                                        |
| elseif    |                                                        |
| if        |                                                        |
| iterator  |                                                        |
| generator | 将一个字符串解析为 一个集合                            |
| merge     | 用于多个集合 拼接为一个集合 但是 与append 实现方式不同 |
| sort      | 对集合的排序                                           |
| subset    | 用于截取集合的部分集合 生成新集合                      |

### 4.4.1 控制标签 if-elseif-else

`if`  与 `elseif` 都只包含一个 属性 `test ` 返回一个boolean 值。利用 `%` 计算 `{}`内表达式的值

```xml
<s:if test="%{#student.age > 18}">
	<s:property value="成年"></s:property>
</s:if>
...
```

### 4.4.2 iterator 遍历器标签

属性结束：

| 属性名 | 是否可选 | 描述                                                       |
| ------ | -------- | ---------------------------------------------------------- |
| var    | 否       | 每次遍历的对象引用名                                       |
| begin  | 是       | 数值循环 开始                                              |
| end    | 是       | 数值循环结束                                               |
| step   | 是       | 循环每次的步长                                             |
| value  | 是       | 迭代时的集合，如果没有设定 默认使用 值栈 栈顶的 集合       |
| status | 是       | 迭代时的实例对象`IteratorStatus`，类似 当地遍历 当前信息。 |

`IteratorStatus` 方法

| 方法名            | 描述                     |
| ----------------- | ------------------------ |
| int  getCont()    | 返回 当前 迭代的元素个数 |
| int getIndex()    | 返回 当前迭代元素的 下标 |
| boolean isEven()  | 当前下表 是否为 偶数     |
| boolean isFirst() | 是否为 第一个 元素       |
| boolean isLast()  |                          |
| boolean idOdd()   | 是否 为 级数             |

```xml
	<s:iterator begin="10" var="num" end="20" step="2">
		<s:property value="#num"/>
	</s:iterator>
	<hr/>
	<s:iterator value="{'张三','李四','王五'}" var="list" status="lists">
		<s:property value="#lists.count"/>
		<s:property value="list"/>
		<s:property value="#lists"/>
	</s:iterator>
```

## 4.5 模板 与 主题

主题 与 模板 是所有 Struts 2 UI标签的核心

### 4.5.1 模板 Template

就是一些代码，status 2 中 常用`FreeMarker` 来进行编写，故而 看到 maven 依赖 Struts 2 时，还有 freemarker 的  包，标签使用 这些代码 能渲染生成 相应的HTML 代码。

数据：通过值栈 与 OGNL 表达式

样式： 由 `FreeMarker` 的模板定义

每个标签 都有 自己对应的`FreeMarker` 模板，在 核心包 的 template 下

### 4.5.2 主题 Theme

主题就是许多模板的集合，通常情况下，这些模板 拥有 相同 或者 类似的风格，以保证显示风格一致。

Struts 2 标签 是使用一个模板来生成 最终 的HTML 代码。就是说 同一个 struts 2 标签 使用不同的的模板，生成的 HTML代码 也就不同 。

如果 一个复杂的页面 ，需要很多标签，而每个标签的 风格不同时，就是使用 主题了。

设置主题的方法：

+ 通过设定特定的 UI 标签中 theme 属性来指定主题
+ 通过设定特定的 UI 标签外围 `<form>`标签的 theme 属性指定设置
+ 通过 获取 page 页面 范围内 以 theme 为名称的属性值 确定主题
+ 通过获取 request 会话范围内 以 theme 为名称的属性来确定主题
+ 通过 获取 session 会话范围内以 theme 为名称的属性来确定主题 
+ 通过 获取 application 会话范围内以 theme 为名称的属性来确定主题 
+ 通过 获取 名称 为 `struts.ui.theme`的常量值 （默认为 xhtml）确定主题，可以在 struts.xml 和 struts.properties 中配置

### 4.5.3 Struts 2 的内建主题

[Struts 2 内置主题 与 自定义主题](https://www.jianshu.com/p/47f55fceef8f)

（1） Simple 主题： 最简单的主题，每个UI标签 只生成一个简单的HTML元素，没有任何其他内容

（2）xhtml 主题： Struts 2 的默认主题，在 Simple 基础上实现一下功能

+ 针对 HTML 标签使用标准的两列表格布局
+ 每个HTML标签的Label，既可以出现在HTML 元素左边，也可以出现在上边，这取决于 labelposition 属性设置
+ 自动输出校验错误信息
+ 输出 JavaScript 的客户端校验

（3）css_html 主题：在xhtml的扩展 对css样式的支持与控制

（4）ajax 主题 ： 继承自 xhtml，在 每个标签提供了 Ajax技术支持，ajax 主题的Ajax 技术支持 是以`Dojo` 和 `DWR` 为基础的。如下特性

+ 主持 Ajax 方式的客户端校验
+ 支持远程表单的一步提交（应与 submit 标签一起使用）
+ 支持 高级的 div 标签，语序实现更新部分 HTML 的功能
+ 提供 高级 的a 标签，语序动态加载并执行远端 的 JavaScript 代码
+ 提供 支持 Ajax 的 `tabbedPanel`
+ 提供 “富客户端”模型的 `pub-sub` 事件模型

**配置**

```xml
<constant nam="struts.ui.theme" value="simple" ></constant>
```

```properties
struts.ui.theme = simple
```

## 4.6 表单标签

表单标签：`<select>`、 `<checkbox>`等 HTML 标签使用。

Struts 2的表单 标签

| 标签名               | 描述                                                         |
| -------------------- | ------------------------------------------------------------ |
| checkboxlist         | 该标签根据一个集合 属性，一次可以创建多个复选框              |
| combobox             | 生成一个单行文本框 和 一个下拉列表框的组合                   |
| datetimepicker       | 生成一个 日期 事件下拉选择框                                 |
| doubleselect         | 生成一个互相关联的列表框 即 生成联动下拉框                   |
| file                 | 上传文件的元素                                               |
| form                 | 表单                                                         |
| hidden               | 生成一个 hdidden 类型的用户输入元素                          |
| optgroup             | 下拉列表框的选项组，下拉列表框中可以包含多个选项组           |
| optiontransferselect | 同时生成两个下拉列表框，与 两个按钮。按钮控制 选项 在 下拉框中 移动排序 |
| password             | 密码表单域                                                   |
| radio                | 单选按钮                                                     |
| reset                | reset 按钮                                                   |
| select               | 下拉列表                                                     |
| submit               | submit 按钮                                                  |
| textarea             | 文本域                                                       |
| textfiled            | 单行文本输入框                                               |
| token                | 防止用户 多次提交表单，例如通过刷新页面来提交表单            |
| updownselect         | 与 select 类似， 支持选项上下移动                            |

### 4.6.1 checkboxlist 标签

| 属性名    | 必填 | 描述                                                         |
| --------- | ---- | ------------------------------------------------------------ |
| list      | 是   | 用来指定集合属性值                                           |
| listKey   | 否   | 指定 集合 复选框的 value，如果集合的类型为map ，可以使用 `key` 与 `value`分别 设置为 复选的 value |
| listValue | 否   | 指定 集合 复选框的 lable，如果集合的类型为map ，可以使用 `key` 与 `value`分别 设置为 复选的 lable |

```xml
<s:checkboxlist name="check1" list="{'a','b','c','d'}" labelposition="top" label="选择："></s:checkboxlist>
	<s:checkboxlist name="check2" list="#{ 1:'一',2:'二',3:'三',4:'四' }" labelposition="top" label="选择："
		listKey="value" listValue="key"
	></s:checkboxlist>
```

### 4.6.2 datetimepicker 标签

时间输入框，前提 需要 在 `head` 标签内加上 `<s:head theme='ajax' />`,然后在 from 表单中使用

由于版本更新的问题使用过程中会出现的问题，主要就是struts2版本 更新时做了一些修改。

在struts2.0时，使用`<s:datetimepicker/>`时，需要在`<head></head>`标签中申明：`<s:head theme="ajax"/>`.

但在struts2.1.6时，struts2就不再单独提供主题ajax，而是将ajax主题整合到dojo包 中。

所以我们在使用struts2.1.6以上版本时，需要导入     struts2-dojo-plugin-2.x.x.jar, 

```xml
		<dependency>
			<groupId>org.apache.struts</groupId>
			<artifactId>struts2-dojo-plugin</artifactId>
			<version>2.3.37</version>
		</dependency>
```

要在jsp页面中引入dojo的标签库：`<%@ taglib="/struts-dodo-tags" prefix="sx"%>`，

而将`<s:head theme="ajax"/>`去掉。直接写上：

`<head>`中加入下列
```html
<head>
    <s:head theme="xhtml"/>
    <sx:head parseContent="true"/>      
</head>
```

| 属性名         | 是否必填 | 描述                                                         |
| -------------- | -------- | ------------------------------------------------------------ |
| displayFormat  | 否       | 指定日期格式 "yyyy-MM-dd"                                    |
| displayWeeks   | 否       | 指定显示 星期数                                              |
| endDate        | 否       | 指定 结束日期，之后的日期不能使用                            |
| formatLength   | 否       | 指定日期显示的格式，这些格式就是 dataFormat 中的值， 支持：long short  medium  full |
| language       | 否       | 指定日期的格式语言，zh_CN                                    |
| startDate      | 否       | 指定 开始时间，之前的 不能使用                               |
| toggleDuration | 否       | 指定选择框出现  ，隐藏的切换时间                             |
| toggleType     | 否       | 指定 日期选择框的出现、隐藏的方式  plain wipe explode fade   |
| type           | 否       | 日期选择框的类型  date 与 time                               |
| value          | 否       | 默认时间                                                     |
| weekStartsOn   | 否       | 指定选择框中那一天是 一周的开始 ，周日 0  周六 6             |

过程中还有个坑： `StrutsPrepareAndExecuteFilter` 过滤器 如果使用 

```xml
	<filter-mapping>
		<filter-name>struts2</filter-name>
<!-- 		<url-pattern>/path/*</url-pattern> -->
		<url-pattern>/*</url-pattern>
	</filter-mapping>
```

如果 保留路径 需要 再添加 mapping

```xml
	<filter-mapping>
		<filter-name>struts2</filter-name>
 		<url-pattern>/path/*</url-pattern> 
		<!-- <url-pattern>/*</url-pattern> -->
	</filter-mapping>
	<filter-mapping>
		<filter-name>struts2</filter-name>
 		<url-pattern>/struts/*</url-pattern> 
		<!-- <url-pattern>/*</url-pattern> -->
	</filter-mapping>
```

中 /path/* 来配置 是无法显示 出该控件。应该 是 dojo 默认的路径 的问题，导致过滤器没法 映射到。

```xml
	<s:form theme="simple">
		日期 ： <sd:datetimepicker weekStartsOn="0" name="mydate" toggleType="explode"
			value="today" type="date" language="zh_CN" displayFormat="yyyy-MM-dd">
			</sd:datetimepicker>
	</s:form>
```

### 4.6.3 doubleselect 标签

两个相关联的 列表框。

| 属性名           | 是否必选 | 描述                                                         |
| ---------------- | -------- | ------------------------------------------------------------ |
| list             | 是       | 指定 用于 迭代的集合，collection map array，如果 list 使用的 map ，以下两个属性 |
| listKey          | 否       | 第一个 下拉框的 选项 的 value                                |
| listValue        | 否       | 第一个 下拉框的 选项 的 显示值                               |
| headerKey        | 否       | 设置 当前用户 选择了 header 选项时，提交的value，如果 使用该属性，不能设置为空 |
| headerValue      | 否       | 设置 当前用户 选择了 header 选项时，显示值                   |
| doubleList       | 是       | 指定 用于 第二个 下拉框的  迭代的集合，                      |
| doubleListKey    | 否       | 基本与上面类似                                               |
| doubleaListValue | 否       | 基本与上面类似                                               |
| doubleName       | 否       | 基本与上面类似                                               |
| doubleValue      | 否       | 基本与上面类似                                               |

必须 在 `s:form` 标签内，并且 form 标签 使用 action 属性

但是 不知道 例子中 只用 map 为什么 doublelist 没有值

```xml
	<s:form action="ac">
	<!-- list="#{1:'一',2:'二',3:'三',4:'四' }" 
	doubleList="top.key == 1 ? #{'a':'A','aa':'AA'} : #{'b':'B','bb':'BB'} "
	-->
		<s:doubleselect list="#{1:'一',2:'二',3:'三',4:'四' }"
		
		listKey="value" listValue="key" label="doubleselect 测试" labelposition="left" name="tests1"
		doubleListKey="value" doubleListValue="key"
		doubleList="#{'b':'B','bb':'BB'} "
		doubleName="tests2">
		</s:doubleselect>
	</s:form>
	<s:form action="ab">
	<!-- list="#{1:'一',2:'二',3:'三',4:'四' }" -->
		<s:doubleselect list="{1,2,3,4}"
		label="doubleselect 测试" labelposition="left" name="tests1"
		doubleList="top == 1 ? {'a','aa'} : {'b','bb'} "
		doubleName="tests2">
		</s:doubleselect>
	</s:form>
```

### 4.6.4 optgroup 标签

optgroup  作为 select 的子标签使用，用于创建 选项组。

可以在 select 中加入 一个或者多个 optgroup ，但是 optgroup  不能嵌套 optgroup 

| 属性名    | 是否必选 | 描述                                                       |
| --------- | -------- | ---------------------------------------------------------- |
| lable     | 否       | 指定 下拉框显示的 label   ，这个是无法被选择的             |
| list      | 否       | 指定集合,看了 目前版本2.5.20 必须使用 map，等 有属性的集合 |
| listKey   | 否       | map时设置value 值                                          |
| listValue | 否       | map时设置key值                                             |

```xml
<s:form>
	<s:select label="选择" name="selects1" list="{'大写','小写'}">
		<s:optgroup label="数字" list="#{'1':1,'2':2,'3':3}"></s:optgroup>
	</s:select>
</s:form>
```
### 4.6.5 optiontransferselect 标签

用于 两个组件之间元素的转换移动。表单提交是，两个组件 的 都会提交

| 属性名             | 是否必选 | 描述                             |
| ------------------ | -------- | -------------------------------- |
| list               | 是       | 需要显示的 第一个集合            |
| name               | 是       |                                  |
| listKey            | 否       | 当 list 为 map，类型时设置，值   |
| listValue          | 否       | 当 list 为 map，类型时设置，key  |
| addAllToLeftLable  | 否       | 设置全部移动到右边的按钮的 title |
| addAllTorightLable | 否       | 设置全部移动到左边的按钮的 title |
| addToLeftLable     | 否       | 设置移动到右边的按钮的 title     |
| addToRightLable    | 否       | 设置移动到左边的按钮的 title     |
| allowAddAllToLeft  | 否       | 全部的到右边按钮 启用            |
| allowAddAllToRight | 否       |                                  |
| allowAddToLeft     | 否       |                                  |
| allowAddToRight    | 否       |                                  |
| leftTitle          | 否       | 标题                             |
| rightTitle         | 否       |                                  |
| allowSelectAll     | 否       | 是否启用全部标题                 |
| selectAllLable     | 否       | 全选按钮 的 名字                 |
| doubleList         | 是       | 第二 个的集合                    |
| doubleListKey      |          |                                  |
| doubleListValue    |          |                                  |
| doubleName         | 是       | 指定第二个列表框 name 映射       |
| doubleValue        |          | 初始化                           |
| doubleMultiple     |          | 是否添加 空白                    |

```xml
<s:form>
		<s:optiontransferselect 
		 list="{'1','2','3','4'}" 
		 leftTitle="开始"
		 name="leftRecords"
		 rightTitle="选中"
		 doubleList="{'6'}"
		 doubleName="rightRecords"
		
		 ></s:optiontransferselect>
	</s:form>
```

## 4.7 非表单标签

非表单标签，主要用于输入 Action 中 封装的信息

| 标签名        | 描述                                                         |
| ------------- | ------------------------------------------------------------ |
| actionerror   | 用来输入 actinon 中的 错误信息。                             |
| actionmessage | 输入 action 中 的 信息                                       |
| component     | 通过主题 、 模板 生成一个自定义的组件                        |
| div           | 生成一个    div 片段                                         |
| fielderror    | 输出 异常提示信息， 如果 action 实例 存在表单域的 类型转换错误 ，校验错误，该标签 负责输入这些信息 |
| tabbedPanel   | 生成 HTML 页面中的tab                                        |
| tree          | 生成 树                                                      |
| treenode      | 树形节点                                                     |

### 4.7.1 actionerror 与 actionmessage

实际上 是 调用 action 中 的 getActionError 和 getActionMessage

actiong 继承 ActionSupport

在执行函数中 调用 addActionError/Message

```xml
	<s:actionerror />
	<s:actionmessage/>
```

不知道怎么  没有显示



### 4.7.2 tree 与 treenode

```xml
	<sd:tree label="1级树" id="tree" showRootGrid="true" showGrid="true" selectedNotifyTopics="treeSelected" >
		<sd:treenode label="11">
			<sd:treenode label="111"></sd:treenode>
		</sd:treenode>
		<sd:treenode label="12"></sd:treenode>
		<sd:treenode label="13"></sd:treenode>
	</sd:tree>
```

