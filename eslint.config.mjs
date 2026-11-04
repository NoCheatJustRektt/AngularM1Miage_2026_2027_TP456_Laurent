// @ts-check
// Configuration ESLint commune à tout le projet (voir docs/CONVENTIONS.md).
import eslint from '@eslint/js';
import angular from 'angular-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores(['**/node_modules/', '**/dist/', '**/coverage/', '**/.angular/']),

  // Tout le code JavaScript et TypeScript
  {
    files: ['**/*.{js,mjs,ts}'],
    extends: [eslint.configs.recommended, tseslint.configs.recommended],
    plugins: { 'simple-import-sort': simpleImportSort },
    languageOptions: { globals: globals.node },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      // Ordre : modules Node, bibliothèques, @studyshare/shared, fichiers du projet.
      'simple-import-sort/imports': [
        'error',
        { groups: [['^node:'], ['^@?\\w'], ['^@studyshare/'], ['^\\.']] },
      ],
      'simple-import-sort/exports': 'error',
    },
  },

  // Application Angular
  {
    files: ['client/**/*.ts'],
    extends: [angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    languageOptions: { globals: globals.browser },
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
    },
  },
  {
    files: ['client/**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
  },

  // Désactive les règles de style gérées par Prettier
  prettier,
);
