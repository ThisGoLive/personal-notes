# docker-compose

[模板](https://blog.csdn.net/ZhanBiaoChina/article/details/105467835)

```yaml
version: '3.3'
# ERROR: for service UnixHTTPConnectionPool(host='localhost', port=None): Read
# 没有在规定时间内启动     export DOCKER_CLIENT_TIMEOUT=500 export COMPOSE_HTTP_TIMEOUT=500
# vim /etc/profile
services: 
    service:
        container_name: bitwardenrs
        image: bitwardenrs/server:latest
        restart: always
        ports:
            - 80
        networks:
            - local_net
    web:
        image: arm32v7/nginx:1.19.5-alpine
        volumes:
            - /home/pi/dockerfiles/bitwardenrs/default.conf:/etc/nginx/nginx.conf
        ports:
            - 18000:80
            - 18443:443
        restart: always
        networks:
            - local_net

networks:
    local_net:
    # 使用已存在的
        external: true
    # 创建新的
    # demo:
    #     driver: default
    #     config:
    #         subnet: 172.16.238.0/24
    #         gateway: 172.16.238.1
```

容器service endpoint with name xxx already exist问题

利用docker compose启的容器再用docker rm命令删除后，网络仍然被占用，需要手动清理

docker rm -f xxx

```
docker network disconnect --force bridge contation_name
```

docker network inspect netWorkName
## 使用 build

```yaml
version: '3'
services:
    node1:
            build: node1
            container_name: node1
            # build 构建的 iamge tag
            image: node1:latest
```


```yaml
version: '3.2'
services:
  jobsaf-server:
    image: jobsaf-server:${TAG}
    build: 
      context: ./application
      dockerfile: Dockerfile.production
# TAG=1.0.1 是 .env 文件下
```