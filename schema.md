# 知识库模式

## 根结构

```text
嵌入式/
|- AGENTS.md                  # 完整维护规则
|- rules.md / schema.md       # 规则摘要与字段/检查契约
|- index.md                   # 唯一内容入口
|- 硬件/
|  |- 原始备份/               # 用户原件，只读
|  |- 私人备份/               # 私人资料，仅本地
|  |- 原理/                   # 分类有效来源
|  `- PCB/                    # 分类有效来源
|- external/                  # AI 获取的外来资源及派生笔记
|  `- index.md / 资源条目模板.md
|- wiki/                      # AI 维护的知识层
|- 思维模型库/                 # 通用方法层，与 wiki/ 平行
`- journal/
   |- daily/YYYY-MM-DD.md
   `- planning/current_plan.md
```

## 本机根配置

`.kb.local.json` 是被 `.gitignore` 排除的本机配置，格式如下。检查器从自身位置解析仓库根目录，并要求 `root` 与之相同；知识页面和脚本不得写入本机绝对路径。

```json
{
  "root": "<当前 Git 仓库根目录的绝对路径>"
}
```

## 私人资料边界

`硬件/私人备份/` 不属于公开来源层，必须由根 `.gitignore` 排除。不得登记其文件明细、哈希或内容到公开清单、来源映射、索引及知识页；不得复制到可发布目录规避忽略规则。只有用户另行明确授权后才能读取其内容，发布仍需用户明确授权。

## 页面类型

| 类型 | 目录建议 | 作用 |
|---|---|---|
| `principle` | `wiki/原理/` | 可跨项目复用的电子、PI、SI、EMC 原理。 |
| `datasheet` | `wiki/原理/芯片手册/` | 器件事实、应用条件、限制与项目确认项。 |
| `pcb-module` | `wiki/PCB/` | 按功能模块归纳布局、布线、测试和失效模式。 |
| `pcb-method` | `wiki/PCB/` | 跨模块工程方法、DFM、DFT、发布流程。 |
| `comparison` | `wiki/综合/` | 对多个器件、方案或条件进行有来源的比较。 |
| `synthesis` | `wiki/综合/` | 连接多个主题的决策框架、比较、排障路径。 |
| `source-map` | `wiki/` | 分类稿与 Wiki 页的追溯关系。 |
| `meta-method` | `思维模型库/` | 通用思维方法；不作为硬件来源，正文使用固定六段结构。 |
| `external-resource` | `external/` | AI 获取的外来来源登记；不直接替代分类有效来源。 |
| `concept` | `external/` | 基于外来来源形成的概念笔记，须逐节注明出处。 |

外来派生笔记可使用 `concept` 或 `synthesis`；其 `sources` 指向实际外来来源登记页，并保持 `needs-review`，直到结论得到分类有效来源复核。

## Frontmatter

每个正式页面必须包含以下六个字段。`sources` 使用相对根目录路径；标签最多 6 个，并用于领域、主题或检索，不得使用禁用泛标签。

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

允许的 Wiki `type` 为 `principle`、`datasheet`、`pcb-module`、`pcb-method`、`concept`、`comparison`、`synthesis`、`source-map`；`思维模型库/` 使用 `meta-method`，外来资源登记使用 `external-resource`。状态为 `seed`、`reviewed` 或 `needs-review`；分类来源另可使用 `curated`。Wiki 的 `sources` 只指向 `硬件/原理/`、`硬件/PCB/` 或已登记的 `external/` 来源。外来来源主导的硬件结论标为 `needs-review`。

`meta-method` 页面的 `sources` 通常为空；其正文包含“是什么、何时使用、怎么用、示例、常见误区、我的案例与规则”，并包含输入、输出、组合模型和触发词。

## 外来资源条目

模板必须保持下列 frontmatter 字段、状态枚举、标签规则与检查器一致：

```yaml
---
title: 资源名称
type: external-resource
status: seed
updated: YYYY-MM-DD
sources: []
tags: [外来资料, 来源登记]
---
```

条目正文记录原始 URL、获取日期、作者/机构、官方性、用途、可靠性判断、版本/发布日期、许可/访问限制、可引用边界、相关 Wiki 页面和待核验项。可选本地文件路径使用根相对路径；SHA-256 必须说明对应本地文件还是 HTTP 响应。`待核验` 用状态或正文表达，不作为标签。

## 整理清单 v2

| 字段 | 约束 |
|---|---|
| `role` | `raw-source` / `backup-source` / `curated-source` 三选一。 |
| `bytes`、`sha256` | 必须与当前文件一致；内容漂移时保留 `previous_sha256`。 |
| `duplicate_of` | 可选，必须指向现存且同哈希文件。 |
| `note` | 可选；缺附件、文件名与正文不符、用户排版变更等写明原因。 |
| `status` | `available` / `needs-review`；只说明字节一致性，不代表事实已核验。 |
| `previous_sha256` | 可选，记录内容变化前的哈希。 |
| `pre_split_git_head_sha256` | 可选，记录拆分前 HEAD blob，仅用于追溯。 |
| `structural_only_sha256`、`content_updated` | 可选；证明纯结构拆分未改正文，当前 SHA 必须匹配。 |

`items` 只登记现存来源和分类稿，路径相对知识库根目录；`retired_items` 保存完全缺失来源的旧路径与哈希，不计入当前可用来源。用户原件和分类稿进入整理清单，外来资源使用独立来源登记。

## 健康检查契约

`scripts/check_kb.py` 必须检查以下项目。新增缺附件报错；已登记缺附件作为告警保留。

| 检查 | 级别 |
|---|---|
| frontmatter 六字段、类型/状态枚举、日期格式 | 错误 |
| `sources` 目标存在且位于允许来源层 | 错误 |
| Wiki 双链、Markdown 链接、索引可达、孤儿页 | 错误 |
| 每页有效出链不少于 2 | 错误 |
| `duplicate_of` 悬空或哈希不符 | 错误 |
| 同哈希重复原件未登记或未清理 | 错误 |
| 新增缺附件引用未登记（含 Markdown、Obsidian 嵌入及 HTML `img`） | 错误 |
| `reviewed` 页面引用了更新的来源 | 错误 |
| 重复标题、目录状态与目标不符 | 错误 |
| Wiki 超 200 行、分类稿超 400 行 | 错误 |
| 标签缺少主题/检索标签、超过 6 个或含禁用泛标签 | 错误 |
| 私人路径进入 Git 索引或出现在公开链接中 | 错误 |
| `.kb.local.json` 缺失或配置根目录与当前仓库不同 | 错误 |
| 已登记缺附件引用、退役来源及未决历史差异 | 告警 |

## 附件缺口基线

`journal/attachments-baseline.json` 记录已登记缺图。键为原始文件相对路径，值为 `{count, reason, since}`。体检仅将超出基线的缺图报错；基线内缺图保留告警并记录来源、行号、引用目标和原因。

`originals` 只允许尚存的失效嵌入；修复后移入 `resolved` 保存旧数量与本次处置，不扩大豁免。原图尚未取得而以可见“原图待补”替代坏嵌入时，必须逐处保留原目标文件名，并在 `pending_originals` 登记 `{count, reason, since}`、在 `audit/图片修复明细.csv` 保留旧位置。检查器比对可见标记数量，缺失或未登记均报错；登记的原图缺口继续作为 `pending-original-images` 告警及 `pending_original_images` 总量输出。零失效链接不表示原图已全部找回。

附件扫描覆盖公开Markdown（含 `Imported/`），跳过私人目录、工具数据和Excalidraw绘图专用块；代码示例与隐藏注释中的图像语法不视为正文嵌入。

## 审计输出

- `audit/auto_fix_todo.md`：整改项、证据和验收条件。
- `audit/missing_attachments.csv`：字段 `source,line,target,reason`。
- `audit/review_queue.csv`：字段 `priority,path,status,updated,sources,reason`。
- `audit/external-links.csv`：来源页、行号、URL、检查时间、HTTP 状态和结果类别。

审计文件是基于已登记来源生成的维护视图，不构成新的事实来源。带认证或临时会话参数的 URL 不发送到外链检查器；网络检查只报告状态，不自动改写来源。

## 维护记录格式

知识库维护记录只追加：

```markdown
## [YYYY-MM-DD] action | 简短摘要
- 变更内容、影响页面、来源和验证结果。
```

每日记录 `journal/daily/YYYY-MM-DD.md` 固定包含“工作日志”和“下一步计划”两节；下一步计划覆盖更新，不堆积历史版本。
