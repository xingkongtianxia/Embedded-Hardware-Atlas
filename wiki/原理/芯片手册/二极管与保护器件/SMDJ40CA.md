---
title: SMDJ40CA
type: datasheet
status: reviewed
updated: 2026-08-23
sources: [硬件/原理/芯片手册/二极管与保护器件.md]
tags: [嵌入式硬件, TVS, SMDJ40CA, EMC, 保护]
---

# SMDJ40CA

SMDJ40CA 是 SMDJxxCA 系列双向 TVS，SMC（DO-214AB）封装，40 V 反向工作电压档位，峰值脉冲功率等级为 3000 W（10/1000 μs 条件）。

## 选型与布局

- 双向结构没有单一整流极性；须按被保护节点的正负摆幅、击穿区间和最大钳位电压选型。
- 3000 W 是规定脉冲波形下的峰值能力，不等于持续功率；脉冲重复率、温度和 PCB 散热需要降额。
- 器件应靠近连接器或浪涌入口，回路短而宽，避免保护电流穿过敏感地和信号回流路径。

## 相关页面

- [[wiki/原理/芯片手册/二极管与保护器件/SMF18A|SMF18A]]
- [[wiki/PCB/连接器保护与EMC模块|连接器、保护与 EMC 模块]]
- [[wiki/原理/EMC|EMC]]
