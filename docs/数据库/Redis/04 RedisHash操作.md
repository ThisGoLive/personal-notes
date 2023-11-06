# 04 Redis hash 操作

理解为 里面又套了一个  Redis

数据量少时，field 使用的类数组结构

数据量大时，field 使用的 Hash 

## 基本操作

```shell
# 添加
hset key field value
# 获取
hget key field
hgetall key
# 删除
hdel key field1[,field2...]

# 批量添加
hmset key1 field1 key2 field2...
# 获取多个
hmget key1 key2 ...

# 获取 field 数量
hlen key
# 获取 哈希表中 是否存在指定字段
hexists key field
```

## 扩展操作

获取哈希表中所有的字段名 或 字段值 

```shell
hkeys key
hvals key
```

设置指定字段的数值数据增加自定范围的值

```shell
hincrby key field incre
hincrbyfloat key field incre
```

## 注意

hash类型 下的 value 只能存储 字符串，没有的话返回 nil

每个 hash 可以存储 2^32-1 个键值对

接近对象，但是不要乱用 存储对象

hgetall 获取 全属性， field 过多时，效率低下

