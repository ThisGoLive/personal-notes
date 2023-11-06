# 安装SMB

# Lnux ping Win 主机名

系统错误原因，windows 有多个IP，一个IP 就可以

## arch linux

## other linux

samba-common-bin 中包含 nmblookup 可用来查看 是否解析了 主机名

samba winbind libnss-winbind

```shell
 apt install libnss-winbind libnss-mymachines

 sudo vim /etc/samba/smb.conf

 # hosts 行， wins 放在 [NOTFOUND=return] 之前 或者dns 也放在之前
 sudo vim /etc/nsswitch.conf
 # 如果编辑了/etc/nsswitch.conf 安装了libnss-winbind 还不行，就得 禁用 NSCD
```

# Linux ping Linux 主机名 解决

系统错误，原因 /etc/samba/smb.conf  wins 位置错误

> hosts:          files dns wins
> 
> sudo systemctl enable winbind.service

# Other

搜索服务：

```shell
ps -e| grep xxx
```

主机别名生效：

```shell
# 修改 /etc/hosts  IP   hostname
# 重启 
1）重启机器
2）重启服务
Ubuntu: $sudo /etc/init.d/networking restart

Gentoo: /etc/init.d/net.eth0 restart

3）使用hostname命令
hostname 定义的主机名
```

Ubuntu 18 修改主机名

```shell
sudo hostnamectl set-hostname xxx
vi /etc/hosts
127.0.0.1 xxx
# 对于已安装 Cloud-init 软件包的系统，您需要打开 /etc/cloud/cloud.cfg 并将 preserve_hostname 值从 false 更改为 true。
```

卸载软件

```
sudo apt-get autoremove --purge 
```

VNCService

[使用 VNC](https://www.cnblogs.com/qiaoyanlin/p/6914530.html 
)

# 局域网主机名 Samba

https://askubuntu.com/questions/243461/how-can-i-connect-to-a-samba-server-using-its-hostname-instead-of-the-ip

[Samba 配置详细](https://blog.51cto.com/itwish/2174270)

windows NetBEUI

Linux 下没有NetBEUI，而是使用 **Samba** ，而且还可以 共享文件夹

Samba所需软件包括：

Samba（服务器端软件包），

## Samba-client（客户端软件包），

Samba-common（Samba公共文件软件包），

Samba-Winbind（使用 Windows 域控制器管理 Linux 帐户）；

Samba由smbd 和 nmbd两个守护进程组成：

  smbd服务进程是Samba的核心启动服务，主要负责建立 Linux Samba服务器与Samba客户机之间的对话，为客户端提供文件共享与打印机服务及负责用户权限验证以及锁功能，smdb默认监听端口是 139 与 445 TCP端口。Samba通过smb服务启动smbd进程，可使用命令 # netstat -nutlp 可以查看进程端口信息；

  nmbd进程提供NetBIOS名称服务，以满足基于Common Internet File  System(CIFS)协议的共享访问环境（类似与DNS实现的功能，实现把Linux系统共享的工作组名称与其IP对应起来），Samba通过nmb 服务启动 nmbd进程，**该进程默认监听的是137与 138 UDP端口**；

Samba服务器可实现如下功能：WINS和DNS服务； 网络浏览服务； Linux和Windows域之间的认证和授权； UNICODE字符集和域名映射；满足CIFS协议的UNIX共享等。

```shell
sudo apt-get upgrade 
sudo apt-get update 
sudo apt-get dist-upgrade
# 安装
sudo apt-get install samba samba-client
sudo apt-get install samba samba-common-bin
sudo apt install samba samba-common-bin smbclient cifs-utils
# samba: command not found 
sudo /etc/init.d/smbd 
# 重启，如果不能进行 机名连接， 查看服务状态
sudo systemctl status nmbd

# 默认好像不需要
vi etc/samba/smb.conf
netbios name = MYSERVER
netbios name = k8s-m-01
#说明：设置Samba Server的NetBIOS名称。如果不填，则默认会使用该服务器的DNS名称的第一部分。netbios name和workgroup名字不要设置成一样了。

# 校验配置
testparm
smbd -F -S

vi /etc/nsswitch.conf

在hosts项中加入wins：
```

```bat
net view # win 端查看
```

## smb.conf 配置脚本

https://www.ibadboy.net/archives/1960.html

Samba的主配置文件为/etc/samba/smb.conf，主配置文件由两部分构成：全局参数及共享定义。在配置相关参数时，格式为 name = value

- Samba Server的验证方式，包含四种验证方式。
1. share：用户访问Samba Server不需要提供用户名和口令, 安全性能较低。该模式已被弃用
2. user：Samba Server共享目录只能被授权的用户访问,由Samba Server负责检查账号和密码的正确性。账号和密码要在本Samba Server中建立。
3. server：依靠其他Windows NT/2000或Samba Server来验证用户的账号和密码,是一种代理验证。该模式已被弃用
4. domain：域安全级别,使用主域控制器(PDC)来完成认证。 
- sam应该是security account manager（安全账户管理）的简写，目前用户后端有三种模式：smbpasswd、tdbsam和ldapsam。
1. smbpasswd：旧的明文passdb后端。如果使用此passdb后端，某些Samba功能将不起作用。smbpasswd文件默认在/etc/samba目录下，不过有时候要手工建立该文件。
2. tdbsam：基于TDB的密码存储后端。将TDB的路径作为可选参数（默认为在/etc/samba 目录中的passdb.tdb）。passdb.tdb用户数据库可以使用smbpasswd –a  来建立Samba用户，不过要建立的Samba用户必须先是系统用户； 也可使用pdbedit命令来建立Samba账户       
3. ldapsam：基于LDAP的passdb后端。 将LDAP URL作为可选参数（默认为ldap：// localhost）

## 共享文件夹

## Linux使用samba-client挂载Windows共享文件夹

```shell
apt-get install samba-client
apt-get install cifs-utils

# 挂载到/software
mount //192.168.11.11/e/software /software -o username="tianshangrenjian",password=abc\!123
# 开机自动挂载：
# 在文件 /etc/rc.local 中（用root用户）追加如下上述命令： 密码中如果带“!”需要在前面加“\”转译
```

[解决Linux ping lan hostname](https://serverfault.com/questions/352305/why-can-windows-machines-resolve-local-names-when-linux-cant)

[类似](https://serverfault.com/questions/145994/resolve-linux-hostname-in-windows)

```shell
# 修改配置 edit /etc/nsswitch.conf file and add wins
# hosts:          files mdns4_minimal [NOTFOUND=return] dns wins mdns4
# 这个貌似可以解决 system error
install libnss-winbind libnss-mymachines
sudo systemctl status winbind.service
sudo systemctl enable winbind.service
```

archlinux 没有配置文件

https://bbs.archlinux.org/viewtopic.php?id=194468

### 访问 两个配置

让windows通过域名访问linux 

vi /etc/samba/smb.conf

打开netbios name一项，并给出一个netbios名。

重启smb和nmb服务

```bash
sudo service smb restart
sudo service nmb restart

sudo service smbd restart
sudo service nmbd restart
```

让linux可以通过域名访问windows（或其他开启了netbios名的linux）

### Name or service not known

两点：自己问题 或者 服务问题

自己问题： 需要添加 wins

vi /etc/nsswitch.conf

在hosts项中加入wins：

hosts:           files wins dns

ping   windows域名    以确认

 但由于WINS server上缓存的IP可能已经过期，解析可能不对。

https://wiki.samba.org/index.php/Mounting_samba_shares_from_a_unix_client

smbd -F -S

服务问题：

### system error

install libnss-winbind libnss-mymachines
sudo systemctl status winbind.service
sudo systemctl enable winbind.service

https://shazi.info/%E5%9C%A8-linux-%E8%A7%A3%E6%9E%90-netbios-%E5%90%8D%E7%A8%B1/

NetBios name resolution with WINS

All networking programs at some point need to resolve a host name to an IP-Address. Usually this is done with a call to the function gethostbyname. This call is a library function and thus is handled in user space. Glibc systems such as Linux have the feature of using more than one lookup method to fulfill such a query. This is known as nsswitch (Name Service Switch). The config file is usually found in /etc/nsswitch.conf.

If a program wants to resolve the ip address of a host named 'wiki' it simply calls the function gethostbyname. The lookups done are the responsibility of the underlying glibc then. Glibc reads the /etc/nsswitch.conf and loads the library mentioned in the hosts line. Thats the key point: if there is a wins entry, glibc loads the libnss_wins.so which enables the NetBios Name Lookup. You got it then, you can resolve a Windows Name to an ip address.

So its simple: install the libnss_wins.so, add to your /etc/nsswitch.conf at line hosts the wins entry and the windows name resolution works. Your network setup should be ok for this, but thats not a matter of samba. 

### 总结

samba -> /ect/samba/smb.conf （netbios name）

/etc/nsswitch.conf （hosts ： wins) (libnss_wins.so 为 winbind.service)

> 但 还有问题，ping windows hostname 还有问题系统报错应该 是 smb.conf 中 wins support 的问题，但是我用 debian 裸版本，安装后smba 后，wind linux 都可以互通 
> 
> 看日志 应该是 hostname 多个了
