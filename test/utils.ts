import {promisify} from 'util';
import webpack from 'webpack';
jest.mock('fs');

export function getCompiler({fs}) {
  const compiler = webpack({
    mode: 'development',
    entry: '/entry.js',
    output: {
      path: '/',
      filename: 'bundle.js'
    }
  });

  return compiler;
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
