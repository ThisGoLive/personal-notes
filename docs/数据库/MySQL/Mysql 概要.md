D:\MySQL\mysql-5.7.21A\bin

mysqld --install MySQLA --defaults-file="D:\MySQL\mysql-5.7.21A\my.ini"

net start MySQLA 

mysqld --remove MySQLA         

mysqladmin -u root -p password root 

mysqld --initialize-insecure --user=mysql 

方法一：

MySQL提供跳过访问控制的命令行参数，通过在命令行以此命令启动MySQL服务器：

safe_mysqld --skip-grant-tables&

即可跳过MySQL的访问控制，任何人都可以在控制台以管理员的身份进入MySQL数据库。

需要注意的是在修改完密码以后要把MySQL服务器停掉重新启动才会生效，先找到mysql.server 然后停止mysql服务。

# mysqld_safe --skip-grant-tables --skip-networking &

# mysql

> use mysql;

> update user set password=PASSWORD("new-password") where user="root";

> flush privileges;

【Mysql 5.7 忘记root密码或重置密码的详细方法】

1、修改配置文件my.cnf 按i编辑

在[mysqld]中添加
skip-grant-tables
例如：

[mysqld]

**skip-grant-tables**

datadir=/var/lib/mysql

socket=/var/lib/mysql/mysql.sock
键盘 Esc 保存修改  :wq退出。

2、重启mysql服务

service mysqld restart
3、用户登录

mysql -uroot -p (直接点击回车，密码为空)
选择数据库

use mysql;
下面我们就要修改密码了

以前的版本我们用的是以下修改

update user set password=password('root') where user='root';
但是在5.7版本中不存在password字段，所有我们要用以下修改进行重置密码

update user set authentication_string=password('123456') where user='root';
执行

flush privileges;
4、退出mysql

quit;
5、将最开始修改的配置文件my.cnf中的skip-grant-tables删除

6、重启mysql

7、当你登陆mysql之后你会发现，当你执行命令时会出现

ERROR 1820 (HY000): You must reset your password using ALTER USER statement；
这是提示你需要修改密码

当你执行了

SET PASSWORD = PASSWORD('123456');
如果执行成功后面的就不要看了，纯属浪费时间！

如果出现：

ERROR 1819 (HY000): Your password does not satisfy the current policy requirements
你需要执行两个参数来把mysql默认的密码强度的取消了才行

set global validate_password_policy=0; set global validate_password_mixed_case_count=2;
这时你再执行

SET PASSWORD = PASSWORD('123456');