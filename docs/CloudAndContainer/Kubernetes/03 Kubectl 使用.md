[[TOC]]

# kubectl 使用

kubectl 是 Kubernetes 自带的客户端，可以用它来直接操作 Kubernetes

```shell
# 显示一个 或者 多个资源
kubectl get 

# 显示资源详情
kubectl describe

# 从文件或标准输入创建资源
kubectl create

# 从文件或标准输入更新资源
kubectl update

# 通过 文件名 标准输入 资源名 或者 label selector 删除资源
kubectl delete

# 输出pod中一个容器的日子
kubectl log

# 将本地端口 转发到 Pod
kubectl port-forward

# 为	Kubernetes	API	server	启动代理服务器
proxy

# 在集群中使用指定镜像启动容器
run

#将 replication controller service 或 pod 暴露为新的 kubernetes service 
expose

# 更新资源的 label
label

# 修改 kubernetes 配置文件
config

# 显示集群信息
cluster-info

# 以	"组/版本"	的格式输出服务端支持的	API	版本
api-versions

# 输出服务端和客户端的版本信息
version

#显示各个命令的帮助信息
help

```

