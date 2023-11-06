[[TOC]]

# Anaconda3

[Anaconda3 安装使用](https://www.jianshu.com/p/026a2c43b081)

## 设置源

查看

```shell
conda config --show-sources
```

设置

```shell
# 设置搜索时显示通道地址
conda config --set show_channel_urls yes

conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free

https://mirrors.aliyun.com/pypi/simple/
https://pypi.mirrors.ustc.edu.cn/simple/

# 清华源
    conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/conda-forge 
    conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/msys2
    conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/pytorch/
    conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/r
    conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free
    conda config --add channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main

# 中科源
    conda config --add channels https://mirrors.ustc.edu.cn/anaconda/pkgs/main/
    conda config --add channels https://mirrors.ustc.edu.cn/anaconda/pkgs/free/
    conda config --add channels https://mirrors.ustc.edu.cn/anaconda/cloud/conda-forge/
    conda config --add channels https://mirrors.ustc.edu.cn/anaconda/cloud/msys2/
    conda config --add channels https://mirrors.ustc.edu.cn/anaconda/cloud/bioconda/
    conda config --add channels https://mirrors.ustc.edu.cn/anaconda/cloud/menpo/
The channel is not accessible or is invalid.

# 恢复使用默认的 源
conda config --remove-key channels 
```

删除

```shell
conda config --remove channels https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free
```

## 构建 python 开发环境

构建一个 python 38

```shell
# python38 为环境名称  python=3.8 为 python的 版本
conda create -n python38 python=3.8

# 指定按照位置
conda create --prefix ./env python=
```

显示环境

```shell
conda env list #  * 即为当前环境，base 为 默认的环境

base                  *  E:\SoftwareDevelopment\Anaconda3
TestCode                 E:\SoftwareDevelopment\Anaconda3\envs\TestCode
python38                 E:\SoftwareDevelopment\Anaconda3\envs\python38
```

进入 环境

```shell
conda activate(激活) python38
# CommandNotFoundError: Your shell has not been properly configured to use 'conda activate'.
# windows 中， 使用 powershell 会报上面的错
# 执行：get-ExecutionPolicy，回复Restricted，表示状态是禁止的
# cmd 中却没有问题
# conda init powershell ,再打开 出现无法加载文件 
# 以管理员身份运行PowerShell set-ExecutionPolicy RemoteSigned
# (python38) PS C:\WINDOWS\system32>
```

退出环境

```shell
conda deactivate
```

删除环境

```shell
conda env remove -n xxx环境名称
```

## 更新

```shell
conda update conda 
conda update anaconda
conda update python
conda update --all
```

```cmd
conda install python = $python version$`
其中，`$python version$`替换为主版本号，如：`3.8
```

出现错误 

> SSLError(MaxRetryError('HTTPSConnectionPool(host=\'repo.anaconda.com\', port=443): Max retries exceeded with url: /pkgs/free/win-64/repodata.json.bz2 (Caused by SSLError("Can\'t connect to HTTPS URL because the SSL module is not available."))'))

需要下载 [openssl](https://slproweb.com/products/Win32OpenSSL.html)

如果没有安装，这也可能导致 python  报同样的错误

## 无法使用Anaconda Python导入sqlite3

在执行程序之前，请在shell中输入`conda activate`。

# miniconda

[Conda &mdash; conda documentation](https://docs.conda.io/en/latest/)

conda install Anaconda-Navigator

conda config --set auto_activate_base false
