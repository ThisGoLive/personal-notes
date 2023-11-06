[[TOC]]

### 拉去镜像

```shell
 docker pull mysql:5.7.25
```

### 须知

由 Dockerfile 可知道：是使用的 Linux 版本的 Mysql，故而配置文件、路径 与之前 Window端的 又有所差别！

而且 要进行 **主从复制** 是需要容器间的互联，这里 就不去使用 --link，而是使用

```shell
	docker	network	create	-d	bridge	my-net # 构建容器 间的网络
```

### 创建容器

如果不进行 主从复制，即 不怎么需要进行 配置**文件**

故而可以直接使用

```shell
docker run -p 3309:3306 --name some-mysql -v /srv/mydbs/mysql:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.7.25
```

#### master

my.cnf 文件 与 my.ini 貌似可以复用

```ini

[mysql]
# 设置mysql客户端默认字符集
default-character-set=utf8 
[mysqld]

# 允许最大连接数
max_connections=200
# 服务端使用的字符集默认为8比特编码的latin1字符集
character-set-server=utf8
# 创建新表时将使用的默认存储引擎
default-storage-engine=INNODB

log_bin = mysql-bin 
server_id = 1 

relay_log = mysql-relay-bin 
log_slave_updates = 1 
read_only = 1
```

需要将 my.cnf 文件挂载到 容器中的 /etc/mysql/my.cnf

```shell
docker run -p 3307:3306 --name mysql-m  --network my-net  -v /srv/mydbs/mysqlM/data:/var/lib/mysql -v /srv/mydbs/mysqlM/cnf/my.cnf:/etc/mysql/my.cnf -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.7.25
```

#### slave

```ini
[mysql]
# 设置mysql客户端默认字符集
default-character-set=utf8 
[mysqld]

# 允许最大连接数
max_connections=200
# 服务端使用的字符集默认为8比特编码的latin1字符集
character-set-server=utf8
# 创建新表时将使用的默认存储引擎
default-storage-engine=INNODB

log_bin = mysql-bin 
server_id = 2 

relay_log = mysql-relay-bin 
log_slave_updates = 1 
read_only = 1
```

```shell
docker run -p 3308:3306 --name mysql-s1  --network my-net  -v /srv/mydbs/mysqlS/data:/var/lib/mysql -v /srv/mydbs/mysqlS/cnf/my.cnf:/etc/mysql/my.cnf -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.7.25
```

### 开启复制

剩下 同 主从复制

> 1.创建对应的账号
>
> grant all on *.* to 'slave1'@'%' identified by '123456'; 
>
> 2.刷新
>
> flush privileges;



> 1.设置参数 注意 这里的 master_port=3306; 由于是 容器间的 互联 不是映射
>
> change master to master_host='mysql-m',master_user='slave1',master_password='123456',master_log_file='mysql-bin.000003',master_log_pos=771,Relay_Log_Pos=771,master_port=3306;
>
> 2.start slave
>
> 3.SHOW SLAVE STATUS；