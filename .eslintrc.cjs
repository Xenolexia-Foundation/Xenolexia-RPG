module.exports = {
  root: true,
  env: {
    es2022: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  overrides: [
    {
      files: ['main/**/*.ts'],
      parserOptions: { project: null },
    },
    {
      files: ['**/__tests__/**/*', '**/*.test.ts', '**/*.spec.ts'],
      env: { jest: true, node: true },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-var-requires': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'warn',
    'no-var': 'error',
    'prettier/prettier': ['warn', { endOfLine: 'auto' }],
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'coverage/',
    '*.lock',
    '*.cjs',
    'main/worlds/',
    'main/spritesheets/',
    'main/gui/',
  ],
};
