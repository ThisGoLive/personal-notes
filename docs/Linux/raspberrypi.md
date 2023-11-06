### 1 系统选择

[系统选择](https://shumeipai.nxez.com/download#os)

默认 **Raspbian**

### 2 系统烧录

balenaEtcher 即可烧录进 SD卡

### 3 配置WiFi

如果没有接入显示器的话，使用 SSH 进行连接的话 

https://shumeipai.nxez.com/2017/09/13/raspberry-pi-network-configuration-before-boot.html

未启动树莓派的状态下单独修改 `/boot/wpa_supplicant.conf` 文件配置 WiFi 的 SSID 和密码，这样树莓派启动后会自行读取 wpa_supplicant.conf 配置文件连接 WiFi 设备。

```
country=CN
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
 
network={
ssid="WiFi-A"
psk="12345678"
key_mgmt=WPA-PSK
priority=1
}
 
network={
ssid="WiFi-B"
psk="12345678"
key_mgmt=WPA-PSK
priority=2
scan_ssid=1
}
```

### 4 远程图像操作

一、 **使用xdrp**

```shell
sudo apt-get install xrdp
```

二、VNC-Viewer

### 5 笔记本连接

如果现在笔记本已经通过WIFI连接到互联网，可以将无线网卡的互联网资源共享给本地连接。以win7系统为例，开始——控制面板——网络和Internet——网络和共享中心——查看网络状态和任务——更改适配器设置，找到无线网络连接右键“属性”，在共享选项卡上选中“允许其他网络用户通过此计算机的Internet连接来连接（N）”选项，点确定。

```shell
 arp -a
```

### 6 apt镜像

如果通过 ssh 连接树莓派出现 Access denied 这个提示则说明 ssh 服务没有开启。要手动开启的话，和 WiFi 配置相似，同样在 boot 分区新建一个文件，空白的即可，文件命名为 ssh。注意要小写且不要有任何扩展名。

https://shumeipai.nxez.com/2013/08/31/raspbian-chinese-software-source.html

```shell
sudo vi /etc/apt/sources.list 
# vi 操作 直接使用 testing 源
deb http://mirrors.tuna.tsinghua.edu.cn/raspbian/raspbian/ testing main contrib non-free
deb-src http://mirrors.tuna.tsinghua.edu.cn/raspbian/raspbian/ testing main contrib non-free
deb http://mirrors.tuna.tsinghua.edu.cn/raspbian/raspbian/ bullseye main non-free contrib
deb-src http://mirrors.tuna.tsinghua.edu.cn/raspbian/raspbian/ bullseye main non-free contrib

# 源
sudo vi /etc/apt/sources.list.d/raspi.list
deb http://mirrors.tuna.tsinghua.edu.cn/raspberrypi/ testing main ui
deb http://mirrors.tuna.tsinghua.edu.cn/raspberrypi/ bullseye main ui

http://mirrors.aliyun.com/raspbian/raspbian/

dpkg-reconfigure locales 空格选
 sudo apt-get update 
 sudo apt-get upgrade 
 sudo apt-get dist-upgrade
```

### 7 docker

直接使用脚本安装，apt 安装有问题或许 需要添加软件源

```shell
$ curl -fsSL get.docker.com -o get-docker.sh
$ sudo sh get-docker.sh --mirror Aliyun
$ sudo systemctl enable docker
$ sudo systemctl start docker
sudo groupadd docker
groups
sudo gpasswd -a $USER docker
```

### 8 samba

https://www.raspberrypi.org/documentation/remote-access/samba.md

```shell
lsb_release  -a

sudo apt install samba samba-common-bin smbclient cifs-utils
```

### 9 常用命令

https://shumeipai.nxez.com/2015/01/03/raspberry-pi-software-installation-and-uninstallation-command.html

### 10 设置中文

https://shumeipai.nxez.com/2016/03/13/how-to-make-raspberry-pi-display-chinese.html

### 11 Docker使用

由于 docker使用 armhf，分为 多种，所以 很多镜像需要自己 build

arm的build ：

https://www.v2ex.com/amp/t/366162

https://blog.csdn.net/whatday/article/details/86776463

推荐 arm32v6/7 最为 base image。

```shell
docker pull portainer/portainer
docker pull arm32v7/hello-world
docker pull bellsoft/liberica-openjdk-alpine:11.0.9-11
docker pull arm32v7/adoptopenjdk:11.0.9.1_1-jre-hotspot
docker pull arm32v7/postgres:12.5-alpine
docker pull arm32v7/nginx:1.19.4-alpine
```

#### 本地Build 时异常

arm32v7/ubuntu:20.04 apt update 报错

https://www.kutu66.com/ubuntu/article_192836#2-yfsys

[stackoverflow](https://stackoverflow.com/questions/64439278/gpg-invalid-signature-error-while-running-apt-update-inside-arm32v7-ubuntu20-04)

原因可能是 由于 respberrypi 安装系统太低 是基于 Debian  9的，docker 进行的 ubuntu:20.04 无法获取磁盘，

```shell
# 卸载旧
sudo dpkg --force-all -P libseccomp2

# 安装新 https://packages.debian.org/sid/armhf/libseccomp2/download
sudo dpkg -i  xxx
```

