import path from 'path';
import {promisify} from 'util';
import webpack from 'webpack';
import {version as webpackVersion} from 'webpack/package.json';
import semver from 'semver';
import {createFsFromVolume, Volume} from 'memfs';

export function getCompiler({fs}) {
  const compiler = webpack({
    mode: 'development',
    entry: '/entry.js',
    output: {
      path: '/',
      filename: 'bundle.js'
    }
  });
  Object.assign(
    compiler,
    {
      inputFileSystem: fs,
      outputFileSystem: fs
    }
  );

  return compiler;
}

export function compile(compiler) {
  return promisify(compiler.run).call(compiler);
}

export function prepareFs(json) {
  const vol = Volume.fromJSON(json, '/');
  const fs = createFsFromVolume(vol);

  if(semver.lt(webpackVersion, '5.0.0')) {
    fs['join'] = path.join.bind(path);
  }

  return {vol, fs};
}
