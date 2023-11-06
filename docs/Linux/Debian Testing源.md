它介于不稳定版和稳定版之间，顺便提一下，我就是从稳定版追过来的，用了挺长的时间了，没发现不稳定，因此，推荐使用。unstable不推荐使用，毕竟是不稳定版，万一出了点什么，也不好解决。测试版是在不稳定版本的基本上建立起来了，相对稳定很多。

**方法一：添加debian testing版本源**  如果安装的是debian stable版，只要喜欢，任何时间都可以将其变成 testing版本，方法很简单，用喜欢的编辑器打开：/etc/apt/source.list 源文件，用#号注释掉之前的源，加入下面的源文件,该源长期有效，因为每个debian版本，都会有testing版本。

## testing 源

deb [http://security.debian.org/](https://links.jianshu.com/go?to=http%3A%2F%2Fsecurity.debian.org%2F) testing/updates main contrib  deb-src [http://security.debian.org/](https://links.jianshu.com/go?to=http%3A%2F%2Fsecurity.debian.org%2F) testing/updates main contrib  deb-src [http://ftp.debian.org/debian/](https://links.jianshu.com/go?to=http%3A%2F%2Fftp.debian.org%2Fdebian%2F) testing-updates main contrib  deb [http://ftp.debian.org/debian/](https://links.jianshu.com/go?to=http%3A%2F%2Fftp.debian.org%2Fdebian%2F) testing-updates main contrib

## 163

deb [http://mirrors.163.com/debian/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.163.com%2Fdebian%2F) testing main non-free contrib  deb [http://mirrors.163.com/debian/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.163.com%2Fdebian%2F) testing-updates main non-free contrib  deb-src [http://mirrors.163.com/debian/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.163.com%2Fdebian%2F) testing main non-free contrib  deb-src [http://mirrors.163.com/debian/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.163.com%2Fdebian%2F) testing-updates main non-free contrib  deb [http://mirrors.163.com/debian-security/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.163.com%2Fdebian-security%2F) testing/updates main non-free contrib  deb-src [http://mirrors.163.com/debian-security/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.163.com%2Fdebian-security%2F) testing/updates main non-free contrib

deb [http://mirrors.163.com/debian](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.163.com%2Fdebian) sid main contrib non-free  deb-src [http://mirrors.163.com/debian](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.163.com%2Fdebian) sid main contrib non-free  deb [http://mirrors.163.com/debian](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.163.com%2Fdebian) experimental main contrib non-free deb-src [http://mirrors.163.com/debian](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.163.com%2Fdebian) experimental main contrib non-free

## 中国官方源镜像

deb [http://mirrors.ustc.edu.cn/debian/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.ustc.edu.cn%2Fdebian%2F) testing main contrib non-free  deb-src [http://mirrors.ustc.edu.cn/debian/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.ustc.edu.cn%2Fdebian%2F) testing main contrib non-free  deb [http://mirrors.ustc.edu.cn/debian/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.ustc.edu.cn%2Fdebian%2F) testing-updates main contrib non-free  deb-src [http://mirrors.ustc.edu.cn/debian/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.ustc.edu.cn%2Fdebian%2F) testing-updates main contrib non-free  deb [http://mirrors.ustc.edu.cn/debian-security/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.ustc.edu.cn%2Fdebian-security%2F) testing/updates main contrib non-free  deb-src [http://mirrors.ustc.edu.cn/debian-security/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.ustc.edu.cn%2Fdebian-security%2F) testing/updates main contrib non-free

[可以选择另外一些源：](https://links.jianshu.com/go?to=https%3A%2F%2Fwww.yangshengliang.com%2Fkaiyuan-shijie%2Flinux-shijie%2F562.html)

#### testing 源

deb [http://security.debian.org/](https://links.jianshu.com/go?to=http%3A%2F%2Fsecurity.debian.org%2F) testing/updates main contrib  deb-src [http://security.debian.org/](https://links.jianshu.com/go?to=http%3A%2F%2Fsecurity.debian.org%2F) testing/updates main contrib  deb-src [http://ftp.debian.org/debian/](https://links.jianshu.com/go?to=http%3A%2F%2Fftp.debian.org%2Fdebian%2F) testing-updates main contrib  deb [http://ftp.debian.org/debian/](https://links.jianshu.com/go?to=http%3A%2F%2Fftp.debian.org%2Fdebian%2F) testing-updates main contrib

#### 163

deb [http://mirrors.163.com/debian/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.163.com%2Fdebian%2F) testing main non-free contrib  deb [http://mirrors.163.com/debian/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.163.com%2Fdebian%2F) testing-updates main non-free contrib  deb-src [http://mirrors.163.com/debian/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.163.com%2Fdebian%2F) testing main non-free contrib  deb-src [http://mirrors.163.com/debian/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.163.com%2Fdebian%2F) testing-updates main non-free contrib  deb [http://mirrors.163.com/debian-security/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.163.com%2Fdebian-security%2F) testing/updates main non-free contrib  deb-src [http://mirrors.163.com/debian-security/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.163.com%2Fdebian-security%2F) testing/updates main non-free contrib

#### 中国官方源镜像

deb [http://mirrors.ustc.edu.cn/debian/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.ustc.edu.cn%2Fdebian%2F) testing main contrib non-free  deb-src [http://mirrors.ustc.edu.cn/debian/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.ustc.edu.cn%2Fdebian%2F) testing main contrib non-free  deb [http://mirrors.ustc.edu.cn/debian/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.ustc.edu.cn%2Fdebian%2F) testing-updates main contrib non-free  deb-src [http://mirrors.ustc.edu.cn/debian/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.ustc.edu.cn%2Fdebian%2F) testing-updates main contrib non-free  deb [http://mirrors.ustc.edu.cn/debian-security/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.ustc.edu.cn%2Fdebian-security%2F) testing/updates main contrib non-free  deb-src [http://mirrors.ustc.edu.cn/debian-security/](https://links.jianshu.com/go?to=http%3A%2F%2Fmirrors.ustc.edu.cn%2Fdebian-security%2F) testing/updates main contrib non-free

**保存源文件，终端下执行：**  sudo apt-get update  sudo apt-get upgrade  sudo apt-get dist-upgrade

系统就开始更新了，等待的时间可能会有点长，取决于网络速度。升级完成后，发现一切都变了,内核从3.16变成4.8了，当然，不止内核，一切都变了,隔一两个星期再执行以上的命令，就会发现，你的debian系统永远是最新的。

**方法二：直接使用testing镜像安装**  下载debian testing版本ISO镜像，刻盘或制作U盘启动工具，就可以安装testing了，推荐使用这种方式进行testing，不需要设置。直接安装就是testing了。  DVD镜像下载地址：[http://cdimage.debian.org/cdimage/weekly-builds/amd64/iso-dvd/](https://links.jianshu.com/go?to=http%3A%2F%2Fcdimage.debian.org%2Fcdimage%2Fweekly-builds%2Famd64%2Fiso-dvd%2F)

**友情提示**：尽管debian testing依然稳定，但是系统从稳定版升级到测试版后，有些软件的依赖会发生变化，可能会导致一些软件无法使用，当然了，这些还是可以解决的，只是有点麻烦，如果不担心这一条，就大胆地升级吧，我是不怕的，你呢?



作者：王贼臣
链接：https://www.jianshu.com/p/38708aeb1252
来源：简书
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。