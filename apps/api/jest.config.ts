import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  coveragePathIgnorePatterns: [
    'node_modules',
    '.module.ts',
    'main.ts',
    'index.ts',
  ],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@udyogasakha/types(.*)$': '<rootDir>/../../packages/types/src$1',
    '^@udyogasakha/validators(.*)$': '<rootDir>/../../packages/validators/src$1',
  },
  setupFilesAfterFramework: [],
  // Run tests serially to avoid DB conflicts in integration tests
  maxWorkers: 1,
};

export default config;
