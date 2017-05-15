/* eslint-env node */
'use strict';

var nsgRules = require('node-style-guide').eslintrc.rules;

module.exports = {
  rules: Object.assign({}, nsgRules, {
    'comma-dangle': ['error', 'always-multiline'],
    'linebreak-style': ['error', 'unix'],
    'strict': ['error', 'safe'],
  }),
};
