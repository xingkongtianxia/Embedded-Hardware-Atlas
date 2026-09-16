---
title: STM32F405RG
type: datasheet
status: reviewed
updated: 2026-08-11
sources: [硬件/原理/芯片手册/主控MCU.md]
tags: [嵌入式硬件, MCU, STM32F405RG, Cortex-M4, LQFP64]
---

# STM32F405RG

## 器件定位

STM32F405RG 是最高 168 MHz 的 Cortex-M4 MCU，带单精度 FPU、DSP 和 MPU。`RG` 对应 1 MB Flash、LQFP64；完整 BOM 仍需补 package、温度和供货后缀。

## 型号边界

- 1 MB Flash，192 KB system SRAM（含 64 KB CCM）和 4 KB backup SRAM。
- 51 GPIO，3 个 12-bit ADC/16 通道，2 个 12-bit DAC。
- 3 SPI/2 I2S、3 I2C、4 USART/2 UART、USB OTG FS/HS、2 CAN、SDIO。
- 没有 Ethernet、camera interface 和 FSMC；这些共用手册能力属于 F407 或更大封装。
- LQFP64 只支持内部 regulator ON。

## 电气边界

- 推荐 VDD/VDDA 1.8~3.6 V，VBAT 1.65~3.6 V。
- 绝对最大 VDD/VDDA 4.0 V；任一 I/O source/sink 最大 25 mA只是应力额定。
- 后缀 6/7 分别对应 -40~85 °C / -40~105 °C，必须按完整订货号确认。

## 设计入口

- 每组 VDD/VSS 放 100 nF，另加 4.7 µF；VDDA/VREF+ 各 100 nF + 1 µF。
- VCAP_1、VCAP_2 各接 2.2 µF、ESR < 2 Ω。
- 原理图逐项核对 VBAT、VDDA/VSSA、全部 VDD/VSS、VCAP、NRST、BOOT0、SWD/JTAG。
- 启动源为 Flash、system memory 或 SRAM；量产 Bootloader 路径需与引脚复用共同确认。

## 验证清单

1. 核对完整订货号、marking、硅步进和 `ES0182` Errata。
2. 限流测 VDD、VDDA、VCAP、VBAT、NRST、静态电流和时钟。
3. 验证 BOOT0、SWD、system Bootloader 和目标外设复用。
4. 在最高负载与温度下验证供电纹波、时钟和结温。

## 待确认

- 实际温度后缀、供货选项和硅步进。
- USB HS、CAN、SDIO、ADC/DAC 等项目目标与引脚分配。

## 相关页面

- [[wiki/原理/数电|数电]]
- [[wiki/PCB/主控与数字逻辑模块|主控与数字逻辑模块]]
- [[wiki/PCB/时钟复位与启动模块|时钟、复位与启动模块]]
