[[TOC]]

# Windows 安装MySql 压缩包

解压路径 D:\Mysql\

## 1. 配置环境变量

``path = D:\Mysql\mysql-5.7.22A\bin``

## 2. 配置文件

由于是Windows端 配置文件为 xx.ini

内容：

```shell
[mysql]

skip_ssl
# disable_ssl 关闭ssl
# 设置mysql客户端默认字符集
default-character-set=utf8 
[mysqld]
#设置3306端口
port = 3306 
# 设置mysql的安装目录
basedir=D:\Mysql\mysql-5.7.22A
# 设置mysql数据库的数据的存放目录
datadir=D:\Mysql\mysql-5.7.22A\data
# 允许最大连接数
max_connections=200
# 服务端使用的字符集默认为8比特编码的latin1字符集
character-set-server=utf8
# 创建新表时将使用的默认存储引擎
default-storage-engine=INNODB
```

## 3. 安装

以管理员身份运行C:\Windows\System32目录下找到这个cmd.exe，

以管理员身份打开cmd窗口后，

多个Mysql 就不要配置 环境变量

```
netstat -ano
d:
cd D:\Mysql\mysql-5.7.22A\bin
// 创建一个 叫 MySQLA 的服务
mysqld --install MySQLA 

// 启动不了服务 是由于data目录没有创建 使用以下 并在 data目录下 PC.err 找到 默认的密码 用于登陆
mysqld  --initialize
```

登陆：

`mysql -u root -p`

此时可能无法登陆。

启动服务：

`net start MySQL`

 关闭服务：

`net stop MySQL`

删除服务：

`mysqld --remove MySQL    `

# CentOs 压缩包安装 MySQL

[Linux 安装](https://blog.csdn.net/yeyinglingfeng/article/details/80665083)

## 1. 解压

顺便复习Linux 命令

```shell
# tar.gz 解压
tar -zxf mysql...

# tar.gz 压缩
tar -zcf 新.tar.gz 旧

# bz2 解压
tar -jxf 
tar -jcf

mkdir /myservice/
mv mysql... /myservice/mysql/
```

## 2. 设置启动项



```
alter table t_animal change column sex ani_sex boolean not null
```