import fs from "fs";
import path from "path";

const dir = path.resolve("public/question_banks");
const out = path.join(dir, "index.json");

const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".json") && f !== "index.json")
  .sort();

fs.writeFileSync(out, JSON.stringify({ files }, null, 2) + "\n", "utf-8");

console.log("Wrote manifest:", out);
console.log("Files:", files.length);
