# Maven

Repositories → Create Repository

选择**repository类型** 

## Host Maven 2

### version pollcy 

存储库 存放 什么类型的

Release 正式  Snapshot 快照 mixed 混合

### Layout pollcy

验证所有路径 都是 maven 

Strict 严格   Permissive 宽松

## Storage

### Strlct Content Type Valldation 内容类型

Validate that all content uploaded to this repository is of a MIME type appropriate for the repository format 验证所有上传到库的 MIME类型 

测试中，maven 的 类型 [application/x-sh], 验证的类型[application/java-archive]

所以 这里没勾选

## Hosted 

### deployment  

控制是否允许对构件进行部署和更新

Disable redeploy 禁止部署

Allow redeploy 允许重新部署

Read-only

### Cleanup Policy

Select a cleanup policy  选择清理策略



## pom 配置

pom.xml 中需要配置 对应私服的 路径

```xml
    <distributionManagement>
    <!-- （稳定）发布版本仓库 -->
    <repository>
        <id>glserver</id>
        <name>glserver maven</name>
        <url>http://glserver:8033/repository/mvn-hosts/</url>
    </repository>
    </distributionManagement>
</project>
```



setting 要配置 私服的认证

```xml
		<server>
			<id>glserver</id>
			<username>admin</username>
			<password>123456</password>
		</server>
```

## 创建回收策略 Cleanup Policy

### format 

用于什么格式 maven2

### Criteria 标准

Restrict cleanup to components that were published to NXRM more than the given number of days ago. (Blob updated date)

将清理限制为发布到NXRM的组件超过给定的天数。（Blob更新日期）

即：超过天数  就 清理

Restrict cleanup to components that were last downloaded more than the given number of days ago. (Last downloaded	date)

 将清理限制为上次下载的组件超过给定的天数。（上次下载日期） 

即 最后一次下载后开始 天数 被清理

Restrict cleanup to components that are of this release type

将清除限制为具有此发布类型的组件

稳定 与 快照

# docker