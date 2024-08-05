# Docker Image 的构建阶段保护敏感信息

2024-02-20

<https://www.bilibili.com/video/BV1eX4y1b79E/>

## 1. Dockerfile 添加 ARG

```dockerfile
FROM xxx

ARG TOKEN

run git clone httpsL//$TOKEN@github.com/xxx
xxx
```

```shell
docker image build --build-arg TOKEN=xxx -t imagename:version .
```

但是 `docker image history imagename` 还是能看到，所以只能用于普通的参数传递

## 2. 多阶段构建，在前阶段 传递 TOKEN

```dockerfile
FROM xxx as builder

ARG TOKEN
run git clone httpsL//$TOKEN@github.com/xxx

from xxx
copy --from=builder /xxx /xxx

```

## 3. 挂载 secret

```dockerfile
FROM  --mount-type=secret,id=my_secret git clone httpsL//$(cat /run/serets/my_secret)@github.com/xxx
```
