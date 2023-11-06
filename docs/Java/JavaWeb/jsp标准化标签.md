1. JSP规范下的标准标签（Standard Tag）：

    1) JSP标准标签是JSP早期规范中提出来的，目的是为了协助JSP编写是减少Scriptlet的使用；

    2) 在J2EE规范下所有Web容器都必须支持标准标签；

    3) 标准标签都以jsp:打头，比如`<jsp:include>`等；

    4) 虽然后来提出的JSTL和EL表达式等一些更加便捷的功能来取代标准标签，但必须还要对这些标准标签有所认识；


2. 请求调配标签：

    1) 即实现了include和forward请求调配的标签，那么以后进行请求调配是就无需在Scriptlet中使用Dispatcher等进行调配，而是简单的使用两个JSP标签即可实现；

    2) 两个标签分别是`<jsp:include>`和`<jsp:forward>`，其属性是page，指定调配到的目的页面（URL），例如：`<jsp:include page="index.view">`；

    3) 但是我们知道在调配的时候可以添加额外的请求参数，这里在使用这两个标签的时候不能直接在page属性中加入额外的请求参数，但是可以使用`<jsp:param>`标签指定额外的请求参数，其属性有两个，一个是name，另一个是value，即参数的名称和值，例如：`<jsp:param name="name" value="Peter" />`，该标签可以简写，无需再加结束标签，直接在>左侧加一个/即可，但是`<jsp:include>`和`<jsp:forward>`必须要有末尾标签，因为`<jsp:param>`使其子标签，没有这个子标签这两个标签不可能结束；

    4) 完整举例：

```xml
[html] view plain copy
<jsp:include page="index.view">  
    <jsp:param name="a" value="1" />  
    <jsp:param name="b" value="2" />  
</jsp:include>  
```
！<jsp:forward>完全相同；
    4) 这两个标签在转译后都是调用RequestDispatcher对象再进行调配的；

    5) 转译后必然也是放在_service方法中的；


3. 对JavaBean原件的支持：

    1) 先不介绍JavaBean原件，光是谈谈对JSP的特别需求，其中一点最重要的就是范围属性了，我们都知道在Serlvet中可以不同的范围对象（request、session、servletContext等）设置对象属性，那么我们如何用JSP的标签简化Java中对象属性的操作呢？

    2) JSP规范当然有标签支持对象属性操作的简化，只不过对这些对象属性有一定要求，不能随随便便就那一个对象作为属性通过JSP标签添加到各个范围对象中，这个要求就是这些对象属性必须是JavaBean元件；

    3) JavaBean元件就是满足一下条件的纯粹Java类对象：

         i. 数据成员全部都不公开（可以是private、protected或是包范围，但不能有一个public的）；

         ii. 具有无参构造器；

         iii. 有public的getter和setter；

         iv. 实现串行化接口：java.io.Serializable

    4) JSP的`<jsp:useBean>`、`<jsp:setProperty>`和`<jsp:getProperty>`三个标准标签可以简化对满足JavaBean标准的属性对象进行操作

    5) `<jsp:useBean>`：在JSP页面中寻找JavaBean原件（对象实例，相当于对象定义语句），如果找不到就创建一个

         i. 该标签有两个属性，一个是id，另一个是class；

         ii. 意义是：使用class所代表的JavaBean类创建一个属性名和对象名都为id的对象属性；

         iii. 例如：`<jsp:useBean id="user" class="com.lirx.User" />`的意思就是com.lix.User是一个符合JavaBean标准的类，然后用该类创建一个名为user的对象，并且当该对象作为范围属性时的名称也为user，用Java代码表示就是如下：

[javascript] view plain copy
com.lirx.User user;  
XXX.setAttribute("user", user);  // 这句并不在该标签的转译语句中  
！！即该对象的范围属性名（setAttribute的第一个参数的字符串值）和其对象名称本身（setAttribute的第二个参数的名称）都是相同的；
         iv. 使用该标签后就创建了一个user对象了，但并没有将该对象作为范围属性插入到某个范围中，上例代码的第二行仅仅是一种演示，即使为了演示user对象的范围属性名称也为"user"罢了；

         v. 对象创建完之后就可以自由使用了，比如在Scriptlet中直接调用user.getName等方法，但是不推荐这样使用，因为标准标签就是为了避免使用Scriptlet的，因此接下来对范围属性的操作应该使用标准标签才行；

    6) 使用`<jsp:setProperty>`标签设置对象属性：

         i. 当第一步使用`<jsp:useBean>`标签创建JavaBean元件后，就可以使用`<jsp:setProperty>`将该元件作为范围属性添加到某个范围中了；

         ii. 该标签的常用属性：

             a. name：属性名，即对应userBean中定义的name属性名；

             b. property：JavaBean元件中的某个数据成员；

             c. value：将property中指定的数据成员设成value指定的值；

             d. scope：将该属性添加到哪个范围中，即page、request、session、application这4个中选，如果该属性不写，则默认为page范围；

         iii. 例如：<jsp:setProperty name="user" property="name" value="Peter" scope="application" />就会被转译为如下Java代码

[java] view plain copy
user.setName("Peter");  
application.setAttribute("user", user);  
！！这里涉及到了JSP的自省机制，即在setProperty时，如果指定的property的名称为xxx，那么将使用元件的setXxx来设置值，因此JavaBean必须要有public的setter和getter，同样，在使用`<jsp:getProperty>`时会使用getXXX方法来获取指定的property；         
         iv. 也可以利用请求参数来设置JavaBean元件中的数据成员的值：即不在标签中直接设定value，而是将请求参数的值作为value来设置给元件的property，此时可以使用属性param，例如：<jsp:setProperty name="user" param="member_name" property="name" />就是将member_name请求参数的值设置给user.name，其转译后的代码是这样的：

[java] view plain copy
String name = request.getParameter("member_name");  
user.setName(name);  
application.setAttribute("user", user);  
！！如果请求参数名刚好和propety名称相同，那么这里就可以进一步利用JSP的自省机制了：如果不写param和value属性，那么就会到请求参数中去找是否有何property指定的名称相同的请求参数，如果有，就把那个请求参数的值设置给property，否则就不调用setter，即什么也没发生，保持原来的值不变，例如：
<jsp:setProperty name="user" property="name" />就会被转译成下面的Java语句：

[java] view plain copy
```java
String name = request.getParameter("name");  
if (name != null) {  
    user.setNmae(name);  
    application.setAttribute("user", user);  
}  
```
         v. 更进一步利用JSP的自省机制：所有的property都用请求参数来设置
！！！只要将property写成"*"即可，通配符*就代表所有的属性，此时就会到元件中找所有的setter，即找出所有的setXxx，然后得到所有的set属性名xxx，然后找请求参数中是否有叫做xxx的请求参数，如果有就拿其值来设置对应的元件数据成员，例如：user中有setName、setPasswd、setHeader三个setter，而使用的标签是<jsp:setProperty name="user" property="*" />，那么转译后的Java代码描述的步骤是这样的：

            a. 先到user中找其所有的setter，发现有setName、setPasswd、setHeader三个；

            b. 然和取得setter属性名：name、passwd和header；

            c. 然后到请求参数中找是否有名称为name、passwd和header的参数；

            d. 如果有就调用相应的setter将请求参数的值设置给元件；

            e. 最后调用setAttribute方法将user作为属性设置给指定范围对象；

！这也要求请求参数的名称与setter名相同；


！！！但是要注意的是setter名可以不等于元件的数据成员的名称，比如user的一个数据成员是String member_name;，但是其setter可以是setName(String s) { member_name  = s; }，但是setName的setter名是name而不是member_name；

！！！而我们的这里利用的JSP自省机制就要求请求参数名要和setter名相同，而不是元件的数据成员的名称；


    7) 使用<jsp:getProperty>标签获得指定的对象属性：

         i. 其属性有3个，分别是name、property和scope（意义和set的相同），如果scope不写，则默认为page范围的；

         ii. 目的是在指定范围内获取对象属性的某个数据域，作用刚好和set相反；

         iii. 例如：`<jsp:getProperty name="user" property="name" scope="session" />`就会被转译为

[java] view plain copy
User user = session.getAttribute("user");  
out.write(user.getName());  
！！实际返回的是数据域的字符串形式，因此该数据域必须实现toString方法，才能插入到字符串序列中；
         iv. 整个标签的返回值就是一个查询结果的字符串表示，和JSP中的其它输入文本混合在一起作为画面呈现；


4. 深入理解`<jsp:useBean、setProperty、getProperty>`的转译源码，认识其本质：

    1) `<jsp:useBean>`的转译源码：以`<jsp:useBean id="user" class="com.lirx.User" />`为例

[java] view plain copy
com.lirx.User user = null; // 由于标签中未指定scope，因此默认为page scope  
synchronized(request) { // 由于一个请求只能被一个线程访问，所以用同步的方式去操作request，而不是异步asynchronized  
    // useBean的意思是使用Bean，因此会先查找在指定范围内是否存在名为"user"的Java Bean  
    user = (com.lirx.User)_jspx_page_context.getAttribute("user", PageContext.PAGE_SCOPE);  
    if (user == null) { // 如果不存在，那既然要使用，就得创建  
        user = new com.lirx.User(); // 创建完了还得将其作为属性插入到指定范围中  
        _jspx_page_context.setAttribute("user", user, PageContext.PAGE_SCOPE);  
    }  
}  
！！_jspx_page_context就是PageContext对象的引用，PageContext中保存着当前JSP页面的所有信息，其它隐式对象都需要用它来初始化，这在之前讲过；

！！其本质就是先查找，如果有就直接使用，如果没有则创建后再插入，总共有两步；

    2) <jsp:setProperty>的转译源码：以<jsp:setProperty name="user"  property="name" value="Peter" />为例

[java] view plain copy
((com.lirx.User)_jspx_page_context.findAttribute("user")).setName("Peter");  
！这个很简单，很好理解，是先利用findAttribute在所有范围内寻找"user"属性，找到后在通过“反射”机制调用响应property的setter进行设值；
    3) useBean和setProperty组合使用：

         i. 组合使用有两种不同的方式，但是效果却大不相同；

         ii. 第一种是useBean包裹setProperty，例如：

[java] view plain copy
```xml
<pre name="code" class="java"><jsp:useBean id="user" class="com.lirx.User" scope="session">  
    <jsp:setProperty name="user" property="*" />  
</jsp:useBean>
```
！这里也用到了自省机制，直接利用请求参数设置property，先来看一下转译后的源码：
[java] view plain copy
```java
com.lirx.User user = null;  
synchronizd (request) {  
    user = (com.lirx.usr)_jspx_page_context.getAttribute("user", PageContext.SESSION_SCOPE);  
    if (user == null) {  
        user = new com.lirx.User;  
        _jspx_page_context.setAttribute("user", user, PageContext.SESSION_SCOPE);  
        JspRuntimeLibrary.introspect(_jspx_page_context.findAttribute("user"), request);  
    }  
}  
```
！JspRuntimeLibrary的introspect方法就是自省的意思，第一个参数是JavaBean，第二个参数就是request，意思就是将request中的请求参数通过setter设置给JavaBean；
！！从这里可以看到这种包裹方式时必须在Bean不存在的情况下才会发生setProperty，setProperty和创建一同发生；

         iii. 第二种是useBean和setProperty平行使用（但无论如何useBean都必须出现在setProperty之前），例如：
[java] view plain copy
```xml
<jsp:useBean id="user" class="com.lirx.User" scope="session" />  
<jsp:setProperty name="user" property="*" />  
```
！其转译后的源码为：
[java] view plain copy
```java
com.lirx.User user = null;  
synchronizd (request) {  
    user = (com.lirx.usr)_jspx_page_context.getAttribute("user", PageContext.SESSION_SCOPE);  
    if (user == null) {  
        user = new com.lirx.User;  
        _jspx_page_context.setAttribute("user", user, PageContext.SESSION_SCOPE);  
    }  
}  
```
JspRuntimeLibrary.introspect(_jspx_page_context.findAttribute("user"), request);  
！！即无论如何（不管存不存在，不管是否要新创建），都会进行自省（设值）；
！！通常后者（平行的写法）较常用！！注意这两者的区别，千万不能在这个问题上犯错！

    4) `<jsp:getProperty>`的转译源码：很简单，和set一样，只不过用的方法是getter罢了，由于get的结果是直接输出，因此会用out进行输出，以`<jsp:getProperty name="user" property="name" />`为例

[java] view plain copy
```java
JspRuntimeLibrary.toString(  
    ((com.lirx.User)_jspx_page_context.findAttribute("user")).getName()  
);  
```