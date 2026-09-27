---
title: TL8189FQA
type: datasheet
status: needs-review
updated: 2026-09-18
sources: [硬件/原理/芯片手册/蓝牙与无线.md]
tags: [芯片手册, WiFi模块, TL8189FQA, RTL8189FTV, SDIO, Trolink, 创凌智联, 802.11n]
---

# TL8189FQA

## 器件定位

深圳创凌智联（TROLINK）`TL8189FQA`：**IEEE 802.11 b/g/n 2.4 GHz 1T1R WiFi 模块**（SDIO 接口），**主控 Realtek RTL8189FTV**（单芯片 WLAN MAC/BB/RF）。SDIO Product Specification，封面无版本号与日期（p.1）。LGA/半孔模组 14 pin，13.99×12.50×1.6 mm（p.6）。

## 关键边界

| 项 | 数值 | 页码 |
|---|---|---|
| 接口 | SDIO 1.1/2.0，**时钟最高 100 MHz**；另支持 GSPI | p.3 |
| 电源 | VDD33 3.0/3.3/3.6 V；**IDD33 最大 600 mA**（未分模式） | p.4 |
| VIO | 1.62~3.3 V（3.3 V：VIH≥2.0 V/VIL≤0.9 V） | p.4 |
| 11b | 1~11 Mbps，TX **17±2 dBm**、RX -85 dBm@8% PER | p.5 |
| 11g | 6~54 Mbps，TX 14±2 dBm、RX -70 dBm@10% PER | p.5 |
| 11n HT20 | MCS0-7，TX 13±2 dBm、RX -65 dBm@10% PER、短 GI 400 ns | p.5 |
| 温度 | **工作 -10~+70 ℃（非工业级）** | p.10 |
| 装配 | 烘烤 90 ℃ 12-24 h；回流峰值 **245+0/-5 ℃** | p.9/p.11 |

- **矛盾照录**：11n 速率 p.5 标 65 Mbps、p.3 特性表标 72.2 Mbps PHY（短 GI）——两处不一致。
- 频偏 ±13 ppm（p.5）；信道 US 1-11/EU 1-13/JP 1-14（p.4）。

## 设计入口

- **引脚**（p.8，视觉识别）：1 SDIO_CMD、2-5 SDIO_D3/D2/D1/D0、6 SDIO_CLK、7/8/14 GND、9 WL_ANT（天线焊盘，50 Ω）、10 WAKE、11 VIO、12 VCC_3V3、13 CS（power down）。**p.4 DC 表的 CS=PIN#12/WL_HOST_WAKE=PIN#13 与 p.8 引脚表矛盾，照录。**
- **布局**（p.8）：RF 走线 50 Ω、禁 90° 拐角、线长 ≤20 mm；天线端建议 TVS（参考 GESD1005H150CR10GPT + 2 nH + 1.8/2.2 pF 匹配）——ESD 器件选型参考 [[wiki/原理/芯片手册/二极管与保护器件/BST236A054U|BST236A054U]]（低容高速款）。
- 核内电压由内部 LDO 生成（p.7）——单 3.3 V 供电即可，但 **600 mA 峰值预算**要留够。
- 分工：WiFi 数据量大的场景用本模块（SDIO）；BLE 透传/低功耗用 [[wiki/原理/芯片手册/无线通信/KT6368A|KT6368A]]（UART 蓝牙）；外置天线引出用 [[wiki/原理/芯片手册/无线通信/BWIPX-1-001E|BWIPX-1-001E]]（IPEX 座子）。

## 待确认

- 手册无 FCC/CE 认证信息、无版本日期——量产前向厂商索取认证与最新版规格书。
- 天线形态（pin9 焊盘 vs IPEX 座）照片疑似 IPEX 但正文未明示。
- 600 mA 是否为 TX 峰值未说明，电源设计按最坏情况预算。

## 相关页面

- [[wiki/原理/芯片手册/无线通信/KT6368A|KT6368A]]
- [[wiki/原理/芯片手册/无线通信/BWIPX-1-001E|BWIPX-1-001E]]
- [[wiki/PCB/高速接口模块|高速接口模块]]
