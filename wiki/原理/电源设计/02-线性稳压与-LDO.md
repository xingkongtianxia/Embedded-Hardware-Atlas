---
title: 线性稳压与 LDO
type: principle
status: reviewed
updated: 2026-08-10
sources: [硬件/原理/电源设计.md]
tags: [嵌入式硬件, Wiki子主题]
---

# 线性稳压与 LDO

上级主题： [[wiki/原理/电源设计|电源设计]]

- LDO 外围简单、噪声低，但功耗近似 `P = (VIN - VOUT) × IOUT`，输入输出压差越大热越严重。
- 必须满足 `VIN(min) > VOUT + Vdropout`，并按有效输出电容和 ESR 范围选择输入/输出电容。
- 反馈、使能、输出放电、反向电流和短路保护取决于具体器件，不能套用通用经验。

## 相关页面

- [[wiki/原理/电源设计|电源设计]]
- [[wiki/概览|Wiki 概览]]

