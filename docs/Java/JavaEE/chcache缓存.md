# ehcache

app...xml:

    <cache:annotation->
    
    <bean id="cacheManager"
    class="org.springframework.cache.ehcache.EhCacheCacheManager" p:cache-manager-ref="ehcache"/>
    
    <!-- EhCache library setup -->
    <bean id="ehcache"
    class="org.springframework.cache.ehcache.EhCacheManagerFactoryBean" p:config-location="ehcache.xml"/>
    
    
    @Cacheable(value="缓存名"，key="#id",condition="#id>4")
    //用于查询,查询到缓存中有值就不会执行下面方法。
    //value属性，代表操作空间，来自与ehcache.xml中的name .
    //key属性定义方案，默认策略，不写，自定义策略（"#参数名","#p参数下标名"）
    //condition都是可以不写的，一般是缓存条件，
    public bean 查询方法（int id）{}

先用key  定义的  id在缓存中查找，再没有再执行下面的方法，再缓存在内存中。

    @CachePut(value="缓存名"，key="#id",condition="#id>4")
    //用于添加或者更新，每次该方法都会执行，并刷新缓存中的数据
    
    @CacheEveict(value="缓存名"，key="#id",allEntries=false,beforInvocation=true)
     //用于删除  beforInvocation,是否运行前先删除缓存