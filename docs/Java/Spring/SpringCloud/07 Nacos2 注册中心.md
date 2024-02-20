# 1 注册中心客户端 1.4.X

[Nacos源码（十）总结篇 - 掘金](https://juejin.cn/post/7002843092487241764)

注册中心 需求：

- 服务注册
- 服务注销
- 服务发现

## 1.1 模型

+ Namspace（Tenant）：命名空间（租户）  默认public  

+ group 分组：DEFAULT_GROUP

+ serviceName 服务名：

+ Cluster 集群：默认 DEFAULT

+ 服务实例：IP + 端口

客户端都以**ServiceInfo**表示，由分组+集群+服务确定唯一。

**Instance实例**，**由分组+集群+服务+ip+端口确定唯一**。

## 1.2 NacosNamingService

NamingService的实现类，Nacos命名服务。实现了所有命名服务需要具备的功能。

```java
public class NacosNamingService implements NamingService {
    // 命名空间/租户 默认public
    private String namespace;
    // 类似于apollo的meta-server 提供nacos集群地址，如果启用会无视serverList
    private String endpoint;
    // nacos集群地址列表，逗号分割，用户传入
    private String serverList;
    // 本地缓存路径
    private String cacheDir;
    // 日志的文件名
    private String logName;
    // 服务监听/服务注册表缓存/服务查询
    private HostReactor hostReactor;
    // 心跳维护
    private BeatReactor beatReactor;
    // 命名服务代理
    private NamingProxy serverProxy;
}
```

### 1.2.1 服务注册

服务注册逻辑在NacosNamingService的**registerInstance**方法中。

```java
// NacosNamingService
@Override
public void registerInstance(String serviceName, String groupName, Instance instance) throws NacosException {
    NamingUtils.checkInstanceIsLegal(instance);
    // 对于nacos来说，serviceName = groupName + @@ + serviceName
    String groupedServiceName = NamingUtils.getGroupedName(serviceName, groupName);
    // 1. 如果是临时实例，开启心跳任务
    if (instance.isEphemeral()) {
        BeatInfo beatInfo = beatReactor.buildBeatInfo(groupedServiceName, instance);
        beatReactor.addBeatInfo(groupedServiceName, beatInfo);
    }
    // 2. POST /nacos/v1/ns/instance
    serverProxy.registerService(groupedServiceName, groupName, instance);
}
```

# 2 注册中心客户端 2.X

## 2.1 模型变更

命名服务实现类仍然是**NacosNamingService**，服务实例仍然是**com.alibaba.nacos.api.naming.pojo.Instance**。

**ServiceInfo**也没有变，分组+服务+集群对应一组Instance

存储服务注册表的容器由**HostReactor改为了ServiceInfoHolder**，主要是负责管理failover注册表和内存注册表。1.x中HostReactor调用远程接口的逻辑都放到了**NamingClientProxy**中。
