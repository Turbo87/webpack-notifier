import {join} from 'path';
import webpack from 'webpack';
import {version as webpackVersion} from 'webpack/package.json';
import {createFsFromVolume, Volume} from 'memfs';
import {notify} from 'node-notifier';
import {satisfies} from 'semver';
import fixtures from './fixtures';
import WebpackNotifierPlugin, {Options} from '../../';

function getCompiler(compilerOpts: webpack.Configuration): webpack.Compiler {
  const config: webpack.Configuration = {
    entry: '/entry.js',
    output: {
      path: '/',
      filename: 'bundle.js'
    },
    ...compilerOpts
  };
  if (satisfies(webpackVersion, '>=4', {includePrerelease: true})) {
    config['mode'] = 'development';
  }

  return webpack(config);
}
function patchCompiler(compiler: webpack.Compiler, fs: any) {
  compiler.inputFileSystem = fs;
  compiler.outputFileSystem = fs;
  // compiler.watchFileSystem = fs;

  if (satisfies(webpackVersion, '<5')) {
    (compiler as any)['resolvers'].normal.fileSystem = fs;
    // compiler['resolvers'].loader.fileSystem = fs;
    // compiler['resolvers'].context.fileSystem = fs;
  }
}
async function compile(compiler: webpack.Compiler): Promise<webpack.Stats> {
  return new Promise((resolve, reject) => {
    compiler.run((err?: Error, res?: webpack.Stats) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
  });
}

function prepareFs() {
  const vol = new Volume();
  const fs = createFsFromVolume(vol);

  if (satisfies(webpackVersion, '<5')) {
    (fs as any)['join'] = join;
  }

  return {fs, vol};
}

function updateFs(vol: any, json: any) {
  vol.reset();
  vol.fromJSON(json, '/');
}

export const reduceArraySerializer: jest.SnapshotSerializerPlugin = {
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
export const contentImageSerializer: jest.SnapshotSerializerPlugin = {
  test(val) {
    return typeof val === 'object' &&
      val.contentImage &&
      !val.contentImage.startsWith('__dirname');
  },
  serialize(val, config, indentation, depth, refs, printer) {
    var modifiedVal = {
      ...val,
      contentImage: val.contentImage.replace(join(__dirname, '../../'), '__dirname/')
    }
    delete modifiedVal.icon;
    return printer(modifiedVal, config, indentation, depth, refs);
  },
};

export type Sources = string[];
export type PluginOptions = Options | undefined;
export type CompilerOptions = {};
export type TestArguments = [Sources, PluginOptions, CompilerOptions?];

// intermediate, so that the jest does not pass done-callback, in case of last optional argument
export function testChangesFlow(...args: TestArguments)  {
  return runTest(...args);
};

async function runTest(sources: Sources, opts: PluginOptions, compilerOpts = {})  {
  const compiler = getCompiler(compilerOpts);
  const {fs, vol} = prepareFs();
  const plugin = new WebpackNotifierPlugin(opts);
  plugin.apply(compiler);
  patchCompiler(compiler, fs);

  for (const name of sources) {
    (notify as jest.Mock).mockClear();
    updateFs(vol, (fixtures.simple as any)[name]);
    await compile(compiler);
    expect((notify as jest.Mock).mock.calls).toMatchSnapshot(`after "${name}" build`);
  }
}
