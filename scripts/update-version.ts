import fs from "fs";
import path from "path";
import isEmpty from "lodash/isEmpty";
import { exec } from "child_process";
import zipObject from "lodash/zipObject";

let diffFilePath = process.argv[2];
const tempFileName = "DRAFT.tokenlist.json";

if (!diffFilePath) {
  diffFilePath = `diff-output/diff_superfluid.extended.tokenlist<>DRAFT.tokenlist.json`;
}

const updateTempList = async (version: {
  major: number;
  minor: number;
  patch: number;
}) => {
  const currentList = await import(
    path.resolve(__dirname, "../superfluid.extended.tokenlist.json")
  );

  try {
    const nextVersionContents = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "../", tempFileName), "utf8")
    );

    nextVersionContents.version = zipObject(
      ["major", "minor", "patch"],
      Object.entries(currentList.version).map(
        ([name, value]) => Number(value) + version[name as keyof typeof version]
      )
    );

    fs.writeFileSync(
      `./${tempFileName.replace("DRAFT", "superfluid.extended")}`,
      JSON.stringify(nextVersionContents, null, 2)
    );

    fs.rmSync(`./${tempFileName}`);
  } catch (e) {
    console.error("Temporary tokenList file not found", e);

    process.exit(1);
  }
};

if (!diffFilePath) {
  console.error("Usage: yarn update-version path/to/diff.json");
  process.exit(1);
}

const diffContents = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../", diffFilePath), "utf8")
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
        await updateTempList({ major: 1, minor: 0, patch: 0 });
        resolve(null);
      });
    });

    process.exit(0);
  }

  if (!isEmpty(diffContents.added)) {
    console.info(`bump version: minor`);
    await new Promise((resolve) => {
      exec(`npm version minor --no-git-tag-version`, async () => {
        await updateTempList({ major: 0, minor: 1, patch: 0 });
        resolve(null);
      });
    });
    process.exit(0);
  }

  if (!isEmpty(diffContents.changed)) {
    console.info(`bump version: patch`);
    await new Promise((resolve) => {
      exec(`npm version patch --no-git-tag-version`, async () => {
        await updateTempList({ major: 0, minor: 0, patch: 1 });
        resolve(null);
      });
    });

    process.exit(0);
  }
})();
