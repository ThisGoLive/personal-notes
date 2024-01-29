# gradle 笔记

## 查看升级的问题

```shell
gradle help --warning-mode=all
gradlew help --warning-mode=all
```
升级时 会判断 当前环境变量 Java_home 与 当前项目的版本需求

## 升级 gradle wapper
```shell
gradlew wrapper --gradle-version 8.1.1
```
# 修改 gradle 本地库路径

# 1 环境变量
```shell
.zshrc .profile
export GRADLE_USER_HOME="$HOME/.java-repository/gradle-repository"
source .zhscr

# 如果不生效

gradle --gradle-user-home=${HOME}/.java-repository/gradle-repository
```shell