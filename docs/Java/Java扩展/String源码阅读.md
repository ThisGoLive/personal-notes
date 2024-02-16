[[TOC]]

# 继承

无

# 实现

+ Serializable 序列化接口
+ comperable 比较器
+ CharSequence

# 静态属性

#### serialVersionUID

是 Serializable 是内存 id

当反序列化的时候系统会去检测文件中的serialVersionUID ，

看它是否和当前类的serialVersionUID 一致，如果一致就说明序列化的类的版本和当前类的版本是相同的，这个时候可以成功反序列化，否则就说明当前类

和序列化的类相比发生了某些变换，比如成员变量的数量，类型可能发生了改变，这个时候就会抛异常，反序列化失败。    

#### serialPersistentFields

是长度为0的ObjectStreamField数组。

​    一般会用一个ObjectStreamField数组来声明一个类中的串行化字段 。

 **串行化和并行化**

​     **串行化**也叫做序列化,就是把存在于内存的对象数据转化成可以保存成硬盘文件的形式去存储;
     **并行化**也叫反序列化,就是把序列化后的硬盘文件加载到内存,重新变成对象数据.

就是对

# 私有属性

+ char value[]
  + 与之前了解的一样。数据存放.
+ int hash
  + hash 值 ，默认是0.

# 构造

#### String():

​    就是创建的 字符串“”的值 赋值给this.value

#### String(String va);

​    va的值 赋值给this.value。并且 hash值也一起赋值了。

#### String(char[] va);

​    调用的 Array.copyOf 将va 复制给 this.value。

#### String(char value[], int offset, int count)

​    基本同上 Arrays.copyOfRange 。开始下标 offset 与 长度 count。不过事先判断。

#### String(int[] codePoints, int offset, int count)；

​    通过Character类中静态方法，移位符号，判断codePoints的每一项，是否是**Unicode编码**，即小于65536，或者小于1114112. 再转换为一位或者两位char赋值给value。

```
<<      :     左移运算符，num << 1,相当于num乘以2

>>      :     右移运算符，num >> 1,相当于num除以2

>>>    :     无符号右移，忽略符号位，空位都以0补齐
```

​    

#### String(byte ascii[], int hibyte, int offset, int count)；

基本就是 byte 转换为 char 。不过 是 hibyte  == 0 时。其他情况, hibyte <<= 8;就没看懂。不看了。

12&5 的值是多少？答：12转成二进制数是1100（前四位省略了），5转成二进制数是0101，则运算后的结果为0100即4 这是两侧为数值时； 

#### String(byte bytes[], int offset, int length, String charsetName)

还是byte转char ,charsetName为编码集。默认ISO-8859-1

#### public String(byte bytes[], int offset, int length, Charset charset)

基本同上。Charset 类判断字符集

#### String(byte bytes[], String charsetName)

将字节数组 以字符集 转换为 String

#### **总结：**

构造基本都是char[] 类型。其余都是判断字符集什么。其它基本数据类型，都无法通过构造转成String。还有两个String工具类，直接构造。不过StringBuffer 加了锁。

# 其它方法

#### length()

直接是数组的长度

#### isEmpty()

数组长度是否是0

#### charAt(int index)

是否下标越界

#### codePointAt(int index)

看不懂，貌似又和Unicode 编码集有关

#### byte[] getBytes(String charsetName)

得到对应字符集的 字节数组

#### equals(Object anObject)

先判断是否是同一对象的引用。不是，则再类型，长度，每个字符 判断。

#### equals(Object anObject)

contentEquals(CharSequence cs)   nonSyncContentEquals(AbstractStringBuilder sb) 

基本是同一个意思，StringBuffer 比较。内部都有char[] 作为存储值

#### equalsIgnoreCase(String anotherString)

比较两个字符串 相当

#### compareTo(String anotherString)

比较器 升序 Comparator`<String>` CASE_INSENSITIVE_ORDER 静态 自带 比较器

#### regionMatches(int toffset, String other, int ooffset,,            int len)

this  从多少  到多少长度与 与 other 从多少  到多少长度 相同 。再加 一个参数boolean 是否 判断字符集

#### startsWith(String prefix, int toffset)

this 从toffset开始 是否包含 

#### endsWith(String suffix)

this 与 suffix 从后往前 比较 是否包含 

#### hashCode()

返回hash值。当 hash值为0时计算。

#### indexOf(int ch, int fromIndex)

ch unicon码值 在fromIndex 位开始 算 。第几位出现

#### lastIndexOf(int ch, int fromIndex)

同理 最后一个出现 的下标

#### indexOf(String str, int fromIndex)

同理 str 的下标

#### substring(int beginIndex)

创建新对象 原本的  beginIndex 到最后

### substring(int beginIndex, int endIndex)

创建新对象 原本的  beginIndex 到 endIndex

#### concat(String str)

字符串 加 str 

#### replace(char oldChar, char newChar)

顾名思义 新替换旧

#### matches(String regex)

正则 判断

#### split(String regex, int limit)

正则 拆分

#### toLowerCase(Locale locale) toUpperCase()

把字母变为小写。

```java
 scan: {

     break scan;
 }
```

跳出多重循环 

#### trim()

去掉空格

#### valueOf系列

基本类 都是转换成 包装类 toString

#### native String intern()

native 是说底层 接口 实现的。Java 7 开始。主要就是，堆中有字符串时，直接调用引用，而不是再创建对象，减少内存。 但时间会延长。

```java
System.out.println("123" == new String("123"));//false
System.out.println("123" == new String("123").intern());//true
```
