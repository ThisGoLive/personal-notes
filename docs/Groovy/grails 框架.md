#  grails 优缺点分析

### 　　Grails是一套用于快速Web应用开发的开源框架，它基于Groovy编程语言，并构建于Spring、Hibernate等开源框架之上，是一个高生产力一站式框架。

- 易于使用的基于[Hibernate](http://www.hibernate.org/)的对象-关系映射(ORM)层
- 称为Groovy Server Pages (GSP)的表现层技术
- 基于[Spring](http://www.springframework.org/) MVC的控制器层
- 构建于[Gant](http://groovy.codehaus.org/Gant) 上的命令行脚本运行环境
- 内置Jetty服务器，不用重新启动服务器就可以进行重新加载
- 利用内置的[Spring](http://www.springframework.org/) 容器实现依赖注入
- 基于Spring的MessageSource核心概念，提供了对国际化（i18n）的支持
- 基于Spring事务抽象概念，实现事务服务层

 

**grails 优点：**

### 　　1、DRY和约定优先于配置的思想，是由Rails兴起并迅速被广泛接收和欣赏的Web框架新思路。

　    　　Grails作为JEE世界的Rails，把这些最前沿的设计理念带入已显得陈旧的JEE社区，以及由此带来的优秀的开发效率。

　　 　　Grails中的DRY主要提现在URL映射定义上（URLMappings.groovy）。在  URLMappings.groovy中定义了应用的各个URL以后，通过使用Grails预定义的动态Controller方法和GSP标签，开发者就  不必再把程序URL硬编码在各处。

　　 　　在约定优于配置方面，Grails和Rails非常相似。所谓约定优于配置，就是按照框架约定的方式来组织资源，就可以免去任何额外的配置。比如 Grails的自定义标签，存放在应用目录下的`grails-app/taglib`路径下，并以`XXXTagLib.groovy`的方式命名，就能无需任何配置就可以在GSP里使用这些标签库了。另外还有Service类，Job类，包括整个Grails应用的目录结构，都是约定由于配置原则的体现。在这 些方面JEE开发者一定会为摆脱各种繁琐的配置感到异常兴奋，并且实实在在的节约很多开发时间

### 　　2、JVM支持，性能保障

　　　　通过运行在JVM之上，Grails拥有一个经过多年开发，已经非常成熟，业界标准级别的运行环境。JVM的稳定性和最新版本的性能都已经相当成熟。相比   最直接的比较对象Rails，Grails在运行环境性能上的优势是比较明显的。另外，已有的Java可重用组件基本都可以直接使用于Grails，无疑  也是Grails的一个明显优势

### 　　3、采用groovy语言开发

　　　　对Grails来说，Groovy是其能够实现灵活多变的快速开发，区别于其他运行于JVM之上的Web框架的核心技术。

　　　　Groovy的动态特性是其最大亮点，在这方面几乎不输于Ruby等其他热门的动态语言。meta-programming，closure等等热门的动   态语言特性在Groovy中都有很好的实现。而且，Groovy程序能够编译为JVM字节码的.class文件，直接运行在JVM上，Groovy程序的   性能能够得到一定的帮助。Groovy能够和Java混合编写，混合编译，使得Java程序员能不用浪费自己在Java语言上的大量投入，更轻松快捷地进  入Groovy的世界。使用Groovy编程，相比使用Java来说快速轻松得多，对为数众多的Java程序员颇有吸引力

### 　　4、插件系统

　　　　Grails的插件系统也是其亮点之一。首先，和Rails，Django等Web框架类似，基于微内核的思想，插件（可重用模块）是框架的一等公民。  Grails除了核心模块以外的功能几乎都是通过插件方式实现的。实际上，一个Grails插件和一个Grails应用基本是完全一样的，同样可以使用`grails run-app`命令来运行。区别仅在于一个插件的根目录下需要提供一个`FooPlugin.groovy`文件，提供插件的一些描述信息

### 　　5、GSP和标签库

　　　　Grails前端开发使用的是GSP（Grails Server  Pages），开发者可以使用Grails特定的模板语法编写gsp动态页面，并且可以直接使用Groovy脚本或是各种预定义和自定义的标签库  （taglib）。这么看起来和JSP区别不大，而实际上，Grails带给开发者的是远比名字上的区别大得多的开发效率上的进步。

**grails 缺点**

### 　　6、复合框架整合复杂

　　　　Grails使用多种已有的成熟开源JEE组件，同样是一把双刃剑。多种组件整合在一起，出现整合方面的问题的话调试修改都会比较吃力

### 　　7、尚不成熟的社区

　　　　这可能是Grails最关键的隐藏的弱点。一个开源项目的成功与否很大程度上取决于其社区。Rails/Ruby，Django/Python，包括   PHP都属于现今最好的开源社区，活跃的社区对开源项目的成长起到巨大的作用。但是Grails的社区至今还是相当小众，在人数和质量上都无法和以上三大  社区相比。一个不成熟的社区带来的一个明显问题就是Grails项目的开发进度比较慢，相关文档和资料缺乏