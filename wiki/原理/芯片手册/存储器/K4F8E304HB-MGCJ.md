---
title: K4F8E304HB-MGCJ
type: datasheet
status: needs-review
updated: 2026-09-18
sources: [硬件/原理/芯片手册/存储器.md]
tags: [芯片手册, DRAM, LPDDR4, K4F8E304HB-MGCJ, Samsung, 三星, 200-FBGA]
---

# K4F8E304HB-MGCJ

## 器件定位

三星 `K4F8E304HB-MGCJ`：**8 Gbit x32 LPDDR4 SDRAM**——SoC 运行内存（配套 K230 等 RISC-V/视觉 SoC）。规格书 Rev 1.0（2016-06-27，Final），共 85 页（p.1-2）。立创商城料号 C2803257。

- **料号解析**（p.8）：K4=三星；F=LPDDR4；8E=8 Gb（8K/32 ms 刷新）；30=x32（2 CS/2 CKE）；4=8 Bank；H=LVSTL_11；B=第 3 代；M=200-FBGA；G=-25~85 ℃；CJ=0.536 ns@RL32、tRCD18 ns、tRP18 ns。
- **组织**（p.7/p.13-14）：8 Gb = 32 Mb×16 DQ×8 Bank×**2 独立通道**（每通道 4 Gb x16）；行 15 bit、列 10 bit。封装 **200-ball FBGA** 10.00×15.00 mm、0.65 mm 球距（p.9）。

## 关键边界

| 项 | 数值 | 页码 |
|---|---|---|
| 电源 | **三电源**：VDD1=1.8 V（核）、VDD2=1.1 V（核2）、VDDQ=1.1 V（IO） | p.41-42 |
| 绝对最大 | VDD1 -0.4~2.1 V；VDD2/VDDQ -0.4~1.5 V；存储 -55~125 ℃ | p.40 |
| 速度等级 CJ | **最高 3733 Mbps**（tCK=0.536 ns 即 1866 MHz），向后兼容 3200 Mbps | p.8/p.71 |
| 关键时序 | RL=32 tCK、WL=16 tCK；tRCD=Max(18 ns,4tCK)、tRPab=Max(21 ns,4tCK)、tRAS=Max(42 ns,3tCK)、tFAW=40 ns | p.71-72 |
| 刷新 | **tREFI=3.906 µs**（8192 条/32 ms）；tRFCab=180 ns、tRFCpb=90 ns | p.70 |
| 温度 | TOPER -25~85 ℃（Standard） | p.41-42 |
| ZQ 校准 | **外接 240 Ω±1% 到 VDDQ** | p.12 |

## 设计入口

- **接口**（p.13/p.25-36）：**6-bit CA 总线（CA[5:0]）**（1/2/4 时钟周期 SDR 命令；p.11 又称 DDR，自相矛盾照录）；ODT 经 MR11（DQ/CA 独立，RZQ÷1~÷6）；FSP（MR13）两套 VREF/频率组快速切换；**CBT 命令总线训练复位后必做**。
- **上电初始化**（p.14-15/p.31-36）：Reset_n 拉低上电 → 释放 → MPC Training（FIFO/Read DQ 校准、**ZQ CAL**、CBT、Write Leveling、VREF 训练）→ MRW/MRR。模式寄存器 **MR0-MR63**（MR4 刷新率、MR11 ODT、MR12/MR14 VREF、MR13 CBT/FSP）。
- 搭配 [[wiki/原理/芯片手册/主控MCU/K230|K230]]（双通道 16 bit LPDDR4 @3200 Mbps、最大 2 GB）——两颗并单通道或单颗 x32 组双通道按板况定。
- **布局警告**：本手册无 PCB 布局/等长/阻抗章节（仅封装 ballout p.9-10）——**LPDDR4 布局规范需另行索取三星应用笔记**，等长/拓扑/参考平面按 [[wiki/原理/叠层阻抗|叠层与阻抗]] 与 [[wiki/PCB/高速接口模块|高速接口模块]] 方法论自建约束。

## 待确认

- >85 ℃ 高温刷新分档（1/2-rate、1/4-rate）提取不清晰，需视觉复核 p.70 表。
- CA 总线 SDR/DDR 两种表述矛盾（p.13 vs p.5/p.11），以命令定义文档核对。
- 免责（p.1）：三星保留不经通知变更权利、"AS IS"、禁生命支持/医疗/军用。

## 相关页面

- [[wiki/原理/芯片手册/主控MCU/K230|K230]]
- [[wiki/原理/芯片手册/存储器/W25Q16JV|W25Q16JV]]（配套启动 Flash）
- [[wiki/PCB/高速接口模块|高速接口模块]]
