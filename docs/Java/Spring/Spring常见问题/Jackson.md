<https://juejin.cn/post/6844904166809157639>

```java
CollectionType collectionType = objectMapper.getTypeFactory().constructCollectionType(List.class, KeyValueModel.class);
objectMapper.readValue(jsonNode.traverse(), collectionType);
```

@JsonIgnore

哪些字段全部场景下不进行序列化

@JsonView（class）

哪些字段在该场景下序列化，并且 场景可以继承