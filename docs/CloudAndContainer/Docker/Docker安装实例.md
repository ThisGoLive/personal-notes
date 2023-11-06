# 基本镜像安装

> --restart具体参数值详细信息

- no - 容器退出时，不重启容器
- on-failure - 只有在非0状态退出时才从新启动容器
- always - 无论退出状态是如何，都重启容器

如果创建时未指定 --restart=always ,可通过 update 命令

```shell
docker update --restart=always xxx
```

## MySQL 安装

```shell
# 主库
docker run -p 3307:3306 --name mysql-m  --network my-net --restart=always  -v ~/Datas/MySQLDatas/mysqlM/data:/var/lib/mysql -v ~/Datas/MySQLDatas/mysqlM/cnf/my.cnf:/etc/mysql/my.cnf -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.7.25
# 从库
docker run -p 3308:3306 --name mysql-s1  --network my-net --restart=always  -v ~/Datas/MySQLDatas/mysqlS/data:/var/lib/mysql -v ~/Datas/MySQLDatas/mysqlS/cnf/my.cnf:/etc/mysql/my.cnf -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.7.25

docker run -p 3306:3306 --name mysql8  --network local_net --restart=always  -v ~/Datas/mysql/data:/var/lib/mysql -v ~/Datas/mysql/conf/my.cnf:/etc/mysql/my.cnf -v ~/Datas/mysql/mysql-files:/var/lib/mysql-files -e MYSQL_ROOT_PASSWORD=123@456Q -d mysql:8
# 如果data 中包含数据，那么不需要MYSQL_ROOT_PASSWORD
```

## GitBilt 安装

```shell
docker run -d --name=gitblit -p 8100:8080 --restart=always -e "JAVA_OPTS=-Xmx512m" -v ~/Datas/gitblit:/opt/gitblit-data jacekkow/gitblit:1.9.1
```

## sonatype/nexus3 安装

```shell
sudo chown -R 200 ./Datas/nexus-data
docker run -d -p 8033:8081 --restart=always --name nexus3 -v ~/Datas/nexus-data:/nexus-data sonatype/nexus3

docker run -d -p 8033:8081 --restart=always --name nexus3 -v ~/Datas/nexus-data:/nexus-data -e INSTALL4J_ADD_VM_PARAMS="-Xms2g -Xmx2g -XX:MaxDirectMemorySize=3g  -Djava.util.prefs.userRoot=/some-other-dir" sonatype/nexus3
```

```shell
# 查看密码
docker logs -f nexus
```

## Postgresql  安装

```shell
docker run -d -p 5432:5432 --name postgres11  -e POSTGRES_PASSWORD=123456  -v ~/Datas/postgresdata:/var/lib/postgresql/data postgres:11

docker run -d -p 5432:5432 --name postgres12 --restart=always --network local_net  -e POSTGRES_PASSWORD=123456  -v ~/Datas/postgres_data:/var/lib/postgresql/data arm32v7/postgres:12-alpine
```
https://github.com/tianon/docker-postgres-upgrade
```shell
docker run --rm -v /home/gl/docker-data/Nextcloud/db:/var/lib/postgresql/15/data -v /home/gl/docker-data/Nextcloud/16db:/var/lib/postgresql/16/data tianon/postgres-upgrade:15-to-16
```doc
## redis安装

```shell
docker pull redis:5
docker run -d -p 6379:6379 --restart=always --name redis-versver -v ~/Datas/RedisData:/data redis:5
```

## portainer 安装

```shell
docker pull portainer/portainer-ce

docker run -d \
-p 9000:9000 \
--restart=always \
--name protainer \
-v ~/Datas/portainerdata:/data \
-v "/var/run/docker.sock:/var/run/docker.sock" \
portainer/portainer-ce
```

gitea

```shell
docker run -d \
-p 3000:3000 \
--restart=always --network local_net \
--name gitea \
-v ~/Datas/gitea_data:/data \
ram32v7_gitea:1.13
```

 docker image 多阶段构建
https://docker-practice.github.io/zh-cn/image/multistage-builds/