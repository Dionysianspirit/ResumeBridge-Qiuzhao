(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ResumeBridgeCatalog = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const PENDING = new Set(["待投递", "未投递", "准备中"]);
  const ENDED = new Set(["Offer", "已拒绝", "已撤回", "已放弃", "无回应归档"]);
  function localDateKey(value = new Date()) {
    const d = value instanceof Date ? value : new Date(value);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function dateNumber(value) {
    const text = String(value || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
    const d = new Date(`${text}T00:00:00Z`);
    return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === text ? d.getTime() : null;
  }
  function deadlineInfo(entry, today = localDateKey()) {
    const end = dateNumber(entry.deadline), current = dateNumber(today);
    const days = end !== null && current !== null ? Math.round((end - current) / 86400000) : null;
    const expired = Boolean(entry.sourceExpired || (days !== null && days < 0));
    return { days, expired, label: days === null ? String(entry.deadline || "待核实") :
      days < 0 ? `已过期 ${-days} 天` : days === 0 ? "今天截止" : `还剩 ${days} 天` };
  }
  function safeWebUrl(raw) {
    try {
      const u = new URL(String(raw || "").trim());
      return ["https:", "http:"].includes(u.protocol) && !u.username && !u.password ? u.href : "";
    } catch { return ""; }
  }
  function isSubmitted(application) {
    return Boolean(application.appliedAt && !PENDING.has(application.status));
  }
  function buildRows(entries, applications = [], notes = {}, today = localDateKey()) {
    const index = new Map();
    for (const app of applications) {
      if (!app.catalogId || !isSubmitted(app)) continue;
      if (!index.has(app.catalogId)) index.set(app.catalogId, []);
      index.get(app.catalogId).push(app);
    }
    return entries.map((entry) => {
      const records = (index.get(entry.id) || []).slice().sort((a, b) =>
        String(b.updatedAt || b.appliedAt).localeCompare(String(a.updatedAt || a.appliedAt)));
      const note = notes[entry.id] || {};
      const status = records[0]?.status || note.decision || "未投递";
      return { entry, records, note, status, submitted: records.length > 0,
        followup: records.some((app) => !ENDED.has(app.status)), ...deadlineInfo(entry, today) };
    });
  }
  function filterRows(rows, filters = {}) {
    const query = String(filters.query || "").trim().toLocaleLowerCase();
    const view = filters.view || "weekly";
    return rows.filter((row) => {
      const e = row.entry;
      if (view === "weekly" && (e.weeklyRank == null || row.expired)) return false;
      if (view === "active" && row.expired) return false;
      if (view === "unsubmitted" && (row.expired || row.submitted || row.status === "已放弃")) return false;
      if (view === "submitted" && !row.submitted) return false;
      if (view === "followup" && !row.followup) return false;
      if (view === "expired" && !row.expired) return false;
      if (filters.tier && e.tier !== filters.tier) return false;
      if (filters.status && row.status !== filters.status) return false;
      if (filters.due === "7" && (row.days === null || row.days < 0 || row.days > 7)) return false;
      if (filters.due === "rolling" && e.deadlineType !== "招满为止") return false;
      return !query || [e.companyName, e.roles, e.location, e.batch, e.fields["行业大类"], e.fields["企业性质"], row.note.notes,
        row.note.targetRole, ...row.records.map((a) => a.jobTitle)].join(" ").toLocaleLowerCase().includes(query);
    }).sort((a, b) => {
      if (filters.sort === "deadline") return (a.days ?? 99999) - (b.days ?? 99999) || a.entry.companyName.localeCompare(b.entry.companyName, "zh");
      if (filters.sort === "company") return a.entry.companyName.localeCompare(b.entry.companyName, "zh");
      if (filters.sort === "updated") return String(b.note.updatedAt || b.records[0]?.updatedAt || "").localeCompare(String(a.note.updatedAt || a.records[0]?.updatedAt || ""));
      return (a.entry.weeklyRank ?? 99999) - (b.entry.weeklyRank ?? 99999) ||
        a.entry.companyName.localeCompare(b.entry.companyName, "zh");
    });
  }
  function metrics(rows) {
    return { active: rows.filter((r) => !r.expired).length, weekly: rows.filter((r) => r.entry.weeklyRank != null && !r.expired).length,
      unsubmitted: rows.filter((r) => !r.expired && !r.submitted && r.status !== "已放弃").length,
      submitted: rows.filter((r) => r.submitted).length, followup: rows.filter((r) => r.followup).length,
      expired: rows.filter((r) => r.expired).length,
      due: rows.filter((r) => !r.expired && !r.submitted && r.status !== "已放弃" && r.days !== null && r.days <= 7).length };
  }
  function csvCell(v) {
    let text = String(v ?? "");
    if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  }
  function exportRows(rows) {
    const data = [["公司名称", "招聘批次", "投递状态", "已投岗位数", "具体已投岗位", "计划岗位", "档位", "本周序", "截止日期", "截止提醒", "招聘岗位", "工作地点", "投递链接", "官方公告", "下次跟进日期", "个人备注", "来源行"]];
    for (const r of rows) data.push([r.entry.companyName, r.entry.batch, r.status, r.records.length,
      r.records.map((a) => a.jobTitle).join("；"), r.note.targetRole, r.entry.tier, r.entry.weeklyRank,
      r.entry.deadline, r.label, r.entry.roles, r.entry.location, r.entry.applyUrl, r.entry.noticeUrl,
      r.note.followUpDate, r.note.notes, r.entry.sources.map((s) => `${s.sheet}!${s.row}`).join("；")]);
    return "\ufeff" + data.map((r) => r.map(csvCell).join(",")).join("\r\n");
  }
  return { localDateKey, dateNumber, deadlineInfo, safeWebUrl, isSubmitted, buildRows, filterRows, metrics, exportRows };
});
