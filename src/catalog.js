"use strict";
const model = globalThis.ResumeBridgeCatalog;
const jobs = globalThis.ResumeBridgeJobTracker;
const $ = (id) => document.getElementById(id);
const VIEW_NAMES = { weekly: "本周优先", unsubmitted: "未投递", submitted: "已投递", followup: "跟进中", active: "全部有效清单", expired: "已过期" };
const PAGE_SIZE = 50;
let catalog, state = { applications: [], notes: {} }, rows = [], visibleRows = [];
let view = "weekly", page = 1, selectedId = "", noteRevision = "", noteDirty = false;
let stateRequest = 0, profileLibrary = null;
const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function message(type, payload) {
  return new Promise((resolve, reject) => chrome.runtime.sendMessage({ type, payload }, (r) => {
    if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
    if (!r?.ok) return reject(new Error(r?.error || "操作未完成"));
    resolve(r.data);
  }));
}
function feedback(text, error = false, detail = false) {
  const e = $(detail ? "detailFeedback" : "feedback");
  e.textContent = text; e.classList.toggle("error", error);
}
async function loadState() {
  const requestId = ++stateRequest;
  try {
    const result = await message("OJAF_GET_CATALOG_STATE");
    if (requestId !== stateRequest) return;
    state = result;
    rows = model.buildRows(catalog.entries, state.applications, state.notes);
    render();
    if (selectedId && $("detailDialog").open) renderRecords();
  } catch (e) { feedback(`读取进度失败：${e.message}`, true); }
}
function render() {
  const counts = model.metrics(rows);
  $("countPending").textContent = counts.unsubmitted.toLocaleString();
  $("countSubmitted").textContent = counts.submitted.toLocaleString();
  $("countWeekly").textContent = counts.weekly.toLocaleString();
  $("countDue").textContent = counts.due.toLocaleString();
  $("views").innerHTML = Object.entries(VIEW_NAMES).map(([id, name]) => `<button class="view-button${view === id ? " active" : ""}" data-view="${id}" aria-current="${view === id ? "page" : "false"}"><span>${name}</span><span class="view-count">${counts[id].toLocaleString()}</span></button>`).join("");
  $("viewTitle").textContent = VIEW_NAMES[view];
  visibleRows = model.filterRows(rows, { view, query: $("search").value, tier: $("tier").value, due: $("due").value, sort: $("sort").value });
  const totalPages = Math.max(1, Math.ceil(visibleRows.length / PAGE_SIZE));
  page = Math.max(1, Math.min(page, totalPages));
  $("rows").innerHTML = visibleRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(renderRow).join("");
  $("resultCount").textContent = `${visibleRows.length.toLocaleString()} 条招聘信息`;
  $("pageLabel").textContent = `第 ${page} / ${totalPages} 页 · 每页 ${PAGE_SIZE} 条`;
  $("previous").disabled = page === 1; $("next").disabled = page === totalPages;
  $("empty").hidden = visibleRows.length > 0;
}
function renderRow(r) {
  const e = r.entry, applied = r.submitted;
  const stateClass = applied ? (r.followup ? "follow" : "applied") : "";
  const dueClass = r.expired ? "expired" : r.days !== null && r.days <= 7 ? "urgent" : "";
  return `<tr data-id="${e.id}"><td><button class="company-link" data-action="detail">${escapeHtml(e.companyName)}</button><div class="cell-meta"><span class="tag">${escapeHtml(e.tier)} · ${escapeHtml(e.tierLabel)}</span>${e.weeklyRank != null ? `<span class="tag weekly">本周 #${e.weeklyRank}</span>` : ""}</div><span class="cell-sub">${escapeHtml(e.batch)}</span></td><td><span class="clamp">${escapeHtml(e.roles)}</span></td><td><span class="clamp">${escapeHtml(e.location)}</span></td><td><span class="deadline ${dueClass}">${escapeHtml(r.label)}</span><span class="cell-sub">${r.days !== null ? escapeHtml(e.deadline) : "以官网开放状态为准"}</span></td><td><span class="state ${stateClass}">${escapeHtml(r.status)}</span><span class="cell-sub">${applied ? `已投 ${r.records.length} 个具体岗位` : escapeHtml(r.note.targetRole || "还没有投递记录")}</span>${r.note.followUpDate ? `<span class="cell-sub">跟进：${escapeHtml(r.note.followUpDate)}</span>` : ""}</td><td><div class="row-buttons"><button data-action="open" ${model.safeWebUrl(e.applyUrl) ? "" : "disabled"}>去投递</button><button data-action="detail" class="quiet">详情</button></div></td></tr>`;
}
function setView(nextView) { view = nextView; page = 1; $("due").value = ""; render(); }
function currentRow() { return rows.find((r) => r.entry.id === selectedId); }
async function openEntry(id) {
  try { await message("OJAF_OPEN_CATALOG_ENTRY", { id }); feedback("已打开招聘页面。提交后在插件里记录，这张总表会同步更新。"); }
  catch (e) { feedback(e.message, true, $("detailDialog").open); }
}
function renderFields(fields) {
  return Object.entries(fields).filter(([key, value]) => !model.isHiddenCatalogField(key) && String(value ?? "").trim()).map(([key, value]) => {
    const url = model.safeWebUrl(value);
    return `<dt>${escapeHtml(key)}</dt><dd>${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer noopener">${escapeHtml(value)}</a>` : escapeHtml(value)}</dd>`;
  }).join("");
}
function applyCatalogPack(pack) {
  catalog = pack.catalog;
  $("snapshotLabel").textContent = pack.source === "imported"
    ? `${catalog.asOf || "本地导入"} · 自己导入的总表`
    : `${catalog.asOf} · 内置脱敏总表`;
  const counts = catalog.counts || {};
  $("sourceSummary").textContent = pack.source === "imported"
    ? `当前使用你导入的清单，共 ${pack.entryCount.toLocaleString()} 条。挂钩提示和软岗分已自动清空。`
    : `社区投递表快照：${Number(counts.activeSourceRows || pack.entryCount).toLocaleString()} 条有效来源归并为 ${Number(counts.active || pack.entryCount).toLocaleString()} 条招聘信息，本周优先 ${Number(counts.weekly || 0)} 条。`;
}
function showEntry(id) {
  selectedId = id; noteDirty = false;
  const r = currentRow(), e = r.entry;
  noteRevision = r.note.updatedAt || "";
  $("detailTitle").textContent = e.companyName;
  $("detailBatch").textContent = `${e.batch} · ${e.tier}档${e.weeklyRank ? ` · 本周第 ${e.weeklyRank} 条` : ""}`;
  $("detailRoles").textContent = e.roles;
  $("detailLocation").textContent = e.location;
  $("detailDeadline").textContent = `${r.label}${r.days !== null ? `（${e.deadline}）` : ""}`;
  $("detailSource").textContent = `原表来源：${e.sources.map((s) => `${s.sheet} 第 ${s.row} 行`).join("；")}${e.sources.length > 1 ? "。重复来源已归入此条，原始差异见下方。" : ""}`;
  $("detailOpen").disabled = !model.safeWebUrl(e.applyUrl);
  const notice = model.safeWebUrl(e.noticeUrl);
  $("noticeLink").hidden = !notice;
  if (notice) $("noticeLink").href = notice; else $("noticeLink").removeAttribute("href");
  $("sourceFields").innerHTML = renderFields(e.fields);
  $("sourceVariants").innerHTML = [
    ...(e.weeklyFields ? [{ sheet: "本周加急约100", fields: e.weeklyFields }] : []), ...e.variants
  ].map((s) => `<details class="source-variant"><summary>${escapeHtml(s.sheet)}${s.row ? ` 第 ${s.row} 行` : ""}</summary><dl>${renderFields(s.fields)}</dl></details>`).join("");
  $("noteDecision").value = r.note.decision || "未投递";
  $("targetRole").value = r.note.targetRole || "";
  $("followUpDate").value = r.note.followUpDate || "";
  $("noteText").value = r.note.notes || "";
  $("recordRole").value = r.note.targetRole || "";
  $("recordDate").value = toLocalDateTime(new Date());
  $("recordStatus").value = "已投递";
  $("recordDetails").open = false;
  feedback("", false, true);
  renderRecords();
  $("detailDialog").showModal();
}
function renderRecords() {
  const r = currentRow();
  if (!r) return;
  $("recordCount").textContent = `（${r.records.length}）`;
  $("detailRecords").innerHTML = r.records.length ? r.records.map((a) => `<article class="record-card" data-record-id="${escapeHtml(a.id)}"><div class="record-card-row"><strong>${escapeHtml(a.jobTitle)}</strong><button class="danger" data-action="remove">移除误记</button></div><p>${escapeHtml(new Date(a.appliedAt).toLocaleString("zh-CN"))}${a.resumeName ? ` · ${escapeHtml(a.resumeName)}` : ""}</p><select data-action="status" aria-label="更新 ${escapeHtml(a.jobTitle)} 的进度">${recordStatusOptions(a.status)}</select></article>`).join("") : '<p class="muted">尚未记录投递。原表中的其他岗位仍需你按意向选择。</p>';
}
function recordStatusOptions(selected = "已投递") {
  return jobs.JOB_APPLICATION_STATUSES.filter((s) => s !== "待投递").map((s) => `<option${s === selected ? " selected" : ""}>${escapeHtml(s)}</option>`).join("");
}
function toLocalDateTime(d) { return `${model.localDateKey(d)}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; }
async function saveNote(event) {
  event.preventDefault(); $("saveNote").disabled = true;
  try {
    const result = await message("OJAF_SAVE_CATALOG_NOTE", { id: selectedId, expectedUpdatedAt: noteRevision,
      note: { decision: $("noteDecision").value, targetRole: $("targetRole").value, followUpDate: $("followUpDate").value, notes: $("noteText").value } });
    noteRevision = result.note.updatedAt; noteDirty = false;
    await loadState(); feedback("准备信息已保存。", false, true);
  } catch (e) { feedback(e.message, true, true); }
  finally { $("saveNote").disabled = false; }
}
async function saveRecord(event) {
  event.preventDefault(); const e = currentRow().entry;
  $("saveRecord").disabled = true;
  try {
    const result = await message("OJAF_SAVE_JOB_APPLICATION", { application: {
      catalogId: selectedId, companyName: e.companyName, jobTitle: $("recordRole").value,
      appliedAt: new Date($("recordDate").value).toISOString(), status: $("recordStatus").value,
      sourceUrl: e.applyUrl, channel: "公司官网", resumeName: $("recordResume").value
    } });
    await loadState();
    feedback(result.duplicate ? "这条投递已记录，未重复添加。" : "投递已记录，总表和插件共用此条进度。", false, true);
    if (!result.duplicate) { $("recordDetails").open = false; $("recordRole").value = ""; }
  } catch (error) { feedback(error.message, true, true); }
  finally { $("saveRecord").disabled = false; }
}
async function changeRecordStatus(event) {
  const control = event.target.closest('select[data-action="status"]');
  if (!control) return;
  const id = control.closest("[data-record-id]").dataset.recordId;
  const record = state.applications.find((a) => a.id === id);
  control.disabled = true;
  try { await message("OJAF_SAVE_JOB_APPLICATION", { application: { ...record, status: control.value } }); await loadState(); feedback("岗位进度已更新。", false, true); }
  catch (e) { feedback(e.message, true, true); control.value = record.status; control.disabled = false; }
}
async function removeRecord(event) {
  const button = event.target.closest('[data-action="remove"]');
  if (!button || !confirm("移除这条误记的投递？招聘清单和准备信息会保留。")) return;
  const id = button.closest("[data-record-id]").dataset.recordId;
  try { await message("OJAF_DELETE_JOB_APPLICATION", { id }); await loadState(); feedback("误记的投递已移除。", false, true); }
  catch (e) { feedback(e.message, true, true); }
}
function download(name, data, type) {
  const url = URL.createObjectURL(new Blob([data], { type })), a = document.createElement("a");
  a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1500);
}
async function exportBackup() {
  try {
    const backup = await message("OJAF_EXPORT_TRACKING_BACKUP");
    download(`秋招投递进度-${model.localDateKey()}.json`, JSON.stringify(backup, null, 2), "application/json;charset=utf-8");
    feedback("已导出全部投递进度和准备备注；简历资料请在简历设置中单独备份。");
  } catch (e) { feedback(e.message, true); }
}
async function importBackup() {
  const file = $("backupFile").files?.[0];
  if (!file) return;
  try {
    if (file.size > 20 * 1024 * 1024) throw new Error("备份文件超过 20 MB，请检查文件。");
    const backup = JSON.parse(await file.text());
    if (!confirm("合并这份进度备份？相同记录保留更新时间较新的内容；不会删除已有记录。")) return;
    const result = await message("OJAF_IMPORT_TRACKING_BACKUP", { backup });
    await loadState(); feedback(`备份已合并：${result.applicationCount} 条岗位记录、${result.noteCount} 条准备备注。`);
  } catch (e) { feedback(`导入失败：${e.message}`, true); }
  finally { $("backupFile").value = ""; }
}
function closeDetail() {
  if (noteDirty && !confirm("准备信息还有未保存修改，关闭会放弃这些修改。是否关闭？")) return;
  $("detailDialog").close(); selectedId = ""; noteDirty = false;
}
async function importCatalogFile() {
  const file = $("catalogFile").files[0];
  if (!file) return;
  try {
    if (/\.xlsx?$/i.test(file.name)) throw new Error("请先把 Excel 转成 catalog.json。仓库里的 scripts/import-catalog.py 可以转换常见的三表投递表。");
    const parsed = JSON.parse(await file.text());
    if (!confirm("导入后会替换当前招聘总表。挂钩提示和软岗分会自动清空。已投记录还在「全部投递记录」里，但和公司清单的对应可能对不上。继续？")) return;
    await message("OJAF_IMPORT_CATALOG", { catalog: parsed });
    applyCatalogPack(await message("OJAF_GET_CATALOG"));
    page = 1; selectedId = "";
    await loadState();
    feedback(`已导入 ${catalog.entries.length.toLocaleString()} 条招聘信息。个人挂钩字段已清空。`);
  } catch (e) { feedback(`导入总表失败：${e.message}`, true); }
  finally { $("catalogFile").value = ""; }
}
async function resetCatalog() {
  if (!confirm("恢复插件内置的脱敏总表？你导入的清单会从本机去掉，已投记录仍保留。")) return;
  try {
    applyCatalogPack(await message("OJAF_RESET_CATALOG"));
    page = 1; selectedId = "";
    await loadState();
    feedback("已恢复内置脱敏总表。");
  } catch (e) { feedback(`恢复失败：${e.message}`, true); }
}
async function initialize() {
  try {
    applyCatalogPack(await message("OJAF_GET_CATALOG"));
    $("recordStatus").innerHTML = recordStatusOptions();
    profileLibrary = await message("OJAF_GET_PROFILE_LIBRARY");
    $("recordResume").innerHTML = '<option value="">未记录简历版本</option>' + profileLibrary.profiles.map((p) => `<option value="${escapeHtml(p.name)}"${p.id === profileLibrary.activeId ? " selected" : ""}>${escapeHtml(p.name)}</option>`).join("");
    await loadState();
    feedback("清单已就绪。打开页面和自动填表都不会改变投递状态，完成提交后再记录。");
  } catch (e) { feedback(`加载失败：${e.message}`, true); $("resultCount").textContent = "加载未完成"; }
}
document.addEventListener("click", (event) => { const button = event.target.closest("[data-view]"); if (button && catalog) setView(button.dataset.view); });
$("rows").addEventListener("click", (event) => { const button = event.target.closest("[data-action]"), row = button?.closest("[data-id]"); if (row) { if (button.dataset.action === "open") void openEntry(row.dataset.id); else showEntry(row.dataset.id); } });
for (const id of ["search", "tier", "due", "sort"]) $(id).addEventListener(id === "search" ? "input" : "change", () => { page = 1; if (catalog) render(); });
$("showDue").addEventListener("click", () => { view = "unsubmitted"; $("due").value = "7"; $("sort").value = "deadline"; page = 1; if (catalog) render(); });
$("resetFilters").addEventListener("click", () => { for (const id of ["search", "tier", "due"]) $(id).value = ""; page = 1; render(); });
$("previous").addEventListener("click", () => { page--; render(); }); $("next").addEventListener("click", () => { page++; render(); });
$("refresh").addEventListener("click", () => { if (catalog) void loadState(); });
$("detailOpen").addEventListener("click", () => void openEntry(selectedId));
$("closeDetail").addEventListener("click", closeDetail);
$("detailDialog").addEventListener("cancel", (e) => { e.preventDefault(); closeDetail(); });
$("noteForm").addEventListener("input", () => { noteDirty = true; });
$("noteForm").addEventListener("submit", saveNote); $("recordForm").addEventListener("submit", saveRecord);
$("detailRecords").addEventListener("change", (e) => void changeRecordStatus(e));
$("detailRecords").addEventListener("click", (e) => void removeRecord(e));
$("openResume").addEventListener("click", () => chrome.runtime.openOptionsPage());
$("openRecords").addEventListener("click", () => chrome.tabs.create({ url: chrome.runtime.getURL("src/tracker.html") }));
$("exportCsv").addEventListener("click", () => { if (!catalog) return; download(`秋招-${VIEW_NAMES[view]}-${model.localDateKey()}.csv`, model.exportRows(visibleRows), "text/csv;charset=utf-8"); feedback(`已导出筛选结果中的 ${visibleRows.length} 条信息，CSV 可用 Excel 打开。`); });
$("exportBackup").addEventListener("click", () => void exportBackup()); $("importBackup").addEventListener("click", () => $("backupFile").click()); $("backupFile").addEventListener("change", () => void importBackup());
$("importCatalog").addEventListener("click", () => $("catalogFile").click()); $("catalogFile").addEventListener("change", () => void importCatalogFile());
$("resetCatalog").addEventListener("click", () => void resetCatalog());
chrome.storage.onChanged.addListener((changes, area) => { if (catalog && area === "local" && (changes.jobApplications || changes.catalogNotes)) void loadState(); });
window.addEventListener("focus", () => { if (catalog) void loadState(); });
window.addEventListener("beforeunload", (e) => { if (noteDirty) { e.preventDefault(); e.returnValue = ""; } });
void initialize();
