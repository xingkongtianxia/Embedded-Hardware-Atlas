---
title: PMW3901MB
type: datasheet
status: needs-review
updated: 2026-09-17
sources: [硬件/原理/芯片手册/传感器.md]
tags: [芯片手册, 光流, 光学导航, PMW3901MB, PixArt, 飞控, SPI, COB]
---

# PMW3901MB

## 器件定位

PixArt Imaging（原相科技）`PMW3901MB-TXQT`：**光学流动跟踪芯片（Optical Motion Tracking）**，远场工作距离 80 mm 至无穷远，用于无人机 GPS 失效环境的室内外 X-Y 定位。28-pin COB 封装（含镜头组件 6×6×2.28 mm，镜头型号 `LN03-ZSZ`）。文档 Version 1.10（2017-06-20），共 11 页，**每页脚标 PixArt Confidential（保密文档）**（p.1）。

## 关键边界

| 项 | 数值 | 页码 |
|---|---|---|
| VDD 绝对最大 | -0.5~2.1 V | p.3 |
| VDDIO / VIN 绝对最大 | -0.5~3.6 V | p.3 |
| 推荐 VDD | 1.8~2.1 V（typ 2.0） | p.3 |
| 推荐 VDDIO | 1.8~3.6 V（**要求 VDDIO ≥ VDD**） | p.3 |
| 工作温度 | **0~40 °C（室内级，注意！）** | p.3 |
| 电源上升时间 | 0.15~20 ms；噪声 ≤100 mVp-p（10 kHz–75 MHz） | p.3 |
| ESD (HBM) | 2 kV | p.3 |
| 运行电流 | 9 mA typ（p.1 写 "<9 mA" 与 p.4 "Typ 9 mA" 略有出入） | p.4 |
| 掉电电流 | 12 µA typ | p.4 |
| 上电瞬态 | IDDT/IDDTIO 各最大 70 mA | p.6 |
| 探测速度上限 | 7.4 rad/s | p.3 |
| 照度下限 | ≥60 lux；有效视角 42° | p.3 |

## 接口与引脚

- **4-wire SPI @ 2 MHz**（50% 占空比）：MOSI(16)、SCLK(17)、MISO(18)、NCS(19)（p.1、p.2、p.3）。
- 时序：唤醒后须断言 NRESET，tWAKEUP 50 ms 后运动有效；复位到有效运动 tMOT-RST 50 ms；tSWW/tSWR 45 µs（p.5-6）。
- 引脚（p.2）：VDD(2)、VDDIO(3)、VREG(4 内部电压输出)、GND(1,21)、**底部 GND PAD(29\*) 必须接地**；NRESET(7)/MOTION(15)/LED_N(20) 均**低有效**。
- **NC 引脚（5-6、8-14、22-28）要求悬空 float**（与不少手册建议接地相反）。

## 设计入口

- 参考电路（p.10）：VDD 旁 22 µF+100 nF、VDDIO 旁 22 µF+100 nF、VREG 区 10 µF+4.7 µF+100 nF、R1=3 Ω（电容-引脚对应需视觉复核）；所有电容尽量靠近引脚，推荐陶瓷无极性。
- 镜头安装**无需对焦**（p.1）；镜头朝下安装于机身底部，视场内避开结构件。
- 与飞控 IMU 融合：光流提供 X-Y 速度，需配合气压计（[[wiki/原理/芯片手册/传感器/BMP280|BMP280]]）/ToF 高度（[[wiki/原理/芯片手册/传感器/VL53L0X|VL53L0X]]）做定高融合。

## 待确认

- 帧率/分辨率/精度数值手册未列出（**未找到**），选型评估需向 PixArt 索要应用文档。
- p.10 参考电路各电容与引脚的对应需视觉复核。
- 文档为保密文档且 2017 年版本，量产前确认最新版与授权。

## 相关页面

- [[wiki/原理/芯片手册/传感器/MPU-6500|MPU-6500]]
- [[wiki/原理/芯片手册/传感器/BMP280|BMP280]]
- [[wiki/原理/芯片手册/传感器/VL53L0X|VL53L0X]]
- [[wiki/原理/芯片手册/主控MCU/STM32F405RG|STM32F405RG]]
