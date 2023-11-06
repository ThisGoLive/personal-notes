# 03 Redis string 操作

string 是指  redis 键值对 中的 值的类型为 string

## 基本操作

```shell
# 添加
set key value

# 获取
get key

# 删除
del key

# 设置多个
mset key1 value1 key2 value2 ...

# 获取多个
mget key1 key2

# 获取 对应key 的value 的长度
strlen key

# 追加数据 到 value 后面
append key value

```

## 扩展操作

### 数值增减

value 为 纯数字的 字符串时，自增 自减，可以用到 数据库中 分表时的 自动增加ID ，然后 部署到各个分表中

```shell
# 自增1
incr key  
# 自增 stup
incrby key stup
# 自增 小数
incrbyfolat key float 

# 自减1 
decr key
# 自减 stup
decrby key stup

```

最值  -2^63 ~ 2^63-1

### 数据时效性

设置数据 指定的 生命周期，即定时被回收

```shell
setex key s value  # 设置秒 失效
psetex key ms value # 设置毫秒 失效
```

## key 命名规范

表名:ID名:ID数据:字段名  

## 注意事项

不同命令 返回 结果不同

没有对应值返回 nil 

数据最大 存储量  512MB

数字最大范围   -2^63 ~ 2^63-1