import fs from "fs";
import path from "path";
import { exec } from "child_process";
import zipObject from "lodash/zipObject.js";
import isEmpty from "lodash/isEmpty.js";
import packageJson from "../package.json" assert { type: "json" };

let diffFilePath = process.argv[2];
const tempFileName = "DRAFT.tokenlist.json";

if (!diffFilePath) {
  diffFilePath = `diff-output/diff_superfluid.tokenlist<>DRAFT.tokenlist.json`;
}

const updateTempList = async () => {
  try {
    const nextVersionContents = JSON.parse(
      fs.readFileSync(path.resolve(".", "versions", tempFileName), "utf8")
    );

    nextVersionContents.version = zipObject(
      ["major", "minor", "patch"],
      packageJson.version.split(".").map(Number)
    );

    fs.writeFileSync(
      `./versions/${tempFileName.replace("DRAFT", `v${packageJson.version}`)}`,
      JSON.stringify(nextVersionContents, null, 2)
    );

    fs.writeFileSync(
      `./${tempFileName.replace("DRAFT", "superfluid")}`,
      JSON.stringify(nextVersionContents, null, 2)
    );

    fs.rmSync(`./versions/${tempFileName}`);
  } catch {
    console.error(
      "Temporary tokenList file not found, have you run 'yarn build' yet?"
    );

    process.exit(1);
  }
};

if (!diffFilePath) {
  console.error("Usage: yarn update-version path/to/diff.json");
  process.exit(1);
}

const diffContents = JSON.parse(
  fs.readFileSync(path.resolve(".", diffFilePath), "utf8")
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

(async () => {
  if (!isEmpty(diffContents.removed)) {
    console.info(`bump version: major`);

    await new Promise((resolve) => {
      exec(`npm version major --no-git-tag-version`, async () => {
        await updateTempList();
        resolve(null);
      });
    });

    process.exit(0);
  }

  if (!isEmpty(diffContents.added)) {
    console.info(`bump version: minor`);
    await new Promise((resolve) => {
      exec(`npm version minor --no-git-tag-version`, async () => {
        await updateTempList();
        resolve(null);
      });
    });
    process.exit(0);
  }

  if (!isEmpty(diffContents.changed)) {
    console.info(`bump version: patch`);
    await new Promise((resolve) => {
      exec(`npm version patch --no-git-tag-version`, async () => {
        await updateTempList();
        resolve(null);
      });
    });

    process.exit(0);
  }
})();
