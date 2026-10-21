# Embedded-Hardware-Atlas · 嵌入式硬件知识库

一个面向**嵌入式硬件工程师**的个人知识库：以 Obsidian 为载体，用「原始资料 → 分类整理 → Wiki 内化 → 思维模型」四层结构，系统沉淀电路原理、器件知识、PCB 工程方法与设计评审经验，并由 Git 进行版本管理。

- **规模**：630+ 篇 Markdown 笔记，200+ 份芯片手册 / 文献 PDF
- **覆盖**：模拟/数字电路、电源设计、信号完整性（SI/PI/EMC）、叠层与阻抗、PCB 模块化布局布线、器件手册解读
- **特点**：每篇 Wiki 页均有 frontmatter 与来源追溯（`sources`），状态分级（`seed / reviewed / needs-review`），事实与推断显式分离
- **维护方式**：人类贡献原始资料与经验，AI Agent 按 `AGENTS.md` 规则负责整理、内化与索引（详见 [AGENTS.md](AGENTS.md)）

> ⚠️ 本库为个人学习与工程参考用途，不保证内容完全准确。所有器件参数以原厂最新数据手册为准，绝对最大额定值不可作为设计目标。

---

## 目录结构

```text
Embedded-Hardware-Atlas/
├── AGENTS.md / rules.md / schema.md   # Agent 规则手册、硬规则、数据模式
├── index.md                           # 全库查询入口（内容目录 + 时间线）
├── log.md                             # 全库变更日志（只追加）
├── wiki/                              # ★ AI 维护的知识正文（核心层）
│   ├── 原理/                          #   模电/数电/电源/SI/PI/EMC/叠层阻抗
│   │   └── 芯片手册/                  #   器件页（MCU/电源管理/无线通信/传感器…）
│   ├── PCB/                           #   按功能模块的布局布线方法与设计审查
│   ├── 综合/                          #   跨主题决策框架、比较、排障路径
│   └── 来源映射.md                    #   分类稿 ↔ Wiki 页的追溯关系
├── 硬件/                              # 原始资料层
│   ├── 原始备份/                      #   用户原件，只读、不可修改
│   ├── 原理/ · PCB/                   #   当前 Wiki 的分类有效来源
│   └── 芯片数据手册/                  #   器件手册 PDF 原件
├── external/                          # AI 主动获取的外来资源（只读归档 + 登记条目）
├── 思维模型库/                        # 元方法层：第一性原理、5W2H、MECE、OODA…
├── journal/                           # daily 工作日志 / planning 计划
└── Imported/ · Excalidraw/            # 用户导入资料 / 手绘图
```

### 内容组织原则

- **按知识主题组织，不按课程/视频/集数组织**——同一个知识点无论来自哪份资料，都收敛到同一篇 Wiki 页。
- **页面类型**由 frontmatter `type` 标定：`principle`（原理）/ `datasheet`（器件）/ `pcb-module`（模块电路）/ `pcb-method`（工程方法）/ `synthesis`（综合决策）/ `meta-method`（思维模型）/ `external-resource`（外来资源）。
- **每页必有来源**：`sources` 字段写明该结论出自哪些原始文件；`external/` 中的外来资料参与结论时，页面强制标记 `needs-review`。
- **私有边界**：`硬件/私人备份/` 仅本地保存，已由 `.gitignore` 排除，不出现在本仓库中。

---

## 如何检索与使用

### 人类读者

1. **从 [index.md](index.md) 入手**——它是全库的内容目录，按主题和更新时间列出所有 Wiki 页的链接。
2. 主题入口：
   - 电路原理 → [wiki/原理](wiki/原理)（SI/PI/EMC、电源、模数电）
   - PCB 设计 → [wiki/PCB](wiki/PCB)（布局布线模块方法、审查报告）
   - 器件速查 → [wiki/原理/芯片手册](wiki/原理/芯片手册)（每颗器件一页：关键参数、应用条件、限制与坑）
   - 跨主题决策 → [wiki/综合](wiki/综合)（如《硬件设计审查框架》）
3. 在 Obsidian 中打开本仓库可获得完整体验：双链跳转、标签检索、Graph 视图。
4. 看到状态为 `needs-review` 的页面，说明结论尚待核验，引用前请先核对 `sources` 指向的原始资料。

### AI Agent 使用约定

若你以 AI Agent 身份使用本库（如 Claude/WorkBuddy 等），请**先读 [AGENTS.md](AGENTS.md)**。要点：

- 访问顺序：`index.md` 判定问题 → 选择 `思维模型库/` 中的方法 → 按需读取相关页面 → 区分事实/推断/冲突 → 输出证据 → 更新索引与日志；
- 禁止遍历全库加载；`硬件/原始备份/` 只读；`硬件/私人备份/` 未经授权不得读取；
- 输出硬件结论时必须附带来源路径与验证动作。

---

## 内容更新与维护规范

本库采用「人类供料 + Agent 整理」的协作模式，所有变更遵循 `AGENTS.md` / [rules.md](rules.md) / [schema.md](schema.md)：

| 动作 | 规范 |
|---|---|
| **新增原始资料** | 只放进 `硬件/原始备份/`（或器件手册放 `硬件/芯片数据手册/`），不可修改已有文件 |
| **新增 Wiki 页** | 必须含 frontmatter（title / type / status / updated / sources / tags），状态从 `seed` 起步 |
| **状态流转** | `seed`（草稿）→ `reviewed`（已核对来源）→ 内容存疑时回退 `needs-review` |
| **登记外来资源** | 在 `external/` 建条目，必须写 URL、获取日期、作者/机构、可靠性、许可、待核验项 |
| **变更留痕** | 每次摄入/修改后同步更新 `index.md`、追加 `log.md`、写当日 `journal/daily/YYYY-MM-DD.md` |
| **版本管理** | Git 管理；提交前核验 `.gitignore`，确保私人资料与临时文件不入库 |

### Frontmatter 示例

```yaml
---
title: BQ24074
type: datasheet
status: reviewed
updated: 2026-09-19
sources: [硬件/芯片数据手册/BQ24074数据手册.pdf]
tags: [嵌入式, 电源管理, 锂电充电]
---
```

---

## 常见问题（FAQ）

**Q：为什么有些页面标着「待复核」？**
`needs-review` 是本库的诚实机制：来源存在冲突、型号/版本不明、或结论主要由外来资料支撑时，页面会被显式标记，提示引用者先自行核验。

**Q：wiki 里的器件页能替代官方数据手册吗？**
不能。器件页是对手册的提炼（关键参数、应用边界、易错点），只做导航与速查；设计取值一律以原厂最新手册为准。

**Q：为什么仓库里没有某些我在本地见过的目录？**
`硬件/私人备份/` 等私有内容已被 `.gitignore` 排除，仅存在于本地。

**Q：可以转载 / 复用本库内容吗？**
Wiki 正文与结构化笔记可参考、复用，请注明出处；`硬件/` 与 `external/` 下的原厂手册、第三方文献版权归原权利人所有，本库仅作个人学习存档。

**Q：如何贡献或纠错？**
这是个人知识库，暂不接受 PR；发现错误欢迎提 Issue。

---

## 相关链接

- 个人主页 / 其他项目：见 GitHub Profile
- 协作规范细节：[AGENTS.md](AGENTS.md) · [rules.md](rules.md) · [schema.md](schema.md)
