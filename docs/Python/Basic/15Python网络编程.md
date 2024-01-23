[[TOC]]

# 第十五章 网络编程

七层网络模型：

1. 物理层
2. 数据链路层
3. 网络层
4. 传输层
5. 会话层
6. 显示层
7. 应用层

## 15.1 网络设计模块

### 15.1.1  Socket 套接字简介

网络编程中基本组件 套接字 Socket

**套接字** ： **特定网络协议**  (如 TCP/IP  ICMP/IP UDP/IP 等) 套件对上的 网络应用程序提供者 提供当前可 移植标准的对象。

套接字 允许程序接受数据 并进行连接，如发送和接受数据

为了 建立通信通道， 网络通信的每个端点 拥有一个 套接字对象 极为重要

套接字 为 UNIX 核心一部分，类 UNIX 一般都有，而其他的 如 Windows 使用的 则为提供库 以支持

三种流行的 套接字类型： **stream** **datagram** **raw**

其中 stream datagram 套接字可以直接与 TCP 协议进行接口， 而 raw 与 IP 协议 接口

### 15.1.2 socket 模块

套接字模块 是一个非常简单的 基于对象的 接口，提供对低层 BSD 套接字样式网络的 访问。

该模块 可以 实现客户机 和 服务器之间 的 套接字。

一般 来说 创建 服务器连接 需要 六步骤

#### 1 创建 套接字对象

python 中 我们使用功能 socket() 函数 创建套接字

`socket.socket([family[, type[, protocol]]])`

+ farmily : 可以是 AF_UNIX（unix域 用于本机）  AF_INET（用于 IPV4）  AF_INET6（用于 ipv6）
+ type ： 套接字类型  一般分为面向 连接 和 非连接 分为 **SOCKET_STREAM 套接字流**  **SOCKET_DGRAM数据报文套接字**
+ protocol ： 一般 默认  0

AF_UNSPEC 兼容 ipv4 ipv6 

AF_INET6 用于 IP v6

AF_INET PF_INET  用于 IP v4

AF address family 地址族

PF protocolfamily 协议族

两者在 Windows 没有区别 在 unix  下 有 一些区别

#### 2 socket 绑定地址

socket.bing((ip, port))

#### 3 准备套接字 用于连接

`socket.listen(backlog)`  backlog 指定最多连接， 至少 1。连接到请求后 这些请求必须排队，如果 队列已满 就请求拒绝

#### 4 服务器套接字通过 socket accept 方法等待 客户请求连接

```python
connection, address = socket.accept()
```

此时 进入阻塞状态

#### 5 处理 服务端  与 客户端 通过 send recv 通信

服务器 调用 send , 并且采用 字符串 形式 像客户端 发送信息， 

#### 6 传输结束  socket.close() 关闭

### 15.1.3 socket 对象 方法

socket 模块 提供的 服务端 套接字 函数

| 函数     | 描述                     |
| -------- | ------------------------ |
| bind()   | 绑定 地址 端口           |
| listen() | 开始 监听 TCP，等待 连接 |
| accept() | 被动 接受 TCP 客户端连接 |



客户端 函数 

| 函数         | 描述                                               |
| ------------ | -------------------------------------------------- |
| connect()    | 主动 初始化TCP  服务器 连接。 参数  元组 地址 端口 |
| connect_ex() | 上函数 扩展 ，出错时 返回 错误代码                 |

 公共函数

| 函数                                 | 描 述                                           |
| ------------------------------------ | ----------------------------------------------- |
| recv()                               | 接收 TCP 数据 返回字符串                        |
| send()                               | 发送 TCP数据 ，                                 |
| sendall()                            | 完整发送  发送完成 返回 None                    |
| recvform()                           | 接收 UDP 数据。返回值 （data，address）         |
| sendto()                             | 发送  UPD 数据                                  |
| close()                              | 关闭 套接字                                     |
| getpeername()                        | 返回 套接字的 远程地址 (ipaddr, port)           |
| getsockname()                        | 返回 套接字的 地址 (ipaddr, port)               |
| setsockopt(level, optname, value)    | 设置 套接字 选项的值                            |
| getsockopt(level, optname[. buflen]) | 返回 套接字 选项值                              |
| settimeout(timeout)                  | 设置 超时时间                                   |
| gettimeout()                         | 获取 超时 时间                                  |
| fileno()                             | 返回 套接字的描述文件                           |
| setblocking(flag)                    | 如果 flag 为 0 ，则为 非阻塞 否则 默认值 为阻塞 |
| makefile()                           | 创建 一个 与套接字 相关的 文件                  |

## 15.2 TCP 编程

### 15.2.1 客户端

```python
#! /usr/bin/python3
# -*-coding:UTF-8-*-
import socket

# 创建 套接字
soc = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
hostname = socket.gethostname()
# 连接 服务端
soc.connect((hostname, 10000))
soc.send('Python TCP 第一个DEMO'.encode('utf-8'))
print(soc.recv(1024).decode('utf-8'))
# 传输 一个 bytes 二进制数据
# soc.send('end'.encode('utf-8'))
# 也可以 如下 声明
soc.send(b'end')
soc.close()

```

### 15.2.2 服务端

```python
#! /usr/bin/python3
# -*-coding:UTF-8-*-
import socket
import threading
from time import sleep
# 创建 套接字
soc = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

hostname = socket.gethostname()

# 创建 服务端
soc.bind((hostname, 10000))

# 设置 最大连接数
soc.listen(5)


def do_tcp(sock, addr):
    print('接受到:', addr, '连接')

    while True:
        data = sock.recv(1024)
        sleep(1)
        if not data or data.decode('utf-8') == 'end':
            break
        print(type(data))
        data_val = data.decode('utf-8')
        print(type(data_val), data_val)
        sock.send(('服务端接收到数据：%s' % data_val).encode('utf-8'))
    sock.close()
    print('服务端处理完成')


# 接收 服务端发来的数据
while True:
    # 接受一个连接
    sock, addr = soc.accept()
    threading.Thread(target=do_tcp, args=(sock, addr)).start()


```

## 15.3 UDP连接

UDP 为一个 类似广播 的协议

面向无连接的协议。  不需要连接即可建立协议，只需要知道 IP 与 端口，而且 发出后都不知道 是否 发送到了。

### 15.3.1 客户端

```python
#! /usr/bin/python3
# -*-coding:UTF-8-*-
import socket
from time import sleep


def star_c_udp(c_name):
    # 创建 套接字 ,类型为 报文
    soc = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    hostname = socket.gethostname()
    # 连接 服务端
    adds = (hostname, 10000)
    soc.sendto(c_name.encode('utf-8'), adds)

    print(soc.recv(1024).decode('utf-8'))
    # 也可以 如下 声明
    soc.close()


if __name__ == '__main__':
    for i in ['123', '234', '53']:
        star_c_udp(i)
        sleep(1)

```

### 15.3.2 服务端

```python
#! /usr/bin/python3
# -*-coding:UTF-8-*-
import socket
import threading
from time import sleep

# 创建 套接字
soc = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
hostname = socket.gethostname()
# 连接 服务端
adds = (hostname, 10000)
soc.bind(adds)
while True:
    data, add = soc.recvfrom(1024)
    val = data.decode('utf-8')
    print('客户端地址：', add, '客户端数据', val)

    soc.sendto(('服务端接收到数据：%s' % val).encode('utf-8'), add)
```

## 15.4 urllib 模块

在 Python 中 能使用 各种网络工作库， 功能最强大的 就是 urllib.

get

```python
#! /usr/bin/python3
# -*-coding:UTF-8-*-
from urllib import request

if __name__ == '__main__':
    with request.urlopen('http://www.baidu.com') as req:
        data = req.read()
        # 请求 状态
        print(req.status, req.reason)
        # 获取 请求头
        for k, v in req.getheaders():
            print(k, '--', v)

    print(data.decode('utf8'))
```



post

主要 就是 将数据 封装 然后以 bytes 传入

略