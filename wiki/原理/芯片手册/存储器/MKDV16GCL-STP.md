---
title: MKDV16GCL-STP
type: datasheet
status: needs-review
updated: 2026-09-18
sources: [硬件/原理/芯片手册/存储器.md]
tags: [芯片手册, SD NAND, MKDV16GCL-STP, 宏旺, SDIO, SPI, LGA-8, 贴片SD卡]
---

# MKDV16GCL-STP

## 器件定位

深圳宏旺微电子（MK Founder）`MKDV16GCL-STP`：**SD NAND——LGA-8 贴片封装的 NAND Flash，SDIO/SPI 接口，内置 FTL（坏块管理/磨损均衡/掉电保护）**，即"贴片 SD 卡"。数据/日志存储的免管理方案。SD NAND Product Datasheet（Commercial Grade）Rev 1.1（2023-05-19），共 21 页（p.2）。

- **系列**（p.5）：MKDV08GCL-STP=8 Gbit(960 MB)、MKDV16GCL-STP=**16 Gbit(1850 MB)**、MKDV32GCL-STP=32 Gbit(3696 MB)、MKDV64GCL-STP=64 Gbit(7382 MB)，均 MLC。
- ⚠️ **"16G"=16 Gbit≈2 GB 级，不是 16 GB**——BOM 容量预算必须按 1850 MB 计。

## 关键边界

| 项 | 数值 | 页码 |
|---|---|---|
| VDD | 2.7~3.6 V | p.12 |
| 工作温度 | **-25~+85 ℃**（Commercial Grade 标题与温度并存，未解释） | p.5 |
| 接口 | SD 2.0 兼容 + **SPI Mode**；最高时钟 50 MHz | p.4-5 |
| 速度等级 | C10/U1/V10（顺序读写 MB/s 未给） | p.5 |
| 电流 | 写 30 mA/读 28 mA（3.3 V/25 MHz）；待机 0.25 mA | p.12 |
| 封装 | **LGA-8，6.6×8.0 mm**，厚 0.85 mm nom | p.5/p.20 |
| 寿命 | **P/E 5000 次**（MLC） | p.5 |
| 内置管理 | HW ECC、坏块管理、static/dynamic/global 磨损均衡、垃圾回收、掉电保护 | p.4-5 |

## 设计入口

- **引脚**（p.6/p.20，视觉识别）：1 DAT2、2 DAT3、3 CLK、4 GND、5 CMD、6 DAT0、7 DAT1、8 VDD；**SPI 复用：DAT3→CS、CMD→Data In、DAT0→Data Out**。
- **上电流程**（p.6/p.9）：≥74 dummy clock → CMD0（DAT3 拉低进 SPI）→ ACMD41 轮询 → CID/RCA → CMD7 → ACMD6 选总线宽度；DAT3 片内 50 kΩ 默认上拉（ACMD42 可断开）。
- 参考设计（p.21）：RDAT/RCMD 上拉 10 k~100 kΩ（**1-bit 模式也须上拉 DAT0-3**）；VDD 2.2 µF；CLK 串联电阻 0~120 Ω。
- 选型对比：vs [[wiki/原理/芯片手册/存储器/W25Q16JV|W25Q16JV]]（NOR 2 MB）——数据量级差 1000 倍：固件代码用 NOR+XIP，海量数据/日志用 SD NAND；主控侧走 SDIO（如 [[wiki/原理/芯片手册/主控MCU/K230|K230]] 的 SDxC 接口）或 SPI。
- 掉电保护内置——无需外部超级电容方案，但 **P/E 5000 次（MLC）**，写密集日志场景要估算寿命。

## 待确认

- **手册缺口需向宏旺索取**：顺序读/写实测速度、数据保持年限、ECC 强度、回流焊温度曲线、MSL。
- 引脚/封装尺寸经视觉识别，投产前原图复核。
- p.19 出现第三方品牌字样 "Tailor™ SD hard reset"，照录存疑。

## 相关页面

- [[wiki/原理/芯片手册/存储器/W25Q16JV|W25Q16JV]]
- [[wiki/原理/芯片手册/主控MCU/K230|K230]]
- [[wiki/PCB/主控与数字逻辑模块|主控与数字逻辑模块]]
