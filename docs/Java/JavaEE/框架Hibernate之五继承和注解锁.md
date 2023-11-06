2018/2/8 星期四 上午 9:29:04 
## 1.12 数据库的继承 
### 1.12.1 单表继承 ###
在一个表中描述出一个继承体系。缺点：字段全部冗余在一个表中；
添加一个字段来描述，类型，如：A－１　　Ｂ－２　　在把所有的属性写出，下面标1或2来表示有

	父类配置文件中： 加入非公共的属性时 鉴别器 来判断子类
		<discriminator column="type（）表中用于判断的字段名" type="表中的字段的数据类型 用String"/>
		<subclass name="类权限命名" discrimination-value="对应的1还是2。。。">
			<property>
### 1.12.2 多表继承 ###
	相当于连表.父类一张表,子类每个类一个表,存外键,再连;
## 1.13 注解替换配置 #
用sun公司规定jpa规范，完成orm映射。反射的应用；

	<mapping class="">  //不需要再导入hibernate配置   用这个
####  1.完成类的映射： ####
	@Entity
	@Table（catalog=“数据库名” ， name="表名"）
	@Cache(usage="") //对缓存设值 不配就不设置
#### 2.属性 ####
	@Id
	@column(name="id")
	@GeneratedValue(generator="随意1")//jpa定义  但是少 就要映射hibernate的
	@GenericGenerator(name="随意1",strategy="同配置中")//设置生成方式 这为hibernate

	非id
	@Column(name="表中名",length=20据类型来定)
##### 单向 ####
即被所有放没有所有方的对象;

	一对一
	所有方
	@OneToOne(cascade=CascadeType.all,fetch=FetchType.lazy) //fetch包含了fetch lazy
	@casade(value={CascadeType.__,CascadeType.__})//不是jpa的  多  ,jpa的太少
	@JoinColumn(name="名")//外键名设值

	一对多
	被所有方 不配
	@OneToMany(fetch=FetchType.lazy)//延迟加载
	@casade(value={CascadeType.__,CascadeType.__})//不是jpa的 多  ,jpa的太少
	@JoinColumn(name="名")//外键名设值
##### 双向 ####
	一对一
	@OneToOne(fetch=FetchType.lazy,mappedBy="")//mappedBy=""b 和谁有映射关系 代替property-ref=“b”
	@casade(value={CascadeType.__,CascadeType.__})
	@JoinColumn(name="名")//外键名设值

	一对多
	多:
	@many-to-one(fetch=FetchType.lazy)
	@casade(value={CascadeType.__,CascadeType.__})
	@Joincolumn() //外键
	单
	@onetomany(fetch=FetchType.lazy, mappedBy="多方对单方的引用")
	@casade(value={CascadeType.__,CascadeType.__})

	多对多  主控反转
	@manytomany(fetch=FetchType.lazy)
	@casade(value={CascadeType.__,CascadeType.__})

	@jointable(name="中间表的名",
	joinColumn=@JoinColumn(name="本类在中间表的键名"),
	inverseJoinColumn=@JoinColumn(name="另外类在中间表的键名"))

	被控的类
	@ManyToMany(fetch=FetchType.lazy,mappedBy="主控类中的本类的集合名")//反转控制
	@Casade(value={CascadeType.__,CascadeType.__})
#### hibernate的注解 ####
	import org.hibernate.annotations.Cascade;
	import org.hibernate.annotations.CascadeType;
	import org.hibernate.annotations.GenericGenerator;
继承
	...
## 1.14 锁 #
#### 1.14.1 悲观锁 ####
	语句后加上 for update  数据锁死别人看不到  
	适合小系统
#### 1.14.2 乐观锁 ####
	极少情况下,会有并发同一数据; 逻辑层面加锁
	版本version    中程序代码上 逻辑加锁,
	配置
	class属性 optimistic-lock=""version
	对象 和表中  都加上version 
	注解
	类强@optimisticlocking(type="")
	version属性@version()

####失败补偿机制
	失败后台再执行,并得到最新的版本,和数量,再看是否失败,败则再循环此.
# 回调和拦截 #
# 事务提交 #
hibernate的事务提交是基于jdbc  所以只能一次提价;
而多次提交,是jta事务管理器(spring) 两次提交,且能存多个Session,跨数据库; 

逻辑事务（事务管理器控制） 和 物理事务（conmmt提交事务）；

原子性 一致性 隔离性（事务间互不干扰） 持久性（一旦成功，数据就会到硬盘上）