import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.e2e-spec.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@udyogasakha/types(.*)$': '<rootDir>/../../../packages/types/src$1',
    '^@udyogasakha/validators(.*)$': '<rootDir>/../../../packages/validators/src$1',
  },
};

export default config;
