# Arch Liunx 安装

可选远程SSH操作：

```shell
systemctl start sshd
passwd
```

### 1. 更新系统时钟

```shell
timedatectl set-ntp true
timedatectl status
```

### 2. 磁盘分区

```shell
fdisk -l
fdisk /dev/sda
```

```shell
#首先将磁盘转换为 gpt 类型
lsblk                       #显示分区情况
parted /dev/sdx             #执行parted，进行磁盘类型变更
(parted)mktable             #输入mktable
New disk label type? gpt    #输入gpt 将磁盘类型转换为gpt 如磁盘有数据会警告，输入yes即可
quit                        #最后quit退出parted命令行交互

# 可以查看 绿色为磁盘剩余
cfdisk /dev/sdx #来执行分区操作,分配各个分区大小，类型
fdisk -l #复查磁盘情况
```

### 3.格式化

```shell
mkfs.ext4  /dev/sdax            #格式化根目录和home目录的两个分区
mkfs.vfat  /dev/sdax            #格式化efi分区
```

### 4.挂载

```shell
mount /dev/sdax  /mnt # 根分区
mkdir /mnt/home
mount /dev/sdax /mnt/home
mkdir /mnt/efi
mount /dev/sdax /mnt/efi
```

### 5.更换国内镜像源加快下载速度

```shell
vim /etc/pacman.d/mirrorlist
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch

vim /etc/pacman.conf
[archlinuxcn]
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinuxcn/$arch
pcaman -S archlinuxcn-keyring 
```

### 6.安装系统

```shell
pacstrap /mnt vim dhcpcd  base base-devel linux linux-firmware
```

```shell
yay --aururl "https://aur.tuna.tsinghua.edu.cn" --save
```

arch linux samba 安装

https://wiki.archlinux.org/title/Samba_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)

[nmbd (samba.org)](https://www.samba.org/samba/docs/current/man-html/nmbd.8.html)

### vmware

https://wiki.archlinux.org/index.php/Installing_Arch_Linux_in_VMware

详细参考上面的链接!

1.安装VMware Tools

pacman -S open-vm-tools open-vm-tools-modules

2.安装gtkmm    

pacman -S gtkmm

3.修复Tools中的60秒BUG

nano /usr/lib/systemd/system/vmtoolsd.service

在[service]项的后面增加一行    KillSignal=SIGKILL

4.使vmware tools开机自启动

cat /proc/version > /etc/arch-release
systemctl start vmtoolsd
systemctl enable vmtoolsd

## 错误 error: runc: signature from "Frederik Schwan

[Docker - Runc PGP Signature Issue - Stack Overflow](https://stackoverflow.com/questions/70442943/runc-pgp-signature-issue)

## 更新失效

```shell
pacman-key --init
pacman-key --populate
pacman-key --refresh-keys
pacman -Sy archlinux-keyring
```