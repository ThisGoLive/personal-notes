# MySQL进阶

2018/1/17 星期三 下午 14:27:36 

1.索引

2.存储过程（MySQL 的函数）

3.触发器（表与表件）

4.游标

5.视图（简化操作）

## 一.索引

### 概念

一种特殊的文件，包含着对数据表里所有记录的引用指针。类似书的目录。
提高表的搜索效率而对某些字段创建的。

模糊查询 in  放前面会导致索引失效  因为索引是依据字段的前面来运行的，类似依据第一个字来进行创造索引。

通过创建唯一索引 可以保证表中每行数据的唯一性；

### 类型：普通索引

#### 单列索引：

    create index 索引名 on 表名(哪一列的列名); 
        数据库中对应生成一个文件，同一表中的索引民不能相同
    show index from 表名；（显示当前表的索引）

修改表结构，来创建索引：

    alert table 表名 add index 索引名(那一列)；

创建表时创建索引：

    创建时在属性下面直接加index 索引名(那一列)；

删除索引：

    alter table 表名 drop index name 索引名；

复制数据：

    insert into 存的位置表 select * from 数据表：

备份表：

    create table 后表 select * from 前表；

#### 多列索引：

    基本同单列，不大同点：列名多个，用且逗号隔开！
    create index 索引名 on 表名（列1，列2）；
    用于在查询时 条件有多个列 如 登录时 

最左前缀列 ：

查询时，条件按照创建的顺序依次从左往右，第一个条件必须有，
不能有like 查询  且条件顺序连续  例子：1and 2and 3  ，1and 2 ，1都可以其余不行

不使用索引：

1. 多列不用最左
2. like查询在最前，即%出现第一位
3. 不能是or

### 类型：唯一索引

允许有空，属性的值不能维二。创建表时，加的unique;

主键索引：特殊的唯一索引：不能为空；

### 类型：全文索引（myisam支持）

创建表后 engine=    
Ｍｙｉｓａｍ    
Iｎｎｏｄｂ 两个引擎。一般要用全文的话，要修改为myisam    

2.创建 create fulltext

## 二.存储过程

### 2.1意义

是一组为了完成特定功能的sql语句集；（相当于是调函数）            

优点：

    1.能够实现快速，只编译一次，以后就不需要的。
    2.数据库专业人员随时可以修改，对程序源代码无影响；
    3.可以写流程控制语句，有很强的灵活性；
    4.安全性高，

### 2.2基本语法

创建

    create procedure 存储过程名（）begin  
        select 2+3 from dual;(尾表，用于表示结构完整)
        end;

调用（存储）；

    call 名（）；

查询：以数据库为单位（查询所有的）

    select 变量 form dual;
    show procedure status where 数据库名；

### 2.3删除

    dorp procedure 名；

### 2.4存储过程中的变量

#### 变量分类

    SELECT code_money into thismoney FROM t_code WHERE code_code=acc and code_pwd=pwd;

局部变量（begin 和 end 间定义的）

    begin
        declare 变量名 数据类型 (default 类似=初始化) 值（可以为代码）;
        #没有初始化 default 
        set 变量名 := （同=赋值） 值；
      end；

会话变量：

    只对客户端有效、，只能自己的对自己

用户变量（全局变量）：以@开始   @变量名

    每个用户访问服务器的变量  
    包括了会话变量，和全局变量；
    关闭对话就没来了；  

创建用户变量：

    例：set @user = 20;

select into 语句 （只能返回单一的行）：

    procedure ID int ；
    select pk_id into ID from 表名  where pk_id=11;

### 2.5存储过程参数 ：

    create procedure 过程名 （[]）
        begin 
        end;
    
    参数类型 参数名 参数数据类型  ，多个
    参数类型（返回类型）：
                传来运算的数据（默认）        in  
                传来存储数据        out  
                都是        inout

### 2.6流程控制语句

if 语句

    if 判断语句 then
    
        elseif 判断语句 then
    
        else
    
        end if；

case语句（同switch）

    语法1：
            case 表达式
                when 值1 then     一个或者多个；
                执行语句 ；
    
                eslse
    
                end case；

----------

    语法2：
            case
                when 条件语句 then
                执行语句；
    
            end case；
    
    都不会执行多行，只是一行就完成了。
    
    
    加在sql中的case 语句end case不需要加 case ；then 后面接数据 直接显示

循环语句：while repeat loop

    [名字：]while 条件 do
                循环体；(操作变量  set修改)
            end while；
        [名字]；

----------

    repeat ：（似dowhile）
        [名字：] repeat
                循环体；
            until 表达式判断（真就结束循环） end repeat    
        [名字]

----------

    loop 循环（while（true））；
        名字：loop
                循环体;
                自己加条件退出：
                if 条件 then 
                    Leave 名字；
                end if;        
            end loop
        名字；

## 三.触发器

由事件来触发，特殊的储存过程，增删改才能触发

优点：

1. 自动
2. 安全性高
3. 审计
4. 业务逻辑封装性好，修改方便；
5. 实现复杂

缺点：

1. 可移植性差，
2. 定时触发，不可调用，
3. 当数据库间有调用，肯能不必要的调用

语法：

    create trigger 触发器名称
    before/after  //触发程序的作用时间、事件作用前后
    insert/update/delete //监视的事件
    on 表名  //监视的地点
    for each row //行级触发（MySQL只有行级）
    begin
        执行的代码；
    end；

显示所有触发器： show triggers；（当前数据库）

删除触发器：drop trigger 名字；

old 和 new：
主要是对于第三表来说：

<table><tr>
<td></td><td>insert</td><td>update</td><td>delete</td></tr><tr>
<td>old</td><td>无</td><td>修改前的旧值</td><td>旧值</td></tr><tr>
<td>new</td><td>新值</td><td>修改后的新值</td><td>无</td></tr></table>

可用这两个关键字来代替第三方表  点属性来获取

## 四.游标

控制一条条数据的输出；

## 五.视图

### 概念

视图：是从多个或一个表导出来的**新表**，是**虚拟**的存在的表。视图是一个窗口，通过它可以看到系统专门提供的数据。视图使用户的操作方便，保证数据安全。

表中没有数据，而是数据库中的**原数据的引用**。没有约束。

操作视图，也可以操作数据库。

还可以从视图中再导出视图；视图的数据依赖于数据库表.

MySQL中视图不能加参数;

作用:

1. 可以起到筛选作用,
2. 对没有权限想了解的信息屏蔽到,
3. 方便快捷
4. 可以根据原始的多表中的数据来进行动态改变 

### 语法

创建：    

    create view 视图名
    as
    查询语句

删除操作：

删除不能对多个表的连表的视图；因为不知道删哪个。

查询结构：

    show table status like "表名/视图名"

修改视图（更新视图的数据）；

删除视图：

    drop view 名；

### 存储过程例子：

    CREATE TABLE t_code (
    code_id int PRIMARY key  auto_increment,
    code_code VARCHAR(100),
    code_pwd VARCHAR(100),
    code_money INT
    
    );
    
    INSERT INTO t_code(code_code,code_pwd,code_money) values('a123','123',22000);
    
    CREATE TABLE t_deal (
    deal_id int PRIMARY key auto_increment,
    deal_code VARCHAR(100),
    deal_info VARCHAR(100),
    deal_money INT,
    deal_date DATE
    
    );
    
    create procedure code_for_deal(in addmon int , in acc VARCHAR(100),in pwd VARCHAR(100))
    begin  
    declare newmoney int default 0;
    declare thismoney int default 0 ;
    declare datet date default 0 ;
    select current_date into datet;
    SELECT code_money into thismoney FROM t_code WHERE code_code=acc and code_pwd=pwd;
      if addmon>thismoney  THEN
            SELECT '余额不足' as '结果' FROM dual;
        ELSE
    
            SELECT thismoney-addmon into newmoney FROM dual;
            SELECT addmon as '取走' ,newmoney as '余额' FROM dual;
            UPDATE t_code SET code_money=newmoney WHERE code_code=acc and code_pwd=pwd ;
            INSERT INTO t_deal(deal_code,deal_info,deal_money,deal_date) 
            VALUES(acc,'取走金额',addmon,datet);
    
        end if;
    end;
    call code_for_deal(100,'a123','123');
    drop PROCEDURE code_for_deal

### 视图l例子：

    INSERT into t_dept (dept_name,dept_createTime) VALUES('销售部','2018-01-01'),('售后部','2018-01-01');
    
    CREATE TABLE t_employee(
    em_id int PRIMARY KEY auto_increment,
    em_name VARCHAR(100),
    em_job VARCHAR(100),
    em_dept_id INT
    );
    
    INSERT into t_employee (em_name,em_job,em_dept_id) VALUES('小一','打杂',1),('小二','打杂',2);
    
    CREATE VIEW vi_dept_em AS
    SELECT t1.dept_id AS '部门编号' ,
     t1.dept_name AS '部门名称' ,
     t1.dept_createTime AS '成立时间' ,
     COUNT(t2.em_id) AS '员工数' 
    FROM t_dept t1 JOIN t_employee t2 ON t1.dept_id = t2.em_id GROUP BY t1.dept_id
    
    DROP VIEW vi_dept_em
    SHOW CREATE VIEW vi_dept_em
    
    show table status like "vi_dept_em";