const { teardown: teardownPuppeteer } = require("jest-environment-puppeteer");
import { Config } from "@jest/types";

export default async (globalConfig: Config.InitialOptions) => {
  // Your global teardown
  await teardownPuppeteer(globalConfig);
};
