"""Load the unpacked extension in Chrome and click through catalog import/reset."""
from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path

from playwright.sync_api import TimeoutError as PlaywrightTimeout
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / "tests" / "fixtures" / "import-catalog.json"


def fail(message: str) -> None:
    print(f"FAIL: {message}", flush=True)
    raise SystemExit(1)


def text(page, selector: str) -> str:
    page.wait_for_selector(selector, timeout=30000)
    return page.locator(selector).inner_text().strip()


def main() -> None:
    if not (ROOT / "manifest.json").exists():
        fail(f"extension root missing: {ROOT}")
    if not FIXTURE.exists():
        fail(f"fixture missing: {FIXTURE}")

    user_data = tempfile.mkdtemp(prefix="rb-qiuzhao-e2e-")
    print(f"user_data={user_data}", flush=True)
    print(f"extension={ROOT}", flush=True)

    with sync_playwright() as playwright:
        context = playwright.chromium.launch_persistent_context(
            user_data,
            headless=False,
            args=[
                f"--disable-extensions-except={ROOT}",
                f"--load-extension={ROOT}",
                "--no-first-run",
                "--no-default-browser-check",
            ],
            ignore_default_args=["--disable-extensions"],
            viewport={"width": 1400, "height": 900},
        )
        try:
            worker = context.service_workers[0] if context.service_workers else None
            if worker is None:
                worker = context.wait_for_event("serviceworker", timeout=30000)
            extension_id = worker.url.split("/")[2]
            catalog_url = f"chrome-extension://{extension_id}/src/catalog.html"
            print(f"extension_id={extension_id}", flush=True)
            print(f"catalog_url={catalog_url}", flush=True)

            page = context.new_page()
            page.on("dialog", lambda dialog: dialog.accept())
            page.on("pageerror", lambda error: print(f"pageerror={error}", flush=True))
            page.on("console", lambda msg: print(f"console.{msg.type}={msg.text}", flush=True))
            page.add_init_script("window.confirm = () => true;")
            page.goto(catalog_url, wait_until="domcontentloaded")
            page.wait_for_function(
                """() => {
                  const el = document.getElementById("sourceSummary");
                  return el && el.textContent && !el.textContent.includes("加载中");
                }""",
                timeout=60000,
            )

            summary = text(page, "#sourceSummary")
            label = text(page, "#snapshotLabel")
            feedback = text(page, "#feedback")
            print(f"bundled_label={label}", flush=True)
            print(f"bundled_summary={summary}", flush=True)
            print(f"bundled_feedback={feedback}", flush=True)
            if "加载失败" in feedback:
                fail("bundled catalog page reported load failure")
            if "内置脱敏总表" not in label and "社区投递表快照" not in summary:
                fail("bundled catalog did not identify itself")

            first_company = page.locator("#rows .company-link").first
            first_company.wait_for(timeout=15000)
            bundled_company = first_company.inner_text().strip()
            print(f"bundled_first_company={bundled_company}", flush=True)
            if bundled_company == "导入测试公司甲":
                fail("bundled catalog unexpectedly showed fixture company")

            file_ready = page.locator("#catalogFile")
            file_ready.wait_for(state="attached", timeout=5000)
            page.set_input_files("#catalogFile", str(FIXTURE))
            try:
                page.wait_for_function(
                    """() => {
                      const label = document.getElementById("snapshotLabel");
                      const feedback = document.getElementById("feedback");
                      return (label && label.textContent.includes("自己导入的总表")) ||
                        (feedback && feedback.textContent.includes("导入总表失败"));
                    }""",
                    timeout=30000,
                )
            except PlaywrightTimeout:
                print(f"import_timeout_feedback={text(page, '#feedback')!r}", flush=True)
                print(f"import_timeout_summary={text(page, '#sourceSummary')!r}", flush=True)
                print(f"import_timeout_label={text(page, '#snapshotLabel')!r}", flush=True)
                raise
            if "导入总表失败" in text(page, "#feedback"):
                fail(text(page, "#feedback"))
            imported_label = text(page, "#snapshotLabel")
            imported_summary = text(page, "#sourceSummary")
            imported_feedback = text(page, "#feedback")
            imported_company = page.locator("#rows .company-link").first.inner_text().strip()
            print(f"imported_label={imported_label}", flush=True)
            print(f"imported_summary={imported_summary}", flush=True)
            print(f"imported_feedback={imported_feedback}", flush=True)
            print(f"imported_first_company={imported_company}", flush=True)
            if imported_company != "导入测试公司甲":
                fail("import did not replace the visible company list")
            body = page.content()
            if "径舟" in body or "可挂创青春" in body:
                fail("personal matching notes leaked into the imported page")
            page.locator("#rows .company-link").first.click()
            page.wait_for_selector("#detailDialog[open]", timeout=5000)
            detail_title = page.locator("#detailTitle").inner_text().strip()
            print(f"imported_detail_title={detail_title}", flush=True)
            if detail_title != "导入测试公司甲":
                fail("detail dialog did not open the imported company")
            page.locator("details.source-fields > summary").click()
            page.wait_for_selector("#sourceFields", state="visible", timeout=5000)
            details = page.locator("#sourceFields").inner_text()
            print(f"imported_details={details!r}", flush=True)
            if "挂钩提示" in details or "软岗分" in details or "径舟" in details:
                fail("personal fields visible in imported detail panel")
            if "测试岗位甲" not in details:
                fail("job fields missing from imported detail panel")
            page.locator("#closeDetail").click()

            page.evaluate("document.getElementById('resetCatalog').click()")
            page.wait_for_function(
                """() => {
                  const el = document.getElementById("sourceSummary");
                  return el && el.textContent.includes("社区投递表快照");
                }""",
                timeout=60000,
            )
            reset_company = page.locator("#rows .company-link").first.inner_text().strip()
            reset_summary = text(page, "#sourceSummary")
            print(f"reset_summary={reset_summary}", flush=True)
            print(f"reset_first_company={reset_company}", flush=True)
            if reset_company == "导入测试公司甲":
                fail("reset did not restore the bundled catalog")
            full_catalog = ROOT / "data" / "catalog.json"
            page.set_input_files("#catalogFile", str(full_catalog))
            page.wait_for_function(
                """() => {
                  const label = document.getElementById("snapshotLabel");
                  const feedback = document.getElementById("feedback");
                  return (label && label.textContent.includes("自己导入的总表")) ||
                    (feedback && feedback.textContent.includes("导入总表失败"));
                }""",
                timeout=120000,
            )
            if "导入总表失败" in text(page, "#feedback"):
                fail(text(page, "#feedback"))
            full_summary = text(page, "#sourceSummary")
            full_feedback = text(page, "#feedback")
            print(f"full_import_summary={full_summary}", flush=True)
            print(f"full_import_feedback={full_feedback}", flush=True)
            if "3,277" not in full_feedback and "3277" not in full_feedback:
                fail("full catalog.json import did not report 3277 entries")
            print("PASS: catalog import and reset", flush=True)
        except PlaywrightTimeout as error:
            fail(f"timeout: {error}")
        finally:
            context.close()


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        raise
    except Exception as error:
        fail(repr(error))
