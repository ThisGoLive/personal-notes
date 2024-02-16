#Spring-MVC 与 Spring Hibernate 的整合 #

#### spring  的配置文件

基本同spring 整合Hibernate   ，的配置文件， 只是它需要springmvc 。

springmvc如果需要整合到sh当中的话，需要做如下配置

#### spring-MVC 配置文件

1.创建springmvc对应的配置文件，配置文件的名字可以自定义，但需要使用contextConfigLocation 属性指定位置。

<hr/>
2.开启容器的自动扫描功能，

    <context:component-scan base-package="test.com.ssh">
            <context:include-filter type="annotation" expression=""/>  <!-- 包含  spring 的包含业务层的组件 即四个注解 -->
            <context:exclude-filter type="annotation" expression=""/>    <!-- 不含 spring的  表现成组件   spring mvc 与之相反 -->
    </context:component-scan>

3.视图解析器

    <!-- 视图解析器 -->
        <bean id="viewResolver" class="org.springframework.web.servlet.view.InternalResourceViewResolver">
            <property name="suffix" value=".jsp"></property>
            <property name="prefix" value="/"></property>
            <property name="viewClass" value="org.springframework.web.servlet.view.JstlView"></property>
        </bean>

4.注解支持

    <!-- 开启springmvc注解支持  不能 -->
        <mvc:annotation-driven conversion-service="conversionService"/>
    引入类型转换器
    <bean  id = "" class="org.springframework.context.support.ConversionServiceFactoryBean"  >
        <property name = "">
            <set>
                <bean class="" >   <bean/>   类型转换器的位置
            </set>
        </ property>
    </bean>

5.spring 的验证体系 （拦截器）

6.配置静态资源包

    <!-- 在访问是 忽略/static/下面的    -->
    <mvc:resources  location="/test1/" mapping="/test1/**" />

#### 配置web xml

1.配置spring mvc 的前端控制器

    <servlet>
          <servlet-name>dispatcherServlet</servlet-name>
          <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
          <init-param>
            <param-name>contextConfigLocation</param-name>   <!-- 默认不配的话，回去在webapp下找 -->
            <param-value>classpath:spring_mvc.xml</param-value>      
          </init-param>
          <load-on-startup>1</load-on-startup><!-- 加载顺序 -->
      </servlet>
    
      <servlet-mapping>
          <servlet-name>dispatcherServlet</servlet-name>
        <url-pattern>/</url-pattern>  
      </servlet-mapping>

2.开启除了web层组件的 另外一个容器

    <context-param>
        <param-name>contextConfigLocation</>
        <param-value>classpath:application....xml</param-value>
    </>

3.使用contextLoaderListener 开启spring容器 为web层提供一个运行环境  并将spring 容器向 web容器注册

    <listener>
          <listener-class> org.springframework.web.context.ContextLoaderListener</listener-class>
     </listener>