### network

```shell
ifconfig
ps -e | grep 
netstat -tunlp | grep 

which docker
whereis docker # 查看命令的路径

```

### 启动

```shell
shutdown -r/h now
reboot # 重启
runlevel # 查看启动级别
run level 0-6 # 设置启动级别
```

### 安装

[apt](http://www.cnblogs.com/EasonJim/p/7144017.html)

```shell
apt-get # 下载后，软件所在路径是：/var/cache/apt/archives
# 管理deb包 格式 dpkg (Debian package)\

apt-cache madison <<package name>> # 查询 软件版本 或者网站 https://packages.ubuntu.com/

sudo apt install net-tools # 安装工具包 ifconfig

# 查看安装软件 两种方法
apt list --installed
dpkg -l    
# 查找某款软件
dpkg -l | grep xxx
```

### 问题

1. 远程ssh连接 ： Network error: Connection refused

SSH服务没有开启

```shell
sudo apt-get update
sudo apt-get openssh-client # 下载安装
sudo apt-get openssh-server # 下载安装
```

[ssh](https://blog.csdn.net/weixin_42739326/article/details/82260588)

```shell
sudo service ssh start # 启动
# 报错 Failed to start ssh.service: Unit ssh.service not found.
sudo systemctl enable ssh.service # 关闭 start 启动
# 报错 Failed to enable unit: Unit file ssh.service does not exist. (单元文件 ssh.service 不存在)

sudo ps -e |grep ssh # 查看 ssh是否开启 有输出
```

