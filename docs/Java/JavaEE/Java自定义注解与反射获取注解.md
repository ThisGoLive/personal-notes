#  Java自定义注解和运行时靠反射获取注解  #
 java自定义注解
[[../Java扩展/java 注解的原理|java 注解的原理]]
Java注解是附加在代码中的一些元信息，用于一些工具在编译、运行时进行解析和使用，起到说明、配置的功能。
注解不会也不能影响代码的实际逻辑，仅仅起到辅助性的作用。包含在 java.lang.annotation 包中。

## 1、元注解

元注解是指注解的注解。包括  @Retention @Target @Document @Inherited四种。

1.1、@Retention: 定义注解的保留策略
@Retention(RetentionPolicy.SOURCE)   //注解仅存在于源码中，在class字节码文件中不包含
@Retention(RetentionPolicy.CLASS)     // 默认的保留策略，注解会在class字节码文件中存在，但运行时无法获得，
@Retention(RetentionPolicy.RUNTIME)  // 注解会在class字节码文件中存在，在运行时可以通过反射获取到

注解类：
[java] view plain copy

```java
@Retention(RetentionPolicy.RUNTIME) // 注解会在class字节码文件中存在，在运行时可以通过反射获取到  
@Target({ElementType.FIELD,ElementType.METHOD})//定义注解的作用目标**作用范围字段、枚举的常量/方法  
@Documented//说明该注解将被包含在javadoc中  
public @interface FieldMeta {  
  
    /** 
     * 是否为序列号 
     * @return 
     */  
    boolean id() default false;  
    /** 
     * 字段名称 
     * @return 
     */  
    String name() default "";  
    /** 
     * 是否可编辑 
     * @return 
     */  
    boolean editable() default true;  
    /** 
     * 是否在列表中显示 
     * @return 
     */  
    boolean summary() default true;  
    /** 
     * 字段描述 
     * @return 
     */  
    String description() default "";  
    /** 
     * 排序字段 
     * @return 
     */  
    int order() default 0;  
}  
```



实体类：
[java] view plain copy

```java
public class Anno {  
  
    @FieldMeta(id=true,name="序列号",order=1)  
    private int id;  
    @FieldMeta(name="姓名",order=3)  
    private String name;  
    @FieldMeta(name="年龄",order=2)  
    private int age;  
      
    @FieldMeta(description="描述",order=4)  
    public String desc(){  
        return "java反射获取annotation的测试";  
    }  
      
    public int getId() {  
        return id;  
    }  
    public void setId(int id) {  
        this.id = id;  
    }  
    public String getName() {  
        return name;  
    }  
    public void setName(String name) {  
        this.name = name;  
    }  
    public int getAge() {  
        return age;  
    }  
    public void setAge(int age) {  
        this.age = age;  
    }  
      
}  
```


获取到注解的帮助类：
[java] view plain copy

```java
public class SortableField {  
  
    public SortableField(){}  
      
    public SortableField(FieldMeta meta, Field field) {  
        super();  
        this.meta = meta;  
        this.field = field;  
        this.name=field.getName();  
        this.type=field.getType();  
    }  
    public SortableField(FieldMeta meta, String name, Class<?> type) {  
        super();  
        this.meta = meta;  
        this.name = name;  
        this.type = type;  
    }   
    private FieldMeta meta;  
    private Field field;  
    private String name;  
    private Class<?> type;  
      
    public FieldMeta getMeta() {  
        return meta;  
    }  
    public void setMeta(FieldMeta meta) {  
        this.meta = meta;  
    }  
    public Field getField() {  
        return field;  
    }  
    public void setField(Field field) {  
        this.field = field;  
    }  
    public String getName() {  
        return name;  
    }  
    public void setName(String name) {  
        this.name = name;  
    }  
  
    public Class<?> getType() {  
        return type;  
    }  
  
    public void setType(Class<?> type) {  
        this.type = type;  
    }  

}  
```


运行时获取注解，首先创建一个基类：
[java] view plain copy

```java
public class Parent<T> {  
  
    private Class<T> entity;  
  
    public Parent() {  
        init();  
    }  
  
    @SuppressWarnings("unchecked")  
    public List<SortableField> init(){  
        List<SortableField> list = new ArrayList<SortableField>();  
        /**getClass().getGenericSuperclass()返回表示此 Class 所表示的实体（类、接口、基本类型或 void） 
         * 的直接超类的 Type(Class<T>泛型中的类型)，然后将其转换ParameterizedType。。 
         *  getActualTypeArguments()返回表示此类型实际类型参数的 Type 对象的数组。 
         *  [0]就是这个数组中第一个了。。 
         *  简而言之就是获得超类的泛型参数的实际类型。。*/  
        entity = (Class<T>)((ParameterizedType)this.getClass().getGenericSuperclass())  
                .getActualTypeArguments()[0];  
//      FieldMeta filed = entity.getAnnotation(FieldMeta.class);  
          
        if(this.entity!=null){  
              
            /**返回类中所有字段，包括公共、保护、默认（包）访问和私有字段，但不包括继承的字段 
             * entity.getFields();只返回对象所表示的类或接口的所有可访问公共字段 
             * 在class中getDeclared**()方法返回的都是所有访问权限的字段、方法等； 
             * 可看API 
             * */  
            Field[] fields = entity.getDeclaredFields();  
//            
            for(Field f : fields){  
                //获取字段中包含fieldMeta的注解  
                FieldMeta meta = f.getAnnotation(FieldMeta.class);  
                if(meta!=null){  
                    SortableField sf = new SortableField(meta, f);  
                    list.add(sf);  
                }  
            }  
              
            //返回对象所表示的类或接口的所有可访问公共方法  
            Method[] methods = entity.getMethods();  
              
            for(Method m:methods){  
                FieldMeta meta = m.getAnnotation(FieldMeta.class);  
                if(meta!=null){  
                    SortableField sf = new SortableField(meta,m.getName(),m.getReturnType());  
                    list.add(sf);  
                }  
            }  
            //这种方法是新建FieldSortCom类实现Comparator接口，来重写compare方法实现排序  
//          Collections.sort(list, new FieldSortCom());  
            Collections.sort(list, new Comparator<SortableField>() {  
                @Override  
                public int compare(SortableField s1,SortableField s2) {  
                    return s1.getMeta().order()-s2.getMeta().order();  
//                  return s1.getName().compareTo(s2.getName());//也可以用compare来比较  
                }  
                  
            });  
        }  
        return list;  
          
    }  
}  
```

创建子类继承基类：
[java] view plain copy
```java
    public class Child extends Parent<Anno>{  
      
    }  
```

测试类：
[java] view plain copy
```java
    public class TestAnnotation {  
      
        @SuppressWarnings({ "unchecked", "rawtypes" })  
        public static void main(String[] args) {  
            Parent c = new Child();  
            List<SortableField> list = c.init();//获取泛型中类里面的注解  
            //输出结果  
            for(SortableField l : list){  
                System.out.println("字段名称："+l.getName()+"\t字段类型："+l.getType()+  
                        "\t注解名称："+l.getMeta().name()+"\t注解描述："+l.getMeta().description());  
            }  
        }  
    }  

```
转：

1、Annotation的工作原理：

JDK5.0中提供了注解的功能，允许开发者定义和使用自己的注解类型。该功能由一个定义注解类型的语法和描述一个注解声明的语法，读取注解的API，一个使用注解修饰的class文件和一个注解处理工具组成。

Annotation并不直接影响代码的语义，但是他可以被看做是程序的工具或者类库。它会反过来对正在运行的程序语义有所影响。

Annotation可以冲源文件、class文件或者在运行时通过反射机制多种方式被读取。

## 2、@Override注解：

java.lang
注释类型 Override
@Target(value=METHOD)
@Retention(value=SOURCE)
public @interface Override

表示一个方法声明打算重写超类中的另一个方法声明。如果方法利用此注释类型进行注解但没有重写超类方法，则编译器会生成一条错误消息。

@Override注解表示子类要重写父类的对应方法。

Override是一个Marker annotation，用于标识的Annotation，Annotation名称本身表示了要给工具程序的信息。

下面是一个使用@Override注解的例子：
```java
class A {
    private String id;
    A(String id){
        this.id = id;
    }
    @Override
    public String toString() {
        return id;
    }
}
```
## 3、@Deprecated注解：

java.lang
注释类型 Deprecated
@Documented
@Retention(value=RUNTIME)
public @interface Deprecated

用 @Deprecated 注释的程序元素，不鼓励程序员使用这样的元素，通常是因为它很危险或存在更好的选择。在使用不被赞成的程序元素或在不被赞成的代码中执行重写时，编译器会发出警告。

@Deprecated注解表示方法是不被建议使用的。

Deprecated是一个Marker annotation。

下面是一个使用@Deprecated注解的例子：
```java
class A {
    private String id;
    A(String id){
        this.id = id;
    }
    @Deprecated
    public void execute(){
        System.out.println(id);
    }
    public static void main(String[] args) {
        A a = new A("a123");
        a.execute();
    }
}
```
## 4、@SuppressWarnings注解：

java.lang
注释类型 SuppressWarnings
@Target(value={TYPE,FIELD,METHOD,PARAMETER,CONSTRUCTOR,LOCAL_VARIABLE})
@Retention(value=SOURCE)
public @interface SuppressWarnings

指示应该在注释元素（以及包含在该注释元素中的所有程序元素）中取消显示指定的编译器警告。注意，在给定元素中取消显示的警告集是所有包含元素中取消显示的警告的超集。例如，如果注释一个类来取消显示某个警告，同时注释一个方法来取消显示另一个警告，那么将在此方法中同时取消显示这两个警告。

根据风格不同，程序员应该始终在最里层的嵌套元素上使用此注释，在那里使用才有效。如果要在特定的方法中取消显示某个警告，则应该注释该方法而不是注释它的类。

@SuppressWarnings注解表示抑制警告。

下面是一个使用@SuppressWarnings注解的例子：

@SuppressWarnings("unchecked")
public static void main(String[] args) {
    List list = new ArrayList();
    list.add("abc");
}

## 5、自定义注解：

使用@interface自定义注解时，自动继承了java.lang.annotation.Annotation接口，由编译程序自动完成其他细节。在定义注解时，不能继承其他的注解或接口。

自定义最简单的注解：
```java
public @interface MyAnnotation {

}
```

使用自定义注解：
```java
public class AnnotationTest2 {

	@MyAnnotation
	public void execute(){
    	System.out.println("method");
	}
}
```
5.1、添加变量：

```java
public @interface MyAnnotation {
    String value1();
}
```
使用自定义注解：
```java
public class AnnotationTest2 {

    @MyAnnotation(value1="abc")
    public void execute(){
        System.out.println("method");
    }
}
```
当注解中使用的属性名为value时，对其赋值时可以不指定属性的名称而直接写上属性值接口；除了value意外的变量名都需要使用name=value的方式赋值。
5.2、添加默认值：

```java
public @interface MyAnnotation {

    String value1() default "abc";
}
```
5.3、多变量使用枚举：

```java
public @interface MyAnnotation {

    String value1() default "abc";
    MyEnum value2() default MyEnum.Sunny;
}
enum MyEnum{
    Sunny,Rainy
}
```
使用自定义注解：
```java
public class AnnotationTest2 {

    @MyAnnotation(value1="a", value2=MyEnum.Sunny)
    public void execute(){
        System.out.println("method");
    }
}
```
5.4、数组变量：
```java
public @interface MyAnnotation {

    String[] value1() default "abc";
}
```
使用自定义注解：
```java
public class AnnotationTest2 {

    @MyAnnotation(value1={"a","b"})
    public void execute(){
        System.out.println("method");
    }
}
```
## 6、设置注解的作用范围：

@Documented
@Retention(value=RUNTIME)
@Target(value=ANNOTATION_TYPE)
public @interface Retention

指示注释类型的注释要保留多久。如果注释类型声明中不存在 Retention 注释，则保留策略默认为 RetentionPolicy.CLASS。

只有元注释类型直接用于注释时，Target 元注释才有效。如果元注释类型用作另一种注释类型的成员，则无效。

`public enum RetentionPolicy extends Enum<RetentionPolicy>`

注释保留策略。此枚举类型的常量描述保留注释的不同策略。它们与 Retention 元注释类型一起使用，以指定保留多长的注释。

CLASS
编译器将把注释记录在类文件中，但在运行时 VM 不需要保留注释。
RUNTIME
编译器将把注释记录在类文件中，在运行时 VM 将保留注释，因此可以反射性地读取。
SOURCE
编译器要丢弃的注释。

@Retention注解可以在定义注解时为编译程序提供注解的保留策略。

属于CLASS保留策略的注解有@SuppressWarnings，该注解信息不会存储于.class文件。
6.1、在自定义注解中的使用例子：
```java
@Retention(RetentionPolicy.CLASS)
public @interface MyAnnotation {

    String[] value1() default "abc";
}
```

## 7、使用反射读取RUNTIME保留策略的Annotation信息的例子：

java.lang.reflect
        接口 AnnotatedElement
所有已知实现类：
        AccessibleObject, Class, Constructor, Field, Method, Package

表示目前正在此 VM 中运行的程序的一个已注释元素。该接口允许反射性地读取注释。由此接口中的方法返回的所有注释都是不可变并且可序列化的。调用者可以修改已赋值数组枚举成员的访问器返回的数组；这不会对其他调用者返回的数组产生任何影响。

如果此接口中的方法返回的注释（直接或间接地）包含一个已赋值的 Class 成员，该成员引用了一个在此 VM 中不可访问的类，则试图通过在返回的注释上调用相关的类返回的方法来读取该类，将导致一个 TypeNotPresentException。

`isAnnotationPresent boolean isAnnotationPresent(Class<? extends Annotation> annotationClass)`

如果指定类型的注释存在于此元素上，则返回 true，否则返回 false。此方法主要是为了便于访问标记注释而设计的。

参数：

annotationClass - 对应于注释类型的 Class 对象

返回：

如果指定注释类型的注释存在于此对象上，则返回 true，否则返回 false

抛出：

NullPointerException - 如果给定的注释类为 null

从以下版本开始：

1.5

`getAnnotation <T extends Annotation> T getAnnotation(Class<T> annotationClass)`

如果存在该元素的指定类型的注释，则返回这些注释，否则返回 null。

参数：

annotationClass - 对应于注释类型的 Class 对象

返回：

如果该元素的指定注释类型的注释存在于此对象上，则返回这些注释，否则返回 null

抛出：

NullPointerException - 如果给定的注释类为 null

从以下版本开始：

1.5

getAnnotations
Annotation[] getAnnotations()

返回此元素上存在的所有注释。（如果此元素没有注释，则返回长度为零的数组。）该方法的调用者可以随意修改返回的数组；这不会对其他调用者返回的数组产生任何影响。

返回：

此元素上存在的所有注释

从以下版本开始：

1.5

getDeclaredAnnotations
Annotation[] getDeclaredAnnotations()

返回直接存在于此元素上的所有注释。与此接口中的其他方法不同，该方法将忽略继承的注释。（如果没有注释直接存在于此元素上，则返回长度为零的一个数组。）该方法的调用者可以随意修改返回的数组；这不会对其他调用者返回的数组产生任何影响。

返回：

直接存在于此元素上的所有注释

从以下版本开始：

1.5


下面是使用反射读取RUNTIME保留策略的Annotation信息的例子：

自定义注解：
```java
@Retention(RetentionPolicy.RUNTIME)
public @interface MyAnnotation {

    String[] value1() default "abc";
}
```

使用自定义注解：
```java
public class AnnotationTest2 {

    @MyAnnotation(value1={"a","b"})
    @Deprecated
    public void execute(){
        System.out.println("method");
    }
}
```
读取注解中的信息：
```java
public static void main(String[] args) throws SecurityException, NoSuchMethodException, IllegalArgumentException, IllegalAccessException, InvocationTargetException {
    AnnotationTest2 annotationTest2 = new AnnotationTest2();
    //获取AnnotationTest2的Class实例
    Class<AnnotationTest2> c = AnnotationTest2.class;
    //获取需要处理的方法Method实例
    Method method = c.getMethod("execute", new Class[]{});
    //判断该方法是否包含MyAnnotation注解
    if(method.isAnnotationPresent(MyAnnotation.class)){
        //获取该方法的MyAnnotation注解实例
        MyAnnotation myAnnotation = method.getAnnotation(MyAnnotation.class);
        //执行该方法
        method.invoke(annotationTest2, new Object[]{});
        //获取myAnnotation
        String[] value1 = myAnnotation.value1();
        System.out.println(value1[0]);
    }
    //获取方法上的所有注解
    Annotation[] annotations = method.getAnnotations();
    for(Annotation annotation : annotations){
        System.out.println(annotation);
    }
}
```
## 8、限定注解的使用：

限定注解使用@Target。

@Documented
@Retention(value=RUNTIME)
@Target(value=ANNOTATION_TYPE)
public @interface Target

指示注释类型所适用的程序元素的种类。如果注释类型声明中不存在 Target 元注释，则声明的类型可以用在任一程序元素上。如果存在这样的元注释，则编译器强制实施指定的使用限制。 例如，此元注释指示该声明类型是其自身，即元注释类型。它只能用在注释类型声明上：

@Target(ElementType.ANNOTATION_TYPE)
    public @interface MetaAnnotationType {
        ...
    }

此元注释指示该声明类型只可作为复杂注释类型声明中的成员类型使用。它不能直接用于注释：

@Target({}) 
    public @interface MemberType {
        ...
    }

这是一个编译时错误，它表明一个 ElementType 常量在 Target 注释中出现了不只一次。例如，以下元注释是非法的：
```java
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.FIELD})
    public @interface Bogus {
        ...
    }
```
`public enum ElementType extends Enum<ElementType>`

程序元素类型。此枚举类型的常量提供了 Java 程序中声明的元素的简单分类。

这些常量与 Target 元注释类型一起使用，以指定在什么情况下使用注释类型是合法的。

ANNOTATION_TYPE
注释类型声明
CONSTRUCTOR
构造方法声明
FIELD
字段声明（包括枚举常量）
LOCAL_VARIABLE
局部变量声明
METHOD
方法声明
PACKAGE
包声明
PARAMETER
参数声明
TYPE
类、接口（包括注释类型）或枚举声明


注解的使用限定的例子：
```java
@Target(ElementType.METHOD)
public @interface MyAnnotation {

    String[] value1() default "abc";
}
```
## 9、在帮助文档中加入注解：

要想在制作JavaDoc文件的同时将注解信息加入到API文件中，可以使用java.lang.annotation.Documented。

在自定义注解中声明构建注解文档：
```java
@Documented
public @interface MyAnnotation {

    String[] value1() default "abc";
}

```

使用自定义注解：
```java
public class AnnotationTest2 {

    @MyAnnotation(value1={"a","b"})
    public void execute(){
        System.out.println("method");
    }
}
```
## 10、在注解中使用继承：

默认情况下注解并不会被继承到子类中，可以在自定义注解时加上java.lang.annotation.Inherited注解声明使用继承。
```java
@Documented>此元注释仅促成从超类继承注释；对已实现接口的注释无效。
