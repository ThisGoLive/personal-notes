```shell
# 卸载本地 Java
sudo apt-get purge openjdk*
# sdkman 管理Java
curl -s "https://get.sdkman.io" | bash
export SDKMAN_DIR="/usr/local/sdkman"
# 激活
source ~/.sdkman/bin/sdkman-init.sh

sudo apt install shadowsocks-libev
# Edit the configuration file
sudo vim /etc/shadowsocks-libev/config.json

# Edit the default configuration for debian
sudo vim /etc/default/shadowsocks-libev

# Start the service
sudo /etc/init.d/shadowsocks-libev start    # for sysvinit, or
sudo systemctl start shadowsocks-libev      # for systemd
```
