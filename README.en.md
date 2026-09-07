<p align="center">
  <img src="assets/resumebridge-logo.png" width="176" alt="ResumeBridge Campus logo" />
</p>

<h1 align="center">🌉 ResumeBridge Campus</h1>

<p align="center">
  <strong>Resume Autofill · Campus Recruiting Catalog · Application Tracker · Local First</strong>
</p>

<p align="center">
  Maintain your resume once → reuse it across application forms → track every application in one place.
</p>

<p align="center">
  <img alt="Version 0.2.0" src="https://img.shields.io/badge/version-0.2.0-0f766e" />
  <img alt="Chrome / Edge" src="https://img.shields.io/badge/Chrome%20%2F%20Edge-Manifest%20V3-2563eb" />
  <img alt="Local first" src="https://img.shields.io/badge/data-local--first-334155" />
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-16a34a" /></a>
</p>

<p align="center">
  <a href="README.md">中文</a> | English
</p>

**ResumeBridge Campus** is a local-first Chrome / Edge extension for Chinese campus recruiting and graduate job applications. It combines a structured resume profile, assisted form filling, a bundled recruiting catalog, and per-role application tracking in one workflow.

> [!IMPORTANT]
> **This is not an auto-apply bot.** It does not upload attachments, bypass CAPTCHAs, confirm sensitive declarations, or click the final submit button. Every fill is user-initiated and should be reviewed before submission.

The current release is **0.2.0**, distributed as a local unpacked extension. It is not yet published on the Chrome Web Store or Microsoft Edge Add-ons.

This project builds on [ResumeBridge](https://github.com/xiaocheng223/ResumeBridge), with earlier form-filling work originating from [OpenJobAutofill](https://github.com/Br1an67/OpenJobAutofill). This repository primarily adds the **campus recruiting catalog, multi-resume switching, and catalog-linked application tracking**.

## ✨ Features

| Feature | Current behavior |
| --- | --- |
| 🧾 Structured resume | Stores common sections such as personal info, job preferences, education, internships, work, projects, awards, languages, certificates, papers and patents |
| 🪄 Resume autofill | Scans the active recruiting page and attempts to map resume data to form fields without overwriting existing values by default |
| 🗂️ Multiple resumes | Keeps up to **20 local resume variants** for different job directions |
| 📚 Recruiting catalog | Bundles a **2026-09-06** community snapshot with about **2,788** merged recruiting entries |
| 🔎 Search and filtering | Browse the catalog by company, role, city, tier and other available fields |
| ✅ Application tracker | Track company, role and status; multiple roles at the same company are stored separately |
| 🔗 Catalog linking | Applications opened from the catalog can later be linked back to the corresponding catalog entry |
| 📥 Custom catalogs | Import your own `catalog.json` or generate one from an Excel workbook |
| 🤖 Optional AI mapping | Off by default; can assist field mapping, subject to the privacy terms of the API provider you choose |
| 🔒 Local first | Resume data, API configuration and application history stay in the current browser; the project has no hosted backend |

Recruiting websites change frequently. ResumeBridge Campus should be treated as a **careful form-filling assistant**, not a promise that every ATS can be completed automatically.

## 🎯 Why this exists

Campus recruiting is repetitive in ways that are hard to justify automating blindly:

- the same resume information is requested by many different career sites;
- different ATS products use different labels for the same concept;
- it is easy to lose track of which company, role and stage you are on;
- job listings are scattered across spreadsheets, community lists and official career pages.

ResumeBridge Campus reduces that repetitive work while keeping the final decision with the applicant:

- **maintain the resume once** and reuse common information;
- **fill what can be matched safely** and leave uncertain fields for review;
- **record an application only after you actually submit it**;
- **treat the bundled catalog as a starting point**, with official company pages as the source of truth.

## 🚀 Quick Start

### 1. Clone the repository

```powershell
git clone https://github.com/Dionysianspirit/ResumeBridge-Qiuzhao.git
cd ResumeBridge-Qiuzhao
```

### 2. Load the extension

Chrome: open `chrome://extensions/`  
Edge: open `edge://extensions/`

Then:

1. enable **Developer mode**;
2. choose **Load unpacked**;
3. select the `ResumeBridge-Qiuzhao` repository directory;
4. optionally pin the extension for quick access on recruiting pages.

### 3. Test with fictional data first

Import [`sample-profile.json`](sample-profile.json) from the settings page. The file contains fictional data and is intended for checking field mapping before entering a real resume.

## 🧭 Typical Workflow

1. **Maintain your resume** in Settings and create role-specific variants when needed.
2. **Browse the recruiting catalog** and filter companies or roles.
3. **Open the official application page**. Opening a link does not mark it as applied.
4. **Run assisted filling** and review filled versus unresolved fields.
5. **Complete the sensitive steps yourself**, including uploads, CAPTCHAs, declarations and final submission.
6. **Record the application** with its exact company, role and current status.

> [!TIP]
> When trying a new recruiting site for the first time, keep the cautious defaults enabled and test with fictional or low-sensitivity data before using your real profile.

## 📚 Recruiting Catalog

The repository bundles a **2026-09-06 community recruiting snapshot**:

- [`data/catalog.json`](data/catalog.json) — the catalog loaded by the extension by default;
- [`data/2026秋招投递总表-20260906.xlsx`](data/2026秋招投递总表-20260906.xlsx) — the same snapshot in Excel format;
- [`data/README.md`](data/README.md) — source and sanitization notes.

The snapshot was compiled from community-maintained campus recruiting lists, including sources commonly known as 土豆投递表 and 互联派. Personal matching columns such as `挂钩提示` and `软岗分` are removed from the public version while company names, roles, URLs, tiers and deadlines are retained.

### Import your own catalog

The catalog page can import a `catalog.json` directly. To convert an Excel workbook first:

```powershell
python scripts/import-catalog.py path\to\workbook.xlsx data\my-catalog.json
```

The conversion and import flow strip the personal matching fields. You can later switch back to the bundled catalog.

> [!WARNING]
> The catalog is **not a live recruiting database**. Deadlines, referral status, open roles and application URLs can change. Always verify the official company recruiting page before applying.

## 🔐 Privacy & Safety

The project is local-first, but local storage should not be mistaken for a secure encrypted vault.

| Data / action | Current design |
| --- | --- |
| Resume, API config, fill policy, application records | Stored in browser extension local storage |
| Imported recruiting catalog | Stored in browser-local IndexedDB |
| Git repository | Should never contain your real resume, API keys, cookies or application history |
| Existing webpage values | Not overwritten by default |
| IDs, family, health and emergency-contact fields | Left for manual confirmation by default |
| Background checks, integrity declarations and conflict questions | Left for manual confirmation by default |
| File uploads, CAPTCHAs and final submission | Never automated |
| AI | Disabled by default and still governed by the policies of the API provider you configure |

AI mapping attempts to avoid exposing known resume values and redacts known values where possible. This is a privacy safeguard inside the extension, **not** a guarantee about any third-party AI provider.

Also note:

- local browser storage is **not password-encrypted**;
- changes to recruiting sites can cause incorrect mappings, so review before submitting;
- do not post real resumes, IDs, API keys, cookies or complete private recruiting-page source code in public issues;
- see [`SECURITY.md`](SECURITY.md) for security reporting guidance.

## 🧩 Compatibility & Boundaries

- **Browsers:** Manifest V3, intended for modern Chrome and Edge.
- **Native form controls:** generally easier to recognize than custom UI widgets.
- **Repeated sections:** heuristic support exists for education, internships, work, languages, family, training, papers, patents and certificates.
- **Complex controls:** modal add flows, Shadow DOM, cascading addresses and virtualized lists may still require manual input.
- **Multi-step applications:** you will usually need to trigger filling again after navigating to the next step.
- **Platform restrictions:** the extension does not bypass CAPTCHAs, anti-automation measures or recruiting-site rules.

When a field cannot be recognized confidently, leaving it unresolved is preferable to forcing a guess.

## 🛠️ Development

Requires **Node.js 20+**. The extension runtime has no third-party npm dependencies.

```powershell
npm run check     # JavaScript syntax checks
npm test          # current automated tests
npm run package   # build a local Chrome package directory
```

Convert an Excel recruiting workbook:

```powershell
python scripts/import-catalog.py path\to\workbook.xlsx data\my-catalog.json
```

## 🗂️ Project Structure

```text
ResumeBridge-Qiuzhao/
├─ manifest.json
├─ src/
│  ├─ background.js          # config, storage, messaging, AI and catalog backend logic
│  ├─ content.js             # page scanning, field matching and filling
│  ├─ options.*              # resume, AI and fill-policy settings
│  ├─ popup.*                # extension popup
│  ├─ catalog.*              # campus recruiting catalog UI
│  ├─ catalog-model.js       # catalog normalization and model logic
│  ├─ tracker.*              # application tracker UI
│  ├─ job-tracker.js         # application record model
│  ├─ safety-policy.js       # cautious filling policy
│  └─ ai-privacy.js          # privacy handling before AI requests
├─ data/                     # recruiting catalog snapshot (JSON + Excel)
├─ scripts/                  # packaging and catalog import scripts
├─ tests/                    # automated tests
├─ sample-profile.json       # fictional sample resume
├─ CONTRIBUTING.md
├─ SECURITY.md
└─ LICENSE
```

## ⚠️ Current Limitations

- site-specific compatibility needs continuous maintenance as recruiting pages change;
- the bundled recruiting catalog is a static snapshot and does not auto-refresh;
- company and role detection relies on page signals and should be checked before saving;
- local profile data is not protected by password-level encryption;
- there is currently no signed browser-store package or automatic update channel;
- AI field mapping is only an assistant and should not decide what resume content belongs in a field.

## 🤝 Contributing

Contributions are welcome for:

- reproducible form-field mapping issues;
- ATS examples built with fictional data;
- recruiting catalog cleaning and import improvements;
- multi-resume and application-tracking workflows.

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Improvements that apply to the general form-filling engine may also be appropriate for upstream [ResumeBridge](https://github.com/xiaocheng223/ResumeBridge).

## 🙏 Credits

- [OpenJobAutofill](https://github.com/Br1an67/OpenJobAutofill) — original form-filling extension;
- [ResumeBridge](https://github.com/xiaocheng223/ResumeBridge) — primary upstream for the current filling engine and privacy boundaries;
- community maintainers of campus recruiting lists such as 土豆投递表 and 互联派.

## 📄 License

Released under the [MIT License](LICENSE). See [`NOTICE`](NOTICE) for upstream attribution. Recruiting information remains owned by the relevant companies and original list maintainers; this repository only ships a convenience snapshot for local use.

---

<p align="center">
  <strong>Keywords:</strong> resume autofill · job application tracker · campus recruiting · graduate jobs · Chrome extension · Edge extension · ATS form filler · local-first job search
</p>
