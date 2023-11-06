## 主要特性
### 1. Java 17
略
### 2. Jakarta EE
略
### 3. Observability
外部观察运行系统内部的功能
+ 日志 
+ 指标 
+ 链路追踪 zipkin prometheus
（需要被包裹到micrometer中）


### 4. Navive Images
GraalVM 22.3 ⬆️
```shell
mvn -Pnative native:compile
```
### 5. CRUD 新接口

ListCrudRepository
PagingAndSortingRepository
ListQueryByExampleExecutor
ListQuerydslpredicateExecutor

### 6. HTTP 接口

@GetExchange(url)

Webfulx WebClient 作为创建代理实现
```java
WebClient client = WebClient.builder().baseUrl(url).build()
var proxy = HttpServiceProxyFactory.builder(WebClientAdapter.forClient(client)).builer()
proxy.createClient(xxx.class)
```
### 7. 统一错误返回
### 8. security 的修改
