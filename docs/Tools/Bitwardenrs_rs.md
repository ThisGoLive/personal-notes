### 密码管理

https://github.com/dani-garcia/bitwarden_rs

```shell
docker pull bitwardenrs/server:latest
```

现代浏览器基本上都不支出，非HTTPS访问加密的 所以需要 设置代理

https://github.com/dani-garcia/bitwarden_rs/wiki/Proxy-examples

docker-compose

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

https://www.cnblogs.com/sucretan2010/p/13216848.html?utm_source=tuicool

生成证书

```conf
http {
  server {
  listen 443 ssl http2;
  server_name vault.*;
  
  # Specify SSL config if using a shared one.
  #include conf.d/ssl/ssl.conf;
  
  # Allow large attachments
  client_max_body_size 128M;

  location / {
    proxy_pass http://bitwardenrs:80;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
  
  location /notifications/hub {
    proxy_pass http://bitwardenrs:3012;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
  
  location /notifications/hub/negotiate {
    proxy_pass http://bitwardenrs:80;
  }

  # Optionally add extra authentication besides the ADMIN_TOKEN
  # If you don't want this, leave this part out
  location /admin {
    # See: https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-http-basic-authentication/
    auth_basic "Private";
    auth_basic_user_file /path/to/htpasswd_file;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_pass http://bitwardenrs:80;
  }

}
}
```

