import { diffTokenLists } from "@uniswap/token-lists";
import fs from "fs";
import path from "path";

const listA = process.argv[2];
const listB = process.argv[3];

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

fs.writeFileSync(
  `./diff-output/diff_${getFileName(listA)}<>${getFileName(listB)}.json`,
  JSON.stringify(
    diffTokenLists(listAContents.tokens, listBContents.tokens),
    null,
    2
  )
);
