import { buildSuperfluidTokenList } from "../utils";
import dotenv from "dotenv";

dotenv.config();

buildSuperfluidTokenList({
  publishToIpfs: false,
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecret: process.env.PINATA_SECRET,
});
