---
title: GitHub SimpleFOC Arduino-FOC
type: external-resource
status: needs-review
updated: 2026-11-28
sources: []
tags: [外来资料, GitHub, FOC, BLDC, 电机控制]
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


## 2026-11-28 版本定位与阅读增量

- 仓库：`simplefoc/Arduino-FOC`；本轮API读取默认分支 `master`，取得commit `b3d8f3931342ae68a980d0140e24b9048eba098b`；当时未归档。
- 固定入口：[README](https://github.com/simplefoc/Arduino-FOC/blob/b3d8f3931342ae68a980d0140e24b9048eba098b/README.md)；[提交](https://github.com/simplefoc/Arduino-FOC/commit/b3d8f3931342ae68a980d0140e24b9048eba098b)。
- 元数据许可标识：`MIT`，仍须逐组件核对。旧获取记录与Star数量保留为2026-09-26历史快照，不用作当前质量或活跃性证明。
- 本轮获取：仓库元数据、commit和该版本README正文；未克隆、编译、运行或连接目标板。

从README的Arduino code example读初始化与循环，区分motor.loopFOC()和motor.move()的职责；沿文档链接再查目标MCU的采样、PWM和驱动限制。只读示例不能保证本机实时性。

使用 [[external/GitHub检索与版本化阅读]] 记录文件、Issue/PR、环境与验证范围；回到 [[external/开放学习与外部查证导航]] 比较本地条件。具体硬件结论及原待核验项不因本轮登记而关闭。

### 讨论证据走查：PR 506

[PR 506](https://github.com/simplefoc/Arduino-FOC/pull/506)由固定版本README链接发现。本轮API确认其在2026-02-07合并，合并commit为 `aaf0b28d7b208c36309708c84981124989adfba3`。API记录该PR目标分支基线为 `60701490dd73e1caace24548fe07fb7b83d4d328`；本轮未核对提交祖先关系、后续revert或发行包是否包含该改动。

作者说明在注入ADC转换同时增加规则通道读取，但仍轮询、阻塞、无DMA，不宜高频调用；测试自述限F4/G4，其他板未测。其约20μs与analogRead约60μs以上是作者报告，未提供本库测量，不能移植成本板保证值。

走查结论：这提供了“是否阻塞、采样会否干扰、目标平台是否覆盖”的待查问题；本轮未读完整评审/代码差异或复现性能，不能称为已验证的优化方案。
