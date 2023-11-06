[[TOC]]

# 一、安装 与 初始化

## 1.1 压缩包安装 的 初始化

```shell
initdb.exe -D D:\pgsql\data -E UTF8 # 初始化 数据存放位置 可修改

# 启动服务
pg_ctl -D D:\pgsql\data -l logfile start

# 如果配置了环境变量 PGDATA
pg_ctl -l logfile start
pg_ctl start
pg_ctl start -l /opt/postgresql/log/pg_server.log

# 关闭服务
pg_ctl -D D:\pgsql\data stop

# shell 添加环境变量
PGDATA=/opt/postgresql/data
export PGDATA

# 进入服务postgres
psql postgres
# 改变端口
psql -p 5433 postgres

# 默认的 postgres 是没有密码
alter user postgres with password '123456';

# 如果 说这个角色没有 exist 创建 需要在系统中 添加此角色
# windows 添加角色用户
net user postgres 123456 /add
cacls d:\pgsql\data /e /t /r administrator
cacls d:\pgsql\data /e /t /g postgres:C

# \l 列出数据库 \du 列出用户 \

# 创建新用户
CREATE USER postgres WITH PASSWORD '123';

#postgres dose not exits  数据库不存在时 提示
# 创建数库
 createdb postgresql -U postgresql
 create DATABASE postgresql
```

[PostgreSQL 开与关 服务](https://blog.csdn.net/dyx1024/article/details/6594851)

PostgreSQL 的用户 与 系统的用户相关 与Mysql 不同。

[Window 端 参考](https://www.jb51.net/article/55453.htm)

1.   psql，createdb，dropdb这些命令是在dos命令下直接可以使用的，当然首先是需要将PostgreSQL的bin目录配置到环境变量中，你会发现在bin目录下有这些命令的exe文件。如在C:\Users\Administrator>该路径下，直接使用psql，createdb这些命令。

2.   如果没有配置关于用户，主机，端口这些环境变量则需要将这些加入到命令行中，如：

C:\Users\Administrator>createdb –h localhost –U postgres–p 5432 demo

点击回车之后，会让输入数据库的密码，输入之后，你可以通过GUI工具查看已经完成了创建。上述命令的意思是：

-h localhost 是为了确定登录的主机

-U postgres 是确定登录数据库的用户名，其中postgres是安装PostgreSQL数据库时默认的用户

-p 5432 是确定端口号，默认的端口号是5432，如同MySQL的3306

3.   为了不用每次使用psql，createdb，dropdb这些命令时都要输入-h,-U,-p这些参数，可以选择在环境变量中加入配置，如下：

PGHOST=localhost  配置登录主机

PGPORT=5432     配置端口号

PGUSER=postgres   配置登录用户

在环境变量中加入这些配置之后就可以直接使用psql，createdb，dropdb等命令而不需要加入-h,-U,-p这些参数。

[举例操作](https://blog.51cto.com/wujianwei/1970757)

# 二、配置文件

初始化完成后，在 Data 文件夹下 `postgresql.conf` 与 `postgresql.auto.conf`

[postgresql 配置文件详解](https://www.cnblogs.com/zhaowenzhong/p/5667434.html)

## 2.1 修改密码验证

data/pg_hba.conf 文件内：

```ini
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# IPv4 local connections:
host    all             all             127.0.0.1/32            trust
# IPv6 local connections:
host    all             all             ::1/128                 trust
# Allow replication connections from localhost, by a user with the
# replication privilege.
#host    replication     all             127.0.0.1/32            trust
#host    replication     all             ::1/128                 trust
host    all     all             0.0.0.0/0                 md5
```

## 2.2 远程连接

0x0000274D/10061 错误代码就是没有开启远程。

```ini
listen_addresses = '*'        # what IP address(es) to listen on;
                    # comma-separated list of addresses;
                    # defaults to 'localhost'; use '*' for all
                    # (change requires restart)
port = 5433                # (change requires restart)
max_connections = 100            # (change requires restart)
#superuser_reserved_connections = 3    # (change requires restart)
#unix_socket_directories = ''    # comma-separated list of directories
                    # (change requires restart)
#unix_socket_group = ''            # (change requires restart)
#unix_socket_permissions = 0777        # begin with 0 to use octal notation
                    # (change requires restart)
#bonjour = off                # advertise server via Bonjour
                    # (change requires restart)
#bonjour_name = ''            # defaults to the computer name
                    # (change requires restart)
```

# 三、小结

```shell
# 命令 postgres是 数据库名称，而不是 用户名称，登录的用户指的是当前的 系统 用户
psql postgres 
```

```sql
-- \du 可以查看当前 能够使用的用户，但是 超级用户（adminisraor）,不能远程，即当前系统的用户名
# 故而需要创建 新用户   但是这里需要 系统用户同名
CREATE USER postgres WITH PASSWORD '123';
```

[权限问题 ](https://blog.csdn.net/ttchengcheng/article/details/78881789)

```shell
CREATE USER # 创建的 用户 可以登陆 登陆角色
CREATE role # 创建的 角色 不能登陆 组角色
```

权限分为 ： 角色权限 和 操作权限

# 四、主从复制

[复制](https://juejin.im/post/5c8fb5996fb9a070b96f011d)

逻辑与 mysql 的主从复制类似，都是 开启对应的二进制日志流。

# 五、 问题汇总

```
error column "proisagg" dones not exist
# 客户端版本太低
```
