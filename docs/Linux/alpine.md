https://blog.csdn.net/weixin_44374482/article/details/90094414

软件镜像源 修改

```shell
echo -e "http://mirrors.aliyun.com/alpine/latest-stable/main" > /etc/apk/repositories 
apk update 
```

使用alpine构建基础镜像：

https://blog.csdn.net/weixin_44374482/article/details/90094414
