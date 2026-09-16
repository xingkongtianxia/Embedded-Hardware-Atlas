# 知识库模式

## 根结构

```text
嵌入式/
|- AGENTS.md                  # 规则手册
|- rules.md / schema.md       # 硬规则与数据模式
|- index.md / log.md          # 内容目录与时间线
|- 硬件/
|  |- 原始备份/               # 用户原件，只读
|  |- 原理/                   # 分类有效来源
|  `- PCB/                    # 分类有效来源
|- external/                  # 外来资料，只读归档
|  `- index.md / 资源条目模板.md
|- wiki/                      # AI 维护的维基层
|  |- 原理/
|  |- PCB/
|  |- 综合/                   # 跨主题设计决策与比较
|  `- 来源映射.md
|- 思维模型库/                 # 元方法层（与 wiki/ 平行的通用思维方法论）
`- journal/
   |- daily/YYYY-MM-DD.md
   `- planning/current_plan.md
```

## 页面类型

| 类型 | 目录建议 | 作用 |
|---|---|---|
| `principle` | `wiki/原理/` | 可跨项目复用的电子、PI、SI、EMC 原理。 |
| `datasheet` | `wiki/原理/芯片手册/` | 器件事实、应用条件、限制与项目确认项。 |
| `pcb-module` | `wiki/PCB/` | 按功能模块归纳布局、布线、测试和失效模式。 |
| `pcb-method` | `wiki/PCB/` | 跨模块工程方法、DFM、DFT、发布流程。 |
| `synthesis` | `wiki/综合/` | 连接多个主题的决策框架、比较、排障路径。 |
| `source-map` | `wiki/` | 分类稿与维基页的追溯关系。 |
| `meta-method` | `思维模型库/` | 通用思维方法论（第一性原理、5W2H、MECE 等）；与 `wiki/` 平行，`sources` 通常为空，正文按"是什么/何时用/怎么用/示例/误区/我的规则"组织。 |
| `external-resource` | `external/` | AI 主动获取的外来资源登记；不直接替代分类有效来源。 |

## Frontmatter

```yaml
---
title: 页面名称
type: principle
status: reviewed
updated: YYYY-MM-DD
sources: [硬件/原理/示例.md]
tags: [嵌入式, 主题]
---
```

`meta-method` 类型的页面示例（用于 `思维模型库/`）：

```yaml
---
title: 第一性原理
type: meta-method
status: seed
updated: 2026-09-05
sources: []
tags: [思维, 元方法, 分层=元思维层]
---
```

`sources` 用相对根目录路径。现阶段 Wiki 正文只可引用 `硬件/原理/` 或 `硬件/PCB/`；外来资料参与结论时，页面需把状态设为 `needs-review` 并写出获取信息和核验需求。`meta-method` 页面是元方法论，不引用硬件原始资料，其 `sources` 字段通常为空，状态以 `seed` 起步并随个人案例积累升至 `reviewed`。AI 访问顺序为判定问题/资料层、选择模型、按需读取、区分事实与推断、输出验证动作、决定沉淀并更新索引日志。`Imported/` 是用户导入资料，不属于 `external/`。

模型页正文除六个固定段外，统一包含 `输入`、`输出`、`组合模型`、`触发词`，用于 AI 选择方法和检查产出完整性。

`external-resource` 条目示例：

```yaml
---
title: 资源名称
type: external-resource
status: needs-review
updated: YYYY-MM-DD
sources: []
tags: [外来资料, 待核验]
---
```

正文必须包含：原始 URL、获取日期、作者/机构、官方性、用途、可靠性判断、版本/发布日期、许可/访问限制、文件哈希（如有）、可引用边界、待核验项和相关 Wiki 页面。

## 日志格式

`log.md` 只追加：

```markdown
## [YYYY-MM-DD] ingest | 简短摘要
- 变更内容、影响页面、来源和验证结果。
```

`journal/daily/YYYY-MM-DD.md` 固定为“工作日志”和“下一步计划”两节；后者覆盖更新，不堆积历史版本。
