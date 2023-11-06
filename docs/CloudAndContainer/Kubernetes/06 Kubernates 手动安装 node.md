[[TOC]]

参考 https://mp.weixin.qq.com/s/rKc8k4qrOHnKIiH_x4SaxA

# 部署Node

部署为两个节点 k8s-n-01 k8s-n-02

K8S的Node上需要运行kubelet和kube-proxy。本篇介绍在Node机器安装这两个组件，除此之外，安装通信需要的cni插件。

## 安装kubelet

```shell
cd ~/kubernetes/resources
wget https://dl.k8s.io/v1.23.1/kubernetes-node-linux-amd64.tar.gz
tar -zxvf ./kubernetes-node-linux-amd64.tar.gz

sudo mkdir /etc/kubernetes/{ssl,bin} -p

sudo cp kubernetes/node/bin/kubelet ./kubernetes/node/bin/kube-proxy /etc/kubernetes/bin
cd /etc/kubernetes

```

### 准备kubelet配置文件
```shell 
sudo vim kubelet
#n01
KUBELET_ARGS="--logtostderr=false \
--v=2 \
--log-dir=/var/log/kubernetes \
--enable-server=true \
--kubeconfig=/etc/kubernetes/kubelet.kubeconfig \
--hostname-override=k8s-n-01 \
--network-plugin=cni \
--bootstrap-kubeconfig=/etc/kubernetes/bootstrap.kubeconfig \
--config=/etc/kubernetes/kubelet-config.yml \
--cert-dir=/etc/kubernetes/ssl"
# n02
KUBELET_ARGS="--logtostderr=false \
--v=2 \
--log-dir=/var/log/kubernetes \
--enable-server=true \
--kubeconfig=/etc/kubernetes/kubelet.kubeconfig \
--hostname-override=k8s-n-02 \
--network-plugin=cni \
--bootstrap-kubeconfig=/etc/kubernetes/bootstrap.kubeconfig \
--config=/etc/kubernetes/kubelet-config.yml \
--cert-dir=/etc/kubernetes/ssl"
```

### 准备bootstrap.kubeconfig文件

```shell
sudo vim /etc/kubernetes/bootstrap.kubeconfig

apiVersion: v1
clusters:
- cluster:
  certificate-authority: /etc/kubernetes/ssl/ca.pem
  server: https://k8s-m-01:6443
name: kubernetes
contexts:
- context:
  cluster: kubernetes
  user: kubelet-bootstrap
name: default
current-context: default
kind: Config
preferences: {}
users:
- name: kubelet-bootstrap
user:
  token: 142e7e57f9e70125a2d7e00acb315956
```

> user:token 为 master 中token.csv

### 准备kubelet-config.yml文件

```shell
sudo vim kubelet-config.yml

kind: KubeletConfiguration
apiVersion: kubelet.config.k8s.io/v1beta1
address: 0.0.0.0
port: 10250
readOnlyPort: 10255
cgroupDriver: cgroupfs
clusterDNS:
- 10.0.0.2
clusterDomain: cluster.local
failSwapOn: false
authentication:
anonymous:
  enabled: false
webhook:
  cacheTTL: 2m0s
  enabled: true
x509:
  clientCAFile: /etc/kubernetes/ssl/ca.pem
authorization:
mode: Webhook
webhook:
  cacheAuthorizedTTL: 5m0s
  cacheUnauthorizedTTL: 30s
evictionHard:
imagefs.available: 15%
memory.available: 100Mi
nodefs.available: 10%
nodefs.inodesFree: 5%
maxOpenFiles: 1000000
maxPods: 110
```

### 准备kubelet.kubeconfig文件

```shell
sudo vim kubelet.kubeconfig

kubelet.kubeconfig
apiVersion: v1
clusters:
- cluster:
  certificate-authority: /etc/kubernetes/ssl/ca.pem
  server: https://k8s-m-01:6443
name: kubernetes
contexts:
- context:
  cluster: kubernetes
  namespace: default
  user: default-auth
name: default-context
current-context: default-context
kind: Config
preferences: {}
users:
- name: default-auth
user:
  client-certificate: /etc/kubernetes/ssl/kubelet-client-current.pem
  client-key: /etc/kubernetes/ssl/kubelet-client-current.pem
```

### 准备kubelet服务配置文件

```shell
sudo vim /usr/lib/systemd/system/kubelet.service

[Unit]
Description=Kubelet
Documentation=https://github.com/GoogleCloudPlatform/kubernetes
After=docker.service
Requires=docker.service

[Service]
EnvironmentFile=/etc/kubernetes/kubelet
ExecStart=/etc/kubernetes/bin/kubelet $KUBELET_ARGS
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

### 启动kubelet：

```shell
sudo systemctl daemon-reload
sudo systemctl start kubelet
sudo systemctl enable kubelet
sudo systemctl status kubelet
```

放弃了  对于我来说手动安装没用吧！
