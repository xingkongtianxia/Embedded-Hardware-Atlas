---
title: GitHub PX4 Autopilot
type: external-resource
status: needs-review
updated: 2026-09-26
sources: []
tags: [外来资料, GitHub, 无人机, 飞控, STM32, 待核验]
---

# GitHub PX4 Autopilot

## 来源身份

- 原始 URL：https://github.com/PX4/PX4-Autopilot
- 作者/机构：PX4 project / Dronecode community
- 是否官方发布：项目官方 GitHub 仓库
- 版本或发布日期：默认分支 `main`；获取时仓库未归档且持续提交

## 获取记录

- 获取日期：2026-09-26
- 获取方式：GitHub 公共 API 元数据
- 本地文件路径（如有）：无，仅登记资源
- SHA-256（如有）：未下载，无

## 用途与可靠性

- 适用问题：无人机飞控架构、传感器融合、任务/姿态控制、板级支持包和仿真验证流程。
- 可靠性判断：高（成熟开源项目）；BSD-3-Clause 许可，但具体模块、硬件目标和依赖仍需逐项核对。
- 判断依据：官方项目仓库，获取时约 12k stars、16k forks，长期维护。
- 许可/访问限制：BSD-3-Clause；保留版权、许可和免责声明，商用集成需核对依赖许可及安全责任。

## 可引用边界

- 可以支撑的事实：飞控软件分层、驱动/估计器/控制器接口、仿真与硬件抽象的组织方式。
- 不能支撑的结论：你的具体 PCB 走线、器件选型、飞行安全认证或 3S 功率级放行结论。
- 是否允许支撑 Wiki 结论：否，待核验后再决定。
- 相关 Wiki 页面：[[wiki/原理/芯片手册/主控MCU/STM32F405RG|STM32F405RG]]、[[wiki/原理/芯片手册/主控MCU/STM32F407VG|STM32F407VG]]、[[wiki/PCB/主控与数字逻辑模块|主控与数字逻辑模块]]、[[wiki/PCB/轮趣无刷四驱PCB设计审查|轮趣无刷四驱 PCB 设计审查]]。

## 待核验项

- [ ] 目标飞控板的 MCU、传感器和 PWM/定时器资源与项目硬件匹配
- [ ] 许可证和第三方依赖清单满足项目发布要求
- [ ] 仿真结果已通过实机台架和失效保护测试

