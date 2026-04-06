import fs from "node:fs";
import path from "node:path";

const distAssetsDir = path.resolve(process.cwd(), "dist", "assets");
const maxBytes = Number(process.env.MAX_FRONTEND_JS_BUNDLE_BYTES || 450 * 1024);

if (!fs.existsSync(distAssetsDir)) {
  console.error("Bundle check failed: dist/assets directory not found. Run the build first.");
  process.exit(1);
}

const files = fs.readdirSync(distAssetsDir).filter((name) => name.endsWith(".js"));

if (!files.length) {
  console.error("Bundle check failed: no JavaScript bundle found in dist/assets.");
  process.exit(1);
}

const largest = files
  .map((name) => {
    const fullPath = path.join(distAssetsDir, name);
    return {
      name,
      size: fs.statSync(fullPath).size,
    };
  })
  .sort((a, b) => b.size - a.size)[0];

if (largest.size > maxBytes) {
  console.error(
    `Bundle check failed: ${largest.name} is ${largest.size} bytes, exceeding limit ${maxBytes} bytes.`,
  );
  process.exit(1);
}

console.log(
  `Bundle check passed: largest JS bundle ${largest.name} is ${largest.size} bytes (limit ${maxBytes}).`,
);
