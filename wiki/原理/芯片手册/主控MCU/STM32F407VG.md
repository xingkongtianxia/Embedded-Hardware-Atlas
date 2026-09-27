---
title: STM32F407VG
type: datasheet
status: needs-review
updated: 2026-09-25
sources: [硬件/原理/芯片手册/主控MCU.md]
tags: [芯片手册, MCU, STM32F407VG, Cortex-M4, LQFP100]
---

# STM32F407VG

## 器件定位

ST `STM32F407VG` 属于 STM32F405/F407 系列，Arm Cortex-M4 + FPU，最高 168 MHz。来源手册为 DS8626 Rev 10（2024-11，production data）；文件名未提供完整订货后缀。

## 关键边界

- 最高 1 MB Flash、192 KB SRAM（含 64 KB CCM）+ 4 KB backup SRAM。
- 3×12-bit ADC、2×12-bit DAC；USB OTG FS/HS、10/100 Ethernet MAC、Camera 接口和 FSMC 为 F407 系列能力，具体引脚和资源取决于封装。
- 应用电源和 I/O 为 1.8~3.6 V；系列工作温度有 -40~+85 °C 与 -40~+105 °C 档，后缀必须确认。
- LQFP100 为 14×14 mm；VDD/VDDA、VBAT、VCAP、VREF+ 和 VSSA 的去耦、复位及 BOOT 配置按实际原理图逐项核对。

## 设计入口

1. 从完整订货号确认 Flash 容量、温度档、封装和硅步进，不使用系列首页的 `up to` 代替 BOM 事实。
2. 评审 Ethernet PHY/RMII 或 MII、USB HS 外部 PHY、Camera/FSMC 引脚复用以及时钟源；每个接口都要保留测试点和回流路径。
3. 在最高负载和温度下测 VDD、VDDA、VCAP、VBAT、NRST、时钟、USB 和 Ethernet 信号质量。

## 待确认

- `VG` 对应的完整封装/温度/供货后缀与实际 marking。
- 项目是否使用 Ethernet、USB HS、Camera 或 FSMC；这些接口的外部器件和引脚复用尚未由项目原理图确认。

## 相关页面

- [[wiki/原理/芯片手册/主控MCU/STM32F405RG|STM32F405RG]]
- [[wiki/PCB/主控与数字逻辑模块|主控与数字逻辑模块]]
- [[wiki/PCB/时钟复位与启动模块|时钟、复位与启动模块]]
