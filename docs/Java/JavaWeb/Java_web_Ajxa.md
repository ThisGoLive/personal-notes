# Ajax
2018/1/16 星期二 下午 17:36:25 
## 概念
异步的JavaScript和xml

指一种创建交互网页技术开发。

ajxa是前端的技术。在web开发中大量使用。动态网页的技术。

可以通过与后台实现数据交互，实现异步更新。不刷新整个页面的情况下，局部更新整个页面。

传统的页面需要刷新页面的全部数据。

## 优势
客户段在操作请求响应的时候，不需要锁定这个页面，只需要发送异步请求做到局部的刷新，对于客户来端说，我们可以像操作cs架构一样，操作bs架构，提高用户体验。

可以提高访问速度 ，提高系统性能。

主要用到的技术。
JavaScript xml xhtml xmlhttpprequest

并不是新技术，而是很多年前的技术，组合起开发的一门技术。

## 运行过程
 ajxa通过js来访问; 和更新数据  
数据的传输： 

+ xml但由于后台（java）操作麻烦
+ txt文本类型
+ 转换为json类型的：json-lib 和jackso

数据的处理也是客户端 js 来处理！

但不能跳转页面，谁发送的请求 ，响应也是发回给谁


## 实现步骤

1.页面添加点击事件 onclick = function（）{}：

2.发送异步请求给服务器：

3.处理响应：

----------

3.1. 先创建XMLHttpRequest对象

	var xmlhttp = null;
	if(window.ActiveXobject){  //表示当前浏览器是ie 5 6
		xmlhttp = new ActiveXobject("Micrisift.Xmlttp");
	}else if(window.XMLHttpRequest){v//表示标准dom浏览器 火狐等
		xmlhttp = enw XMLHttpRequest();
	}

	//建立链接 1.提交方式 2.请求的路径 3.是否同异步
	xml.open("post","/项目名/servlet容器名","true");异步
	
	//发送类型（post时）；
	xmlhttp.setRequestHeader("Content-Type",
	"application/x-www-form-urlencoded;charset=utf-8");
	


3.2. 发送请求给服务器。(在点击事件里)

	xml.send("");
	send();  //中可传参数 post时 键值对 加&



3.3. 处理响应  监控状态码 (在点击事件里)

	xmlhttp.onreadystatechange = function （）{

	//在数据的传输过程中 有5中状态 （对象状态0-4）
	//0没开始 1未读取 2已读取 3处理4为完成。故：

		if（xmlhttp.status==200 && xmlhttp.readyState==4）{
		

	//读取响应消息体的数据
			var v = xmlhttp.responseText;

			通过js来动态操作页面 dom操作
		}
	}
		
	(serlvet中加上response.setContentType("text/html");才能说明返回是什么格式)

----------

#### readyState对象状态码：

	0：未初始化，没有调用send方法。发出请求默认初始化。
	1：读取中，载入，已经执行send方法，正在发送请求。
	2：已经读取，载入完成，send调用执行完成。
	3：交互中，客户端正在解析响应的内容。
	4：响应完成，客户端可以获取数据。

#### status 对象状态码 ：（200时，对象状态可能才到2）

	100：表示客户端必须发出请求；
	101：客户端请求的内容，转化为http响应的内容；
	200：请求成功；

#### 将JavaBean传输到页面：

	JSONObject obj = new JSONObject();
	obj = obj.fromObject(javabaen);      //这个方法为static的
	obj.toString();                      //传输这个值

	a.此时不能传输多余的值或者不传值  不然客户端 无法转
	b.集合例如ArrayList 等 或者数组  都是JSONArray 来接受；
	c.如果是用到重定项 或者派发 那  客户端接受到的就是一个页面的字符串
	d.日期类型的转换。JSONObject转不支持sql包的date  而是util包的。
		new java.util.Date(java.sql.Date .getTime());
	
	页面中：json.parse( ) 将字符串转换为json对象

### ajax 对时间的操作
date时间类 在转成JSONObject后 又是一个JSON对象，
so：

	var year = json.date.day+1900;
	var month = json.date.month+1; //默认从零开始
	var date = json.date.date;
	再拼接。
	new Date(json.date.Time),才是jsDate时间类 
	也可以导包 script src="包位置" 

## jQuery封装的Ajax
		$.ajax(json对象);
	
	对象模板：
	{method:"post",url:"请求的地址",async:true,
	data:{"id":id},success:function run(res){}}；

### 同步与异步：

同步：服务器处理一个请求必须完成，才能完成下个请求；

异步：服务器可以同时处理多个请求，互不干涉。

外部导入也会发送一次请求！

##  扩展类容：分页显示。
需要的：page ajax传来的页数 pagerow  与每页显示的条数；
  
整体来说，分页的需要的数据太多。。可以封装为一个javabean对象！

daoimp层用 page pagerow来limit 查询。


在动态添加按钮 但又不知道 ID时  可以确定一个类  然后循环出来得到各个对象，如果在创建按钮时添加事件  没法获得该对象