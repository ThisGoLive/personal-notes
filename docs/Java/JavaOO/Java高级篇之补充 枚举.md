# 补充内容 枚举

	什么是枚举？

将数据一个一个的列举出来，作为一个数据集存在

在实际编程中，往往存在着这样的“数据集”，它们的数值在程序中是稳定的，而且“数据集”中的元素是有限的。

例如星期一到星期日七个数据元素组成了一周的“数据集”，春夏秋冬四个数据元素组成了四季的“数据集”。

以前我们定义一个常量通常都是使用 public static final …… 定义的，如下面:

	public static final CONSTANT_STR = "TEST";

或者使用接口定义的变量，因为接口定义的变量默认都是public static final，如下：

	public interface IWeekConstants {
	    String MON = "Mon";
	    String TUE = "Tue";
	    String WED = "Wed";
	    String THU = "Thu";
	    String FRI = "Fri";
	    String SAT = "Sat";
	    String SUN = "Sun";
	}
	
有了枚举我们可以使用下面的方式：

	public enum WeekEnum {
	    MON, TUE, WED, THU, FRI, SAT, SUN;
	}

**解释：**
创建枚举类型要使用 **enum** 关键字，隐含了所创建的类型都是 java.lang.Enum 类的子类（java.lang.Enum 是一个抽象类）。枚举类型符合通用模式 Class `Enum<E extends Enum<E>>`，而 E 表示枚举类型的名称。枚举类型的每一个值都将映射到 protected Enum(String name, int ordinal) 构造函数中，在这里，每个值的名称都被转换成一个字符串，并且序数设置表示了此设置被创建的顺序。

上面那段代码声明的enum对象实际上调用了7次Enum(String name, int ordinal) 这个构造函数。（name 是常量，上面是MON,TUE等，ordinal是被创建顺序）

	new Enum<EnumTest>("MON",0);
	new Enum<EnumTest>("TUE",1);
	new Enum<EnumTest>("WED",2);
	...

可以在switch中使用枚举

	enum Color{  
	    GREEN, YELLOW, RED  
	}  
	public class TrafficLight {  
	    Color color = Color.RED;  
	    public void change() {  
	        switch (color) {  
	        case RED:  
	            System.out.println("红色");  
	            break;  
	        case YELLOW:  
	            System.out.println("黄色");  
	            break;  
	        case GREEN:  
	            System.out.println("绿色");  
	            break;  
	        }  
	    }  
	}

我们使用常量的时候，我们使用接口的时候是可以有值与之对应的，如上面IWeekConstants 接口的MON的值是Mon，但枚举好像没能标示出这种意义。下面我们就讨论该方式的实现和枚举类型的遍历

　　枚举类型提供了构造函数，我们可以通过构造函数和覆写toString方法来实现。实现代码如下：


	package test;
	
	enum ActionTypeEnum {
		// 通过括号赋值,而且必须带有一个参构造器和一个属性跟方法，否则编译出错
		// 赋值必须都赋值或都不赋值，不能一部分赋值一部分不赋值；如果不赋值则不能写构造器，赋值编译也出错
		下载(1, "xiazai"), 访问(2, "fangwen");
		int index;
		String name;
	
		private ActionTypeEnum(int index, String name) {
			this.index = index;
			this.name = name;
		}
	
		public int getIndex() {
			return index;
		}
	
		public void setIndex(int index) {
			this.index = index;
		}
	
		public String getName() {
			return name;
		}
	
		public void setName(String name) {
			this.name = name;
		}
	
	}
	
	public class EnumTest {
		public static void main(String[] args) {
			// ActionTypeEnum.values()将枚举中所有的可能性存放在ActionTypeEnum[] 数组中
			ActionTypeEnum[] actionTypeEnums = ActionTypeEnum.values();
			for (ActionTypeEnum actionTypeEnum : actionTypeEnums) {
				System.out.println("name=" + actionTypeEnum.getName());
				System.out.println("index= " + actionTypeEnum.getIndex());
				System.out.println("oridary=" + actionTypeEnum.ordinal());
				System.out.println("this = " + actionTypeEnum);
				System.out.println("下载值：" + actionTypeEnum.valueOf("下载"));
				System.out.println("name()方法= " + actionTypeEnum.name());
				System.out.println("--------------叫我分割线------------------");
			}
		}
	}

简单的总结下

可以把 enum 看成是一个普通的 class，它们都可以定义一些属性和方法，不同之处是：enum 不能使用 extends 关键字继承其他类，因为 enum 已经继承了 java.lang.Enum（java是单一继承），但可以继承接口。