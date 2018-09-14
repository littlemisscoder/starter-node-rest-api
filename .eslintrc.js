module.exports = {
  extends: ['airbnb-base', 'plugin:jest/recommended'],
  plugins: ['import', 'jest'],
  env: {
    node: true,
    'jest/globals': true,
  },
  rules: {
    'consistent-return': 1,
    'no-param-reassign': 1,
    'max-len': 0,
  },
};
