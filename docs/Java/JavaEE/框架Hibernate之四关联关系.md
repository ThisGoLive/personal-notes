2018/2/7 星期三 上午 9:06:22 
# Hibernate的关联关系 #
java中类与类的关系

1. 继承（泛化）	 子类与基类（超类）的关系
2. 实现    		 实现类与接口之间的关系
3. 关联关系     	 主要说的是拥有关系，例如：老公有老婆  一般会在以成员变量存在；
4. 组合、聚合    都是讲的部分和整体的关系，区别在于：组合中部分与整体是强耦合（鸟和翅膀），而聚合是若耦合（车和车轮）；特殊的关联关系。代码体现：成员变量。
5. 依赖			使用与被使用的关系； 代码体现：方法的参数，或者方法返回，返回类型。
 

## 1.9 单向的  一对一 一对多  （即只在一方中写成员变量）
### 1.9.1 配置文件 ##
####一对一 
	//unique=“true（将多的一方唯一化，此时就相当于一对一）
	
	//cascade  级联
	//cascade="save-update"  当前对象，在新增或修改时，与之有关联的对象，也需要修改和更改 
	//cascade=delete  当前对象删除时，与之关联的对象也需要删除。
	//cascade=none 不管。  默认
	//cascade=all  当前对象，做任何事，关联对象， 都会与之跟着做
	//cascade=persist 当前对象新增时，也会新增
	//cascade=refresh 当前对象获取数据库最新数据，与之有关的也会获取。 

	//fetch 表示关联对象，在获取时的抓取方式
	//fetch="join" 预加载，在查询时，hibernate在拼接hql时，回自动将“与之有关的对象”采用left join进行加载hql语句。
	//select 代表及时加载，在查询时，主对象先查询，完成后，hibernate再发送hql去查询关联对象
	
	//fetch="select" lazy="" false 默认 不开启延迟加载  proxy 变成延迟加载方式
	//cloumn="关联表的外键名" 在一对一中的外键，主要是查询时，提供对方的id  

	<many-to-one name="某类的在改对象的属性名" unique=“true” class="权限类名" cascade="非必填的，级联" ></>
	
#### 一对多 ####
 在添加单向一对多时  是先添加的多，在添加主对象后，再去修改外键，效率差

	//lazy="" true  变成延迟加载方式
	//只写一的那方方
	<set(集合类型) lazy="true" name="属性名" >
		<key cloumn="关联表的主表外键">
		<one-to-many lass="类型">
	</>
###1.9.2 增删改 
由于开启了级联的 ，就不需要一个一个操作，而是操作主对象就可以
### 1.9.3 查询
延迟加载；

一对一连表
	
	String hql = from 主对象 as o1 left join 主对象.关联对象 as o2 on o1.外键 = o2.主键
	//fatch 表示将join后这一个关联对象向主对象封装，在结果集中忽略掉，返回完整的主对象，也就没法用按需查询（不能用new）；
	查出来又成对象数组了，同前面解决，new。且会有两条数据，一条主对象，一条关联对象（解决：fatch加于join后）

#### **hq与sql的不同：** ####

1. 不需写 select __ 
2. 可以 new Object()  new Map()
3. fatch 关键字
## 1.10 双向的  一对一 一对多
即双向拥有  彼此都有对方对象的引用  但表中只有一方有另一方的外键：例如 夫妻双向拥有

### 1.10.1 一对一 ###
	拥有外键的一方
	配置 必填：name unique class fetch lazy column 
	用<many-to-one>  唯一化

	没有外键的一方<one-to-one property-ref>   
	必填：name class fetch property-ref=“”(用于关联有外键的类 中关联此相关对象的属性  
	例如：A类有两个属性对象名b和c 且外键在a的表中 b类的配置文件就是用one-to-one 并配置 property-ref=“b” )

	双向一对一的hql ：
	"from 对象1 join 对象2 不加 on"
### 1.10.2 一对多 ###
一的配置文件：

	//inverse="true" 控制反转  用于一对多  多对多  中 选择哪一方为主控方  
	例如学生 选择 科目	，数据库中，就是维护表中外键，谁有建立更是外键的权力；
	描述的是关系维护的控制权，true表示让出控制权，由对方维护；一般一对多中，
	由多的一方来维护；
	
	<set(集合类型) name="集合名" inverse="true" table="关联的表的名" 
	cascade="all" fetch="select" lazy="true"  >
		<key cloumn="关联表的主表外键名">
		<one-to-many class="类型" />
	</>	
多的配置文件中：

	<many-to-one name="某类的在改对象的属性名" fetch="select" lazy="true" 
	class="一的类名" cascade="非必填的，级联" cloumn="表中的外键名" ></>

## 1.11 多对多 ##
配置：
	
	//必填： name table fetch lazy （inverse）
	<set name="" cascade="all"  table="关联表名" >
		<key column="中间表的本类的一方的外键"></>
		<many-to-many class="对方类权限命名名" column="中间表的对面多的一方的外键"></>
	</>
	
	另外一方基本相同，但是 inverse="true" 控制反转依据
	
若一个对象之前有一个集合并且有值，这是要添加，这时，得查询出之前的集合，再添加到集合中，再加到对象中，再修改。若不去添加到集合，会认为是，改变了集合，从而将原本的删除，只保留新增的。