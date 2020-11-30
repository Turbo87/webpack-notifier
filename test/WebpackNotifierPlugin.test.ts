import {notify} from 'node-notifier';
import WebpackNotifierPlugin from '../';
import {getCompiler, compile, prepareFs, contentImageSerializer, reduceArraySerializer} from './utils';
import fixtures from "./fixtures";

expect.addSnapshotSerializer(reduceArraySerializer);
expect.addSnapshotSerializer(contentImageSerializer);

describe('WebpackNotifierPlugin', () => {
  describe('one compilation', () => {
    test.each([
      [['successful'], {}],
      [['error'], {}],
      [['warning'], {}],
    ])('%j %j', testChangesFlow);
  });
  describe('verbosity level configuration', () => {
    describe('Default', () => {
      test.each([
        [['successful', 'successful', 'successful'], {}],
        [['error', 'error', 'successful'], {}],
      ])('%j %j', testChangesFlow);
    });
    describe('Exclude Warnings', () => {
      test.each([
        [['warning'], {excludeWarnings: true}],
      ])('%j %j', testChangesFlow);
    });
    describe('Always Notify', () => {
      test.each([
        [['successful', 'successful'], {alwaysNotify: true}],
      ])('%j %j', testChangesFlow);
    });
    describe('Notify on error', () => {
      test.each([
        [['successful', 'warning', 'error'], {onlyOnError: true}],
      ])('%j %j', testChangesFlow);
    });
    describe('Skip Notification on the First Build', () => {
      test.each([
        [['successful', 'successful'], {skipFirstNotification: true}],
      ])('%j %j', testChangesFlow);
    });
  });
});

async function testChangesFlow(sources, opts)  {
  const compiler = getCompiler();
  const plugin = new WebpackNotifierPlugin(opts);
  plugin.apply(compiler);

  for (const name of sources) {
    notify.mockClear();
    prepareFs(fixtures.simple[name]);
    await compile(compiler);
    expect(notify.mock.calls).toMatchSnapshot(`after "${name}" build`);
  }
}
