import { diffTokenLists } from "@uniswap/token-lists";
import fs from "fs";
import path from "path";
import isEmpty from "lodash/isEmpty";
import packageJson from "../package.json";

const ignoreExtensions = process.argv[2];
let listA = process.argv[3];
let listB = process.argv[4];

if (!listA && !listB) {
  console.info("Usage: lists not provided, using current version and draft.");
  listA = `versions/token-list_@latest.json`;
  listB = `versions/token-list_DRAFT.json`;
}

const listAContents = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../", listA), "utf8")
);

const listBContents = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../", listB), "utf8")
);

if (!listAContents.tokens || !listBContents.tokens) {
  console.error("Lists must have a 'tokens' property");
  process.exit(1);
}

if (!fs.existsSync("./diff-output")) {
  fs.mkdirSync("./diff-output");
}

const getFileName = (input: string) =>
  path.basename(input).replace(".json", "");

let diff = diffTokenLists(listAContents.tokens, listBContents.tokens);

if (ignoreExtensions == "--ignoreExtensions") {
  Object.entries(diff.changed).forEach(([network, changeData]) => {
    const parsedNetwork = Number(network);
    Object.entries(changeData).forEach(([address, changes]) => {
      if (changes.length === 1 && changes[0] === "extensions") {
        delete diff.changed[parsedNetwork][address];
      }
    });

    if (isEmpty(diff.changed[parsedNetwork])) {
      delete diff.changed[parsedNetwork];
    }
  });
} else if (ignoreExtensions) {
  console.info(
    `Received unknown argument: ${ignoreExtensions}, expected --ignoreExtensions`
  );
}

fs.writeFileSync(
  `./diff-output/diff_${getFileName(listA)}<>${getFileName(listB)}.json`,
  JSON.stringify(diff, null, 2)
);
