---
title: GitHub SimpleFOC Arduino-FOC
type: external-resource
status: needs-review
updated: 2026-09-26
sources: []
tags: [外来资料, GitHub, FOC, BLDC, 电机控制, 待核验]
---

# GitHub SimpleFOC Arduino-FOC

## 来源身份

- 原始 URL：https://github.com/simplefoc/Arduino-FOC
- 作者/机构：SimpleFOC project community
- 是否官方发布：项目官方 GitHub 仓库
- 版本或发布日期：默认分支 `master`；获取时 API 返回仓库活跃、未归档

## 获取记录

- 获取日期：2026-09-26
- 获取方式：GitHub 公共 API 元数据
- 本地文件路径（如有）：无，仅登记资源
- SHA-256（如有）：未下载，无

## 用途与可靠性

- 适用问题：BLDC/PMSM 与步进电机 FOC 的控制结构、传感器/无感接口、Arduino 原型验证。
- 可靠性判断：中高；仓库活跃，MIT 许可，示例和库代码适合原型与学习，不替代芯片数据手册或安全关键量产验证。
- 判断依据：仓库公开源码、示例、文档和持续维护记录；获取时约 3k stars、700+ forks。
- 许可/访问限制：MIT；保留版权和许可声明，第三方依赖按其各自许可证执行。

## 可引用边界

- 可以支撑的事实：FOC 软件接口组织、控制环路示例、支持的电机/传感器抽象和原型验证路径。
- 不能支撑的结论：你的 FD6288Q/AON7544 功率级额定值、热设计、EMC、实时性上限或量产安全性。
- 是否允许支撑 Wiki 结论：否，待结合本库分类来源和实测后再决定。
- 相关 Wiki 页面：[[wiki/PCB/轮趣无刷四驱PCB设计审查|轮趣无刷四驱 PCB 设计审查]]、[[wiki/PCB/电源模块|电源模块]]、[[wiki/综合/硬件设计审查框架|硬件设计审查框架]]。

## 待核验项

- [ ] 当前版本与目标 MCU/定时器、PWM 频率和采样同步策略匹配
- [ ] 与 FD6288Q 栅极驱动、分流采样和保护策略的接口已在实板验证
- [ ] 若用于量产，已补充故障停机、过流、过温和回馈工况测试

