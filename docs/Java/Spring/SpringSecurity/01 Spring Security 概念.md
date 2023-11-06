

# 1 概念

Spring Security因为是利用了Spring IOC 和AOP的特性而无法脱离Spring独立存在。而Apache Shiro可以独立存在。

Spring security 的功能更多，如 OAuth2.0 、LDAP 、ACL 等等  以及支持 Spring 5.0 新增的 WebFul 功能

## 1.1核心

认证  鉴权   `authentication` `authorization`

无论Spring Security 还是 Apache Shiro 都是 这两个核心 

认证 ： 你是谁

鉴权： 你能做什么

## 1.2 过滤器链

Servlet Web 应用来说 ，非常常用的 Servlet Filter，应为这关系到 一系列的 安全控制。

## 1.3 RBAC 模型

RBAC ： 角色的访问控制（Role-Based Access Control ）

