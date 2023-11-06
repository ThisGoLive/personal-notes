2018/3/12 星期一 下午 16:11:16 
# REST框架 #
前后端分离   指  后台（s） 服务器  与  客户端(c)  或者 浏览器(b)

但是  c  是没有  cookie 和 session方式的。**伪会话技术**
#### 伪会话技术 ####
tokcn令牌  返回给客户端或者浏览器。交由**状态服务器来管理状态**
## REST概念 ##
表述性状态转移风格。

http 的 四种提交  get  post put delete
#### uri ####
同一资源修饰符：可以指代任何资源，但是并非所有资源都可以通过网络获取。
#### url ####
指资源在网络上的路经。
#### CRUD操作 ####
同一资源的修饰符是一样的 ，再用http的四种方法 对数据进行  增删查该。
#### 状态表述转移 ####
#### 无状态服务 ####
#### http状态码 ####
#### cache控制
ajax 提交。  

#### proxy ####
### REST关键原则 ###
+ 为所有的资源定义ID
+ 将所有的资源连接在一起
+ 使用标准方法
+ 资源多重表示
+ 无状态通信
## 汇总 ##
#### 什么是rest ####
描述性状态转移风格，既不是一种新框架，也不是新技术，只是一种架构风格。web应用程序的架构风格。以前，应用服务器采用session来对“用户状态”进行管理，此时服务器被称为“有状态的应用服务器”。“用户状态”耦合在应用服务器本身。  分步式  且不需要状态管理。但是选择我们将用户状态采用“口令（token 令牌）”的方式将状态维护在前端和“状态服务器上”。好处：我们的应用服务器**无需再花费大量的精力**去维护用户状态，并且**支持更多的并发**。

以前使用http 传输协议时，使用的"动词"对资源进行动作性的描述，采用get/post完成对数据的提交。限制采用“名词”对资源泳衣描述。采用四种标准方法完成对资源的 动作性的描述。

符合上述说法的应用程序，那么就是一个rest架构风格的应用程序，否则为“伪rest”
#### rest风格中，转移的状态 ####
1.	应用服务器的状态 ：
	1.	从应用服务器本身-转移到前端，以及对应的服务器上
2.	资源状态：
	1.	同一资源使用get方法提交，资源状态：只有一个，有   存在
	2.	post：从无到有
	3.	put：只有一个   有  存在
	4.	delete：只有一个  无  不存在
#### rest作为一种架构风格，提出多种架构约束，其中的约束有： ####
+ 作为前端/服务器通信模式，前端与服务器间采用“统一的接口”来完成数据交互。
+ rest系统中，前端一般情况之下不会只与某一天服务器交互，而是与服务器集群中多台交互
+ 前后端通信：后台服务器不会存放任何状态“用户状态”信息，状态被转移到前端，以及状态服务器上去了。这就要求：前端在传输数据的时候，对资源的描述需要足够的详细。（非绝对，要考虑数据的安全性）
+ rest架构风格中：如果能够对资源缓存的情况下，劲量使用缓存技术，减少前后端不必要的数据请求，
+ 当系统复杂或者业务流量过大时，不可避免地需要对系统进行拆分，这就引发一个系统被拆分为不同或者数量庞大的多个子系统，那么子系统之间在进行数据通讯时，也需要采用**同一的接口**来进行交互。

## 实例操作 ##
2018/3/13 星期二 上午 10:39:18 
#### 第八种参数法 ####
	//
	@RequestMapping（value ="/{id}/{}.."）
	public  void 方法名(@PathVariable("id") int id)

#### post ###
基本就是  原来的  

同一的接口  ***/{id}    post put delete（作为路径，来称为数据）  get中 路径 是并不能转  参数可以转
#### put修改 ####
默认情况下  put 默认是路径传输数据的    但是ajax  是消息体 提交数据的 。所以 要条件一个过滤器  来将之变成我们所需要的 。

org.springframework.web.filter.HttpPutFormContentFilter 配置与webxml中

	<filter>
		<filter-name>httpPutFormContentFilterr</filter-name>
		<filter-class>org.springframework.web.filter.HttpPutFormContentFilterr</filter-class>
	</filter>
	
	<filter-mapping>
		<filter-name>httpPutFormContentFilterr</filter-name>
		<url-pattern>/*</url-pattern>
	</filter-mapping>

配置put请求表单数据过滤器 目的：为了put请求也采用post请求一样 使用消息体来作为数据的载体。
#### delete删除   ####
类似  put    也是在路径传输数据  但没有过滤器  需要自己来写个  或者  不用同一接口  而是 路径传输
#### get ####
#### info ####

OpenSessionInView  在Hibernate中    同一视图范围内  延迟加载的  时不需要 关闭   Session

	<filter>
		<filter-name>openSessionInView</filter-name>
		<filter-class>org.springframework.orm.hibernate4.support.OpenSessionInViewFilter</filter-class>
	</filter>
	
	<filter-mapping>
		<filter-name>openSessionInView</filter-name>
		<url-pattern>/*</url-pattern>
	</filter-mapping>

load()方法  不适合与@ResponseBody 配合使用 

一定要配合使用的话：ObjectMapper中的过滤器来实现按需“完成属性的序列化”，在序列化的时候，使用过滤器来选择一些属性，抛弃一些属性。

406   不可接受   Jackson 没加   @RequestMapping(value="/{id}",produces= {"application/json;charset=utf-8"})

@Transient   bean的该属性 不参与 数据的持久化  就是 不在数据库显示   