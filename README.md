<p align="center">
  <img src="assets/resumebridge-logo.png" width="176" alt="ResumeBridge Campus 履历桥 Logo" />
</p>

<h1 align="center">🌉 ResumeBridge Campus · 履历桥</h1>

<p align="center">
  <strong>秋招网申辅助填写 · 投递追踪 · 多简历管理 · 本地优先</strong>
</p>

<p align="center">
  把重复网申变成：维护一次履历 → 按需辅助填写 → 统一记录投递。
</p>

<p align="center">
  <img alt="Version 0.2.0" src="https://img.shields.io/badge/version-0.2.0-0f766e" />
  <img alt="Chrome / Edge" src="https://img.shields.io/badge/Chrome%20%2F%20Edge-Manifest%20V3-2563eb" />
  <img alt="Local first" src="https://img.shields.io/badge/data-local--first-334155" />
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-16a34a" /></a>
</p>

<p align="center">
  中文 | <a href="README.en.md">English</a>
</p>

**ResumeBridge Campus** 是一个面向中国校园招聘 / 秋招网申的 Chrome / Edge 扩展。它把结构化简历、网页辅助填写、秋招职位总表和投递进度追踪放进同一个本地工作流里，减少在招聘网站、Excel 和备忘录之间反复切换。

> [!IMPORTANT]
> **这不是自动投递机器人。** 扩展不会替你上传附件、绕过验证码、点击最终提交，也不应该替你确认敏感信息或声明。填写由你主动触发，提交前必须人工复核。

当前版本为 **0.2.0 本地公开版**，通过浏览器开发者模式加载，尚未发布到 Chrome Web Store 或 Edge Add-ons。

本项目基于 [ResumeBridge](https://github.com/xiaocheng223/ResumeBridge) 继续扩展；更早的填写能力来自 [OpenJobAutofill](https://github.com/Br1an67/OpenJobAutofill)。本仓库主要增加了 **秋招总表、多简历切换、投递记录与总表联动**。

## ✨ 核心功能

| 能力 | 当前行为 |
| --- | --- |
| 🧾 结构化履历 | 支持基本信息、求职意向、教育、实习、工作、项目、奖项、语言、证书、论文、专利等常见模块 |
| 🪄 网申辅助填写 | 扫描当前招聘页面并尝试匹配字段；默认不覆盖网页已有内容 |
| 🗂️ 多简历切换 | 本地最多保存 **20 份**简历，可为开发、产品、数据等不同方向维护版本 |
| 📚 秋招投递总表 | 内置 **2026-09-06** 社区快照，合并后约 **2,788** 条招聘记录 |
| 🔎 筛选与浏览 | 可按公司、岗位、城市、档位等条件浏览招聘信息 |
| ✅ 投递追踪 | 记录公司、岗位和状态；同一公司不同岗位分别记账 |
| 🔗 总表联动 | 从总表打开招聘页后，可在后续记录投递时关联对应条目 |
| 📥 自定义总表 | 可导入自己的 `catalog.json`，也可由 Excel 转换生成 |
| 🤖 可选 AI | 默认关闭；用于辅助字段映射，启用时仍需自行评估第三方 API 的隐私条款 |
| 🔒 本地优先 | 履历、API 配置和投递记录保存在当前浏览器本地，不依赖项目自建服务端 |

招聘网站会持续改版。这个项目更适合被理解为 **谨慎的填写助手**，而不是“所有 ATS 都能一次填完”的通用自动化工具。

## 🎯 为什么做这个项目

秋招网申真正消耗时间的，往往不是“不会填”，而是：

- 同一批个人信息和经历被不同招聘网站反复要求；
- 不同 ATS 对同一个字段使用不同名字；
- 投完之后很难记住“哪家公司、哪个岗位、进行到哪一步”；
- 招聘信息散落在 Excel、群聊、公众号和公司官网。

ResumeBridge Campus 的目标不是把投递完全自动化，而是把重复劳动压缩掉，同时把最后的判断权留给你：

- **履历只维护一遍**，常见字段尽量复用；
- **网页能稳妥识别的就填**，不确定的留给人工；
- **投递完成后再记录**，不把“点开官网”误判成“已经投递”；
- **招聘信息作为参考快照**，最终状态始终以公司官网为准。

## 🚀 快速开始

### 1. 克隆仓库

```powershell
git clone https://github.com/Dionysianspirit/ResumeBridge-Qiuzhao.git
cd ResumeBridge-Qiuzhao
```

### 2. 加载扩展

Chrome：打开 `chrome://extensions/`  
Edge：打开 `edge://extensions/`

然后：

1. 开启「开发者模式」；
2. 点击「加载已解压的扩展程序」；
3. 选择仓库根目录 `ResumeBridge-Qiuzhao`；
4. 建议固定扩展图标，方便在网申页面调用。

### 3. 先用示例数据试跑

设置页可以导入 [`sample-profile.json`](sample-profile.json)。其中内容均为虚构数据，适合先检查字段映射和页面兼容性，再决定是否录入真实履历。

## 🧭 典型使用流程

1. **维护履历**：在设置页录入资料，需要时创建针对不同岗位方向的简历版本。
2. **筛选岗位**：打开「投递总表」，按公司、岗位、城市、档位等条件浏览。
3. **打开官网**：从总表进入招聘页面。此时只代表“去看看”，不会自动记为已投。
4. **辅助填写**：在网申页面点击「开始填写」，检查已填字段和待处理字段。
5. **人工完成最后一步**：附件、验证码、敏感问答、声明和最终提交由你自己处理。
6. **记录投递**：提交后再保存公司、具体岗位和当前状态。

> [!TIP]
> 第一次在某个招聘网站使用时，建议保持默认谨慎策略，并优先用虚构或低敏感度数据测试。页面识别正确，再用于正式网申。

## 📚 秋招投递总表

仓库内置的是一份 **2026-09-06 的社区招聘信息快照**：

- [`data/catalog.json`](data/catalog.json)：扩展运行时默认读取；
- [`data/2026秋招投递总表-20260906.xlsx`](data/2026秋招投递总表-20260906.xlsx)：同一份快照的 Excel 版本；
- [`data/README.md`](data/README.md)：数据来源、清洗方式和使用说明。

快照来自社区整理的秋招投递表（土豆投递表、互联派等）。公开版本会清除「挂钩提示」「软岗分」这类与原整理者个人经历相关的字段，保留公司、岗位、链接、档位、截止日期等招聘信息。

### 导入自己的总表

插件的总表页面支持直接导入 `catalog.json`。如果手里是 Excel，可先转换：

```powershell
python scripts/import-catalog.py path\to\workbook.xlsx data\my-catalog.json
```

转换和导入过程都会清除个人匹配字段。导入自己的总表后，也可以在插件里恢复内置版本。

> [!WARNING]
> 这份数据**不是实时招聘数据库**。截止日期、岗位状态、内推信息和链接都可能变化；“招满为止”也不会被项目推测成一个具体日期。正式投递前请以公司官方招聘页为准。

## 🔐 隐私与安全

项目采用本地优先设计，但“本地”不等于“绝对安全”。

| 数据 / 操作 | 当前设计 |
| --- | --- |
| 履历、API 配置、填写策略、投递记录 | 保存在浏览器扩展本地存储 |
| 自定义招聘总表 | 保存在浏览器本地 IndexedDB |
| Git 仓库 | 不应包含你的真实履历、API Key、Cookie 或投递记录 |
| 网页已有内容 | 默认不覆盖 |
| 证件、家庭、健康、紧急联系人等敏感字段 | 默认留给人工确认 |
| 背景调查、诚信声明、亲属回避等声明类问题 | 默认留给人工确认 |
| 文件上传、验证码、最终提交 | 不自动操作 |
| AI | 默认关闭；开启后仍受你所选择 API 服务商的数据政策约束 |

AI 映射逻辑会尽量避免直接暴露已知履历值，并对已知内容做遮盖，但这不应被理解成第三方服务的隐私保证。处理真实履历前，请自行判断所使用 API 是否适合发送招聘页面元数据。

另外：

- 浏览器本地存储**没有口令加密**，不要在公用电脑上长期保存高敏感信息；
- 招聘网站结构变化可能造成误匹配，提交前必须人工检查；
- 公开 Issue 中请不要粘贴真实姓名、电话、邮箱、证件号、Cookie、API Key 或完整内部招聘页面源码；
- 安全问题请参考 [`SECURITY.md`](SECURITY.md)。

## 🧩 兼容性与边界

- **浏览器**：Manifest V3，面向新版 Chrome 与 Edge；
- **普通原生表单**：通常比复杂自定义控件更容易识别；
- **重复经历**：对教育、实习、工作、语言、家庭、培训、论文、专利、证书等重复区块有启发式处理；
- **复杂控件**：弹窗式新增、Shadow DOM、级联地址、虚拟列表等仍可能需要手动完成；
- **多步骤表单**：进入下一页后通常需要重新触发填写；
- **平台限制**：不绕过验证码、反自动化机制或招聘平台规则。

如果遇到没识别出来的字段，正确行为应该是“留给你处理”，而不是为了填满页面强行猜测。

## 🛠️ 开发

需要 **Node.js 20+**。扩展运行时代码没有第三方 npm 依赖。

```powershell
npm run check     # JavaScript 语法检查
npm test          # 当前自动化测试
npm run package   # 生成本地 Chrome 打包目录
```

Excel 招聘表转换：

```powershell
python scripts/import-catalog.py path\to\workbook.xlsx data\my-catalog.json
```

## 🗂️ 项目结构

```text
ResumeBridge-Qiuzhao/
├─ manifest.json
├─ src/
│  ├─ background.js          # 配置、存储、消息边界、AI 与总表后台逻辑
│  ├─ content.js             # 页面扫描、字段匹配与填写
│  ├─ options.*              # 履历、AI 和填写策略设置
│  ├─ popup.*                # 扩展弹窗
│  ├─ catalog.*              # 秋招投递总表页面
│  ├─ catalog-model.js       # 总表数据规范化与模型逻辑
│  ├─ tracker.*              # 投递记录页面
│  ├─ job-tracker.js         # 投递记录模型
│  ├─ safety-policy.js       # 谨慎填写策略
│  └─ ai-privacy.js          # AI 请求前的隐私处理
├─ data/                     # 招聘总表快照（JSON + Excel）
├─ scripts/                  # 打包与总表导入脚本
├─ tests/                    # 自动化测试
├─ sample-profile.json       # 虚构示例履历
├─ CONTRIBUTING.md
├─ SECURITY.md
└─ LICENSE
```

## ⚠️ 当前限制

- 网站专用适配需要随着真实招聘页面变化持续维护；
- 内置招聘总表是静态快照，不会自动刷新；
- 公司和岗位识别依赖页面信号，记录前仍需核对；
- 本地资料暂未提供口令级加密；
- 当前没有浏览器商店签名包和自动更新通道；
- AI 只能作为字段映射辅助，不应代替你判断履历内容是否适合某个字段。

## 🤝 参与项目

欢迎提交：

- 可复现的字段识别问题；
- 使用虚构数据构造的 ATS 页面样例；
- 秋招总表更新、清洗或导入流程改进；
- 多简历和投递追踪工作流改进。

具体约定见 [`CONTRIBUTING.md`](CONTRIBUTING.md)。通用填写引擎的改进，如果也适用于上游项目，建议同时考虑回馈 [ResumeBridge](https://github.com/xiaocheng223/ResumeBridge)。

## 🙏 致谢

- [OpenJobAutofill](https://github.com/Br1an67/OpenJobAutofill) — 原始填写扩展；
- [ResumeBridge](https://github.com/xiaocheng223/ResumeBridge) — 当前填写引擎与隐私边界的主要上游；
- 土豆投递表、互联派等社区整理者 — 招聘信息来源。

## 📄 License

本项目使用 [MIT License](LICENSE)。上游项目版权说明见 [`NOTICE`](NOTICE)。招聘信息本身的权利仍属于相关公司和原始整理者，本仓库仅提供便于本地使用的社区快照。

---

<p align="center">
  <strong>Keywords:</strong> 秋招 · 校招 · 网申 · 简历自动填充 · Chrome 扩展 · Edge 扩展 · 投递追踪 · 求职工具 · resume autofill · campus recruiting · job application tracker
</p>
