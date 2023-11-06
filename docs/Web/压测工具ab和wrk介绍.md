https://www.cnblogs.com/flkin/p/ab_wrk.html

```shell
# 十个线程 共发送100次请求
ab -c 10 -n 100 https://www.baidu.com/
# 两个现场 六个链接 持续5秒
wrk -t 2 -c 6 -d 5s https://www.baidu.com

```