# KVM 虚拟机配置

## 1 资源

https://gitee.com/ledisthebest/LEDs-single-gpu-passthrough/blob/main/README-cn.md
https://space.bilibili.com/589560036/channel/seriesdetail?sid=2031728
https://wiki.archlinux.org/title/PCI_passthrough_via_OVMF

## 2 系统配置

1. CPU 开启虚拟化
   开启 IOMMU 和虚拟化。通常在 CPU 高级选项里面，AMD 处理器的一般叫 Virtualization Technology 或 AMD-Vi，英特尔的叫 VT-x 或 VT-d。

2. grub 开启
   sudo nvim /etc/default/grub
   amd_iommu=on intel_iommu=on 可视情况添加（修复或导致黑屏）：iommu=pt
   GRUB_CMDLINE_INE_LINUX_DEFAULT=""
   update-grub # 更新配置

3. 重启后

```shell
   dmesg | grep -e DMAR -e IOMMU # 检查
```

找到 amd_IOMMU:Detected 或者 Intel-IOMMU: enabled

4. 运行 iommu.sh。

```bash
#!/bin/bash
shopt -s nullglob
for g in $(find /sys/kernel/iommu_groups/* -maxdepth 0 -type d | sort -V); do
	echo "IOMMU Group ${g##*/}:"
	for d in $g/devices/*; do
		echo -e "\t$(lspci -nns ${d##*/})"
	done
done
```

找到显卡 组

```
IOMMU Group 21:
        24:00.0 VGA compatible controller [0300]: Advanced Micro Devices, Inc. [AMD/ATI] Polaris 20 XL [Radeon RX 580 2048SP] [1002:6fdf] (rev ef)
        24:00.1 Audio device [0403]: Advanced Micro Devices, Inc. [AMD/ATI] Ellesmere HDMI Audio [Radeon RX 470/480 / 570/580/590] [1002:aaf0]

```

```shell
sudo nvim /etc/modprobe.d/vfio.conf
```

```
options vfio-pci ids=1002:6fdf,1002:aaf0
options vfio-pci disable_idle_d3=1
options vfio-pci disable_vga=1
```

## 3 配置一个简单的 KVM 非直接通

软件

```shell
pacman qemu libvirt edk2-ovmf virt-manager dnsmasq ebtables iptables bridge-utils gnu-netcat
```

- qemu
- libvirt 客户端
- virt-manager 界面
- bridge-utils iptables ebtables 网络
- edk2-ovmf uefi 支持 wind 硬盘

服务启动

```shell
sudo systemctl enable libvirtd
sudo systemctl enable virtlogd.socket

sudo systemctl start libvirtd
sudo systemctl start virtlogd.socket
```

启用虚拟网络

```shell
sudo virsh net-start default
sudo virsh net-autostart default
```

### 3.1 virt-manager 配置与使用

~/Downloads/system-collection/

选择硬盘注意设置路径
/var/lib/libvirt/images/pool/
新增卷 格式 qcow2, raw 为整个磁盘直通

在安装前自定义配置

1. 概况-芯片组 q35 新的
2. 概况-固件 uefi edk2 ovmf-code.fd
3. cpu 型号 passthrough
4. cpu 拓扑 调节字 1
5. 引导 选择磁盘
6. 磁盘 1 virtio
7. 添加硬件 存储 virtio-win-pkg-scripts 设备类型 cdrom
8. 安装时需要选择 磁盘驱动 virtio amd64/xx/viostor.inf nvtkjm.inf

添加 usb usb host is not a valid device model name

```shell
sudo pacman -S qemu-hw-usb-host
```

共享文件设置 开启内存 shared memory 添加硬件

[wind 增强 ](https://github.com/virtio-win/virtio-win-pkg-scripts)

普通用户无法访问 virt-manager https://zhuanlan.zhihu.com/p/28307813
virsh net-start default virsh net-autostart default

Network not found: no network with matching name 'default' # https://www.cnblogs.com/jottings/p/11831413.html
virsh net-list --all 没有 检查/usr/share/libvirt/networks/目录下有没有 default.xml 文件
普通用户无法访问 virt-manager https://zhuanlan.zhihu.com/p/28307813
virt-manager 中网络有相关

## 半虚拟化 VirtIO

https://boke.wsfnk.com/archives/987.html

## 4 显卡直通配置

### 4.1 AMD 单显卡直通

#### 4.1.1 下载显卡的 VGA BIOS

显卡信息
https://www.cnblogs.com/mxjy/p/17593902.html

```shell
 lspci | grep -i vga
 cd /sys/bus/pci/devices/0000:xxx/
```

#### 4.1.2 配置脚本

```shell
sudo mkdir /etc/libvirt/hooks
sudo mv qemu vfio-startup.sh vfio-teardown.sh /etc/libvirt/hooks
cd !$

sudo chmod +x /etc/libvirt/hooks/*

sudo ln -s /etc/libvirt/hooks/vfio-startup.sh /bin/vfio-startup.sh
sudo ln -s /etc/libvirt/hooks/vfio-teardown.sh /bin/vfio-teardown.sh
```

qemu

```bash
#!/bin/bash

OBJECT="$1"
OPERATION="$2"

if [[ $OBJECT == "win10_ltsc" ]] || [[ $OBJECT == "win7" ]]; then
	case "$OPERATION" in
        	"prepare")
                systemctl start libvirt-nosleep@"$OBJECT"  2>&1 | tee -a /var/log/libvirt/custom_hooks.log
                /bin/vfio-startup.sh 2>&1 | tee -a /var/log/libvirt/custom_hooks.log
                ;;

            "release")
                systemctl stop libvirt-nosleep@"$OBJECT"  2>&1 | tee -a /var/log/libvirt/custom_hooks.log
                /bin/vfio-teardown.sh 2>&1 | tee -a /var/log/libvirt/custom_hooks.log
                ;;
	esac
fi
```

防止宿主系统休眠

```shell
sudo vim /etc/systemd/system/libvirt-nosleep@.service
sudo chmod 644 -R /etc/systemd/system/libvirt-nosleep@.service
```

```
[Unit]
Description=Preventing sleep while libvirt domain "%i" is running

[Service]
Type=simple
ExecStart=/usr/bin/systemd-inhibit --what=sleep --why="Libvirt domain \"%i\" is running" --who=%U --mode=block sleep infinity
```

#### 4.1.3 虚拟机配置

```shell
sudo systemctl restart libvirtd
```

配置 qemu 虚拟机

打开虚拟机管理器，把显卡的所有 pci 部分都添加到虚拟机里面。
启用 XML 编辑, 在显卡的所有 pci 设备里面, 在`</source>`之后添加:`<rom bar="on" file="/path/to/patched.rom"/>`

显示协议 串口 信道 显卡
把信道，usb 转接，显卡 qxl,触摸板那些东西删掉

添加你的 USB 设备，比如鼠标、键盘和 USB 耳机。

```xml
  <features>
    <acpi/>
    <apic/>
    <hyperv mode="custom">
      <relaxed state="on"/>
      <vapic state="on"/>
      <spinlocks state="on" retries="8191"/>
      <vendor_id state='on' value='randomid'/>
    </hyperv>
    <kvm>
      <hidden state='on'/>
    </kvm>
  </features>
```
AMD CPU需要配置
```xml
<cpu mode='host-passthrough' check='none'>
 <feature policy='require' name='topoext'/>
 </cpu>

```

```shell
virsh shutdown xxx
```

#### 4.1.4 配置Libvirt

启动管理器 不需要密码

```shell
# 查看用户组 发现libvirt
cat /etc/group

sudo nvim /etc/libvirt/libvirtd.conf
# unix_sock_group = "libvirt"
# unix_sock_rw_perms = "0770"

sudo nvim /etc/libvirt/qemu.conf
# 把 #user = "xx" 改成 user = "yourusername",
# #group = "root" 改成 group = "libvirt"

# 把自己添加到libvirt组里面：
sudo usermod -a -G libvirt 用户名
```

## 5 去虚拟化

### 5.1 hyperv 全面 但是性能低

```xml
    <hyperv mode="custom">
      <relaxed state="on"/>
      <vapic state="on"/>
      <spinlocks state="on" retries="8191"/>
      <vendor_id state='on' value='randomid'/>

      <vpindex state="on" />
      <runtime state="on" />
      <synic state="on" />
      <stimer state="on" />
      <reset state="on" />
      <frequencies state="on" />
      <reenlightenment state="on" />
      <tlbflush state="on" />
      <ipi state="on" />
      <evmcs state="off" />
    </hyperv>
```
需要开启 hyper-v
### 5.2 cpu 检测cpu

```xml
  <cpu mode="host-passthrough" check="none" migratable="on">
    <topology sockets="1" dies="1" cores="8" threads="2"/>
    <feature policy='disable' name='hypervisor'/>
  </cpu>
```

## 6 问题

### 6.1 直通虚拟机关机后 宿主机无响应
https://wiki.archlinux.org/title/PCI_passthrough_via_OVMF#Host_lockup_after_virtual_machine_shutdown
