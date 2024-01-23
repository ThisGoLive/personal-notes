# 第十七章 爬虫

简单理解 就是 请求

## 17.1 技巧

只是基本的

### 17.1.1 基本方法

使用 十五章 中 `urllib 模块` **request**

```shell
request.urlopen('http://www.baidu.com')
```

### 17.1.2 使用代理

防止IP 被标记，但是 现在 互联网 IPv4 中，各个 服务商对于家用网络，要给小区 或者 一片区域 或许都是 使用 的同一个IP，故而正常的 网站 是会进行 筛选的。

```python
proxy_support = request.ProxyHandler({}) # 设置 代理池
opener = request.build_opener(proxy_support, request.HTTPHandler)
request.install_opener(opener)

request.urlopen(xxx)
```

### 17.1.3 cookie 处理

```python
from urllib import request
from http import cookiejar
cookie_support = request.HTTPCookieProcessor(cookiejar.CoolieJar) 
opener = request.build_opener(cookie_support, request.HTTPHandler)
request.install_opener(opener)

request.urlopen(xxx)
```

### 17.1.4 伪装浏览器

伪装浏览器 通过 修改 HTTP 请求中  请求头 header 实现

```python
postdata = parse.urlencode({})
headers = {
    # 设置的浏览器
    '':''
}
req = request.Request(url = '',
                     data = postdata,
                     headers = headers)
```

### 17.1.5 登录

同上  将 登录数据 格式 包装进 request

```shell
postdata = parse.urlencode({
'user': "xxx",
'password': "xxx"
})

req = request.Request(url = '',
                     data = postdata)
```



## 17.2 实例

之前 我使用 Java 爬虫框架，爬取过 小说网站。

基本类似

略



