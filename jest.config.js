/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // If your tests are in TypeScript, make sure Jest knows where to find them
  testMatch: ["<rootDir>/src/**/*.test.ts"],
  // Ignore the dist directory to prevent Jest from trying to run compiled JS files
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};