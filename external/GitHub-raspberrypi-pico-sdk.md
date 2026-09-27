---
title: GitHub Raspberry Pi pico-sdk
type: external-resource
status: needs-review
updated: 2026-09-26
sources: []
tags: [外来资料, GitHub, RP2040, RP2350, SDK, 待核验]
---

# GitHub Raspberry Pi pico-sdk

## 来源身份

- 原始 URL：https://github.com/raspberrypi/pico-sdk
- 作者/机构：Raspberry Pi Ltd
- 是否官方发布：Raspberry Pi 官方 GitHub 仓库
- 版本或发布日期：默认分支 `master`；获取时仓库未归档且持续更新

## 获取记录

- 获取日期：2026-09-26
- 获取方式：GitHub 公共 API 元数据
- 本地文件路径（如有）：无，仅登记资源
- SHA-256（如有）：未下载，无

## 用途与可靠性

- 适用问题：RP2040/RP2350 的 C/C++ SDK、PIO、硬件寄存器封装、构建系统和示例工程。
- 可靠性判断：高（芯片厂商官方 SDK）；适合建立 RP2350 软件基线，但具体芯片步进和 errata 仍需配合数据手册。
- 判断依据：Raspberry Pi 官方仓库，BSD-3-Clause 许可，获取时约 5k stars、1k forks。
- 许可/访问限制：BSD-3-Clause；保留版权与许可声明，工具链和第三方组件按各自许可证执行。

## 可引用边界

- 可以支撑的事实：SDK 目录组织、PIO/硬件 API、CMake 工程入口和官方示例。
- 不能支撑的结论：RP2350 A4 步进供货、封装热能力、板级 SI/PI 或量产 errata 结论。
- 是否允许支撑 Wiki 结论：否，待与本库 RP2350 手册及实板验证交叉核对。
- 相关 Wiki 页面：[[wiki/原理/芯片手册/主控MCU/RP2350|RP2350]]、[[wiki/PCB/主控与数字逻辑模块|主控与数字逻辑模块]]、[[wiki/PCB/高速接口模块|高速接口模块]]。

## 待核验项

- [ ] SDK 版本与 RP2350 A4 步进、工具链版本和目标封装匹配
- [ ] PIO、USB、Flash/XIP 和时钟配置已在目标板实测
- [ ] 引用 SDK 代码时已保留许可证和版本记录

