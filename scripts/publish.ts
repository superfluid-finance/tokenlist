import { validate, validateUnderlyingTokens } from "../utils/index.js";
import fs from "fs";
import path from "path";
import pinataSDK from "@pinata/sdk";
import dotenv from "dotenv";

dotenv.config();

const tokenList = process.argv[2];

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecret = process.env.PINATA_SECRET;

const tokenListContents = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../", tokenList), "utf8")
);

(async () => {
  try {
    const isValid = await validate(tokenListContents);
    const isUnderlyingValid = validateUnderlyingTokens(tokenListContents);

    if (isValid && isUnderlyingValid && pinataApiKey && pinataSecret) {
      console.info(`✅ TokenList validation successful! \n Pinning to IPFS...`);

      const pinata = new pinataSDK(pinataApiKey, pinataSecret);

      const result = await pinata.pinJSONToIPFS(tokenListContents);
      console.info(result);
    }
  } catch (e) {
    console.error(e);
  }
})();
