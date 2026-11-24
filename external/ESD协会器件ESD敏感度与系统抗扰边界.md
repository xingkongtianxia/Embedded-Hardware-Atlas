---
title: 器件 ESD 敏感度与系统抗扰边界
type: external-resource
status: needs-review
updated: 2026-11-21
sources: []
tags: [外来资料, ESD, IEC 61000-4-2, JS-001]
---

## 来源身份

- 原始 URL：<https://www.esda.org/esd-overview/esd-fundamentals/part-5-device-sensitivity-and-testing/>
- 获取日期：2026-11-21；访问结果 HTTP 200。
- 作者/机构：EOS/ESD Association, Inc. 页面为 ESD Fundamentals Part Five。
- 官方性：该协会的公开教育材料；不是 IEC 61000-4-2 或 ANSI/ESDA/JEDEC JS-001 标准正文。
- 版本/发布日期：网页未标明固定修订日期，获取时页面引用 JS-001。
- 许可/访问限制：网页可公开访问；著作权归协会，本站仅登记短摘要和链接，不保存副本或转载全文。
- HTTP 响应 SHA-256：`07e458c5f50cd26e192cb480206332f254b097673f7c9f001dd70d42093dc308`。
  该值标识本次 HTTP 响应字节，不代表本地存有原网页。
- 用途/可靠性：用于区分器件级敏感度表征和系统级静电抗扰测试。标准判定仍须使用适用于产品的当前标准版本与认可的测试方案。
- 可引用边界：不能将组件 HBM 分类值换算成 IEC 系统等级，不能据组件测试等级宣称整机 IEC 61000-4-2 通过。
- 待核验项：项目适用的 JS-001 与 IEC 61000-4-2 版本、等级、试验点和验收准则。

## 核心边界

- ANSI/ESDA/JEDEC JS-001 的组件级 HBM 使用 100 pF 电容和 1.5 kΩ 串联电阻。
- IEC 61000-4-2 的系统级放电网络使用 150 pF 和 330 Ω；该试验评估设备/系统在现场放电条件下的抗扰表现。
- 两类试验的波形及严重度不可直接互换。具体设计按标准当前版本、设备端口、测试布置与验收等级确定。

## 相关知识

- [[wiki/原理/EMC|EMC]]：从端口、电流回路和系统试验检查抗扰设计。
- [[wiki/PCB/连接器保护与EMC模块|连接器保护与 EMC]]：TVS、泄放回路和板级布局。
- [[external/高速PCB设计指南-TI|TI 高速 PCB 布局指南]]：补充 PCB 回流和布局参考。
