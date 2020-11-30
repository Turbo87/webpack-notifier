import {join} from 'path';
import {platform} from 'os';
import {notify} from 'node-notifier';
import WebpackNotifierPlugin from '../';
import {getCompiler, compile, prepareFs} from './utils';
import fixtures from "./fixtures";


describe('WebpackNotifierPlugin', () => {
  describe('simple', () => {
    test.each([
      ['successful', 'Build successful'],
      ['error', 'Error: /entry.js\nSyntaxError: Unexpected token (1:4)'],
      ['warning', 'Warning: /entry.js\nrequire.extensions is not supported by webpack. Use a loader instead.'],
    ])('%s', async (name, message) => {
      const {fs} = prepareFs(fixtures.simple[name]);
      const compiler = getCompiler({fs});
      const plugin = new WebpackNotifierPlugin();
      plugin.apply(compiler);

      await compile(compiler);

      expect(notify.mock.calls.length).toBe(1);
      expect(notify.mock.calls[0][0]).toEqual({
        title: undefined,
        contentImage: join(__dirname, '../logo.png'),
        icon: ['win32', 'linux'].includes(platform()) ? join(__dirname, '../logo.png') : undefined,
        message,
      });
    });
  });
});
