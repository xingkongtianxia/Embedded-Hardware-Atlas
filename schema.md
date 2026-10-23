# 知识库模式

## 根结构

```text
嵌入式/
|- AGENTS.md                  # 规则手册
|- rules.md / schema.md       # 硬规则与数据模式
|- index.md / log.md          # 内容目录与时间线
|- 硬件/
|  |- 原始备份/               # 用户原件，只读
|  |- 私人备份/               # 私人所有、仅本地；不公开、不提取为公开知识
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

## 私人资料发布边界

`硬件/私人备份/` 不属于公开来源层，必须由根 `.gitignore` 排除。不得登记其文件明细、哈希或内容到公开清单、来源映射、索引及知识页；不得复制到可发布目录规避忽略规则。只有用户另行明确授权后才能读取其内容，发布仍需用户明确授权。

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


## 2026-10-23 私人部分与发布门禁

- 唯一正式知识库始终为 `D:\ai知识库\嵌入式`，维护临时文件不构成第二套知识库。
- `硬件/私人备份/`、`journal/daily/`（工作日志）、`journal/planning/`（规划库）与根 `log.md` 均为私人部分：仅本地保存，不提交、推送、复制或提取到公开知识页、导航和清单。撤下已跟踪文件时仅使用 `git rm --cached`，保留本地原件。
- 本次知识维护授权允许追加本地维护记录；不授权将既有私人日志内容转写为公开报告。公开体检报告仅记录知识结构、完整性、来源问题与验证结果，存于 `journal/health-check-*.md`。
- `.gitignore` 是持续排除规则；提交前还须运行 `python scripts/check_kb.py` 检查 Git 索引，禁止强制添加私人文件。`log.md`、每日工作日志和规划库均不得出现在公开内容链接中。历史已发布提交不会因忽略规则自动消失；未经单独授权不重写远端历史。

## 2026-10-23 来源生命周期与清单口径

- `硬件/芯片数据手册/` 为现存只读原始 PDF 来源层，和 `硬件/原始备份/` 同属用户原件；不要求为 PDF 重复制造备份。不恢复用户主动删除的原件或图片，不移动、不改写现存原件。
- Wiki 的 `sources` 仍只指向分类有效来源或符合门禁的 `external/`；分类稿的 `sources` 可指向上述现存原件。旧备份被撤下但原件仍在时，按 SHA-256 定位现存路径；同哈希别名不重复建知识页。
- 整理清单 v2 的 `items` 只登记现存来源（`raw-source` / `backup-source`）及分类稿（`curated-source`），路径相对唯一根目录；`retired_items` 保留完全缺失来源的旧路径与旧哈希，不能计入当前可用来源。
- 来源发生内容漂移时保留 `previous_sha256` 与 `needs-review`，登记当前哈希只证明当前字节一致，不代表事实内容通过核验。分类稿和受影响 Wiki 必须显式标记待复核。
- 分类稿可使用 `principle-source`、`datasheet-source`、`pcb-source` 与 `curated` 状态；这些取值不用于 Wiki。Wiki 使用既有类型与 `seed / reviewed / needs-review`。标签按主题和检索用途使用，不将器件型号误报为未知标签。


`思维模型库/README.md`为既有模型导航页，使用`synthesis`；其中其余模型页保持`meta-method`。双链最低要求对正式知识页和分类稿执行。
