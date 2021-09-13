const { setup: setupPuppeteer } = require("jest-environment-puppeteer");
import { default as axios } from "axios";
import { setup as setupDevServer } from "jest-dev-server";
import { spawnSync } from "child_process";
import { join } from "path";
import { Config } from "@jest/types";

const getVersion = async (artifact: string) => {
  const response = await axios.get(
    "https://clojars.org/api/artifacts/" + artifact + "?format=json"
  );
  return response.data["latest_version"];
};

const ingestProject = async (rootDir: string, artifact: string) => {
  const version = await getVersion(artifact);
  console.log("Importing artifact", { artifact, version });
  const result = spawnSync(
    join(rootDir, "script/cljdoc"),
    ["--project", artifact, "--version", version],
    { cwd: rootDir, timeout: 120000 }
  );

  if (result.error) {
    throw result.error;
  }
};

/**
 * Sets up the environment for running tests with Jest
 */
export default async (globalConfig: Config.InitialOptions) => {
  // do stuff which needs to be done before all tests are executed

  console.log(""); // insert a line break for better logging.
  await ingestProject(globalConfig.rootDir!, "bidi/bidi");
  await ingestProject(globalConfig.rootDir!, "bidi-rest/bidi-rest");
  await ingestProject(globalConfig.rootDir!, "seancorfield/next.jdbc");

  console.log("Starting servers");

  await setupDevServer([
    {
      command: "npm run dev",
      usedPortAction: "error",
      port: 1234
    },
    {
      command: "./script/cljdoc run",
      port: 8000,
      launchTimeout: 120000,
      usedPortAction: "error"
    }
  ]);

  await setupPuppeteer(globalConfig);
};
