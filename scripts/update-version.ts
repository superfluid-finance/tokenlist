import fs from "fs";
import path from "path";
import isEmpty from "lodash/isEmpty";
import { exec } from "child_process";

const diffFilePath = process.argv[2];
const tempFileName = "token-list_v[x.x.x].json";

const updateTempList = async () => {
  const packageJson = await import(path.resolve(__dirname, "../package.json"));

  try {
    const nextVersionContents = fs.readFileSync(
      path.resolve(__dirname, "../versions", tempFileName),
      "utf8"
    );

    fs.writeFileSync(
      `./versions/${tempFileName.replace("[x.x.x]", packageJson.version)}`,
      nextVersionContents
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
