[[TOC]]

# 部署Master

参考 https://mp.weixin.qq.com/s/ETacKFPlDgNgw89XAe2BZA

我们已经知道在K8S的Master上存在着kube-apiserver、kube-controller-manager、kube-scheduler三大组件。本篇介绍在Master机器安装这些组件，除此之外，如果想在Master机器上操作集群，还需要安装kubectl工具。

## **安装kubectl**

kubernetes的安装包里已经将kubectl包含进去了，部署很简单：

```bash
cd ~/kubernetes/resources/
tar -zxvf ./kubernetes-server-linux-amd64.tar.gz
cp kubernetes/server/bin/kubectl /usr/bin
kubectl api-versions
```

## **制作kubernetes证书**

```bash
sudo mkdir ~/kubernetes/resources/cert/kubernetes /etc/kubernetes/{ssl,bin} -p
sudo cp kubernetes/server/bin/kube-apiserver kubernetes/server/bin/kube-controller-manager kubernetes/server/bin/kube-scheduler /etc/kubernetes/bin
cd ~/kubernetes/resources/cert/kubernetes
```

### ca-config.json

接下来都在Master机器上执行，编辑ca-config.json

```bash
vim ca-config.json
```

写入文件内容如下：

```json
{
  "signing": {
    "default": {
      "expiry": "87600h"
    },
    "profiles": {
      "kubernetes": {
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

### ca-csr.json

编辑ca-csr.json：

```bash
vim ca-csr.json
```

写入文件内容如下：

```json
{
    "CN": "kubernetes",
    "key": {
        "algo": "rsa",
        "size": 2048
    },
    "names": [
        {
            "C": "CN",
            "L": "SICHUAN",
            "ST": "CHENDU",            
            "O": "kubernetes",
            "OU": "System"
        }
    ]
}
```

生成ca证书和密钥：

```bash
cfssl gencert -initca ca-csr.json | cfssljson -bare ca
```

### 制作kube-apiserver、kube-proxy、admin证书，编辑kube-apiserver-csr.json

```bash
vim kube-apiserver-csr.json
```

写入文件内容如下：

```json
{
    "CN": "kubernetes",
    "hosts": [
        "10.0.0.1",
        "127.0.0.1",
        "kubernetes",
        "kubernetes.default",
        "kubernetes.default.svc",
        "kubernetes.default.svc.cluster",
        "kubernetes.default.svc.cluster.local",
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
            "L": "SICHUAN",
            "ST": "CHENDU",
            "O": "kubernetes",
            "OU": "System"
        }
    ]
}
```

### kube-proxy-csr.json

编辑kube-proxy-csr.json：

```bash
vim kube-proxy-csr.json
```

写入文件内容如下：

```json
{
    "CN": "system:kube-proxy",
    "hosts": [
        "10.0.0.1",
        "127.0.0.1",
        "kubernetes",
        "kubernetes.default",
        "kubernetes.default.svc",
        "kubernetes.default.svc.cluster",
        "kubernetes.default.svc.cluster.local",
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
            "L": "SICHUAN",
            "ST": "CHENDU",
            "O": "kubernetes",
            "OU": "System"
        }
    ]
}
```

### admin-csr.json

编辑admin-csr.json：

```bash
vim admin-csr.json
```

写入文件内容如下：

```json
{
    "CN": "admin",
    "hosts": [
        "10.0.0.1",
        "127.0.0.1",
        "kubernetes",
        "kubernetes.default",
        "kubernetes.default.svc",
        "kubernetes.default.svc.cluster",
        "kubernetes.default.svc.cluster.local",
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
            "L": "SICHUAN",
            "ST": "CHENDU",
            "O": "system:masters",
            "OU": "System"
        }
    ]
}
```

生成证书和密钥

```bash
cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json -profile=kubernetes kube-apiserver-csr.json | cfssljson -bare kube-apiserver
cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json -profile=kubernetes kube-proxy-csr.json | cfssljson -bare kube-proxy
cfssl gencert -ca=ca.pem -ca-key=ca-key.pem -config=ca-config.json -profile=kubernetes admin-csr.json | cfssljson -bare admin
# 此时目录下生成的文件
ll
-rw-r--r--. 1 root root 1001 May 28 00:32 admin.csr
-rw-r--r--. 1 root root  282 May 28 00:32 admin-csr.json
-rw-------. 1 root root 1679 May 28 00:32 admin-key.pem
-rw-r--r--. 1 root root 1407 May 28 00:32 admin.pem
-rw-r--r--. 1 root root  294 May 28 00:30 ca-config.json
-rw-r--r--. 1 root root 1013 May 28 00:31 ca.csr
-rw-r--r--. 1 root root  284 May 28 00:30 ca-csr.json
-rw-------. 1 root root 1675 May 28 00:31 ca-key.pem
-rw-r--r--. 1 root root 1383 May 28 00:31 ca.pem
-rw-r--r--. 1 root root 1273 May 28 00:32 kube-apiserver.csr
-rw-r--r--. 1 root root  597 May 28 00:31 kube-apiserver-csr.json
-rw-------. 1 root root 1679 May 28 00:32 kube-apiserver-key.pem
-rw-r--r--. 1 root root 1655 May 28 00:32 kube-apiserver.pem
-rw-r--r--. 1 root root 1009 May 28 00:32 kube-proxy.csr
-rw-r--r--. 1 root root  287 May 28 00:31 kube-proxy-csr.json
-rw-------. 1 root root 1679 May 28 00:32 kube-proxy-key.pem
-rw-r--r--. 1 root root 1411 May 28 00:32 kube-proxy.pem
```

将kube-proxy证书拷贝到Node：

前提，需要在Node机器创建目录，以下命令在Node机器上执行：

```bash
mkdir /etc/kubernetes/ -p
mkdir ~/cert/kubernetes/ -p
```

然后再在Master机器执行拷贝操作。

```bash
cp ca.pem ca-key.pem kube-apiserver.pem kube-apiserver-key.pem kube-proxy.pem kube-proxy-key.pem /etc/kubernetes/ssl
scp -r /etc/kubernetes/ssl k8s-n-01:~/cert/kubernetes
scp -r /etc/kubernetes/ssl k8s-n-02:~/cert/kubernetes

sudo cp -r ./ssl /etc/kubernetes
```

## **创建TLSBootstrapping Token**

```bash
cd /etc/kubernetes
head -c 16 /dev/urandom | od -An -t x | tr -d ' '
# 执行上一步会得到一个token，例如 142e7e57f9e70125a2d7e00acb315956，编辑文件token.csv时需要
vim token.csv
```

写入文件内容，替换生成的token

```tex
# d5c5d767b64db39db132b433e9c45fbc,kubelet-bootstrap,10001,"system:node-bootstrapper"
142e7e57f9e70125a2d7e00acb315956,kubelet-bootstrap,10001,"system:node-bootstrapper"

```

## **安装kube-apiserver**

https://kubernetes.io/zh/docs/reference/command-line-tools-reference/kube-apiserver/

准备kube-apiserver配置文件

```bash
vim apiserver
```

执行上行命令，写入文件内容如下：

--advertise-address=k8s-m-01 \

--log-dir=/var/log/kubernetes \ --logtostderr=false \ 弃用

--bind-address=k8s-m-01 \  貌似得是IP，但是不填也可以

sudo mkdir /var/logs/kubernetes/

```bash
KUBE_API_ARGS="--v=2 \
--etcd-servers=https://127.0.0.1:2379 \
--secure-port=6443 \
--allow-privileged=true \
--service-cluster-ip-range=10.0.0.0/24 \
--enable-admission-plugins=NamespaceLifecycle,LimitRanger,ServiceAccount,ResourceQuota,NodeRestriction \
--authorization-mode=RBAC,Node \
--enable-bootstrap-token-auth=true \
--token-auth-file=/etc/kubernetes/token.csv \
--service-node-port-range=30000-32767 \
--kubelet-client-certificate=/etc/kubernetes/ssl/kube-apiserver.pem \
--kubelet-client-key=/etc/kubernetes/ssl/kube-apiserver-key.pem \
--tls-cert-file=/etc/kubernetes/ssl/kube-apiserver.pem  \
--tls-private-key-file=/etc/kubernetes/ssl/kube-apiserver-key.pem \
--client-ca-file=/etc/kubernetes/ssl/ca.pem \
--service-account-key-file=/etc/kubernetes/ssl/ca-key.pem \
--etcd-cafile=/etc/etcd/ssl/ca.pem \
--etcd-certfile=/etc/etcd/ssl/server.pem \
--etcd-keyfile=/etc/etcd/ssl/server-key.pem \
--audit-log-maxage=30 \
--audit-log-maxbackup=3 \
--audit-log-maxsize=100 \
--audit-log-path=/var/logs/kubernetes/k8s-audit.log \
--service-account-issuer=issuer \
--service-account-signing-key-file=/etc/kubernetes/ssl/ca-key.pem
" 
```

准备kube-apiserver服务配置文件

```bash
vim /usr/lib/systemd/system/kube-apiserver.service
```

执行上行命令，写入文件内容如下：

```bash
[Unit]
Description=Kubernetes API Server
Documentation=https://github.com/GoogleCloudPlatform/kubernetes
After=etcd.service
Wants=etcd.service

[Service]
Type=notify
EnvironmentFile=/etc/kubernetes/apiserver
ExecStart=/etc/kubernetes/bin/kube-apiserver $KUBE_API_ARGS
Restart=on-failure
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

启动kube-apiserver:

```bash
sudo systemctl daemon-reload
sudo systemctl enable kube-apiserver
sudo systemctl start kube-apiserver
sudo systemctl status kube-apiserver
# k8s-m-01 kube-apiserver[9798]: Error: invalid argument "k8s-m-01" for "--bind-address" flag: failed to parse IP: "k8s-m-01" etcd 错了
sudo journalctl -u kube-apiserver --no-pager 
# external host was not specified
```

## **安装kube-controller-manager**

准备kube-controller-manger配置文件

```bash
sudo vim controller-manager
```

执行上行命令，写入文件内容如下：

```bash
KUBE_CONTROLLER_MANAGER_ARGS="--logtostderr=false \
--v=2 \
--log-dir=/var/log/kubernetes \
--leader-elect=true \
--master=127.0.0.1:8080 \
--bind-address=127.0.0.1 \
--allocate-node-cidrs=true \
--cluster-cidr=10.244.0.0/16 \
--service-cluster-ip-range=10.0.0.0/24 \
--cluster-signing-cert-file=/etc/kubernetes/ssl/ca.pem \
--cluster-signing-key-file=/etc/kubernetes/ssl/ca-key.pem  \
--root-ca-file=/etc/kubernetes/ssl/ca.pem \
--service-account-private-key-file=/etc/kubernetes/ssl/ca-key.pem \
--experimental-cluster-signing-duration=87600h0m0s"
```

准备kube-controller-manger服务配置文件

```bash
vim /usr/lib/systemd/system/kube-controller-manager.service
```

执行上行命令，写入文件内容如下：

```bash
[Unit]
Description=Kubernetes Controller Manager
Documentation=https://github.com/GoogleCloudPlatform/kubernetes
After=kube-apiserver.service
Requires=kube-apiserver.service

[Service]
EnvironmentFile=/etc/kubernetes/controller-manager
ExecStart=/etc/kubernetes/bin/kube-controller-manager $KUBE_CONTROLLER_MANAGER_ARGS
Restart=on-failure
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

启动kube-controller-manager:

```bash
sudo systemctl daemon-reload
sudo systemctl start kube-controller-manager
sudo systemctl enable kube-controller-manager
sudo systemctl status kube-controller-manager
```

## **安装kube-scheduler**

准备kube-scheduler配置文件

```bash
vim scheduler
```

执行上行命令，写入文件内容如下：

```bash
KUBE_SCHEDULER_ARGS="--logtostderr=false \
--v=2 \
--log-dir=/var/log/kubernetes \
--master=127.0.0.1:8080 \
--leader-elect \
--bind-address=127.0.0.1"
```

准备kube-scheduler服务配置文件

```bash
vim /usr/lib/systemd/system/kube-scheduler.service
```

执行上行命令，写入文件内容如下：

```bash
[Unit]
Description=Kubernetes Scheduler
Documentation=https://github.com/GoogleCloudPlatform/kubernetes
After=kube-apiserver.service
Requires=kube-apiserver.service

[Service]
EnvironmentFile=/etc/kubernetes/scheduler
ExecStart=/etc/kubernetes/bin/kube-scheduler $KUBE_SCHEDULER_ARGS
Restart=on-failure
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
```

启动kube-scheduler:

```bash
systemctl daemon-reload
systemctl start kube-scheduler
systemctl enable kube-scheduler
systemctl status kube-scheduler
```

## **kubelet-bootstrap授权**

```bash
kubectl create clusterrolebinding kubelet-bootstrap --clusterrole=system:node-bootstrapper --user=kubelet-bootstrap
# error: failed to create clusterrolebinding: Post "http://localhost:8080/apis/rbac.authorization.k8s.io/v1/clusterrolebindings?fieldManager=kubectl-create": dial tcp [::1]:8080: connect: connection refused
# The connection to the server localhost:8080 was refused - did you specify the right host or port?
```

查看Master状态

```
kubectl get cs
```

如果Master部署成功，应该输出：

```
NAME                 STATUS    MESSAGE             ERROR
scheduler            Healthy   ok                  
controller-manager   Healthy   ok                  
etcd-2               Healthy   {"health":"true"}  
etcd-1               Healthy   {"health":"true"}  
etcd-0               Healthy   {"health":"true"}
```

kubectl conf

```bash
--admission-control=NodeRestriction,NamespaceLifecycle,LimitRanger,ServiceAccount,PersistentVolumeLabel,DefaultStorageClass,ResourceQuota,DefaultTolerationSeconds 
--authorization-mode=Node,RBAC 
--secure-port=6443 
--bind-address=0.0.0.0 
--advertise-address=10.0.0.8 
--insecure-port=0 
--insecure-bind-address=127.0.0.1 
--client-ca-file=/etc/kubernetes/pki/ca.crt 
--etcd-servers=http://127.0.0.1:2379 
--service-account-key-file=/etc/kubernetes/pki/sa.pub 
--service-cluster-ip-range=172.30.100.0/24 
--tls-cert-file=/etc/kubernetes/pki/kube-apiserver.crt 
--tls-private-key-file=/etc/kubernetes/pki/kube-apiserver.key 
--enable-bootstrap-token-auth 
--kubelet-client-certificate=/etc/kubernetes/pki/apiserver-kubelet-client.crt
--kubelet-client-key=/etc/kubernetes/pki/apiserver-kubelet-client.key 
--kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname 
--requestheader-client-ca-file=/etc/kubernetes/pki/front-proxy-ca.crt 
--requestheader-username-headers=X-Remote-User 
--requestheader-group-headers=X-Remote-Group 
--requestheader-allowed-names=front-proxy-client 
--requestheader-extra-headers-prefix=X-Remote-Extra-

```

> 到这里貌似卡住了，很清楚就是 kubectl 的配置问题，请求 一直访问 8080，kube-apiservice 的端口是6443，但是 我找遍了 官网文档与issu 都 没发现 配置模板 以及讨论这个问题的。今天以及弄了一天这个，而且二进制安装 多属于 运维方面，或者毕竟熟悉的。
>
> 收获：1. samba netibios 更加清楚 2. etcd hosts  不能用 域名 3. master 结构清楚了
>
> 所以 ：以后我 打算还是 使用 kubeadm 进安装吧，我的时间也不是很多 来折腾这些，搭建了 k8s 后 还要 深入 istio，之前搭建的 k8s 怎么我删了嘛！！！

## 补充 kubectl 配置

2021年12月20日 反转？ https://k8s-install.opsnull.com/03.kubectl.html 

```bash
kubectl config set-cluster kubernetes \
  --certificate-authority=/home/debian/kubernetes/resources/cert/kubernetes/ca.pem \
  --embed-certs=true \
  --server=https://k8s-m-01:6443 \
  --kubeconfig=kubectl.kubeconfig

kubectl config set-credentials admin \
  --client-certificate=/home/debian/kubernetes/resources/cert/kubernetes/admin.pem \
  --client-key=/home/debian/kubernetes/resources/cert/kubernetes/admin-key.pem \
  --embed-certs=true \
  --kubeconfig=kubectl.kubeconfig

kubectl config set-context kubernetes \
  --cluster=kubernetes \
  --user=admin \
  --kubeconfig=kubectl.kubeconfig
kubectl config use-context kubernetes --kubeconfig=kubectl.kubeconfig

kubectl get nodes --kubeconfig kubectl.kubeconfig

kubectl create clusterrolebinding kubelet-bootstrap --clusterrole=system:node-bootstrapper --user=kubelet-bootstrap --kubeconfig kubectl.kubeconfig
kubectl get cs --kubeconfig kubectl.kubeconfig

debian@k8s-m-01:~$ kubectl get cs --kubeconfig kubectl.kubeconfig
Warning: v1 ComponentStatus is deprecated in v1.19+
NAME                 STATUS    MESSAGE                         ERROR
etcd-0               Healthy   {"health":"true","reason":""}   
scheduler            Healthy   ok                              
controller-manager   Healthy   ok    

cp kubectl.kubeconfig /etc/kubernetes/admin.conf
cp kubectl.kubeconfig ~/.kube/config
```

