# 自定义事件及监听器

我就喜欢这种自定义类型的。

## 首先了解 需要的类

event object 事件源父类

event listener 监听器

event source 事物

### 自定义事件源

```java
public class FacEentity extends EventObject {
    private static final long serialVersionUID = 3104857515436522399L;
    
    
    public FacEentity(Object arg0) {
	super(arg0);
	
    }
}
```

### 自定义监听器

```java
public interface CreateBeanListenter extends EventListener {

    public void creatEntity(FacEentity ent);
}
```

### 事务载体

```java
public class POJO {

    private Vector<CreateBeanListenter> repository = new Vector<CreateBeanListenter>();  
    
    public void addListenter(CreateBeanListenter cbl) {
	repository.addElement(cbl);
    }
    public void romoveListener(CreateBeanListenter cbl){ 
        repository.remove(cbl); 
    } 
    public void doing() {
	System.out.println("这个POJO在doing");
	Enumeration<CreateBeanListenter> ele = repository.elements();
	for (CreateBeanListenter createBeanListenter : repository) {
	    System.out.println("触发事件");
	    createBeanListenter.creatEntity(new FacEentity(this));
	}
	
    }
}
```

执行:

```java
public class AppTest {
    public static void main(String[] args) {
	POJO myh = new POJO();
	myh.addListenter(new CreateBeanListenter() {
	    
	    @Override
	    public void creatEntity(FacEentity ent) {
			System.out.println("触发该事件！");
	    }
	});
	myh.doing();
    }
}

```

