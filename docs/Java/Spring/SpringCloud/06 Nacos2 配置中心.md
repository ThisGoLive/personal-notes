# 1 配置中心客户端2.X

基于 nacos-client-2.2.0

## 1.1 数据模型

+ Namspace：命名空间 租户，可以理解为 xx环境  xx项目等

+ Group：即某些服务的一个组，

+ DataId：即一个配置文件 而且是最小的单元

Namspace->n个Group->n个Data

## 1.2 ConfigService

ConfigService 是一个客户端对应的服务抽象，一个配置中心 + 一个Namspace 为一个。即 IP:port + Namspace 构建一个 ConfigService 实现。

`NacosFactory.createConfigService` 中可以发现。通过反射构建 `NacosConfigService`实例，实现的是`ConfigService`接口。

## 1.3 获取配置流程

具体获取配置实现`NacosConfigService#getConfigInner`

```java
private String getConfigInner(String tenant, String dataId, String group, long timeoutMs) throws NacosException {
     // 如果为空，设置默认分组
    group = blank2defaultGroup(group);
    ParamUtils.checkKeyParam(dataId, group);
    ConfigResponse cr = new ConfigResponse();

    cr.setDataId(dataId);
    cr.setTenant(tenant);
    cr.setGroup(group);

    // We first try to use local failover content if exists.
    // A config content for failover is not created by client program automatically,
    // but is maintained by user.
    // This is designed for certain scenario like client emergency reboot,
    // changing config needed in the same time, while nacos server is down.
    // 本地文件系统的Failover
    String content = LocalConfigInfoProcessor.getFailover(worker.getAgentName(), dataId, group, tenant);
    if (content != null) {
        LOGGER.warn("[{}] [get-config] get failover ok, dataId={}, group={}, tenant={}, config={}",
                worker.getAgentName(), dataId, group, tenant, ContentUtils.truncateContent(content));
        cr.setContent(content);
        String encryptedDataKey = LocalEncryptedDataKeyProcessor
                .getEncryptDataKeyFailover(agent.getName(), dataId, group, tenant);
        cr.setEncryptedDataKey(encryptedDataKey);
        configFilterChainManager.doFilter(null, cr);
        content = cr.getContent();
        return content;
    }

    try {
        // 请求configserver获取配置
        ConfigResponse response = worker.getServerConfig(dataId, group, tenant, timeoutMs, false);
        cr.setContent(response.getContent());
        cr.setEncryptedDataKey(response.getEncryptedDataKey());
        // 将snapshot保存到本地文件系统
        configFilterChainManager.doFilter(null, cr);
        content = cr.getContent();

        return content;
    } catch (NacosException ioe) {
        if (NacosException.NO_RIGHT == ioe.getErrCode()) {
            throw ioe;
        }
    }
    // 如果非403 报错，使用本地snapshot
    content = LocalConfigInfoProcessor.getSnapshot(worker.getAgentName(), dataId, group, tenant);
    cr.setContent(content);
    String encryptedDataKey = LocalEncryptedDataKeyProcessor
            .getEncryptDataKeySnapshot(agent.getName(), dataId, group, tenant);
    cr.setEncryptedDataKey(encryptedDataKey);
    configFilterChainManager.doFilter(null, cr);
    content = cr.getContent();
    return content;
}
```

### 1.3.1 Failover 文件

从名字可以看出，当出现异常时使用的文件，从代码看，这里的如果存在就会一直使用

一般情况下，failover文件不会存在

### 1.3.2 请求配置服务获取文件

`ClientWorker#ConfigRpcTransportClient#queryConfig`

```java
public ConfigResponse queryConfig(String dataId, String group, String tenant, long readTimeouts, boolean notify)
        throws NacosException {
    // 设置请
    ConfigQueryRequest request = ConfigQueryRequest.build(dataId, group, tenant);
    request.putHeader(NOTIFY_HEADER, String.valueOf(notify));
    RpcClient rpcClient = getOneRunningClient();
    if (notify) {
        CacheData cacheData = cacheMap.get().get(GroupKey.getKeyTenant(dataId, group, tenant));
        if (cacheData != null) {
            rpcClient = ensureRpcClient(String.valueOf(cacheData.getTaskId()));
        }
    }
    // RPC 请求获取配置
    ConfigQueryResponse response = (ConfigQueryResponse) requestProxy(rpcClient, request, readTimeouts);

    ConfigResponse configResponse = new ConfigResponse();
    if (response.isSuccess()) {
        LocalConfigInfoProcessor.saveSnapshot(this.getName(), dataId, group, tenant, response.getContent());
        configResponse.setContent(response.getContent());
        String configType;
        if (StringUtils.isNotBlank(response.getContentType())) {
            configType = response.getContentType();
        } else {
            configType = ConfigType.TEXT.getType();
        }
        configResponse.setConfigType(configType);
        String encryptedDataKey = response.getEncryptedDataKey();
        LocalEncryptedDataKeyProcessor
                .saveEncryptDataKeySnapshot(agent.getName(), dataId, group, tenant, encryptedDataKey);
        configResponse.setEncryptedDataKey(encryptedDataKey);
        return configResponse;
    }
    // 配置文件没找到，本地快照删除
    else if (response.getErrorCode() == ConfigQueryResponse.CONFIG_NOT_FOUND) {
        LocalConfigInfoProcessor.saveSnapshot(this.getName(), dataId, group, tenant, null);
        LocalEncryptedDataKeyProcessor.saveEncryptDataKeySnapshot(agent.getName(), dataId, group, tenant, null);
        return configResponse;
    } 
    // 配置文件冲突
    else if (response.getErrorCode() == ConfigQueryResponse.CONFIG_QUERY_CONFLICT) {
        LOGGER.error(
                "[{}] [sub-server-error] get server config being modified concurrently, dataId={}, group={}, "
                        + "tenant={}", this.getName(), dataId, group, tenant);
        throw new NacosException(NacosException.CONFLICT,
                "data being modified, dataId=" + dataId + ",group=" + group + ",tenant=" + tenant);
    } else {
        LOGGER.error("[{}] [sub-server-error]  dataId={}, group={}, tenant={}, code={}", this.getName(), dataId,
                group, tenant, response);
        throw new NacosException(response.getErrorCode(),
                "http error, code=" + response.getErrorCode() + ",msg=" + response.getMessage() + ",dataId="
                        + dataId + ",group=" + group + ",tenant=" + tenant);

    }
}
```

### 1.3.3 本地快照

在 没有failver ,而且 请求配置服务返回报错，并且不上 403 ，才会读取本地快照。

## 1.4 配置的监听

在上边获取配置时，有个对象 ClientWorker， 以及它内部的 ConfigRpcTransportClient（ConfigTransportClient） queryConfig作为主要的请求。

### 1.4.1 CacheData

其中 CilentWork 下包含 `private final AtomicReference<Map<String, CacheData>> cacheMap = new AtomicReference<>(new HashMap<>());`

```java
    // agentName
    private final String name;

    private final ConfigFilterChainManager configFilterChainManager;

    public final String dataId;

    public final String group;

    public final String tenant;

    // 监听器
    private final CopyOnWriteArrayList<ManagerListenerWrap> listeners;

    private volatile String md5;

    // 类型
    private String type;

    // 3000条一组 的任务ID
    public int taskId;

    // 内部通知线程
    static final ThreadPoolExecutor INTERNAL_NOTIFIER = new ThreadPoolExecutor(0, CONCURRENCY, 60L, TimeUnit.SECONDS,
            new SynchronousQueue<>(), internalNotifierFactory);
```

NacosConfigService委托**ClientWorker**将监听器注册到CacheData中。

```java
// ClientWorker
public void addTenantListeners(String dataId, String group, List<? extends Listener> listeners)
        throws NacosException {
    group = null2defaultGroup(group);
    String tenant = agent.getTenant();
    // 获取CacheData
    CacheData cache = addCacheDataIfAbsent(dataId, group, tenant);
    // 给CacheData注册监听器
    for (Listener listener : listeners) {
        cache.addListener(listener);
    }
}
```

### 1.4.2 监听流程

ClientWorker 构建的时候 初始化了一个 agent(ConfigRpcTransportClient)，以及一个线程池，设置过给 ConfigTransportClient 下 ScheduledExecutorService executor

`agent.setExecutor(executorService);  agent.start();`

```java
// ConfigTransportClient
public void start() throws NacosException {
    securityProxy.login(this.properties);
    // 5毫秒延迟执行执行一次 login
    this.executor.scheduleWithFixedDelay(() -> securityProxy.login(properties), 0,
            this.securityInfoRefreshIntervalMills, TimeUnit.MILLISECONDS);
    startInternal();
}
// ConfigRpcTransportClient
public void startInternal() {
    executor.schedule(() -> {
        while (!executor.isShutdown() && !executor.isTerminated()) {
            try {
                // 5秒执行一次
                listenExecutebell.poll(5L, TimeUnit.SECONDS);
                if (executor.isShutdown() || executor.isTerminated()) {
                    continue;
                }
                executeConfigListen();
            } catch (Throwable e) {
                LOGGER.error("[ rpc listen execute ] [rpc listen] exception", e);
            }
        }
    }, 0L, TimeUnit.MILLISECONDS);

}MILLISECONDS);

}
```

```java
public void executeConfigListen() {    
    Map<String, List<CacheData>> listenCachesMap = new HashMap<>(16);
    Map<String, List<CacheData>> removeListenCachesMap = new HashMap<>(16);
    long now = System.currentTimeMillis();
    // 5分钟需要同步一次
    boolean needAllSync = now - lastAllSyncTime >= ALL_SYNC_INTERNAL;
    // 遍历每个 缓存，分组 
    for (CacheData cache : cacheMap.get().values()) {

        synchronized (cache) {

            //check local listeners consistent.
            if (cache.isSyncWithServer()) {
                // 进行校验 cacheData 与 ManagerListenerWrap 的差异，出现差异 就会将新 MD5 写入 wrap.
                cache.checkListenerMd5();
                if (!needAllSync) {
                    continue;
                }
            }
            // 不需要丢弃的，即设置了 监听的 缓存
            if (!cache.isDiscard()) {
                //get listen  config
                if (!cache.isUseLocalConfigInfo()) {
                    // cache data 的 taskId 为键
                    List<CacheData> cacheDatas = listenCachesMap.get(String.valueOf(cache.getTaskId()));
                    if (cacheDatas == null) {
                        cacheDatas = new LinkedList<>();
                        listenCachesMap.put(String.valueOf(cache.getTaskId()), cacheDatas);
                    }
                    cacheDatas.add(cache);

                }
            }
            // 需要丢弃的 ，删除了监听的 缓存
            else if (cache.isDiscard()) {

                if (!cache.isUseLocalConfigInfo()) {
                    List<CacheData> cacheDatas = removeListenCachesMap.get(String.valueOf(cache.getTaskId()));
                    if (cacheDatas == null) {
                        cacheDatas = new LinkedList<>();
                        removeListenCachesMap.put(String.valueOf(cache.getTaskId()), cacheDatas);
                    }
                    cacheDatas.add(cache);

                }
            }
        }

    }

    boolean hasChangedKeys = false;

    if (!listenCachesMap.isEmpty()) {
        for (Map.Entry<String, List<CacheData>> entry : listenCachesMap.entrySet()) {
            String taskId = entry.getKey();
            Map<String, Long> timestampMap = new HashMap<>(listenCachesMap.size() * 2);

            List<CacheData> listenCaches = entry.getValue();
            for (CacheData cacheData : listenCaches) {
                timestampMap.put(GroupKey.getKeyTenant(cacheData.dataId, cacheData.group, cacheData.tenant),
                        cacheData.getLastModifiedTs().longValue());
            }
            // 将同一个 task 组内的 作为一个请求，验证MD5 
            ConfigBatchListenRequest configChangeListenRequest = buildConfigRequest(listenCaches);
            configChangeListenRequest.setListen(true);
            try {
                // 通过任务ID 构建客户端 ，主要是防止 返回的数据太多，所以分3000一个
                RpcClient rpcClient = ensureRpcClient(taskId);
                // 请求获取
                ConfigChangeBatchListenResponse configChangeBatchListenResponse = (ConfigChangeBatchListenResponse) requestProxy(
                        rpcClient, configChangeListenRequest);
                if (configChangeBatchListenResponse.isSuccess()) {

                    Set<String> changeKeys = new HashSet<>();
                    //handle changed keys,notify listener
                    // 需要通知监听修改
                    if (!CollectionUtils.isEmpty(configChangeBatchListenResponse.getChangedConfigs())) {
                        hasChangedKeys = true;
                        for (ConfigChangeBatchListenResponse.ConfigContext changeConfig : configChangeBatchListenResponse
                                .getChangedConfigs()) {
                            String changeKey = GroupKey
                                    .getKeyTenant(changeConfig.getDataId(), changeConfig.getGroup(),
                                            changeConfig.getTenant());
                            changeKeys.add(changeKey);
                            // 得到需要进行修改的配置，走获取配置流程
                            refreshContentAndCheck(changeKey);
                        }

                    }

                    //handler content configs
                    for (CacheData cacheData : listenCaches) {
                        String groupKey = GroupKey
                                .getKeyTenant(cacheData.dataId, cacheData.group, cacheData.getTenant());
                        if (!changeKeys.contains(groupKey)) {
                            //sync:cache data md5 = server md5 && cache data md5 = all listeners md5.
                            synchronized (cacheData) {
                                if (!cacheData.getListeners().isEmpty()) {

                                    Long previousTimesStamp = timestampMap.get(groupKey);
                                    if (previousTimesStamp != null && !cacheData.getLastModifiedTs()
                                            .compareAndSet(previousTimesStamp, System.currentTimeMillis())) {
                                        continue;
                                    }
                                    cacheData.setSyncWithServer(true);
                                }
                            }
                        }

                        cacheData.setInitializing(false);
                    }

                }
            } catch (Exception e) {

                LOGGER.error("Async listen config change error ", e);
                try {
                    Thread.sleep(50L);
                } catch (InterruptedException interruptedException) {
                    //ignore
                }
            }
        }
    }

    if (!removeListenCachesMap.isEmpty()) {
        for (Map.Entry<String, List<CacheData>> entry : removeListenCachesMap.entrySet()) {
            String taskId = entry.getKey();
            List<CacheData> removeListenCaches = entry.getValue();
            ConfigBatchListenRequest configChangeListenRequest = buildConfigRequest(removeListenCaches);
            configChangeListenRequest.setListen(false);
            try {
                RpcClient rpcClient = ensureRpcClient(taskId);
                boolean removeSuccess = unListenConfigChange(rpcClient, configChangeListenRequest);
                if (removeSuccess) {
                    for (CacheData cacheData : removeListenCaches) {
                        synchronized (cacheData) {
                            if (cacheData.isDiscard()) {
                                ClientWorker.this
                                        .removeCache(cacheData.dataId, cacheData.group, cacheData.tenant);
                            }
                        }
                    }
                }

            } catch (Exception e) {
                LOGGER.error("async remove listen config change error ", e);
            }
            try {
                Thread.sleep(50L);
            } catch (InterruptedException interruptedException) {
                //ignore
            }
        }
    }

    if (needAllSync) {
        lastAllSyncTime = now;
    }
    //If has changed keys,notify re sync md5.
    if (hasChangedKeys) {
        notifyListenConfig();
    }
}
```

### 1.4.3 汇总

1. NacosConfigService 实例会创建 ClientWorker 

2. ClientWorker 实例的时候，cacheData的缓存， 创建的ConfigRpcTransportClient时会构建一个线程池，并执行startInternal，开启 5秒一次的监听

3. 监听的逻辑executeConfigListen: 
   
   1. 校验 cacheData 与 warp 的md5是否一致，相同就直接5分钟后再校验
   
   2. 不一致就会 将 有监听 和 没有监听的cacheData 分开
   
   3. 将同一个 taskId 的cacheData 封装为一个 请求 服务，得到 需要更新的 配置标识
   
   4. 将 需要跟新配置的标识，走 获取配置流程，并且新MD5更新到 cacheData中

# 2 配置中心客户端1.4.X

数据结构基本相同，但是 请求配置的 协议是 **Http短连接+长轮询**的方式

## 2.1 获取配置流程

`NacosConfigService#getConfigInner`

也和 2.x 差不多，分三步 failver->远程查询->异常非403本地快照

## 2.2 配置的监听

而 CacheData 也类似。

还是 交给了 `ClientWorker` ,但是结构就变化了

```java
public class ClientWorker implements Closeable {
    // 检测是否需要提交longPolling任务到executorService，如果需要则提交
    final ScheduledExecutorService executor;
    // 执行长轮询，一般情况下执行listener回调也是在这个线程里
    final ScheduledExecutorService executorService;
    // groupKey -> cacheData
    private final ConcurrentHashMap<String, CacheData> cacheMap = new ConcurrentHashMap<String, CacheData>();
    // 认为是个httpClient
    private final HttpAgent agent;
    // 钩子管理器
    private final ConfigFilterChainManager configFilterChainManager;
    // nacos服务端是否健康
    private boolean isHealthServer = true;
    // 长轮询超时时间 默认30s
    private long timeout;
    // 当前长轮询任务数量
    private double currentLongingTaskCount = 0;
    // 长轮询发生异常，默认延迟2s进行下次长轮询
    private int taskPenaltyTime;
    // 是否在添加监听器时，主动获取最新配置
    private boolean enableRemoteSyncConfig = false;
}
```

`ClientWorker` 初始化会构建两个线程池，executor 和 executorService

其中添加了一 10 毫秒执行一次的，检查任务 `checkConfigInfo` 。

```java
    // 检测并提交LongPollingRunnable到this.executorService
    this.executor.scheduleWithFixedDelay(new Runnable() {
        @Override
        public void run() {
            try {
                checkConfigInfo();
            } catch (Throwable e) {
                LOGGER.error("[" + agent.getName() + "] [sub-check] rotate check error", e);
            }
        }
    }, 1L, 10L, TimeUnit.MILLISECONDS);
```

checkConfigInfo 会判断 当前 cacheData 的数量，每三千条，进行创建一个 taskId的 `LongPollingRunnable `长轮询任务交由`executorService` 执行，

具体流程：

- **处理failover配置**：判断当前CacheData是否使用failover配置（ClientWorker.checkLocalConfig），如果使用failover配置，则校验本地配置文件内容是否发生变化，发生变化则触发监听器（CacheData.checkListenerMd5）。这一步其实和长轮询无关。
- **对于所有非failover配置，执行长轮询**，返回发生改变的groupKey（ClientWorker.checkUpdateDataIds）。请求参数是 全部文件的 md5
- 根据返回的groupKey，**查询服务端实时配置并保存snapshot**（ClientWorker.getServerConfig）即需要变更的，走 获取配置流程
- **更新内存CacheData的配置content**。
- **校验配置是否发生变更，通知监听器**（CacheData.checkListenerMd5）。
- **如果正常执行本次长轮询，立即提交长轮询任务，执行下一次长轮询；发生异常，延迟2s提交长轮询任务**。

# 3 配置中心服务端 1.4.X

服务端的接口：

- **GET /v1/cs/configs**服务端查询配置逻辑
- **POST /v1/cs/configs/listener**接口负责配置监
- **POST /v1/cs/configs**负责发布配置，基于非集群derby启动的流程

数据存储方式：

- 内存：Nacos每个节点都在内存里缓存了配置，但是**只包含配置的md5**（缓存配置文件太多了），所以**内存级别的配置只能用于比较配置是否发生了变更，只用于客户端长轮询配置等场景**。CacheItem ConfigCacheService
- 文件系统：文件系统配置来源于数据库写入的配置。如果是集群启动或mysql单机启动，服务端会以本地文件系统的配置响应客户端查询。
  - `Nacos刚启动时，内存中与文件系统中未必存在所有配置，所以DumpService会全量dump配置到文件系统与内存中` 另外当数据库配置发生变化时，也会dump到本地文件系统。
- 数据库：所有写数据都会先写入数据库。只有当以derby数据源（-DembeddedStorage=true）单机（-Dnacos.standalone=true）启动时，客户端的查询配置请求会实时查询derby数据库。config_info

## 3.1 配置查询 GET /v1/cs/configs

1. 首先，服务端会根据groupKey获取配置项的读锁，**tryConfigReadLock**会返回一个int，不同返回值代表含义和处理方式不同。

2. 获取锁成功后，会去查询配置，这里分为两种逻辑。如果是单机部署且使用derby数据源，则会立即去查询实时数据；否则，如果是集群部署或指定使用mysql数据源，会读取文件系统上的缓存配置。

3. 返回数据

## 3.2 监听配置POST /v1/cs/configs/listener

- **确定长轮询实际超时时间**：如果isFixedPolling=true（默认false），则设置为10s，无视客户端设置的超时时间；否则使用客户端设置的超时时间，默认30s，在这个基础上再减去500ms，防止客户端提前超时。
- **比较服务端内存中的配置md5与客户端本次请求的配置md5是否一致**：如果有配置项发生变更，则立即拼装请求返回（报文结构见第三部分）。**这一步保证了客户端长轮询后，查询配置时发生409错误，可以依靠下一次长轮询自动恢复。因为客户端会将配置的当前版本（md5）传过来，由服务端进行比较，如果客户端不传配置md5就做不到了**。
- 如果当时配置项没有发生变化，且请求头中包含Long-Pulling-Timeout-No-Hangup=true，则立即返回。这一步说明本次请求的配置项，包含刚注册监听的配置项。
- 如果当时配置项没有发生变化，且不需要立即返回，则开启AsyncContext，将长轮询任务提交到其他线程池，等待其他线程设置AsyncContext.complete()再响应客户端。

就是比较，有差异返回 没有差异不返回，由于超时时间，直接交给另外的线程处理

## 3.3 配置发布POST /v1/cs/configs

**基于MySQL数据源**来看，这个接口总共做了几个事情：（单机Derby也是这个流程，集群Derby较为特殊，使用的 SAFO JRaft 进行统一算法）

### 3.3.1 更新数据

收到变更的数据，对数据库的更新

1. 先是新增

2. 发生唯一性问题，改为修改

3. 异步发布事件，然后返回resp

### 3.3.2 发布 ConfigDataChangeEvent 事件

Nocos 的事件发布模型：

NotifyCenter 通知中心，

1. 事件的的发布 publishEvent(event) 

2. 通过 事件类型，找到对应的 EventPublisher 发布者

3. 发布者 receiveEvent，找寻对应事件类型的订阅者 Subscriber

4. 订阅者 处理事件

**NotifyCenter通知中心，主要负责订阅事件与事件发布**。

```java
public class NotifyCenter {
    // NotifyCenter单例
    private static final NotifyCenter INSTANCE = new NotifyCenter();

    /** 普通事件 **/
    // 用于创建普通发布者的工厂
    private static BiFunction<Class<? extends Event>, Integer, EventPublisher> publisherFactory = null;
    // 普通事件发布者实现类，默认DefaultPublisher，可以通过JDKSPI调整
    private static Class<? extends EventPublisher> clazz = null;
    // 事件全类名 - 普通事件发布者
    private final Map<String, EventPublisher> publisherMap = new ConcurrentHashMap<String, EventPublisher>(16);
    // 普通事件发布者缓存事件的最大数量
    public static int ringBufferSize = 16384;

    /** Slow事件 **/
    // Slow事件发布者
    private DefaultSharePublisher sharePublisher;
    // slow事件发布者缓存事件的最大数量
    public static int shareBufferSize = 1024;
}
```

**NotifyCenter内部有两类Publisher发布者**：

- DefaultSharePublisher：用于处理SlowEvent类型事件。
- DefaultPublisher：用于处理其他类型事件。NotifyCenter中，每个事件（Class区分）对应一个DefaultPublisher。

**DefaultPublisher**内部维护一个阻塞队列，长度默认16384，客户端提交的事件都会放入这个队列。自身继承自Thread，负责向所有订阅者发布事件。

**Subscriber**订阅者，subscribeType返回订阅的事件Class，通过onEvent方法处理事件。

Nacos中所有通过NotifyCenter发布的事件，都是放入Publisher里的阻塞队列，由Publisher线程异步执行。

Subscriber和Publisher向NotifyCenter注册，NotifyCenter负责管理他们。另外因为Subscriber告诉外部自己所关注的事件，NotifyCenter还可以通过反射工厂创建事件所对应的Publisher。

### 3.3.3 内存及本地配置更新

`ConfigDataChangeEvent的订阅者是AsyncNotifyService`

AsyncNotifyService收到事件以后，会查询nacos集群里所有的ip（包括当前实例），组装成AsyncTask，提交到另一个线程池处理。

> // 提交AsyncTask到其他线程执行
> ConfigExecutor.executeAsyncNotify(new AsyncTask(nacosAsyncRestTemplate, queue));

AsyncTask 执行的是，调用了**所有nacos节点的/v1/cs/communication/dataChange**接口。

该接口的处理是 创建了一个新的任务 DumpTask

当任务执行更新内存配置MD5后，又发布了 新事件 `LocalDataChangeEvent` 

### 3.3.4 响应监听配置

`服务端LongPollingService构造时，注册了LocalDataChangeEvent的发布和订阅`

当LocalDataChangeEvent发生时，且非固定长轮询，订阅者会提交一个`DataChangeTask`任务到另一个线程池中。

DataChangeTask`比较内存中的配置md5和LocalDataChangeEvent中配置的md5`，响应所有订阅这个groupKey配置的客户端。基于单个配置的事件传播，最终响应客户端时，只会告诉客户端一个groupKey的变更。

DataChangeTask`比较内存中的配置md5和LocalDataChangeEvent中配置的md5`，响应所有订阅这个groupKey配置的客户端。基于单个配置的事件传播，最终响应客户端时，只会告诉客户端一个groupKey的变更。

- 一方面，对**普通长轮询做超时处理**，默认30s后如果无配置变更，响应客户端空数据；
- 另一方面，这里体现了**固定长轮询**的作用，**当服务端开启了isFixedPolling=true，默认10s执行一次这个任务，比较内存中配置md5与客户端请求配置md5是否一致，再响应客户端，而不是通过DataChangeTask等待服务端配置发生变化后主动通知客户端**。

# 4 配置中心服务端 2.X

2.0版本Http长轮询的逻辑还在，没有删除，但是`2.0版本客户端，对应服务端的LocalDataChangeEvent事件处理器是RpcConfigChangeNotifier`。