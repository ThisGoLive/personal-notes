## 1.4  **基本使用**

2018/2/5 星期一 下午 14:13:37 

连接池： c3p0  dbcp  druid

分包思想：  水平分块（子系统功能）  垂直分层（系统先后运行的顺序）

#### hibernate的conf配置

    <!DOCTYPE hibernate-configuration PUBLIC
    "-//Hibernate/Hibernate Configuration DTD 3.0//EN"
    "http://www.hibernate.org/dtd/hibernate-configuration-3.0.dtd">
    
    <hibernate-configuration>
        <session-factory>
    
            <!-- 定义方言 从而让hibernate知道是那个数据库  拼接什么样的sql语句 -->
            <property name="dialect">
                org.hibernate.dialect.MySQLDialect
            </property>
    
            <!-- 配置连接数据库的四件套 -->
            <property name="connection.driver_class">org.gjt.mm.mysql.Driver</property>
            <property name="connection.url">jdbc://localhost:3306/mydb?characterEncoding=utf-8</property>
            <property name="connection.username">root</property>
            <property name="connection.password">gl418</property>
    
            <!-- 配置事务隔离级别  1、读未提交  2、读已提交 4、可重复读 8、可串行化        -->
            <property name="connection.isolation">4</property>
    
            <!-- 配置c3p0连接池  管理 -->
            <!-- 配置连接池中哪个类来给SessionFactory 提供连接 -->
            <property name="hibernate.connertion.provider_class">org.hibernate.c3p0.internal.C3P0ConnectionProvider</property>        
            <!-- 指定连接池最大和最小连接数 -->
            <property name="hibernate.c3p0.max_size">15</property>
            <!-- 类似初始化连接数 -->
            <property name="hibernate.c3p0.min_size">1</property> 
            <!-- 单个连接的超时 毫秒 -->
            <property name="hibernate.c3p0.timeout">5000</property>
            <!-- 指定连接池中最大预编译对象 -->
            <property name="hibernate.c3p0.max_statements">50</property>
            <!-- 当连接数不够时，每次拿多少连接回来 -->
            <property name="hibernate.c3p0.acquire_increment">5</property>
    
            <!-- 要求hibernate显示sql语句 -->
            <property name="show_sql">true</property>
            <!-- 要求显示时按照规范显示 -->
            <property name="format_sql">true</property>
    
            <!-- 添加使用orm规范的映射文件 -->
            <mapping resource = "com/test/hibernate/xmls/UserBean.hbm.xml"/>
        </session-factory>
    </hibernate-configuration>

#### orm规范的映射文件

    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE hibernate-mapping PUBLIC 
        "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
        "http://www.hibernate.org/dtd/hibernate-mapping-3.0.dtd">
    <hibernate-mapping>
        <class name="com.test.hibernate.beans.UserBean" catalog="数据库名" table="t_user">
            <id  name="id" column=="id" type="id在数据库中数据类型">
            <!-- increment 框架自增长 ，生成方式：通过max（id） 获取数据库中最大值id，然后加1
            方式简单，但是，有缺陷，高并发时易出错，主要用于，小系统 -->
            <!-- identity 数据库自增长 框架不负责id的生成 有数据库的底层 自己生成id 通常用于id的类型是数据long int short -->
            <!-- uuid.hex 采用服务器的网卡，IP，时间戳等不易重复的数据，采用128位的bit算法生成的32为的不易重复的字符串，
            常用的id类型是varchar(32),支持高并发 -->
            <!-- native 框架不负责数据的生成，有数据库底层自己觉得id的生成 -->
            <!-- assigned 框架不负责id生成，由程序自己负责（有程序员自己生成id 然后setID（） 注入到对象中） -->
            <!-- select 由数据库的触发器生成id 非常少见 -->
            <!-- foreign 使用关联表中的主键，来作为为本表id 适用与 一对一  非常少见，应为外键关联-->
            <!-- 比较常见的： increment identity uuid.hex assigned -->        
    
            <generator class="identity"></generator>
            </id>
    
            <property name="userName" column="user_name" type="string" length="20"></property>
            <property name="数据对象的属性名" column="表中的字段名" type="string(字符串等有长度的写长度     int就不需要)" length="20"></property>
        </class>
    </hibernate-mapping>

#####DaoImp层
**基本是增 删 改**

    Session session = 工具类.getSession();
    Transaction ts = session.beginTransaction();
    session.save (javabean); 
    ts.commit()

**此时对象为持久化，改则会数据库自动修改！！！**

## 1.5 **事务**

具有**有序** **明确边界**的执行过程。
四大特性：

1. 原子：不可再分，要吗成功，要吗失败。  
2. 隔离：独立的过程，互不干扰。（isolation）
3. 一致：从开始到结束，数据不会变少或多。等值；
4. 持久：事务一旦被确认了，就应该持久化到硬盘上去。并且同一事务不能再对之修改。

#### 事务的隔离级别

1. 8可串行化（最高，每次就一个进来，数据准确性最高，性能最低。）
2. 4可重复读（虚读：已经修改的 数据，由于其他的修改，导致没有达到预期的效果。）
3. 2读已提交（会造成不可重复读，两次读取数据不一样）
4. 1读未提交（脏读：拿到数据库不存在的数据(例、没有事务提交)进行操作）
