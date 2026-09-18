var webpackConfig = require('./webpack.config');

// Remove DtsBundlePlugin so it doesn't delete .d.ts files that karma-webpack
// needs to read during preprocessing.
var DtsBundlePlugin = require('dts-bundle-webpack');
webpackConfig.plugins = (webpackConfig.plugins || []).filter(function(p) {
  return !(p instanceof DtsBundlePlugin);
});

process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'src/**/*_test.ts',
      'src/test_util/**/*.ts',
    ],
    exclude: [],
    preprocessors: {
      '**/*.ts': ['webpack'],
    },
    webpack: webpackConfig,
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox'],
      },
    },
    singleRun: true,
    concurrency: Infinity
  })
}
