## 配置文件

Git 使用一系列配置文件来保存你自定义的行为。

它首先会查找 /etc/gitconfig 文件，该文件含有系统里每位用户及他们所拥有的仓库的配置值。 如果你传 递 --system 选项给 git config ，它就会读写该文件。

接下来 Git 会查找每个用户的 ~/.gitconfig 文件（或者 ~/.config/git/config 文件）。你 可以传递--global 选项让 Git 读写该文件。

最后 Git 会查找你正在操作的版本库所对应的 Git 目录下的配置文件（.git/config）。这个 文件中的值只对该版本库有效。

以上三个层次中每层的配置（系统、全局、本地）都会覆盖掉上一层次的配置，所以 .git/config 中的值会覆盖掉/etc/gitconfig 中所对应的值

`全局配置文件`与`局部配置文件`

全局配置文件 ： 一般在用户的目录下。`C:\Users\Administrator\.gitconfig`

局部配置文件 : 项目中 `.git` 目录下的 `config`文件。 `D:\netctoss\NetCTOSS\.git\config`

## 命令行基本操作

## 使用 GitHub

### 克隆项目

HTTPS : 直接使用，克隆下来后每次提交记录都需要进行 账号密码验证。

需要局部配置 项目中 `.git` 目录下的 `config`文件修改。

```shell
# 对应项目下的 打开控制台
git config --global --list # 查看 config 配置

git config --global user.name "user" # 设置用户名
git config --global user.email email@qq.com # 设置邮箱
git config user.name # 显示用户名
```

例如

```shell
[user]
	name = xiaoming678
	email = 37787710+xiaoming678@users.noreply.github.com
	pass
	# 具体 账户 与邮箱
[core]
	repositoryformatversion = 0
	filemode = false
	bare = false
	logallrefupdates = true
	symlinks = false
	ignorecase = true
[submodule]
	active = .
[remote "origin"]
	url = https://github.com/NetCTOSSteam/NetCTOSS.git
	fetch = +refs/heads/*:refs/remotes/origin/*
[branch "feture"]
	remote = origin
	merge = refs/heads/feture

```

SSH ： 在起初 克隆到本地 之前，就需要配置与添加好 SSH key，故而必须为该项目的管理员拥有着。而且每次 fetch 与 push 不要账号与密码。The target The whole stack

## 版本冲突 及解决

在中心库有修改时，本地没有对新增修改的版本同步，而本地提交到本地库完成，而无法提交到中心库 导致版本 不同步！

### 命令行

### UI 操作

直观便捷，自动会将各个版本环存，可以手动合并，自动合并

## 搭建 Git 仓库

### 首选，使用`docker`容器进行：

#### gitblit

```shell

docker run -d --name=gitblit -p 8100:8080 -p 8143:8443 -p 9418:9418 -p 29418:29418 -e "JAVA_OPTS=-Xmx512m" -v /srv/gitblit:/opt/gitblit-data jacekkow/gitblit

docker run -d --name=gitblit -p 8100:8080 -v /srv/gitblit:/opt/gitblit-data jacekkow/gitblit

 # 默认 admin admin
```

内存耗用约：0.7G

使用 gitblit 镜像，在虚拟机挂起后，出现了这个错误：

不能使用构造函数实例化页面公共 com.gitblit.wicket.pages.CommitPage(org.apache.wicket.PageParameters)和参数 r =“~ guoli1 /测试”h =“223 a925eb0864e642d60299e2aa05996c1a13576”

#### 使用 gitlab 搭建

```shell
sudo docker run --detach \
	--hostname gitlab.example.com \
	--publish 8106:80 --publish 8122:22 \
	--name gitlab \
	--restart always \
	--volume /srv/gitlab/config:/etc/gitlab \
	--volume /srv/gitlab/logs:/var/log/gitlab \
	--volume /srv/gitlab/data:/var/opt/gitlab \
	gitlab/gitlab-ce:11.8.1-ce.0
```

| Local location       | Container location | Usage                                      |
| -------------------- | ------------------ | ------------------------------------------ |
| `/srv/gitlab/data`   | `/var/opt/gitlab`  | For storing application data               |
| `/srv/gitlab/logs`   | `/var/log/gitlab`  | For storing logs                           |
| `/srv/gitlab/config` | `/etc/gitlab`      | For storing the GitLab configuration files |

搭建好，需要设置账号密码

但对于个人来说，太耗费性能，启动后约用 2.4 G 内存。

## git 删除历史文件

https://www.jianshu.com/p/03bf1bc1b543

```shell
pip install git-filter-repo

git filter-repo --path-glob pnpm-lock.yaml --invert-paths --force
git push --all --force
```
