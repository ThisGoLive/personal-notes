2018/3/16 星期五 上午 9:35:13 

# web服务（webservice）

[https://blog.csdn.net/qq32933432/article/details/51394749](https://blog.csdn.net/qq32933432/article/details/51394749)

服务器之间的通信   还是  传输 协议http  和 格式xml

soap =  (xml+xsd)   + http     也是 传输协议   数据还是在http内  只是在 外面添加了一个套装

常用Apache cxf  框架  

## soap

只有post提交
对要衍生出网络的  接口  加webService注解

    @WebService（targetNamespace="http://包结构倒写",serviceName="随意",portName="随意"）
    public interface xxxWebService{
    @WebMethod
    public .. 方法名 （。。）{}
    }

实现类 注解@WebService（endpointInterface="上接口的全路径"）

接受方（申请连接方） 也写与接口相同注解也相同的。 再用代理对象 来进行调用

## rest 方式

 默认是用  的 xml 传输数据