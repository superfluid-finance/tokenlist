import packageJson from "../package.json";
import fs from "fs";

fs.cpSync(
  `./versions/token-list_v${packageJson.version}.json`,
  "./versions/token-list_DRAFT.json"
);
