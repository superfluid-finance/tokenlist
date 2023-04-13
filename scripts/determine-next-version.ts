import fs from "fs";
import packageJSON from "../package.json";
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

const version = packageJSON.version.split(".").map(Number);

if (!isEmpty(diffContents.removed)) {
  const nextVersion = `${version[0] + 1}.${version[1]}.${version[2]}`;
  console.info(`writing: ${nextVersion} into package.json (major)`);
  execSync(`npm version ${nextVersion} --no-git-tag-version`);
  process.exit(0);
}

if (!isEmpty(diffContents.added)) {
  const nextVersion = `${version[0]}.${version[1] + 1}.${version[2]}`;
  console.info(`writing: ${nextVersion} into package.json (minor)`);
  execSync(`npm version ${nextVersion} --no-git-tag-version`);
  process.exit(0);
}

const nextVersion = `${version[0]}.${version[1]}.${version[2] + 1}`;
console.info(`writing: \n${nextVersion} into package.json (patch)`);
execSync(`npm version ${nextVersion} --no-git-tag-version`);
process.exit(0);
