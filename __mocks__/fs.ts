import {createFsFromVolume, Volume} from 'memfs';
import {version as webpackVersion} from 'webpack/package.json';
import semver from 'semver';
import path from 'path';

const vol = new Volume();
const fs = createFsFromVolume(vol);
fs[Symbol.for('Volume')] = vol;

if (semver.lt(webpackVersion, '5.0.0')) {
  fs['join'] = path.join.bind(path);
}
module.exports = fs;
