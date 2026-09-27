---
title: USBLC6-2
type: datasheet
status: needs-review
updated: 2026-09-22
sources: [硬件/原理/芯片手册/二极管与保护器件.md]
tags: [芯片手册, ESD, USB, USBLC6-2, 高速接口保护, ST]
---

# USBLC6-2

## 器件定位

ST `USBLC6-2` 是 USB 2.0/高速接口双数据线 ESD 保护器件，Datasheet DS4260 Rev.7（2021-12），提供两路 I/O、VBUS 保护和低电容钳位。

## 关键边界

- I/O-GND 电容最大 3.5 pF，漏电最大 150 nA；手册给出最高 480 Mbit/s 传输适用性。
- 有 SOT-666 `USBLC6-2P6` 与 SOT23-6L `USBLC6-2SC6`；封装后缀必须与嘉立创封装库一致。
- 典型钳位值随 IEC 脉冲电流变化，不能把 12/17 V 试验值直接当作所有系统的固定钳位电压。

## 设计入口

- 放在 Type-C 连接器旁边，D+/D− 经过 I/O，VBUS 接器件的 VBUS 保护节点，GND 直接落地平面。
- ESD 回路的走线电感会显著增加实际钳位电压；连接器到保护器件、保护器件到地的路径应短、直、少过孔。
- 与 [[wiki/原理/芯片手册/二极管与保护器件/BST236A054U|BST236A054U]] 比较，USBLC6-2 电容更高但带 VBUS 保护，适合 USB 口的完整保护拓扑。

## 待确认

- 选择 SC6 或 P6 封装前确认板厂钢网、焊盘和器件库存。
- USB-C 端口仍需独立配置 CC1/CC2 下拉、电源过压/保险丝以及 RP2350 未上电时的 D+/D− 反向供电策略。

## 相关页面

- [[wiki/原理/芯片手册/二极管与保护器件/BST236A054U|BST236A054U]]
- [[wiki/原理/芯片手册/二极管与保护器件/ESD5451N|ESD5451N]]
- [[wiki/PCB/连接器保护与EMC模块|连接器、保护与 EMC 模块]]
