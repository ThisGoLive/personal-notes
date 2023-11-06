# Java高阶篇之第十七章:反射 #
**反射:**在运行过程中动态获得类模板(class对象),并操作

一个项目中,一个类只需要加载一次,因为当类被加载后,会在内中生成一个class对象(类模板),

**获取类模板**
#### 第一种forName() ####
	Class<?> c = class.forName(类的权限命名);
#### 第二种对象 ###
	该类的对象.getClass();
#### 第三种 ####
	类名.class;

其中主要是第一种,运用非常广泛.常和**XML加dom4解析技术**连用!!!
### 类模板的用法 ###
```java
	class Test0 {
		private int a ;
		public String b;
		public Test0() {
			// TODO Auto-generated constructor stub
		}
		public Test0(int a) {
			// TODO Auto-generated constructor stub
		}
		public void setA(int a) {
			this.a = a;
		}
		private String getB() {
			return b;
		}
	}

	Class<Test0> c = Test0.class;
创建对象

	c.newInstance();//这是类模板直接创建,没有有参构造
得到构造器

	try {
			Constructor<Test0> co = c.getConstructor();
			co.newInstance();

			//参数为该构造的参数的类模板
			Constructor<Test0> con = c.getConstructor(int.class);
			//必须有参数
			co.newInstance(1);
		}catch (Exception e) {
	}
得到方法

	Method[] m = c.getMethods();//得到所有public的方法(包括继承的)
	Method m0 = c.getMethod(方法名, 方法参数);
	Method[] m2 = c.getDeclaredMethods();//得到所有本类的方法

	String name = m[0].getName();//返回该对象表示的方法的方法名
	m[0].invoke(c.newInstance());//如果有参,对象后面需加参数.  运行该对象的该方法.
得到成员变量
	
	基本同Method
	c.getFeilds();
	c.getFeild(String name);
	Field[] f = c.getDeclaredFeilds();

	f[0].get(该类的实例);//得到该实例的该成员变量
	f[0].setAccessible(true);//取消java语言检测
	f[0].set(该类的实例, 改变为的数据的值);//修改数据的值
```
## xml和dom4j解析 ##
下转,Java高阶篇之第十八章:Java XML 解析技术