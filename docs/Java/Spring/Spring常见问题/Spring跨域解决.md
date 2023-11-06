

跨域，指的是浏览器不能执行其他网站的脚本。它是由浏览器的同源策略造成的，是浏览器对JavaScript施加的安全限制。

即，浏览器 对 非当前网页同源的 Javascript 排斥的 功能。

举例

客户通过 跳转到，页面 A ： http 域名A 端口1

而 页面A 中 的JS 脚本，跨域访问 ，到不同源的（不同协议、不同郁闷、不同端口，任意一个不同 即为跨域）服务中，获取 数据。

当获取到不同源的数据后，浏览器控制出现。

就会提示

**no"access control allow origin "**

解决办法：即需要 将 服务请求页面A时，给定 跨域功能，到 响应头中，浏览器便，不会 禁止跨域行为。

[Spring @CrossOrigin 原理](https://blog.csdn.net/weixin_33691817/article/details/92392464)

