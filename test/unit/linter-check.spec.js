'use strict';

const { execSync } = require('child_process');

const { test } = use('Test/Suite')('Linter Check');

test('linter', async ({ assert }) => {
  try {
    execSync('npm run eslint');
  } catch (error) {
    assert.isFalse(!!error);
  }
}).timeout(0);
