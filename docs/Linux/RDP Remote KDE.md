https://docs.kde.org/stable5/en/krdc/krdc/using-krdc.html

https://wiki.archlinux.org/title/Xrdp_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)

XRDP
http://c-nergy.be/blog/?p=6717

install
yay -S xrdp
sudo systemctl enable xrdp 
sudo systemctl start xrdp 

archlinux 
xorgxrdp-git
/etc/xrdp/xrdp.ini 配置文件

KDE
echo startkde >~/.xsession

xfce
echo xfce4-session >~/.xsession