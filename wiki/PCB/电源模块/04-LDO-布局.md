---
title: LDO 布局
type: pcb-module
status: reviewed
updated: 2026-08-10
sources: [硬件/PCB/电源模块.md]
tags: [嵌入式硬件, Wiki子主题]
---

# LDO 布局

上级主题： [[wiki/PCB/电源模块|PCB 电源模块]]

- 输入和输出电容分别紧贴 VIN/VOUT 与 GND，形成短回路。
- 按 `(VIN-VOUT)×IOUT` 估算损耗，通过铜皮和热过孔扩散热量。
- 使能、反馈、噪声旁路和输出放电网络远离高速与开关节点。

## 相关页面

- [[wiki/PCB/电源模块|PCB 电源模块]]
- [[wiki/概览|Wiki 概览]]

