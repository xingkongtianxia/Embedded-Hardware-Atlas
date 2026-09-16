---
title: PDN 模型
type: principle
status: reviewed
updated: 2026-08-10
sources: [硬件/原理/PI.md]
tags: [嵌入式硬件, Wiki子主题]
---

# PDN 模型

上级主题： [[wiki/原理/PI|PI（电源完整性）]]

- 电源分配网络由稳压器、走线/平面、过孔、封装、去耦电容和芯片内部电容组成；任一段高阻抗都可能成为噪声源。
- 目标阻抗 `Ztarget = ΔVallow / ΔIstep`，要求 PDN 在负载瞬态涉及的频段内低于目标阻抗。
- 低频主要由稳压器控制，中频由大容量电容和局部平面承担，高频由小封装低 ESL 去耦和芯片内部电容承担。

## 相关页面

- [[wiki/原理/PI|PI（电源完整性）]]
- [[wiki/概览|Wiki 概览]]

