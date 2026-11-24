---
title: K4F8E304HB-MGCJ
type: datasheet
status: needs-review
updated: 2026-11-21
sources: [硬件/原理/芯片手册/存储器.md]
tags: [嵌入式硬件, 芯片手册, K4F8E304HB-MGCJ, DRAM, LPDDR4, Samsung]
---

# K4F8E304HB-MGCJ

## 器件定位

三星 `K4F8E304HB-MGCJ`：**8 Gbit x32 LPDDR4 SDRAM**——SoC 运行内存（配套 K230 等 RISC-V/视觉 SoC）。规格书 Rev 1.0（2016-06-27，Final），共 85 页（p.1-2）。立创商城料号 C2803257。

- **料号解析**（p.8）：K4=三星；F=LPDDR4；8E=8 Gb（8K/32 ms 刷新）；30=x32（2 CS/2 CKE）；4=8 Bank；H=LVSTL_11；B=第 3 代；M=200-FBGA；G=-25~85 ℃；CJ=0.536 ns@RL32、tRCD18 ns、tRP18 ns。
- **组织**（p.7/p.13-14）：8 Gb = 32 Mb×16 DQ×8 Bank×**2 独立通道**（每通道 4 Gb x16）；行 15 bit、列 10 bit。封装 **200-ball FBGA** 10.00×15.00 mm、0.65 mm 球距（p.9）。

## 关键边界

| 项 | 数值 | 页码 |
|---|---|---|
| 工作电源（最小/典型/最大） | VDD1 为 1.70/1.80/1.95 V，VDD2 与 VDDQ 分别为 1.06/1.10/1.17 V | p.41 表 16 |
| 绝对最大 | VDD1 -0.4~2.1 V；VDD2/VDDQ -0.4~1.5 V；存储 -55~125 ℃ | p.40 |
| 速度等级 CJ | **最高 3733 Mbps**（tCK=0.536 ns 即 1866 MHz），向后兼容 3200 Mbps | p.8/p.71 |
| 3733 Mbps 时序 | RL=32 tCK（无 DBI）、WL=16 tCK（Set A）；tRCD 最小 Max(18 ns,4tCK)、tRPab 最小 Max(21 ns,4tCK)、tRAS 最小 Max(42 ns,3tCK)、tFAW 最小 40 ns | p.71 表 48 |
| 刷新 | 32 ms 窗口至少 8192 次，基准全 Bank tREFI=3.906 µs，tRFCab=180 ns、tRFCpb=90 ns。另列 16/8 ms 窗口，判档按 MR4 | p.23、p.70 表 47 |
| 温度 | 标准档 TCASE −25～85 ℃，测点是封装顶面中央 | p.41 表 18 |
| ZQ 校准 | **外接 240 Ω±1% 到 VDDQ** | p.12 |

## 设计入口

- **CA 采样**：p.11 引脚表写“DDR Command / Address Inputs”；p.12 明确 CA/控制在 CK_t 上升、CK_c 下降交点采样，p.13 写六位 CA 命令占 1/2/4 周期并走正边沿，DQ 用双数据率。按完整采样说明与命令时序实现，保留 p.11 摘要用词差异作追溯。
- **上电初始化**：p.14–15 是状态图；p.16–17 列模式寄存器。MR4 报告刷新率，MR11 配置 ODT，MR12/MR14 配置 VREF，MR13 配置 CBT/FSP。完整上电和训练顺序仍需命令定义及控制器初始化资料。
- **引脚**：按 p.9–12 ballout 确认共用 RESET_n 与 ZQ_a；校准电阻到 VDDQ 的连接适用于本 LPDDR4，其他 DDR 代际须查各自手册。
- 搭配 [[wiki/原理/芯片手册/主控MCU/K230|K230]] 前核对控制器支持的通道宽度、密度、封装映射和训练代码，再确定颗粒数量及连接。
- **布局警告**：本手册无 PCB 布局/等长/阻抗章节（仅封装 ballout p.9-10）——**LPDDR4 布局规范需另行索取三星应用笔记**，等长/拓扑/参考平面按 [[wiki/原理/叠层阻抗|叠层与阻抗]] 与 [[wiki/PCB/高速接口模块|高速接口模块]] 方法论自建约束。

## 待确认

- p.70 的 1/2、1/4 周期已核实为 16、8 ms 刷新窗口。p.41 的 85 ℃ 上限约束该 Standard 订货档，刷新加倍不能扩展允许温度。
- 已复核 p.9–13、p.23、p.40–41 和 p.70–72 相关图表；保持 `needs-review`，剩余核验为原厂现行版、命令定义、控制器训练与实际板级布局。
- 免责（p.1）：三星保留不经通知变更权利、"AS IS"、禁生命支持/医疗/军用。

## 相关页面

- [[wiki/原理/芯片手册/主控MCU/K230|K230]]
- [[wiki/原理/芯片手册/存储器/W25Q16JV|W25Q16JV]]（配套启动 Flash）
- [[wiki/PCB/高速接口模块|高速接口模块]]
