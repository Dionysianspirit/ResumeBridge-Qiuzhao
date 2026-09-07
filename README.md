<p align="center">
  <img src="assets/resumebridge-logo.png" width="176" alt="履历桥 ResumeBridge Logo" />
</p>

<h1 align="center">履历桥 · 秋招助手</h1>

<p align="center">
  一份本地履历，加上一份秋招投递总表。
</p>

<p align="center">
  <img alt="Version 0.2.0" src="https://img.shields.io/badge/version-0.2.0-0f766e" />
  <img alt="Chrome Manifest V3" src="https://img.shields.io/badge/Chrome-Manifest%20V3-2563eb" />
  <img alt="Local first" src="https://img.shields.io/badge/data-local--first-334155" />
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-16a34a" /></a>
</p>

<p align="center">
  中文 | <a href="README.en.md">English</a>
</p>

ResumeBridge-Qiuzhao 是一个面向校园招聘网申的 Chrome / Edge 扩展。你在本机维护一份结构化履历，在不同招聘网站上复用填写；同时内置一份 2026 秋招投递总表，用来浏览、筛选和记录进度。

> [!IMPORTANT]
> 这是填写辅助工具，不是自动投递机器人。它不会上传附件、绕过验证码或点击最终提交。每次填写都由你触发，结果也必须由你复核。

当前版本为 **0.2.0 本地公开版**，适合自己加载使用。尚未发布到浏览器扩展商店。

本仓库在 [ResumeBridge](https://github.com/xiaocheng223/ResumeBridge) 基础上增加了秋招总表、多简历切换和投递进度联动。填写引擎来自上游，投递表是额外送出的社区快照。

## 它能做什么

| 能力 | 说明 |
| --- | --- |
| 一份履历复用 | 本地维护基本信息、求职意向、教育、实习、项目、证书等，在不同 ATS 表单里辅助填写 |
| 秋招投递总表 | 内置 2026-09-06 快照：有效招聘约 2,788 条，过期约 489 条，本周优先 100 条 |
| 未投 / 已投追踪 | 从总表打开官网后不会自动记为已投；你提交后再记录，公司和岗位分别记账 |
| 多份简历 | 最多 20 份本地简历，投不同岗位时可切换 |
| 谨慎填写 | 默认不覆盖已有内容，不自动填敏感字段和声明，不处理上传与提交 |
| 可选 AI | 默认关闭。开启后只发送字段标签等元数据，不发送履历具体值 |

招聘网站会改页面。已有适配规则不等于永远兼容。没认出来的控件会留成待处理，而不是强行填写。

## 投递总表

点击插件弹窗的「打开投递总表」即可使用，无需再开 Excel、也不用起本地服务器。

随仓库送出的文件：

- [`data/catalog.json`](data/catalog.json)：插件运行时读取的清单
- [`data/2026秋招投递总表-20260906.xlsx`](data/2026秋招投递总表-20260906.xlsx)：同一份快照的表格，方便用 Excel 打开或自行筛选

数据来自社区投递表（土豆投递表、互联派）的 2026-09-06 快照，公开前已去掉个人「挂钩提示」。公司名、岗位、投递链接、档位、截止日期等招聘信息保留，方便后来的同学接着用。

请把这份表当成**起点**，不要当成官方实时招聘库：

- 「未过期」按原表日期计算，不保证官网仍在开放
- 「招满为止」不会被编造成具体日期
- 岗位是否还招、内推是否还有效，以官网为准

## 安装

需要 Chrome 或 Edge，用开发者模式加载。

```powershell
git clone https://github.com/Dionysianspirit/ResumeBridge-Qiuzhao.git
cd ResumeBridge-Qiuzhao
```

1. 打开 `chrome://extensions/` 或 `edge://extensions/`。
2. 开启「开发者模式」。
3. 点击「加载已解压的扩展程序」。
4. 选择克隆下来的 `ResumeBridge-Qiuzhao` 目录。
5. 固定工具栏图标。

可以在设置页导入 [sample-profile.json](sample-profile.json) 走一遍流程，其中全部内容都是虚构数据。

## 使用

1. 打开设置，填写并保存本地履历；需要时另存为针对不同岗位的版本。
2. 打开投递总表，按公司、岗位、城市或档位筛选，点「去投递」。
3. 在招聘表单页点击「开始填写」，核对绿色已填字段和橙色待处理字段。
4. 自己完成附件、敏感问答、验证码和最终提交。
5. 提交后回到插件，确认公司、具体岗位和状态，再点「记录本次投递」。
6. 总表会显示已投岗位数量；同一公司的不同岗位请分别记录。

> [!TIP]
> 第一次在某个网站使用时，建议保留全部谨慎策略，先用虚构或低敏感度数据看字段映射是否正确。

## 安全与隐私

| 场景 | 默认行为 |
| --- | --- |
| 网页字段已有内容 | 不覆盖 |
| 证件、家庭、紧急联系人、健康等敏感字段 | 留给你确认 |
| 背景调查、诚信声明、亲属回避 | 留给你确认 |
| 文件上传、申请按钮、最终提交 | 永不自动操作 |

- 履历、API Key 和投递进度只存在当前浏览器的 `chrome.storage.local`，不进这个 Git 仓库，也没有云同步。
- 扩展只在你主动点击后访问当前标签页。
- AI 默认关闭；开启后请求里不应包含姓名、电话、邮箱、证件号或经历正文。
- 本机存储不是口令加密保险箱。不要在公用电脑里保存身份证和家庭成员等信息。
- 公开 Issue 里请不要粘贴真实履历、Cookie、API Key 或完整招聘页源码。

## 兼容性

- 浏览器：Manifest V3，面向新版 Chrome 与 Edge。
- 页面控件：原生表单较好；常见年/月下拉和内联项目列表有启发式支持。弹窗式新增、Shadow DOM、级联地址和未适配虚拟列表仍可能要手动处理。
- 多步骤表单：翻到下一页后需要再点一次「开始填写」。
- 平台规则：不绕过验证码、反自动化或招聘平台限制。

## 开发

需要 Node.js 20 或更高版本。运行时代码没有第三方依赖。

```powershell
npm run check     # 检查扩展脚本语法
npm run package   # 生成 dist/chrome-版本号，已有目录时拒绝覆盖
```

重新导入投递表（会保留每一行，并拒绝覆盖已有输出）：

```powershell
python scripts/import-catalog.py path\to\workbook.xlsx data\catalog.json
```

公开前请自行清空个人备注列。本仓库发布稿已经去掉「挂钩提示」。

## 项目结构

```text
ResumeBridge-Qiuzhao/
├─ manifest.json
├─ src/                      # 扩展脚本与页面
│  ├─ background.js          # 配置、AI 调用、消息边界
│  ├─ content.js             # 表单扫描与填写
│  ├─ catalog.*              # 秋招投递总表
│  ├─ options.*              # 履历和策略设置
│  ├─ popup.*                # 扩展弹窗
│  └─ tracker.*              # 投递记录页
├─ data/                     # 投递总表快照（JSON + Excel）
├─ sample-profile.json       # 虚构示例履历
└─ scripts/                  # 打包与总表导入
```

## 当前限制

- 网站专用规则需要对着真实页面持续回归。
- 总表是 2026-09-06 的社区快照，不会自动刷新。
- 公司和职位识别依赖页面信号，保存前仍需你核对。
- 本地资料暂未提供口令加密。
- 没有浏览器商店签名包，也没有自动更新通道。

## 致谢

- [OpenJobAutofill](https://github.com/Br1an67/OpenJobAutofill) — 原始填写扩展
- [ResumeBridge](https://github.com/xiaocheng223/ResumeBridge) — 当前填写引擎与隐私边界
- 土豆投递表、互联派等社区整理者 — 招聘信息来源

如果这个本地定制对你有用，也欢迎给上游 ResumeBridge 点 Star。通用的填写改进请尽量回馈上游；总表和秋招工作流相关的问题可以开在本仓库。

## 许可

使用 [MIT License](LICENSE) 发布。招聘数据版权仍属于各公司和原整理者；本仓库只提供一份方便查阅的快照。
