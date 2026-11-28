---
title: 外来资源索引
type: source-map
status: needs-review
updated: 2026-11-28
sources: []
tags: [外来资料, 导航, 毕设, 声学]
---

# 外来资源分类目录

本目录登记 AI 主动获取的补充资料。新增条目必须先完成来源身份、获取记录、用途和可靠性字段，再加入下表。

唯一正式库为包含本页、根索引与Wiki的当前Git仓库；返回[[index|总索引]]与[[wiki/知识网络|知识网络]]。用户新增原件继续经分类稿接入Wiki，不混入本目录。

## 开放学习入口

- [[external/开放学习与外部查证导航]]：问题查证与探索学习两条路径，比较条件、寻找反例、验证并回写。
- [[external/原厂资料与技术支持入口]]：参数、勘误与官方支持，核对准确对象和版本。
- [[external/工程社区与CSDN检索入口]]：故障、实操、完整讨论与同源追溯。
- [[external/开源硬件封装与计算工具入口]]：工程、封装、模型和计算的复用检查。
- [[external/GitHub检索与版本化阅读]]：源码、Issue/PR、commit和验证层级，连接下方既有四个仓库。
- [[external/网站推荐视频来源说明]]：视频身份、已辨画面与非完整转写边界。
- [[external/开放学习方法与适用边界]]：按任务选择方法，区分方法走查、来源依据和实际验证。

2026-11-28检查仅覆盖入口、四仓库元数据/README及一项PR说明；站内技术内容未整体核验。完整范围见 [[journal/health-check-2026-11-28-开放学习]]，不得以入口登记提升硬件技术状态。

## 按用途发现入口（本轮定向访问）

视频出处和未逐项核验范围见 [[external/网站推荐视频来源说明]]。下表记录公开HTTP请求时间为2026-11-28；状态只反映本次请求，不代表账号登录后的浏览体验或站内内容正确性。

| 类别 | 入口 | 本轮访问观察 |
|---|---|---|
| 原厂主页 | [TI](https://www.ti.com/) / [ADI](https://www.analog.com/) / [ST](https://www.st.com/) / [Infineon](https://www.infineon.com/) / [MPS](https://www.monolithicpower.com/) / [Microchip](https://www.microchip.com/) | TI/ADI/Infineon/Microchip返回200并取得标题；MPS返回验证页；ST返回567 |
| 原厂社区 | [TI E2E](https://e2e.ti.com/) / [ADI EngineerZone](https://ez.analog.com/cn) / [ST Community](https://community.st.com/) | 均返回200；E2E与EngineerZone另已读主页正文 |
| 社区/CSDN | [电子发烧友](https://bbs.elecfans.com/) / [21ic](https://bbs.21ic.com/) / [EEWorld](https://www.eeworld.com.cn/) / [阿莫](https://www.amobbs.com/) / [野火](https://www.firebbs.cn/) / [安富莱](https://forum.anfulai.cn/) / [正点原子](https://www.openedv.com/) / [PCB联盟](https://www.pcbbar.com/) / [EDA365](https://www.eda365.com/) / [逆天PCB](https://www.ntpcb.com/) / [易特创芯](https://www.eetop.cn/) / [CSDN](https://www.csdn.net/) / [与非网](https://www.eefocus.com/) / [凡亿课堂](https://www.fanyedu.com/) | 除野火超时、易特创芯403外其余返回200；EEWorld本轮未提取到标题 |
| 开源/封装/工具 | [OSHWHub](https://oshwhub.com/) / [Hackaday](https://hackaday.com/) / [CircuitMaker](https://circuitmaker.com/) / [IC封装网](https://www.iclib.com/) / [Ultra Librarian](https://www.ultralibrarian.com/) / [3D ContentCentral](https://www.3dcontentcentral.com/) / [CircuitLab](https://www.circuitlab.com/) / [OKAWA](https://sim.okawa-denshi.jp/en/) | 除OKAWA超时外均返回200；本轮未抽查每个模型或项目 |
| 源码与固定版本 | [GitHub](https://github.com/) | 返回200；固定链接说明见 [[external/GitHub检索与版本化阅读]] |

本轮请求结果与代码中记录的访问日期为客户端时间；MPS挑战页不当作实质主页内容。站点访问限制和无标题不是内容不存在的证据。

## 声学学习笔记

| 笔记 | 用途 | 状态 |
|---|---|---|
| [[external/扬声器频响-读图与指标|频响读图与指标]] | SPL、灵敏度、输入/距离条件与曲线比较 | 外来资料主导，待核验 |
| [[external/扬声器频响-测量与校准流程|测量与校准流程]] | 扫频、校准、IR/ETC、时间窗、数据记录 | 流程建议，尚未执行测试 |
| [[external/扬声器频响-指向性房间与EQ边界|指向性、房间与EQ边界]] | 离轴、房间峰谷、动态与EQ风险 | 假设与推导需实测 |

由[[wiki/综合/扬声器声学频响知识导航|声学知识导航]]连接模电、采集、电源与测量；区分声压频响和电源环路频响。

## 声学官方来源

| 资源 | 用途 | 可靠性与引用门禁 |
|---|---|---|
| [[external/扬声器测量与校准-REW|REW测量与校准]] | 测量电平、声卡/麦克风校准 | 官方方法，不能作为本设备性能证据 |
| [[external/脉冲响应与时间窗-REW|REW脉冲响应与时间窗]] | IR/ETC、窗与相位 | 官方软件定义，具体测量条件待核验 |
| [[external/扬声器自由场与指向性-Klippel-NFS|Klippel NFS]] | 自由场重建、指向性与声功率 | 厂商方法说明，不是本库实测或独立认证 |

获取日期2026-11-07，全部`needs-review`，URL/版本/版权/HTTP响应哈希见资源页。

## PCB与电路资料

| 资源 | 用途 | 可靠性 | 是否支撑 Wiki | 条目 |
|---|---|---|---|---|
| Intel 高速板级设计指南 | 互连、阻抗、回流 | 高（官方） | 待核验 | [[高速PCB设计指南-Intel]] |
| TI 高速 PCB 布局指南 | 拓扑、回流、去耦、层叠 | 高（官方） | 待核验 | [[高速PCB设计指南-TI]] |
| ADI AN-1142 | 高速 ADC 布局与回流 | 高（官方） | 待核验 | [[高速ADC-PCB布局-ADI-AN1142]] |

## ESD 测试模型

| 资源 | 用途 | 可靠性 | 是否支撑 Wiki | 条目 |
|---|---|---|---|---|
| ESD Association 器件敏感度与测试 | 区分组件级 JS-001 HBM 与系统级 IEC 61000-4-2 | 高（协会教育资料；不是标准正文） | 定义边界，不单独作为放行证据 | [[external/ESD协会器件ESD敏感度与系统抗扰边界]] |

## 毕设文献与检索

| 资源 | 用途 | 可靠性 | 是否支撑 Wiki | 条目 |
|---|---|---|---|---|
| 知网毕设文献题录清单（电机/运动控制） | BLDC/PMSM 驱动与 FOC、无感控制、嵌入式硬件实现的选题与参考池（66 条实测题录，分 A 学位论文 / B 期刊 / C 板级 EMC / D 未命中） | 中（题录级，来源为知网实测检索，全文待用户下载核对） | 否（题录未核验，不得支撑 Wiki 结论） | [[知网毕设文献题录清单-电机控制方向]] |
| 毕设文献 PDF 存放区 | 从知网下载的全文存放位置（只读，命名与题录编号对应） | —（空目录） | 否（尚无全文） | [[毕设文献/README|毕设文献]] |
| 检索原始数据 | 知网检索的未加工原始返回，用于复核题录著录 | 高（机器抓取原文） | 否（仅作证据，不支撑结论） | [[检索原始数据/README|检索原始数据]] |
| 第一批优先下载文献直链 | 6 篇优先文献的知网详情页直链与命名建议 | 中（链接有时效） | 否（仅作下载导航） | [[第一批优先下载文献-详情页直链]] |

## 嵌入式开源项目

| 资源 | 用途 | 可靠性 | 是否支撑 Wiki | 条目 |
|---|---|---|---|---|
| GitHub SimpleFOC Arduino-FOC | BLDC/PMSM/步进电机 FOC 原型与控制接口 | 中高（活跃开源项目） | 否，待核验 | [[GitHub-SimpleFOC-Arduino-FOC]] |
| GitHub PX4 Autopilot | 无人机飞控架构、传感器融合、仿真与板级支持 | 高（成熟开源项目） | 否，待核验 | [[GitHub-PX4-Autopilot]] |
| GitHub Raspberry Pi pico-sdk | RP2040/RP2350 SDK、PIO、构建系统与示例 | 高（芯片厂商官方） | 否，待核验 | [[GitHub-raspberrypi-pico-sdk]] |
| GitHub STMicroelectronics STM32CubeF4 | STM32F4 HAL/LL、CMSIS、中间件和官方示例 | 高（芯片厂商官方） | 否，待核验 | [[GitHub-STM32CubeF4]] |

## 查询工具

| 资源 | 用途 | 可靠性 | 是否支撑 Wiki | 条目 |
|---|---|---|---|---|
| 半导小芯芯片查询工具（semiee.com） | 数据手册/规格书检索、国产替代型号、BOM 批量核对、丝印反查 | 中高（商业聚合平台，手册版本可能滞后原厂） | 否，仅作检索入口 | [[半导小芯-芯片查询工具]] |

## 使用规则

- `external/` 与用户导入资料 `Imported/`、用户原始备份完全分离。
- 原始附件与历史获取记录只读；来源登记用`external-resource`，派生笔记可用`concept`/`synthesis`并更新日期、逐节出处和待核验项。HTTP响应哈希不等于本地原文归档。
- 外来资料参与硬件结论时，相关 Wiki 页面标记 `needs-review` 并写明核验动作。
