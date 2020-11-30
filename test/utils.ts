import {promisify} from 'util';
import webpack from 'webpack';
import {version as webpackVersion} from 'webpack/package.json';
import semver from 'semver';
jest.mock('fs');

export function getCompiler() {
  const config = {
    entry: '/entry.js',
    output: {
      path: '/',
      filename: 'bundle.js'
    }
  };
  if (semver.gte(webpackVersion, '4.0.0')) {
    config['mode'] = 'development';
  }

  return webpack(config);
}

export function compile(compiler) {
  return promisify(compiler.run).call(compiler);
}

export function prepareFs(json) {
  const fs = require('fs');
  const vol = fs[Symbol.for('Volume')];
  vol.reset();
  vol.fromJSON(json, '/');

  return {vol, fs};
}
