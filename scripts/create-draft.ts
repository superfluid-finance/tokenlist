import packageJson from "../package.json";
import fs from "fs";

fs.cpSync(
  `./versions/v${packageJson.version}.tokenlist.json`,
  "./versions/DRAFT.tokenlist.json"
);
