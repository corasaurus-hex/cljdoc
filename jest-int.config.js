module.exports = {
  roots: ["<rootDir>/integration-tests"],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testRegex: "(.*)\\.(test|spec)\\.tsx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  preset: "jest-puppeteer",
  globalSetup: "<rootDir>/integration-tests/globalSetup.ts",
  globalTeardown: "<rootDir>/integration-tests/globalTeardown.ts",
  setupFilesAfterEnv: ["<rootDir>/integration-tests/jestSetup.ts"]
};
