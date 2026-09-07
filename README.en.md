<p align="center">
  <img src="assets/resumebridge-logo.png" width="176" alt="ResumeBridge logo" />
</p>

<h1 align="center">ResumeBridge-Qiuzhao</h1>

<p align="center">
  One local profile, plus a campus-recruiting job catalog.
</p>

<p align="center">
  <img alt="Version 0.2.0" src="https://img.shields.io/badge/version-0.2.0-0f766e" />
  <img alt="Chrome Manifest V3" src="https://img.shields.io/badge/Chrome-Manifest%20V3-2563eb" />
  <img alt="Local first" src="https://img.shields.io/badge/data-local--first-334155" />
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-16a34a" /></a>
</p>

<p align="center">
  <a href="README.md">中文</a> | English
</p>

ResumeBridge-Qiuzhao is a Chrome / Edge extension for Chinese campus recruiting. Keep one structured resume in local extension storage, reuse it across application forms, and browse a bundled 2026 autumn job catalog with per-role tracking.

> [!IMPORTANT]
> This is a filling assistant, not an application bot. It does not upload files, bypass CAPTCHAs, or click submit. Every run is user-initiated and every result needs review.

Version **0.2.0** is a public local build. It is not in the Chrome or Edge stores.

This repository builds on [ResumeBridge](https://github.com/xiaocheng223/ResumeBridge). The form-filling engine comes from upstream; the catalog, multi-resume switching and catalog-linked tracking are the extra pieces.

## Install

```powershell
git clone https://github.com/Dionysianspirit/ResumeBridge-Qiuzhao.git
cd ResumeBridge-Qiuzhao
```

1. Open `chrome://extensions/` or `edge://extensions/`.
2. Enable Developer mode.
3. Load unpacked.
4. Select the cloned `ResumeBridge-Qiuzhao` folder.

Import [sample-profile.json](sample-profile.json) for a walkthrough with fictional data.

## Catalog

The snapshot date is **2026-09-06**.

- [`data/catalog.json`](data/catalog.json) is what the extension reads
- [`data/2026秋招投递总表-20260906.xlsx`](data/2026秋招投递总表-20260906.xlsx) is the same snapshot as a spreadsheet

The bundled snapshot is the default. You can also import your own `catalog.json` from the catalog page, or convert an Excel workbook with `scripts/import-catalog.py`. Import clears personal matching columns (`挂钩提示`, `软岗分`). Deadlines and URLs go stale; verify official pages before applying.

## Safety

Resumes, API keys and application progress stay in `chrome.storage.local` on the current browser. They are not in this git repository. AI is off by default and, when enabled, is designed to send field metadata rather than profile values.

Do not paste real resumes, cookies or API keys into public issues.

## License

[MIT](LICENSE). Job-posting data still belongs to the companies and original list maintainers. This repo only ships a convenience snapshot.

Upstream projects: [OpenJobAutofill](https://github.com/Br1an67/OpenJobAutofill), [ResumeBridge](https://github.com/xiaocheng223/ResumeBridge).
