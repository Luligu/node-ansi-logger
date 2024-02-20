// jest.config.mjs
export default {
  preset: 'ts-jest/presets/default-esm', // Use the ESM preset for ts-jest
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'], // Treat .ts files as ESM
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // Redirect .js imports to .ts files
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      // ts-jest specific configuration options go here
      useESM: true,
    }],
  },
};
