[[TOC]]

# 手动搭建

2021年12月12日

之前使用的 kubeadm搭建，1. 时间久了也忘了 2.kubeadm 毕竟只是学习用的

## 01 机器准备

samba 安装, 主要是 局域网中可以直接使用 honstname 连接

```bash
systemctl stop firewalld
systemctl disable firewalld

setenforce 0
sed -i 's/enforcing/disabled/' /etc/selinux/config

swapoff -a
vim /etc/fstab
# 编辑etc/fstab文件，注释swap所在的行

# 机器名称
hostname k8s-m-01
domainname k8s-m-01
hostnamectl set-hostname k8s-m-01
```

## 02 安装基础软件

使用的是 Debian 11基础版本，

#### Docker

```bash
$ sudo apt-get update

$ sudo apt-get install \
     apt-transport-https \
     ca-certificates \
     curl \
     gnupg \
     lsb-release

# 添加国内源
$ curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
# 官方源
# $ curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 我们需要向 sources.list 中添加 Docker 软件源：
$ echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://mirrors.aliyun.com/docker-ce/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
# 官方源
# $ echo \
#   "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \
#   $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

$ sudo apt-get update
$ sudo apt-get install docker-ce docker-ce-cli containerd.io

$ sudo systemctl enable docker
# docker Please check that your locale settings 需要按照提示进行修改 /etc/locale
# /usr/local/bin:/usr/bin:/bin:/usr/local/games:/usr/games
$ sudo systemctl start docker

$ sudo groupadd docker
$ sudo gpasswd -a $USER docker
newgrp docker

# 镜像
$ systemctl cat docker | grep '\-\-registry\-mirror'
# 如果该命令有输出，那么请执行 $ systemctl cat docker 查看 ExecStart= 出现的位置，修改对应的文件内容去掉 --registry-mirror 参数及其值，并按接下来的步骤进行配置。
# 如果以上命令没有任何输出，那么就可以在 /etc/docker/daemon.json 中写入如下内容（如果文件不存在请新建该文件）：
{
  "registry-mirrors": [
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
$ sudo systemctl daemon-reload
$ sudo systemctl restart docker
```

apt-get install vim ntp curl wget -y

由于 防火墙什么都没有

## 03 安装包下载

[官方文档 下载 Linux 版本](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/)

#### kubectl 安装

https://www.kubernetes.org.cn/installkubectl

```bash
curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/darwin/amd64/kubectl
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl
```

### 下载

[参考 https://mp.weixin.qq.com/s/612PCTZdFYvnk9yQ_ikCuw](https://mp.weixin.qq.com/s/612PCTZdFYvnk9yQ_ikCuw)

```bash
# 都需要
mkdir ~/kubernetes/resources -p
cd ~/kubernetes/resources
# 这里的 k8s 是最新的 1.23.1  etcd 就 也用最新的吧
wget https://dl.k8s.io/v1.23.1/kubernetes-server-linux-amd64.tar.gz
wget https://github.com/etcd-io/etcd/releases/download/v3.5.1/etcd-v3.5.1-linux-amd64.tar.gz
# 但是还要考虑兼容问题， 容器底层为 docker 
# https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG/CHANGELOG-1.23.md
# k8s 是最新的 1.23.1 兼容 docker github.com/docker/docker: v20.10.2+incompatible → v20.10.7+incompatible
$ sudo apt-get remove docker \
               docker-engine \
               docker.io
# 查询包
apt-cache search package
# 查询指定软件有多少个版本
apt-cache madison package
sudo apt-get install docker-ce=5:20.10.7~3-0~debian-bullseye docker-ce-cli=5:20.10.7~3-0~debian-bullseye containerd.io
```

#### master 的 需要

```bash
# 证书生成器
wget https://pkg.cfssl.org/R1.2/cfssl_linux-amd64
wget https://pkg.cfssl.org/R1.2/cfssljson_linux-amd64
wget https://pkg.cfssl.org/R1.2/cfssl-certinfo_linux-amd64
wget https://github.com/cloudflare/cfssl/releases/download/v1.6.1/cfssl_1.6.1_linux_amd64
wget https://github.com/cloudflare/cfssl/releases/download/v1.6.1/cfssljson_1.6.1_linux_amd64
wget https://github.com/cloudflare/cfssl/releases/download/v1.6.1/cfssl-certinfo_1.6.1_linux_amd64

# kube-flannel.yml 文件
wget https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml # 不能访问的
wget https://github.com/caoran/kube-flannel.yml/blob/master/kube-flannel.yml
```

#### node 需要

https://blog.csdn.net/weixin_39611930/article/details/111643896

cni k8s 网络插件

```shell
wget https://github.com/containernetworking/plugins/releases/download/v0.8.6/cni-plugins-linux-amd64-v0.8.6.tgz
wget https://github.com/containernetworking/plugins/releases/download/v1.0.1/cni-plugins-linux-amd64-v1.0.1.tgz
```

## 04 etcd 安装

### master 节点

安装cfssl
在Master机器执行：

```bash
cd ./kubernetes/resources/
cp cfssl_linux-amd64 /usr/bin/cfssl
sudo cp cfssl_1.6.1_linux_amd64 /usr/bin/cfssl
cp cfssljson_linux-amd64 /usr/bin/cfssljson
sudo cp cfssljson_1.6.1_linux_amd64 /usr/bin/cfssljson
cp cfssl-certinfo_linux-amd64 /usr/bin/cfssl-certinfo
sudo cp cfssl-certinfo_1.6.1_linux_amd64 /usr/bin/cfssl-certinfo
sudo chmod +x /usr/bin/cfssl /usr/bin/cfssljson /usr/bin/cfssl-certinfo
```

在所有机器执行：

```bash
mkdir /etc/etcd/ssl -p
```

#### **制作etcd证书**

在Master机器执行：

```bash
mkdir ~/kubernetes/resources/cert/etcd -p
cd ~/kubernetes/resources/cert/etcd
```

编辑ca-config.json

```bash
vim ca-config.json
```

```json
{
 "signing": {
   "default": {
     "expiry": "87600h"
  },
   "profiles": {
     "etcd": {
        "expiry": "87600h",
        "usages": [
           "signing",
           "key encipherment",
           "server auth",
           "client auth"
      ]
    }
  }
}
}
```

编辑ca-csr.json：

```bash
vim ca-csr.json
```

写入文件内容如下：

```json
{
    "CN": "etcd ca",
    "key": {
        "algo": "rsa",
        "size": 2048
    },
    "names": [
        {
            "C": "CN",
            "L" : "SICHUAN",
            "ST" :  "CHENGDU"
        }
    ]
}
```

生成ca证书和密钥：

```bash
cfssl gencert -initca ca-csr.json | cfssljson -bare ca
```

编辑server-csr.json：

```bash
vim server-csr.json
```

写入文件内容如下：

不清楚这里 hosts 为什么不能使用 hostname ， 以及 smba 开启了的

```json
{
    "CN": "etcd",
    "hosts": [
        "k8s-m-01",
        "k8s-n-01",
        "k8s-n-02"
        ],
    "key": {
        "algo": "rsa",
        "size": 2048
    },
    "names": [
        {
              "C": "CN",
            "L" : "SICHUAN",
            "ST" :  "CHENGDU"
        }
    ]
}
```

生成etcd证书和密钥

```bash
cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json -profile=etcd server-csr.json | cfssljson -bare server
# 此时目录下会生成7个文件
# This certificate lacks a "hosts" field. This makes it unsuitable for https://github.com/cloudflare/cfssl/issues/717v 徐奥将sfssl 升级到修复的 1.2.0
ls
ca-config.json  ca.csr  ca-csr.json  ca-key.pem  ca.pem  server.csr  server-csr.json  server-key.pem  server.pem
```

拷贝证书

```json
cp ca.pem server-key.pem  server.pem /etc/etcd/ssl
scp ca.pem server-key.pem  server.pem k8s-n-01:~/cfssl
scp ca.pem server-key.pem  server.pem k8s-n-02:~/cfssl
```

#### **安装etcd集群**

在所有机器执行：

```bash
cd ~/kubernetes/resources
tar -zxvf ./etcd-v3.5.1-linux-amd64.tar.gz
sudo cp ./etcd-v3.5.1-linux-amd64/etcd ./etcd-v3.5.1-linux-amd64/etcdctl /usr/bin
```

#### 配置etcd

这里开始命令需要分别在Master和Node机器执行，配置etcd.conf

```bash
sudo vim /etc/etcd/etcd.conf
```

k8s-master01写入文件内容如下：

```bash
[Member]
ETCD_NAME="etcd01"
ETCD_DATA_DIR="/var/lib/etcd/default.etcd"
ETCD_LISTEN_PEER_URLS="https://k8s-m-01:2380"
ETCD_LISTEN_CLIENT_URLS="https://k8s-m-01:2379,https://127.0.0.1:2379"

[Clustering]
ETCD_INITIAL_ADVERTISE_PEER_URLS="https://k8s-m-01:2380"
ETCD_ADVERTISE_CLIENT_URLS="https://k8s-m-01:2379"
ETCD_INITIAL_CLUSTER="etcd01=https://k8s-m-01:2380,etcd02=https://k8-n-01:2380,etcd03=https://k8s-n-02:2380"
ETCD_INITIAL_CLUSTER_TOKEN="etcd-cluster"
ETCD_INITIAL_CLUSTER_STATE="new"
```

这里开始在所有机器执行，设置etcd服务配置文件

```bash
sudo mkdir -p /var/lib/etcd
sudo vim /usr/lib/systemd/system/etcd.service
```

执行上行命令，写入文件内容如下：

```bash
[Unit]
Description=Etcd Server
After=network.target
After=network-online.target
Wants=network-online.target

[Service]
Type=notify
EnvironmentFile=/etc/etcd/etcd.conf
ExecStart=/usr/bin/etcd \
        --cert-file=/etc/etcd/ssl/server.pem \
        --key-file=/etc/etcd/ssl/server-key.pem \
        --peer-cert-file=/etc/etcd/ssl/server.pem \
        --peer-key-file=/etc/etcd/ssl/server-key.pem \
        --trusted-ca-file=/etc/etcd/ssl/ca.pem \
        --peer-trusted-ca-file=/etc/etcd/ssl/ca.pem
Restart=on-failure
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

启动etcd，并且设置开机自动运行etcd

```bash
sudo systemctl daemon-reload
sudo systemctl start etcd.service
sudo systemctl enable etcd.service
```

```bash
# Job for etcd.service failed because the control process exited with error code.
systemctl status etcd.service
sudo systemctl status etcd.service
#* etcd.service - Etcd Server
#     Loaded: loaded (/lib/systemd/system/etcd.service; enabled; vendor preset: enabled)
#     Active: failed (Result: exit-code) since Sun 2021-12-19 14:44:28 CST; 1min 11s ago
#   Main PID: 1051 (code=exited, status=1/FAILURE)
#        CPU: 48ms

#Dec 19 14:44:28 k8s-m-01 systemd[1]: etcd.service: Main process exited, code=exited, status=1/FAILURE
#Dec 19 14:44:28 k8s-m-01 systemd[1]: etcd.service: Failed with result 'exit-code'.
#Dec 19 14:44:28 k8s-m-01 systemd[1]: Failed to start Etcd Server.
#Dec 19 14:44:28 k8s-m-01 systemd[1]: etcd.service: Scheduled restart job, restart #counter is at 5.
#Dec 19 14:44:28 k8s-m-01 systemd[1]: Stopped Etcd Server.
#Dec 19 14:44:28 k8s-m-01 systemd[1]: etcd.service: Start request repeated too quickly.
#Dec 19 14:44:28 k8s-m-01 systemd[1]: etcd.service: Failed with result 'exit-code'.
#Dec 19 14:44:28 k8s-m-01 systemd[1]: Failed to start Etcd Server.
sudo journalctl -u etcd.service -o json-pretty -p warning
# "level":"warn","ts":"2021-12-19T14:44:28.758+0800","caller":"etcdmain/etcd.go:74","msg":"failed to verify flags","error":"expected IP in URL for binding (https://k8s-m-01:2380)"
https://github.com/etcd-io/etcd/issues/9575
# 查看状态
etcdctl \
> --ca-file=/etc/etcd/ssl/ca.pem --cert-file=/etc/etcd/ssl/server.pem --key-file=/etc/etcd/ssl/server-key.pem \
> --endpoints="https://k8s-m-01:2379,https://k8s-n-01:2379,https://k8s-n-02:2379" \
> cluster-health
检查etcd集群的健康状态

etcdctl endpoint health --cacert=/etc/etcd/ssl/ca.pem --cert=/etc/etcd/ssl/server.pem --key=/etc/etcd/ssl/server-key.pem --endpoints="https://k8s-m-01:2379,https://k8s-n-01:2379,https://k8s-n-02:2379"
```

[Listen peer URLs accepts domain names incorrectly · Issue #6336 · etcd-io/etcd · GitHub](https://github.com/etcd-io/etcd/issues/6336) 中表示 必须为IP，所以为了方便，就不使用集群了

### node 节点

```bash
mkdir /etc/etcd/ssl -p
```

#### **安装etcd集群**

在所有机器执行：

```bash
cd ~/kubernetes/resources
tar -zxvf ./etcd-v3.5.1-linux-amd64.tar.gz
sudo cp ./etcd-v3.5.1-linux-amd64/etcd ./etcd-v3.5.1-linux-amd64/etcdctl /usr/bin
```

#### 配置etcd

```bash
sudo vim /etc/etcd/etcd.conf
```

k8s-node01写入文件内容如下：

```bash
[Member]
ETCD_NAME="etcd02"
ETCD_DATA_DIR="/var/lib/etcd/default.etcd"
ETCD_LISTEN_PEER_URLS="https://k8s-n-01:2380"
ETCD_LISTEN_CLIENT_URLS="https://k8s-n-01:2379,https://127.0.0.1:2379"

[Clustering]
ETCD_INITIAL_ADVERTISE_PEER_URLS="https://k8s-n-01:2380"
ETCD_ADVERTISE_CLIENT_URLS="https://k8s-n-01:2379"
ETCD_INITIAL_CLUSTER="etcd01=https://k8s-m-01:2380,etcd02=https://k8s-n-01:2380,etcd03=https://k8s-n-02:2380"
ETCD_INITIAL_CLUSTER_TOKEN="etcd-cluster"
ETCD_INITIAL_CLUSTER_STATE="new"
```

k8s-node02写入文件内容如下：

```bash
[Member]
ETCD_NAME="etcd03"
ETCD_DATA_DIR="/var/lib/etcd/default.etcd"
ETCD_LISTEN_PEER_URLS="https://k8s-n-02:2380"
ETCD_LISTEN_CLIENT_URLS="https://k8s-n-02:2379,https://127.0.0.1:2379"

[Clustering]
ETCD_INITIAL_ADVERTISE_PEER_URLS="https://k8s-n-02:2380"
ETCD_ADVERTISE_CLIENT_URLS="https://k8s-n-02:2379"
ETCD_INITIAL_CLUSTER="etcd01=https://k8s-m-01:2380,etcd02=https://k8s-n-01:2380,etcd03=https://k8s-n-02:2380"
ETCD_INITIAL_CLUSTER_TOKEN="etcd-cluster"
ETCD_INITIAL_CLUSTER_STATE="new"
```

### 单节点安装

vim server-csr.json

```json
{
    "CN": "etcd",
    "hosts": [
        "127.0.0.1"
        ],
    "key": {
        "algo": "rsa",
        "size": 2048
    },
    "names": [
        {
              "C": "CN",
            "L" : "SICHUAN",
            "ST" :  "CHENGDU"
        }
    ]
}
```

sudo vim /etc/etcd/etcd.conf

```bash
[Member]
ETCD_NAME="etcd01"
ETCD_DATA_DIR="/var/lib/etcd/default.etcd"
ETCD_LISTEN_PEER_URLS="https://127.0.0.1:2380"
ETCD_LISTEN_CLIENT_URLS="https://127.0.0.1:2379"

[Clustering]
ETCD_INITIAL_ADVERTISE_PEER_URLS="https://127.0.0.1:2380"
ETCD_ADVERTISE_CLIENT_URLS="https://127.0.0.1:2379"
ETCD_INITIAL_CLUSTER="etcd01=https://127.0.0.1:2380"
ETCD_INITIAL_CLUSTER_TOKEN="etcd-cluster"
ETCD_INITIAL_CLUSTER_STATE="new"
```

etcdctl endpoint health --cacert=/etc/etcd/ssl/ca.pem --cert=/etc/etcd/ssl/server.pem --key=/etc/etcd/ssl/server-key.pem --endpoints="127.0.0.1:2379"
