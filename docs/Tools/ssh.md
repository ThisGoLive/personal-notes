# SSH

## 创建密钥对

```shell
# 算法
ssh-keygen -t ed25519 -C "Gitee SSH Key"
# 保存路径
# passphrase 类似增加一次密码
```

生成的文件有 pub 就是公钥

## SSH git 

```shell
ssh -i privateKeyPath -T git@gitee.com
```

.git/config

```config
[remote "gitee"]
	url = git@gitee.comxx:xx/xx.git
```

.ssh/config

```config
Host gitee.comxx
  HostName gitee.com
  IdentityFIle ~/.ssh/xx
  User git

```

## SSH Remote Server

.ssh/known_hosts

服务器 
公钥存储位置 .ssh

禁用密码 
```shell
vim /etc/ssh/sshd_config
vim /etc/ssh/sshd_config.d/xx.conf
```

PasswordAuthentication no
PubkeyAuthentication yes