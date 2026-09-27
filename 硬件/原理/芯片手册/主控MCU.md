---
title: 主控 MCU
type: datasheet-source
status: curated
updated: 2026-09-18
sources: [原始备份/芯片数据手册/TC264数据手册.pdf, 原始备份/芯片数据手册/ST-STM32F405RG.pdf, 原始备份/芯片数据手册/AT32F421K8U7数据手册.pdf, 原始备份/芯片数据手册/W25Q256JV数据手册 .pdf, 原始备份/芯片数据手册/K230.pdf, 原始备份/芯片数据手册/rp2350数据手册.pdf]
tags: [芯片手册, MCU, TC264, STM32F405RG, AT32F421K8U7, Cortex-M4, AURIX, W25Q256JV, SPI Flash, NOR Flash, K230, RP2350, RISC-V, AIoC]
---

# 主控 MCU

## AT32F421K8U7 新增事实

- AT32F421K8U7 属于 AT32F421 系列，Cortex-M4 内核，最高 120 MHz；该具体订货号对应 64 KB Flash 和 QFN32 5 x 5 mm 封装。
- 系列供电范围为 2.4～3.6 V，含 12 位 2 MSPS ADC、比较器、DMA、定时器、I2C、USART、SPI/I2S 和 SWD。
- 最小系统需按具体 QFN32 引脚表核对电源/地、去耦、复位、启动配置、时钟和 SWD；系列“多达”资源不能直接视为该封装全部可用。

## 范围与来源

- [[wiki/原理/芯片手册/主控MCU/CH549DS1|CH549DS1]]：用户新增 PDF，USB、供电、封装和引脚复用待逐页核对。

本页只整理能绑定到型号、文档版本和条件的主控事实。

| 器件 | 手册身份 | 本页边界 |
|---|---|---|
| Infineon AURIX TC264 | `TC260/TC264/TC265/TC267` Data Sheet，V1.0，2017-06，BC-Step | 当前缺少完整订货号，保留系列级核对入口 |
| ST STM32F405RG | `STM32F405xx, STM32F407xx`，DS8626 Rev 10，2024-11 | 只采用 RG/LQFP64 能力，不混入 F407 或大封装专属外设 |
| Winbond W25Q256JV | `W25Q256JV` Datasheet，Rev R，2026-05-04 | **主控配套串行 Flash**，非 MCU 本体；见下节 |

> **归类说明**：W25Q256JV 是 MCU 外挂的程序/数据存储，本页按"主控及其配套存储"收纳。**2026-09-17 宋工确认不独立建 `存储` 分类**，本节长期保留在本页。

Data Sheet 不能替代 Reference Manual、User's Manual、Errata 和封装/应用笔记。首板结论必须绑定 BOM 完整订货号与硅步进。

## Infineon AURIX TC264

### 文档与型号边界

- 当前资料同时描述 TC260、TC264、TC265、TC267，不允许把系列全部 CPU、存储器、安全模块和外设默认写给任一 TC264。
- 设计前必须确定完整订货号、封装、温度等级、BC-Step 及对应 Errata。
- 需要按目标型号逐项确认 CPU、Flash/RAM、安全特性、CAN/LIN/SPI/ADC/定时器、调试与启动资源。

### 最小系统核对

- 建立全部电源域、地、模拟参考和 PLL/时钟电源表，记录电压、去耦、上电/掉电顺序、最大电流与测点。
- 时钟、复位、启动配置和调试接口按目标封装引脚表连接；复用引脚同时检查默认状态、电压域和外设抢占。
- BGA 或细间距封装在原理图阶段确认逃线、过孔工艺、散热和装配能力。
- 首板先在限流条件下验证电源、复位、时钟、启动和调试，再逐个开启外设。

### 待项目确认

- 完整 TC264 订货号、封装、温度后缀和硅步进。
- 需要优先展开的电源域、启动模式、调试接口和外设。
- 与目标步进匹配的 User's Manual、Errata 与安全手册版本。

## ST STM32F405RG

### 文档身份与器件定位

- Arm Cortex-M4 32-bit MCU，含单精度 FPU、DSP 指令和 MPU，最高 168 MHz（手册 p.14、p.21）。
- `STM32F405RG` 中 `R=64 pins`、`G=1024 KB Flash`；RG 对应 LQFP64，10 x 10 mm、0.5 mm pitch（手册 p.16、p.168-p.170、p.185）。
- 完整订货号还需 package、温度和供货选项后缀：`T=LQFP`，`6=-40~85 °C`，`7=-40~105 °C`（手册 p.185）。
- 1 MB Flash，192 KB system SRAM（112+16+64 KB，含 64 KB CCM）和 4 KB backup SRAM（手册 p.15、p.22）。

### 型号专属外设

| 项目 | STM32F405RG 能力 | 来源 |
|---|---|---|
| GPIO | 51 | 手册 p.16 |
| ADC | 3 个 12-bit，16 个外部通道 | 手册 p.16 |
| DAC | 2 个 12-bit 通道 | 手册 p.16 |
| 串行接口 | 3 SPI / 2 full-duplex I2S、3 I2C、4 USART / 2 UART | 手册 p.16 |
| 连接接口 | USB OTG FS、USB OTG HS、2 CAN、SDIO | 手册 p.16 |
| Ethernet / camera | 均无 | 手册 p.14-p.16 |
| FSMC | LQFP64 不提供 | 手册 p.15-p.16 |

F407 的 Ethernet、camera interface，以及 LQFP100 以上封装的 FSMC 能力不得写入 STM32F405RG 设计。

### 绝对最大额定值

- `VDD/VDDA` 对 `VSS`：-0.3~4.0 V；普通引脚输入最高 4.0 V，5 V tolerant 引脚最高 `VDD+4 V`，同时受注入电流限制（手册 p.79）。
- 任一 I/O sink/source 最大 25 mA；VDD/VSS 总电流最大 240 mA；总注入电流最大 ±25 mA（手册 p.80）。
- 存储温度 -65~150 °C；最大结温 125 °C（手册 p.80）。
- 以上均为损坏边界，不是推荐设计点。

### 推荐工作条件

- 标准 `VDD=1.8~3.6 V`；`VDDA` 与 VDD 同电位，正常 ADC 速率还要满足模拟电压条件（手册 p.25、p.80-p.82）。
- `VBAT=1.65~3.6 V`（手册 p.25、p.80）。
- AHB 最高 168 MHz，APB1 最高 42 MHz，APB2 最高 84 MHz（手册 p.25、p.80）。
- 后缀 6 的最大功耗环境范围为 -40~85 °C，后缀 7 为 -40~105 °C；低功耗扩展范围不能代替热验证（手册 p.81、p.185）。
- LQFP64 `ThetaJA=46 °C/W` 来自 JEDEC 自然对流测试，实际板级结温需结合铜面积、功耗和环境重算（手册 p.184）。

### 电源、复位与启动

- LQFP64 只支持内部 regulator ON，不能使用 regulator OFF 或 internal reset OFF（手册 p.30）。
- 每组 VDD/VSS 就近放 100 nF，另在一个 VDD 放 4.7 µF；VDDA/VREF+ 各采用 100 nF + 1 µF（手册 p.78）。
- VCAP_1、VCAP_2 各接 2.2 µF 低 ESR 陶瓷电容，ESR < 2 Ω（手册 p.78、p.83）。
- 复位后 HSI 16 MHz 为默认 CPU 时钟；外部 HSE 范围 4~26 MHz（手册 p.24）。
- 启动源为 user Flash、system memory 或 embedded SRAM（手册 p.25）。
- System memory Bootloader 可经 USART1、USART3、CAN2 或 USB OTG FS DFU 重编程，具体复用见手册 p.25。

### 引脚与 PCB 边界

- LQFP64 pinout 见手册 p.42；原理图必须覆盖 VBAT、VDDA/VSSA、全部 VDD/VSS、VCAP_1/2、NRST、BOOT0 和 SWD/JTAG。
- 5 V tolerant 只适用于 FT 标识引脚；输入电压和注入电流条件必须同时满足（手册 p.79-p.81）。
- 去耦回路最短，晶振和复位网络远离高 dv/dt 节点；高速接口的阻抗、回流和 ESD 另按 PCB 主题执行。

### 上板验证

1. 核对完整订货号、温度后缀、marking、硅步进和 `ES0182` Errata（手册 p.13）。
2. 限流上电，测 VDD、VDDA、VCAP_1/2、VBAT、静态电流、NRST 和 HSI/HSE。
3. 验证 BOOT0 启动路径、SWD 下载和 system Bootloader。
4. 按实际引脚复用逐项验证 UART/I2C/SPI/CAN/USB/SDIO/ADC/DAC。
5. 在最高负载和温度下验证功耗、结温、时钟稳定与供电纹波。

## Winbond W25Q256JV（主控配套串行 Flash）

### 文档与器件定位

- Winbond `W25Q256JV`，Datasheet，`Revision R`，Publication Release Date `May 4, 2026`，共 96 页（手册 p.1、p.5）。
- 容量 **256 M-bit = 32 M-byte**；组织为 131,072 页 × 256 字节/页、8,192 个 4 KB 扇区、512 个 64 KB 块（手册 p.5）。
- 3 V 供电、支持 Dual/Quad SPI 的串行 NOR Flash，面向 Industrial / Industrial Plus 等级（手册 p.1）。

### 封装与订货（手册 p.5、p.86~p.90、p.92~p.93）

| 封装代码 | 封装 | 备注 |
|---|---|---|
| E | 8-pad WSON 8 × 6 mm | |
| M | 8-pad WFLGA 6 × 5 mm | |
| F | 16-pin SOIC 300 mil | 带 `/RESET` |
| B | 24-ball TFBGA 8 × 6 mm | 5×5-1 阵列，带 `/RESET` |
| C | 24-ball TFBGA 8 × 6 mm | 6×4 阵列，带 `/RESET` |

订货型号温度/功能等级（手册 p.92~p.93）：

| 等级 | 温度 | QE 位 | 示例订货型号 |
|---|---|---|---|
| IQ | -40 ~ +85 °C | 固定 = 1 | `W25Q256JVFIQ`（SOIC16）、`W25Q256JVEIQ`（WSON8） |
| IN | 工业级 | 固定 = 1（DRV 75%） | `W25Q256JVFIN`、`W25Q256JVEIN` |
| JQ | -40 ~ +105 °C | 固定 = 1 | `W25Q256JVFJQ`、`W25Q256JVEJQ` |
| IM | 工业+ | 可编程 = 0 | `W25Q256JVFIM`、`W25Q256JVEIM` |
| JM | 工业+ | 可编程 = 0 | `W25Q256JVFJM`、`W25Q256JVEJM` |

- TFBGA（B/C）属特殊订货；丝印不印 W 前缀与温度字母 "I"（手册 p.91）。
- **选型要点**：`QE=1` 固定表示出厂即启用 Quad 模式，`QE=0` 可编程表示需软件置位后才可用 Quad I/O。

### 绝对最大额定值（手册 p.78；不是推荐工作点）

| 项目 | 限值 |
|---|---|
| 电源电压 VCC | -0.6 ~ +4.6 V |
| 任意引脚电压 VIO（相对 GND） | -0.6 V ~ VCC+0.4 V |
| 瞬态引脚电压（<20 ns） | -2.0 V ~ VCC+2.0 V |
| 存储温度 T<sub>STG</sub> | -65 ~ +150 °C |
| ESD (HBM) | ±2000 V |

### 推荐工作条件（手册 p.78）

- `VCC = 3.0~3.6 V` 时：FR 最大 `133 MHz`、fR 最大 `50 MHz`。
- `VCC = 2.7~3.6 V`（JV 版本）时：FR 最大 `104 MHz`。
- 工作温度：Industrial `-40~+85 °C`；Industrial Plus `-40~+105 °C`。

### 关键性能（手册 p.5、p.83~p.84）

- 时钟：`Read Data (03h/13h)` 的 fR 最大 `50 MHz`；其余指令 FR 最大 `133 MHz`（3.0~3.6 V）/ `104 MHz`（2.7~3.0 V）。
- 吞吐：等效 Dual I/O `266 MHz`、Quad I/O `532 MHz`；连续读 `66 MB/s`。
- 寿命：≥`100K` 编程/擦除周期；数据保持 `>20 年`。
- 时间：页编程 `0.4~3 ms`；扇区擦除 `50~400 ms`；64 KB 块擦除 `150~2000 ms`；整片擦除 `80~400 s`；写状态寄存器 `10~15 ms`。

### 工作模式与指令集（手册 p.5、p.9、p.37~p.45）

- Standard SPI：`CLK` / `/CS` / `DI` / `DO`；Dual SPI：`IO0` / `IO1`；Quad SPI：`IO0~IO3`，**需 `QE=1`**。
- 常用指令：`03h` Read Data、`0Bh` Fast Read、`3Bh` Fast Read Dual、`6Bh` Fast Read Quad、`02h` Page Program、`20h` Sector Erase、`52h`/`D8h` Block Erase、`C7h`/`60h` Chip Erase、`9Fh` Read JEDEC ID、`4Bh` Read Unique ID、`90h` Read Mfr/Dev ID、`B9h` Power-down、`66h`/`99h` Enable/Reset。
- **QPI**：本手册未给出 QPI 命令模式；仅 DTR 变体（`W25Q256JV-IM DTR`）支持，见手册注（手册 p.24、p.91、p.93）。

### 引脚（手册 p.6~p.9）

- `/CS`(1)：片选，拉高为 deselected，输出高阻。
- `CLK`：串行时钟。
- `DI(IO0)` / `DO(IO1)`：标准与 Dual 模式下使用；Quad 模式下 `IO0~IO3` 全部作为数据线。
- `/WP(IO2)`：写保护，低有效，配合 BP/TB/CMP/SRP 位保护状态寄存器与阵列。
- `/HOLD(IO3)`：暂停，低有效；**`QE=1` 时转为 IO3，`/HOLD` 功能不可用**。
- WSON/WFLGA 8 脚排列：`/CS`、`DO(IO1)`、`/WP(IO2)`、`GND`、`DI(IO0)`、`CLK`、`/HOLD` 或 `/RESET`(IO3)、`VCC`；SOIC16 见手册 p.7，TFBGA 见手册 p.8。
- **未用引脚处理**：`/RESET` 未使用时"可悬空或接 VCC"（手册 p.7、p.8）。`/WP` 与 `/HOLD` 的悬空/上拉处理方式手册**未找到**明确条文——这是本页的待核验项。

### 电源与上电时序（手册 p.78~p.79）

- 去耦电容推荐值手册**未找到**（全文无 decoupling/bypass 字样），需按通用 SPI Flash 实践结合板级验证确定。
- 上电时序：`VCC(min)` 到 `/CS` 拉低需 `t<sub>VSL</sub> ≥ 20 µs`；写指令前延迟 `t<sub>PUW</sub> ≥ 5 ms`；写禁止阈值 `V<sub>WI</sub> = 1.0~2.0 V`；初始化保证 `t<sub>PWD</sub> ≥ 100 µs`、`V<sub>PWD</sub> ≤ 0.8 V`。
- **`/CS` 必须跟踪 VCC 的上电/下电**（手册 p.9、p.79）；上拉电阻可用于跟踪 VCC，但手册**未给出**具体阻值。
- 掉电用 `Power-down (B9h)` 指令，深度掉电电流 `<1 µA`（典型）（手册 p.5、p.37）。

### 特殊功能（手册 p.5、p.13、p.72）

- 安全寄存器：3 × 256 B Security Registers，带 OTP 锁位 `LB1~LB3`。
- 唯一 ID：64-bit Unique ID（`4Bh` 读出）。
- 写保护：硬件 `/WP`、状态寄存器 BP/TB/CMP/SRP、Individual Block/Sector Lock（`36h`/`39h`）、Power Supply Lock-Down、OTP 保护（特殊流程）。
- 复位：软件复位 `66h`/`99h`；硬件 `/RESET` 需低 `≥1 µs`（**仅 SOIC16 与 TFBGA 封装提供**）。

### 布局与信号完整性（手册 p.82~p.83）

- AC 测试负载 `C<sub>L</sub> = 30 pF`；输入上升/下降时间 `≤5 ns`；输入脉冲 `0.1~0.9 VCC`；时序参考电平 `0.3~0.7 VCC`。
- 时钟摆率 `≥0.1 V/ns`；`/CS` 建立/保持 `t<sub>SLCH</sub>`/`t<sub>CHSL</sub> ≥ 3 ns`；读期间 `/CS` 解除 `t<sub>SHSL1</sub> ≥ 10 ns`，擦写期间 `t<sub>SHSL2</sub> ≥ 50 ns`。
- 上述为器件级时序要求，板级需按走线长度、负载与目标时钟率另行做信号完整性核算。

### 待确认

- `/WP` 与 `/HOLD` 未使用时的处理方式（手册未明确），需查 Winbond 应用笔记或参考设计。
- 去耦电容推荐值手册未给，需结合板级实测确定。
- 完整订货型号（封装代码 + 温度等级）未在本设计冻结。
- 文档显示 Rev R / 2026-05-04，需确认该版本是否为最新且供货版本一致。

## Canaan K230（RISC-V 双核 AIoC SoC）

嘉楠科技 `K230`（Kendryte 系列）：**RISC-V 64 位双核 AIoT SoC**，文档《K230 Product Full Datasheet》V1.0（2023-7-6），共 41 页（p.1/p.3）。

- **架构**（p.4）：CPU0 小核 C908 @800 MHz（RV64GCB、FPU、L1 32 KB×2、L2 128 KB）；CPU1 大核 @1.6 GHz 带 **RVV 1.0 向量扩展**（128 bit 向量单元、L2 256 KB）；CPU1 与 KPU 支持 DVFS（p.9）。PLIC 208 中断源。
- **AI**：KPU 支持 INT8/INT16 与权重稀疏压缩；典型性能 ResNet50 ≥85 fps、MobileNet_v2 ≥670 fps、YOLOv5s ≥38 fps@INT8（p.5）。**全文未给 TOPS 算力数值**，框图仅标 INT8/INT16（p.25，视觉识别）。DPU 3D 结构光引擎 1920×1080 最大输入、典型 1280×800@30 fps（p.6-7）。
- **多媒体**（p.14-16）：编码最大 8MP@20 fps（H.265 Main/Main10、H.264、JPEG/MJPEG）；解码最大 8MP@40 fps；ISP 8MP@30 fps、3 sensor MCM（p.12）；**框图标注 4K@20/60 fps 与正文 8MP 数值不一致，照录**（p.25）。Fastboot 3A 首图 ≤400 ms（p.24）。
- **存储**（p.7-9）：SRAM 2 MB 共享 + 2 MB（默认给 KPU）；DDR 双通道 16 bit LPDDR4 @3200 Mbps（32 bit LPDDR3 @2133 Mbps），容量最大 2 GB、2 rank；SPI NOR/NAND 支持 Dual/Quad/Octal、XIP。**K230D 为 SiP，内封 1 Gb LPDDR4**（p.25）。
- **外设**（p.19-22）：USB2.0 OTG ×2；2× SDxC（SD3.01/eMMC 5.0，UHS-I SDR104、HS400）；SPI ×3（1 OSPI+2 QSPI）；UART ×5；I2C ×5（3.4 Mb/s）；PWM ×6；GPIO 64+8 PMU；3× MIPI CSI（最多 3×2 lane 或 1×4+1×2 lane，8/10/12/16 bit Bayer，HDR）；1× MIPI DSI（4/2 lane，2MP@60 fps，13 层合成）；内置 Codec（2 DAC+2 ADC 8~192 kHz）+8× PDM DMIC。**无以太网、无 PCIe**。
- **电气**（p.27-29）：0.8 V 域（CORE/CPU/KPU/DDR_CORE，max 0.88 V）；VDD1P1_DDR_IO 典型 1.1/1.2/1.35 V；1.8 V/3.3 V IO 域（3.3 V max 3.63 V）；IO 驱动 DS[2:0] 可选至 IOL 34.9 mA（p.30，视觉识别）。工作环境 -40~85 ℃（p.24）。
- **时钟**（p.9/p.23）：外部 24 MHz OSC + 4 内部 PLL；RTC 需外部 32.768 kHz。
- **封装**：BGA-13×13-390（0.65 mm 球距、球径 0.3 mm）（p.26，视觉识别）；引脚定义依赖外部文档《K230_PINOUT_V1.0_20230524》（p.27）——**手册本体无引脚表，设计前必须另取 pinout 文档**。
- 典型应用：智能门锁、安防摄像头、词典笔、支付识别、3D 结构光、无人机、机器人（p.4）。
- 免责（p.2）：内容可随时更新不另行通知、不承诺正确性/完整性；无 preliminary 字样（已全文检索）。

## Raspberry Pi RP2350（双架构双核 MCU）

Raspberry Pi Ltd `RP2350`：**双核 Cortex-M33 或双核 Hazard3 RISC-V 可切换 MCU**，150 MHz，数据手册 build 2025-07-29（d126e9e-clean），共 1380 页（含 IO 寄存器映射）。封面为图片型，**参数经视觉识别**（p.1-2）。印刷页码 = PDF 页 - 1。

- **架构**（p.14-16）：双核 Arm Cortex-M33 **或** 双核 Hazard3 RISC-V（RV32IMAC+，动态切换架构）；150 MHz；**520 kB SRAM**（10 个独立 bank 单周期访问）；32 kB mask ROM Bootrom；8 kB OTP；专用 QSPI 总线支持最高 16 MB 外部 Flash/PSRAM + 第二片选再扩 16 MB；片上 buck + 低功耗 LDO 双模式；2× PLL。
- **封装**（p.14/p.1330-1331）：RP2350A = QFN-60 7×7 mm、30 GPIO/4 ADC；RP2350B = QFN-80 10×10 mm、48 GPIO/8 ADC；RP2354A/B = 叠封 2 MB Flash（Winbond W25Q16JV**WI**）。命名：RP2350+封装代号(A/B)+版本"0"+die stepping（A2/A3/A4）。QFN-60 MSL1，**QFN-80 MSL 待定**（p.1331）。环境 -40~+85 ℃（p.1340）。
- **电源域**（p.1343-1344）：IOVDD 1.62~3.63 V（典型 1.8/3.3 V）；QSPI_IOVDD 同 IOVDD（RP2354 必须 3.3 V）；DVDD 内核 1.05~1.16 V 由内部稳压器自 VREG_VIN（2.7~5.5 V）生成——**buck 模式最大 200 mA、LDO 睡眠模式 1 mA、开关频率 3 MHz**（p.16/p.1344-1345）；USB_OTP_VDD 3.3 V；ADC_AVDD <2.97 V 性能下降。
- **绝对最大**（p.1339-1340）：DVDD -0.5~1.21 V；IOVDD -0.5~3.63 V；FT 引脚 IOVDD=3.3 V 时耐 **5.5 V**（1.8 V 时 3.63 V）；结温 -40~+125 ℃；ESD：FT 引脚 HBM 4 kV。
- **外设**（p.14-15/p.1096/p.1341）：2× UART、2× SPI、2× I2C、24× PWM 通道、USB 1.1 FS/LS Host/Device（含 PHY）、**12× PIO 状态机（3 个 PIO 块）**、1× HSTX、DMA 16 通道；ADC 12 bit（ENOB 9~9.5 bit），4 通道（A）/8 通道（B），输入 0~ADC_AVDD。
- **启动与安全**（p.354/p.817-819）：Bootrom 支持 Flash/OTP/USB/UART 串行启动、分区表、A/B 升级、反回滚；BOOTSEL=复位时拉低 QSPI_SS 进 USB BOOTSEL；Secure Boot SHA-256 + secp256k1 ECDSA 签名、公钥指纹存 OTP；TrustZone（Armv8-M Security extension）；含 glitch detector 抗故障注入。
- **引脚**（p.588/p.1358）：最多 54 GPIO（A=30/B=48 + Bank1 QSPI 6 + USB）；每 GPIO 12 个复用功能槽 F0~F11；QFN-60 经 IO remap 稀疏引出；FT 引脚默认驱动 4 mA、四档 2/4/8/12 mA。
- **时钟**（p.556-557）：XOSC 1~50 MHz（参考 12 MHz，推荐 Abracon ABM8-272-T3，±30 ppm、CL 10 pF）；PLL 需晶振 ≥5 MHz；ROSC 标称 11 MHz；LPOSC 32 kHz。
- **风险与 Errata**（p.24/p.1358 起）：A2 首发→A3 样品/限量→**A4 为量产版**（参考 PCN 28）；Errata E3/E10/E13/E14/E15/E18 主要影响 A2/A3，A3/A4 修复；QFN-80 MSL 仍在表征；标 "Simulated" 数据不保证。**订货必须指定 A4 步进**。

## 同类选型维度

- CPU 架构、实时性能、FPU/DSP、存储容量和安全需求。
- 封装可用 I/O、外设实例与引脚复用，而不是只看系列首页的 “up to”。
- 电源域、工作电压、低功耗状态、上电顺序、调试和 Bootloader。
- 生命周期、Errata、软件生态、PCB 工艺和量产测试成本。

## 风险与待确认

- STM32 文件名未给出完整温度/封装/供货后缀，实际 BOM 必须补全。
- TC264 仍只有系列级资料入口，不能生成具体订货号的数值承诺。
- W25Q256JV 的完整订货型号、`/WP` 与 `/HOLD` 未用处理、去耦取值均待确认。
- 所有器件都必须在真实 PCB、固件版本和温度范围下完成最小系统验证。

## STM32F407VG（STM32F407xx 系列）

- **器件定位**：ST STM32F407VG 属于 STM32F405/F407 系列，Arm Cortex-M4 + FPU，最高 168 MHz；本手册为 DS8626 Rev 10（2024-11，205 页，production data）。
- **资源与接口**：最高 1 MB Flash、192 KB SRAM（含 64 KB CCM）+ 4 KB backup SRAM；3×12-bit ADC、2×12-bit DAC；USB OTG FS/HS、10/100 Ethernet MAC（带 DMA/IEEE 1588）、Camera 接口和 FSMC 是 F407 系列能力，具体可用资源仍受封装影响。
- **电源与环境**：应用电源和 I/O 为 1.8~3.6 V；系列工作温度覆盖 -40~+85 °C 或 -40~+105 °C 档，实际后缀必须核对。LQFP100 封装尺寸 14×14 mm；VDD/VDDA、VBAT、VCAP、VREF+ 与 VSSA 的去耦和上电顺序按手册连接图复核。
- **工程边界**：STM32F407VG 文件名不足以确认完整订货后缀、温度档和封装选项；不能把系列级“up to”资源直接写入 BOM。Ethernet/USB HS/FSMC/Camera 的引脚复用、外部 PHY/ULPI 和时钟方案需按实际封装逐项核对。

## 来源定位

- `硬件/原始备份/芯片数据手册/TC264数据手册.pdf`
- `硬件/原始备份/芯片数据手册/ST-STM32F405RG.pdf`
- `硬件/原始备份/芯片数据手册/AT32F421K8U7数据手册.pdf`
- `硬件/原始备份/芯片数据手册/W25Q256JV数据手册 .pdf`（注意：文件名 `.pdf` 前有一个空格）
- `硬件/原始备份/芯片数据手册/K230.pdf`（嘉楠 K230 Product Full Datasheet V1.0，2023-7-6；引脚表在外部 pinout 文档）
- `硬件/原始备份/芯片数据手册/rp2350数据手册.pdf`（Raspberry Pi RP2350 Datasheet，build 2025-07-29；封面图片型经视觉识别；页码为 PDF 物理页）
- `硬件/原始备份/芯片数据手册/STM32F407VG数据手册.pdf`（ST DS8626 Rev 10，2024-11；STM32F405xx/STM32F407xx 系列手册）

> **分类变更（2026-09-18）**：新建 `存储器` 分类后，W25Q256JV 的 Wiki 器件页已迁至 `wiki/原理/芯片手册/存储器/`；本分类稿保留其"主控配套串行 Flash"章节作为来源整理（历史条目不变），新入库存储器件（W25Q16JV、MKDV16GCL-STP、K4F8E304HB-MGCJ）见 `硬件/原理/芯片手册/存储器.md`。
