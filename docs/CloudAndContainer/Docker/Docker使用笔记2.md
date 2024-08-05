## 挂起

Vmware 虚拟机的挂起功能：如果 Ubuntu 使用 docker 服务，挂起后，再打开，此时的 docker 服务虽然开启、容器也已启动，但是 外部是不能进行使用 容器对应的服务。需要重新启动 docker 服务，重启 容器服务。

## 初始化

国内镜像配置：

```shell
sudo vim /etc/docker/daemon.json
sudo systemctl daemon-reload
sudo systemctl restart docker
```

```json
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://hub-mirror.c.163.com",
    "https://registry.docker-cn.com"
  ]
}
```

## 常用命令

```shell
docker container stop
docker    container    rm 禁止状态的容器名称
docker    container    prune # 删除全部禁止状态的容器
```

## 遇到的错误

### 镜像超时

> docker: Error response from daemon: Get https://registry-1.docker.io/v2/: net/http: request canceled while waiting for connection (Client.Timeout exceeded while awaiting headers).

[仓库与镜像](https://www.cnblogs.com/jpfss/p/11277615.html)

修改为国内

```shell
sudo vim /etc/docker/deamon.json
{
  "registry-mirrors": ["https://registry.docker-cn.com"]
}
sudo service docker stop
sudo service docker start
```

### 无法运行

> Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?.

怀疑是我 删除了 docker.pid 导致的。后面重装 docker 也没有解决问题。

## 容器导出与导入

[导入与导出](https://blog.csdn.net/lovelong8808/article/details/80447458)

容器启动后，使用

```shell
    docker    export contID > 名称
```

导入

```shell
cat    ubuntu.tar    |    docker    import    -    test/ubuntu:v1.0
```

## 容器间互联

```shell
docker network所有子命令如下：

docker network create
docker network connect
docker network ls
docker network rm
docker network disconnect
docker network inspect

docker    network    create    -d    bridge    my-net # 构建容器 间的网络
```

# 开启 docker-ce 2375 端口

找到 ExecStart，在最后面添加 -H tcp://0.0.0.0:2375

### ubuntu

1. 临时开启 ，通过 dockerd 启动 docker

   ```bash
    sudo dockerd -H tcp://0.0.0.0:2375 -H unix:///var/run/docker.sock &
   ```

2. 永久配置 可能有问题

   ```bash
   vim /lib/systemd/system/docker.service
   # ExecStart=/usr/bin/dockerd -H tcp://0.0.0.0:2375 -H -fd:// --containerd=/run/containerd/containerd.sock
   ```

   centos

   /usr/lib/systemd/system/docker.service

```shell
systemctl daemon-reload
systemctl restart docker
```

# Build 镜像

https://www.jianshu.com/p/c32c9f24b941

构建镜像时，update 时，出现 `At least one invalid signature was encountered.`

```
# /etc/docker/daemon.json
"storage-driver": "vfs"
```

```bash
sudo systemctl restrt systemd-logind
[root@localhost ~]# docker ps -a
Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
```

https://www.freesion.com/article/3515711389/

容器中的 network 如果设置为 host，那么是使用的 宿主机器的 ip 端口

```yml
services:
  db:
    image: postgres:latest
    restart: always
    ports:
      - 5432:5432
    environment:
      POSTGRES_PASSWORD: "postgres"
    volumes:
      - database_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
#CREATE DATABASE "MyDataBase";
```

# 关于快指令集平台运行问题

1 运行问题

```shell
# docker run 时可以强行选择运行容器的平台，如果不选择，就会默认宿主的指令集平台
--platform linux/amd64
```

2 编译问题或者说 build 镜像

`docker buildx` BuildKit
https://yeasy.gitbook.io/docker_practice/buildx/multi-arch-images
