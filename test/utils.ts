import webpack from "webpack";
import {promisify} from "util";
import {createFsFromVolume, Volume} from "memfs";

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
  return {vol, fs};
}
