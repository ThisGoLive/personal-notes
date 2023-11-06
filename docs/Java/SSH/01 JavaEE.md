[[TOC]]

# 第一章：Java EE 应用

## 1.1 概念

### 1.1.11 Java EE  分层架构

+ 实体层（POJO）：通常意义上的实体bean。
+ 数据访问层（DAO）：对数据库数据的操作。如果细分，这里还可以分为（缓存层、数据持久化）
+ 业务逻辑层（Service）：处理业务逻辑。
+ 控制层（Controller）：控制器来控制相应请求
+ 显示层（View）：直接与用户交互的
+ 模型（model）

一般所说的 **三层架构**：dao service MVC(显示层)

### 1.1.2 model 1

适合简单页面开发，步区分什么 业务 、数据层，将 POJO DAO Service 全部揉在一堆。JSP页面 糅杂了 视图与控制。

### 1.1.3 model 2

### 1.1.4 MVC思想

模型 视图 控制

## 1.2 Java EE技术

### 1.2.1 JSP 与 Servlet

JSP 其实 相当于，是 Servlet 的一个变体。每一个 JSP ，在web容器中都会被转换为一个 Servlet。

### 1.2.2 Struts 2介绍

SSH 经典中的 第一个 "S" 的升级版。但是 与 Struts 的理解上完全是不同的。而且两版的支持也有许多不同，后者支持 除了JSP 外更多。

### 1.2.3 Hibernate

数据持久化自动框架。感觉没什么好介绍的。

### 1.2.4 Spring 

更加步用介绍了。

### 1.2.5 EJB 3.0 介绍

EJB ： 会话 bean （Session Bean）、实体bean （entity Bean）、消息驱动bean （Message Driven Bean）

