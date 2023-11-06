[[TOC]]

[https://blog.csdn.net/anzhen0429/article/details/78296814](https://blog.csdn.net/anzhen0429/article/details/78296814)

# 官方文档

[文档](https://dev.mysql.com/doc/refman/5.7/en/mysql-innodb-cluster-creating.html)

# 修改密码

MySQL修改用户的密码主要有两种方法：ALTER USER 和SET PASSWORD

### ALTER USER

**基本使用**

```sql
ALTER USER testuser IDENTIFIED BY '123456';
```

**修改当前登录用户**

```
ALTER USER USER() IDENTIFIED BY '123456';
```

**使密码过期**

```
ALTER USER testuser IDENTIFIED BY '123456' PASSWORD EXPIRE;
```

**使密码从不过期**

```
ALTER USER testuser IDENTIFIED BY '123456' PASSWORD EXPIRE NEVER;
```

**按默认设置过期时间**

```
ALTER USER testuser IDENTIFIED BY '123456' PASSWORD EXPIRE DEFAULT;
```

**指定过期间隔**

```
ALTER USER testuser IDENTIFIED BY '123456' PASSWORD EXPIRE INTERVAL 90 DAY;
```

**在MySQL文档里，推荐使用ALTER USER修改用户密码**

### SET PASSWORD

使用SET PASSWORD的password有两种：

使用默认加密

```
SET PASSWORD FOR testuser = '123456'
```

使用PASSWORD()函数加密

```
SET PASSWORD FOR testuser = PASSWORD("123456")
```

**注意：使用PASSWORD('auth_string')的方式已经被废弃，在以后的版本会把它移除，所以不建议使用它来修改密码。**

# **4、MySql常用命令**

### **4.1 连接服务**

这里介绍两种连接方法分别为本地连接和远程连接。  

#### 4.1.1 本地连接

在cmd中输入并运行命令：mysql -u root -p，然后输入相应的密码。需要注意的是用户名-u和用户名之间也可以没有空格，即-uroot同样正确，但是密码和-p之间必须要有空格。如果是刚安装好的MYSQL，默认的root用户名是没有密码的，直接输入mysql -u root就可以进入MYSQL中了，MYSQL的提示符为：mysql>。                   

[![img](https://files.jb51.net/file_images/article/201607/201607040852295.png)](https://files.jb51.net/file_images/article/201607/201607040852295.png)  

#### 4.1.2 远程连接

假设远程主机的IP地址为：219.243.79.8，用户名为root，密码为123，则在cmd中运行如下命令：mysql -h219.243.79.8 -uroot -p 123。

#### 4.1.3 退出MYSQL命令：exit

### **4.2 增加新用户**

#### 4.2.1 超级用户

增加一个用户test1密码为abc，让他可以在任何主机上登录，并对所有数据库有查询、插入、修改、删除的权限。首先用root用户连入MYSQL，然后键入以下命令：                 

grant select,insert,update,delete on *.* to [email=test1@”%]test1@”%[/email]” Identified by “abc”;      

但增加的用户是十分危险的，你想如某个人知道test1的密码，那么他就可以在internet上的任何一台电脑上登录你的mysql数据库并对你的数据可以为所欲为了，解决办法见2。   

#### 4.2.2 本机用户

 增加一个用户test2密码为abc,让他只可以在localhost上登录，并可以对数据库mydb进行查询、插入、修改、删除的操作（localhost指本地主机，即MYSQL数据库所在的那台主机），这样用户即使用知道test2的密码，他也无法从internet上直接访问数据库，只能通过MYSQL主机上的web页来访问了。              

grant select,insert,update,delete on mydb.* to [email=test2@localhost]test2@localhost[/email] identified by “abc”;      

如果你不想test2有密码，可以再打一个命令将密码消掉。            

grant select,insert,update,delete on mydb.* to [email=test2@localhost]test2@localhost[/email] identified by “”; 

### **4.3 show命令**

show命令是查看的意思，可以用来查看MySql中的一些列表信息，如：show databases显示所有数据库的名称；show tables显示一个数据库中的所有表名称。 

### **4.4 操作数据库**

操作前要进入相关的数据库，可以使用use命令，如：use testdb进入名为testdb的数据库，进入数据库后既可以对数据库中的对象操作，相应的操作命令使用的是SQL语句，DDL、DML、DAL。   

#### 4.4.1 查看数据库内容

1)、查看数据库某个表的字段信息：desc 表名；                                   

  ![img](https://files.jb51.net/file_images/article/201607/201607040852296.png)      

2)、查看数据库表的创建语句：show create table 表名；当然使用同样的方法也可以查看其它创建内容的SQL语句，如查看数据库的创建语句，show create database 数据库名。                           

  ![img](https://files.jb51.net/file_images/article/201607/201607040852297.png)     

#### 4.4.2 修改表中列类型及名称

（1）只修改列类型         

alter table 数据库名.表名  modify column 列名  数据类型，例如：将t_animal表的sex列该为boolean类型：

```
alter table t_animal modify sex boolean not null
```

（2）同时修改列名和列数据类型 alter table 表名 change column 旧列名 新列名 数据类型，例如：将t_animal表的sex列更名为ani_sex，数据类型修改为boolean类型：

```
alter table t_animal change column sex ani_sex boolean not null
```
