import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
const root = process.cwd();
const manifest = JSON.parse(
  await readFile(path.join(root, "src/generated/cdn-assets.json"), "utf8"),
);
const extension = /\.(png|jpe?g|webp|avif|gif|svg|ico)$/i;
async function images(dir, prefix = "") {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.isSymbolicLink()) continue;
    if (entry.isDirectory())
      result.push(
        ...(await images(path.join(dir, entry.name), prefix + entry.name + "/")),
      );
    else if (extension.test(entry.name)) result.push(prefix + entry.name);
  }
  return result;
}
for (const name of await images(path.join(root, "public"))) {
  const buffer = await readFile(path.join(root, "public", name));
  const entry = manifest.files["/" + name];
  assert(entry, "Publish this new image first: " + name + " (npm run assets:publish)");
  assert.equal(
    entry.sha256,
    createHash("sha256").update(buffer).digest("hex"),
    "Image changed; run npm run assets:publish: " + name,
  );
  const section = entry.key.split("/")[0];
  assert(["static", "website"].includes(section), "Unknown CDN section: " + name);
  assert.equal(entry.key, section + "/" + entry.sha256.slice(0, 20) + "/" + name);
}
console.log("Static image manifest matches the local originals.");
