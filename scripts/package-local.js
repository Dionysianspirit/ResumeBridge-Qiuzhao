const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const version = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8")).version;
const destination = path.join(root, "dist", `chrome-${version}`);
if (fs.existsSync(destination)) throw new Error(`Refusing to overwrite existing package: ${destination}`);
fs.mkdirSync(destination, { recursive: true });
for (const name of ["src", "icons", "data", "manifest.json", "sample-profile.json", "LICENSE", "NOTICE", "LOCAL-README.md"]) {
  fs.cpSync(path.join(root, name), path.join(destination, name), { recursive: true, errorOnExist: true, force: false });
}
const manifest = JSON.parse(fs.readFileSync(path.join(destination, "manifest.json"), "utf8"));
for (const entry of [manifest.background.service_worker, manifest.action.default_popup, manifest.options_page, ...Object.values(manifest.icons)]) {
  if (!fs.statSync(path.join(destination, entry)).isFile()) throw new Error(`Missing extension entry: ${entry}`);
}
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    return entry.isDirectory() ? files(target) : [target];
  });
}
const entries = files(destination).map((file) => {
  const relative = path.relative(destination, file);
  const bytes = fs.readFileSync(file);
  const hash = crypto.createHash("sha256").update(bytes).digest("hex");
  const sourceHash = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, relative))).digest("hex");
  if (hash !== sourceHash) throw new Error(`Package differs from source: ${relative}`);
  return { file: relative.replaceAll("\\", "/"), bytes: bytes.length, sha256: hash };
});
fs.writeFileSync(path.join(root, "dist", `package-checksums-${version}.json`), `${JSON.stringify({ version: manifest.version_name, entries }, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ destination, version: manifest.version_name, fileCount: entries.length, bytes: entries.reduce((sum, e) => sum + e.bytes, 0) }));
