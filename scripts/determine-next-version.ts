import fs from "fs";
import path from "path";
import isEmpty from "lodash/isEmpty";
import { execSync } from "child_process";

const diffJson = process.argv[2];

if (!diffJson) {
  console.error("Usage: yarn diff-lists path/to/diff.json");
  process.exit(1);
}

const diffContents = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../", diffJson), "utf8")
);

if (!diffContents.added && !diffContents.changed && !diffContents.removed) {
  console.info("JSON must have 'added', 'changed', and 'removed' properties");
  process.exit(1);
}

if (
  isEmpty(diffContents.added) &&
  isEmpty(diffContents.changed) &&
  isEmpty(diffContents.removed)
) {
  console.info("No changes detected");
  process.exit(0);
}

if (!isEmpty(diffContents.removed)) {
  console.info(`bump version: major`);
  execSync(`npm version major --no-git-tag-version`);
  process.exit(0);
}

if (!isEmpty(diffContents.added)) {
  console.info(`bump version: minor`);
  execSync(`npm version minor --no-git-tag-version`);
  process.exit(0);
}

console.info(`bump version: patch`);
execSync(`npm version patch --no-git-tag-version`);
process.exit(0);
