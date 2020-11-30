import {notify} from 'node-notifier';
import WebpackNotifierPlugin from '../';
import {getCompiler, compile, prepareFs} from './utils';
import fixtures from "./fixtures";


describe('WebpackNotifierPlugin', () => {
  describe('one compilation', () => {
    test.each([
      [['successful'], {}],
      [['error'], {}],
      [['warning'], {}],
    ])('%j %j', testChangesFlow);
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
    expect(notify.mock.calls).toMatchSnapshot();
  }
}
