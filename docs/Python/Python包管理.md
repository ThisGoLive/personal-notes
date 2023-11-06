
## linux 环境
实际环境 不能使用 pip 安装，而需要使用 Linux的包管理进行下载
python -m venv python版本

## PIP

```shell
# pip install 时指定源
 pip install numpy -i http://pypi.douban.com/simple/ --trusted-host pypi.douban.com

pip config set global.index-url http://pypi.douban.com/simple
https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple/
https://pypi.tuna.tsinghua.edu.cn/simple/
```

[镜像](https://zhuanlan.zhihu.com/p/544490001)

## 三方库的加载

在查看别人的Python项目时，经常会看到一个`requirements.txt`文件，里面记录了当前程序的所有依赖包及其精确版本号。这个文件有点类似与Rails的`Gemfile`。其作用是用来在另一台PC上重新构建项目所需要的运行环境依赖。

requirements.txt可以通过`pip`命令自动生成和安装

生成requirements.txt文件

```python
pip freeze > requirements.txt
# or
pip install pipreqs
pipreqs . --encoding=utf-8 --force
```

安装requirements.txt依赖

```python
pip install -r requirements.txt
pip install --upgrade -r requirements.txt
```

## 三方库

### 1. Faker

项目开发初期，为了测试方便，我们总要造不少假数据到系统中，尽量模拟真实环境。比如要创建一批用户名，创建一段文本，电话号码，街道地址、IP地址等等。平时我们基本是键盘一顿乱敲，随便造个什么字符串出来，当然谁也不认识谁。现在你不要这样做了，用Faker就能满足你的一切需求。

```shell
 pip install faker
 conad install faker
```

```python
from faker import Faker
fake = Faker(locale='zh_CN') # zh_TW en_US
fake.name()
```

[faker 常用函数](https://www.jianshu.com/p/6bd6869631d9)

### 2. FuzzyWuzzy

相似度比较
