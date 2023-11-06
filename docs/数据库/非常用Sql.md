# UNION 操作符

## SQL UNION 语法

```sql
SELECT column_name(s) FROM table_name1
UNION
SELECT column_name(s) FROM table_name2
```

注释：默认地，UNION 操作符选取不同的值。如果允许重复的值，请使用 UNION ALL。

## SQL UNION ALL 语法

```sql
SELECT column_name(s) FROM table_name1
UNION ALL
SELECT column_name(s) FROM table_name2
```

# 数据库表复制

## SqlServer

```sql
-- 目标表存在： 
INSERT INTO 目标表 SELECT * FROM 原表;

-- 目标表不存在：
SELECT * INTO 目标表 FROM 原表;

```

## MySql

```sql
CREATE TABLE 新表名 LIKE 源表;
INSERT b SELECT * FROM a；

-- 第二、复制表结构及数据到新表
create table 新表 select * from 旧表 
```

## Oracle

```sql
-- 目标表存在：
INSERT INTO 目标表 SELECT * FROM 原表;
-- 目标表不存在：
CREATE TABLE 目标表 AS SELECT * FROM 原表;
```

