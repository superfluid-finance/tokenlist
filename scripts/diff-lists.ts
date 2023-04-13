import { diffTokenLists } from "@uniswap/token-lists";
import fs from "fs";
import path from "path";
import isEmpty from "lodash/isEmpty";

const listA = process.argv[2];
const listB = process.argv[3];
const ignoreExtensions = process.argv[4];

if (!listA || !listB) {
  console.error("Usage: yarn diff-lists path/to/listA.ext path/to/listB.ext");
  process.exit(1);
}

const listAContents = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../", listA), "utf8")
);

const listBContents = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../", listB), "utf8")
);

if (!fs.existsSync("./diff-output")) {
  fs.mkdirSync("./diff-output");
}
const getFileName = (input: string) =>
  path.basename(input).replace(".json", "");

let diff = diffTokenLists(listAContents.tokens, listBContents.tokens);

if (ignoreExtensions == "--ignoreExtensions") {
  Object.entries(diff.changed).forEach(([network, changeData]) => {
    Object.entries(changeData).forEach(([address, changes]) => {
      if (changes.length === 1 && changes[0] === "extensions") {
        delete diff.changed[Number(network)][address];
      }
    });

    if (isEmpty(diff.changed[Number(network)])) {
      delete diff.changed[Number(network)];
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
