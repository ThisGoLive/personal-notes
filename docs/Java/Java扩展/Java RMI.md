[����](https://www.cnblogs.com/xt0810/p/3640167.html)

�����룺Զ�̵Ĺ����ӿ� ���� �̳�Remote��ǽӿ�

��������ˣ�

```java
public class Entry {
     public static void main(String []args) throws AlreadyBoundException, RemoteException{
         UserManagerImp userManager = new UserManagerImp();
         UserManagerInterface userManagerI =(UserManagerInterface)UnicastRemoteObject.exportObject(userManager,0);
        // ����Զ�̽ӿڷ������õ� �˿�
        Registry registry = LocateRegistry.createRegistry(2004);
        // �˿ڽ�ֵ
        registry.rebind("userManager", userManagerI);
         
        }
 }
```

�ͻ���ȡֵ��

```java
public static void main(String []args){
         
         try {
             Registry registry = LocateRegistry.getRegistry("localhost",2004);
             UserManagerInterface userManager = (UserManagerInterface)registry.lookup("userManager");

         } catch (RemoteException e) {
             e.printStackTrace();
         } catch (NotBoundException e) {
             e.printStackTrace();
         }         
}
```

