const test = require("node:test");
const assert = require("node:assert/strict");
const model = require("../src/catalog-model.js");

test("strips 挂钩提示 and 软岗分 but keeps job fields", () => {
  const catalog = {
    schemaVersion: 1,
    sourceFile: "李-双表合并.xlsx",
    sourceSha256: "abc",
    asOf: "2026-09-06",
    counts: { active: 1 },
    entries: [{
      id: "catalog-1",
      companyName: "示例公司",
      fields: { 公司名称: "示例公司", 挂钩提示: "可挂径舟/B站", 软岗分: "27", 招聘岗位: "产品经理" },
      weeklyFields: { 挂钩提示: "可挂创青春+径舟", 软岗分: "15" }
    }]
  };
  const normalized = model.normalizeCatalog(catalog);
  assert.equal(normalized.sourceFile, "imported-catalog.json");
  assert.equal(normalized.entries[0].fields["挂钩提示"], "");
  assert.equal(normalized.entries[0].fields["软岗分"], "");
  assert.equal(normalized.entries[0].fields["招聘岗位"], "产品经理");
  assert.equal(normalized.entries[0].weeklyFields["挂钩提示"], "");
  assert.equal(model.isHiddenCatalogField("挂钩提示"), true);
  assert.equal(model.isHiddenCatalogField("招聘岗位"), false);
});

test("rejects catalogs without schema or companies", () => {
  assert.throws(() => model.normalizeCatalog({ schemaVersion: 1, entries: [] }), /空的/);
  assert.throws(() => model.normalizeCatalog({ schemaVersion: 2, entries: [{ id: "1", companyName: "A" }] }), /schemaVersion 1/);
});
