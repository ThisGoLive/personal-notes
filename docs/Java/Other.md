
## 资源
Java 8 中的 Streams API 详解
https://www.ibm.com/developerworks/cn/java/j-lo-java8streamapi/

Java 8 新特性概述
https://www.ibm.com/developerworks/cn/java/j-lo-jdk8newfeature/index.html

Java 9 新特性概述
https://www.ibm.com/developerworks/cn/java/the-new-features-of-Java-9/index.html

Java 10
https://www.ibm.com/developerworks/cn/java/j-5things17/index.html

C++ 资源
https://www.ezlippi.com/blog/2014/12/c-open-project.html

C C++ 区别
https://blog.csdn.net/u012234115/article/details/39548729

C++ API连接MySQL数据库
https://www.cnblogs.com/47088845/p/5706496.html

发布内网
https://blog.csdn.net/mr_jianrong/article/details/73604291

天气发布 web服务 接口
http://ws.webxml.com.cn/WebServices/WeatherWS.asmx

web服务 dswl解析
https://www.cnblogs.com/shyroke/p/7646415.html

简单的并发测试以及线程监控
https://blog.csdn.net/gfd54gd5f46/article/details/55150748

Shell cmd dos 与 脚本语言
http://blog.163.com/magicc_love/blog/static/185853662201542121036153/

Spring 4.x 特性
https://blog.csdn.net/think_soft/article/details/49785619
http://www.mamicode.com/info-detail-2002429.html

Spring 5.0 特性
https://www.oschina.net/translate/whats-new-in-spring-framework-5

Psotgresql
http://www.postgres.cn/home

https
https://www.cnblogs.com/lazyInsects/p/9304176.html
http://www.cnblogs.com/moon521/p/5948058.html
https://blog.csdn.net/zhangzuomian/article/details/50324395
https://www.oschina.net/question/12_23148
http://ln-ydc.iteye.com/blog/1335213
https://blog.csdn.net/xls_human/article/details/53925205

java枚举
https://blog.csdn.net/javazejian/article/details/71333103

## 杂记

https://my.oschina.net/upyun/blog/5531281 base64

https://gitee.com/huoyo/ndraw

https://my.oschina.net/lenve/blog/5534323 分布式事务 反向补偿

http://draw.io/ https://app.diagrams.net/ https://github.com/jgraph/drawio-desktop 

Linux Themes for VS Code ---> One Dark Modern

https://my.oschina.net/luozhou/blog/3088908 spring boot tomcat

https://my.oschina.net/lenve/blog/5541964 分布式事务

http://www.dokvm.com/

https://www.oschina.net/news/200311 x-easypdf 

https://www.bbsmax.com/A/gVdnyna15W/ pgsql b tree

https://baijiahao.baidu.com/s?id=1703317782540595879&wfr=spider&for=pc 

https://murmele.github.io/Gittyup/ 全平台 gitui


https://www.jianshu.com/p/b9f3f6a16911 netty
https://blog.csdn.net/lmdsoft/article/details/105618052
https://www.sohu.com/a/272879207_463994
https://www.cnblogs.com/lfs2640666960/p/10012354.html
https://netty.io/wiki/index.html
https://zhuanlan.zhihu.com/p/504962687 NIO

spring boot  启动流程  https://zhuanlan.zhihu.com/p/402183883
netty  相关问题
zookeeper 相关问题


https://www.sohu.com/a/343766701_120097842  教派

## 使用脚本表达式
private final ScriptEngineManager scriptEngineManager = new ScriptEngineManager();
{
    String ex = "a + b + o.get()";
    scriptEngineManager.getEngineFactories().forEach(item -> {
        System.out.println("-------------------------------------");
        String engineName = item.getEngineName();
        String languageName = item.getLanguageName();
        System.out.println("EngineName:" + engineName);
        System.out.println("languageName:" + languageName);
        String name = engineName + "--" + languageName;
        Cost cost = CostUtil.startNanosecondCost(name);
        ScriptEngine scriptEngine = item.getScriptEngine();
        ScriptContext context = scriptEngine.getContext();
        context.setAttribute("a", 1, ScriptContext.ENGINE_SCOPE);
        context.setAttribute("b", 1, ScriptContext.ENGINE_SCOPE);
        context.setAttribute("o", this, ScriptContext.ENGINE_SCOPE);
        Object eval;
        try {
            eval = scriptEngine.eval(ex);
            System.out.println(eval.getClass() + "---" + eval);
        } catch (ScriptException e) {
            e.printStackTrace();
        }
        long stop = cost.stop();
        DecimalFormat format = new DecimalFormat("#,####");
        System.out.println(name + ":" + format.format(stop));
    });
}

脚本设计
https://my.oschina.net/crossoverjie/blog/5566734

// calss
es 查询
https://www.cnblogs.com/wangrudong003/p/10959525.html
https://gitee.com/zxporz/ESClientRHL
https://blog.csdn.net/Weixiaohuai/article/details/109007738
https://www.jb51.net/article/166763.htm

Txtai 人工智能驱动的搜索引擎
https://www.oschina.net/p/txtai

python 单元测试
https://linux.cn/article-14944-1.html