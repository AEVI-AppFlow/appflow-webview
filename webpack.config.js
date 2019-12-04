const path = require('path');

module.exports = {
  entry: './dist/index.js',
  output: {
    filename: 'appflow.js',
    path: path.resolve(__dirname, 'webview/src/main/assets/www/js'),
  },
};