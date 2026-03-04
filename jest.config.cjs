/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/main'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '\\.vue$', '\\.tmx$', '\\.world$'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: true,
          moduleResolution: 'node',
          types: ['node', 'jest'],
        },
      },
    ],
  },
  moduleNameMapper: {
    '^xenolexia-typescript$': '<rootDir>/node_modules/xenolexia-typescript',
  },
  collectCoverageFrom: [
    'main/server/**/*.ts',
    'main/shared/**/*.ts',
    '!main/**/*.d.ts',
    '!main/**/index.ts',
    '!main/**/__tests__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  clearMocks: true,
  verbose: true,
};
