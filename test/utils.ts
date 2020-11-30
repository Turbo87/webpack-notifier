import {promisify} from 'util';
import {join} from 'path';
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

export async function compile(compiler) {
  await promisify(compiler.compile).call(compiler);// TODO workaround for re-compile
  return promisify(compiler.run).call(compiler);
}

export function prepareFs(json) {
  const fs = require('fs');
  const vol = fs[Symbol.for('Volume')];
  vol.reset();
  vol.fromJSON(json, '/');

  return {vol, fs};
}

export const reduceArraySerializer = {
  test(val) {
    return Array.isArray(val) &&
      val.length === 1 &&
      Array.isArray(val[0]) &&
      val[0].length === 1 &&
      typeof val[0][0] === 'object' &&
      val[0][0].hasOwnProperty('title');
  },
  serialize(val, config, indentation, depth, refs, printer) {
    return printer(val[0][0], config, indentation, depth, refs);
  },
};
export const contentImageSerializer = {
  test(val) {
    return typeof val === 'object' &&
      val.contentImage &&
      !val.contentImage.startsWith('__dirname');
  },
  serialize(val, config, indentation, depth, refs, printer) {
    var modifiedVal = {
      ...val,
      contentImage: val.contentImage.replace(join(__dirname, '../'), '__dirname/')
    }
    delete modifiedVal.icon;
    return printer(modifiedVal, config, indentation, depth, refs);
  },
};
