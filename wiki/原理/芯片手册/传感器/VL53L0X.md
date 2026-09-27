---
title: VL53L0X
type: datasheet
status: needs-review
updated: 2026-09-17
sources: [硬件/原理/芯片手册/传感器.md]
tags: [芯片手册, ToF, 激光测距, VL53L0X, ST, 飞行时间, I2C, LGA12]
---

# VL53L0X

## 器件定位

ST `VL53L0X`：**飞行时间（ToF）激光测距模块**，FlightSense 技术——940 nm VCSEL + SPAD 阵列 + 嵌入式微控制器，绝对测距至 2 m，报告距离与目标反射率无关。Optical LGA12 封装 4.4×2.4×1.0 mm。文档 **DS11555 Rev 6（2024-06）**，共 38 页（p.1）。

- 订货：`VL53L0CXV0DH/1`（带 liner）/ `VL53L0CXV9DH/1`（不带 liner），卷带（p.34）。

## 关键边界

| 项 | 数值 | 页码 |
|---|---|---|
| AVDD 绝对最大 | -0.5~3.6 V（I/O 行数值缺失，**需视觉复核 Table 7**） | p.19 |
| 推荐 AVDD | 2.6~3.5 V（typ 2.8） | p.19 |
| 推荐 IOVDD | 标准模式 1.6~1.9 V（typ 1.8）/ 2V8 模式 2.6~3.5 V | p.19 |
| 工作温度 | -20~70 °C | p.19 |
| **上电排序** | **无要求**（I/O 可高/低/悬空） | p.19 |
| Active 电流 | 平均 19 mA（含 VCSEL）；**峰值 40 mA** | p.20 |
| 待机电流 | HW STANDBY 3~7 µA / SW STANDBY 4~9 µA | p.20 |
| I²C | ≤400 kHz；地址 0x52(写)/0x53(读)；tBOOT ≤1.2 ms | p.13, p.15 |

## 测距性能

| 模式 | timing budget | 精度 |
|---|---|---|
| Default | 30 ms | — |
| High Accuracy | 200 ms | **<±3%** |
| Long range | 33 ms | — |
| High speed | 20 ms | ±5% |

（p.24；实际测量 23 ms @33 ms 预算、最小测量周期 8 ms，p.11/p.14）

- 范围（裸模块、23 °C、2.8 V，p.23）：室内白卡(88%) typ 200 cm+/min 120 cm（long range）；灰卡(17%) typ 80/min 70 cm；室外白卡 80/60 cm、灰卡 50/40 cm——**深色/强反射环境目标与室外性能大幅下降**。
- 视场角 FoV 25°；发射/接收 exclusion cone 25°/35°（**外壳禁入区**，p.21、p.26）。

## 引脚与设计入口

- 引脚（LGA12，p.4）：1 AVDDVCSEL、2 AVSSVCSEL、3 GND、4 GND2、5 XSHUT（低有效复位）、6 GND3、7 GPIO1（开漏中断）、**8 DNC 禁止连接必须悬空**、9 SDA、10 SCL、11 AVDD、12 GND4；所有 GND 与 AVSSVCSEL 接地。
- **XSHUT 必须始终被驱动**（host 状态未知时上拉），否则漏电流（p.5）；GPIO1 不用可悬空。
- 去耦：AVDD 旁 100 nF + 4.7 µF；XSHUT/GPIO1 上拉 10 kΩ；I²C 2.8 V/400 kHz 上拉 1.5~2 kΩ（p.5）。
- **盖板 crosstalk 校准必做**；offset calibration 推荐在 10 cm 进行并计入盖板（p.9）。
- 装配：最大压缩力 25 N；MSL Level 3；跌落/冲击须报废；**仅干式对流回流，禁止 vapor phase；建议不清洗**（p.31-32）。
- **Class 1 激光**（IEC 60825-1:2014）：禁止增功率或光学聚焦（p.28）。

## 应用场景（与库内器件的关联）

- 与 [[wiki/原理/芯片手册/传感器/PMW3901MB|PMW3901MB]] 光流 + [[wiki/原理/芯片手册/传感器/BMP280|BMP280]] 气压计构成室内定高/定位融合链：ToF 提供对地高度、光流提供水平速度。
- 单点防撞/避障（2 m 内）场景优于超声波（无串扰、光斑小）。

## 待确认

- Table 7 的 SCL/SDA/XSHUT/GPIO1 绝对最大数值缺失，需视觉复核（p.19）。
- 长期老化与温度漂移数据手册未给，需实测。

## 相关页面

- [[wiki/原理/芯片手册/传感器/PMW3901MB|PMW3901MB]]
- [[wiki/原理/芯片手册/传感器/BMP280|BMP280]]
- [[wiki/原理/芯片手册/传感器/VCNL4040|VCNL4040]]
- [[wiki/PCB/模拟与采集模块|模拟与采集模块]]
