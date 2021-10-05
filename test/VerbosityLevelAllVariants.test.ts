import WebpackNotifierPlugin from '../';
import {contentImageSerializer, reduceArraySerializer, testChangesFlow as _testChangesFlow, PartialTestArguments} from './helpers/utils';

expect.addSnapshotSerializer(reduceArraySerializer);
expect.addSnapshotSerializer(contentImageSerializer);

describe.each([
  [require('webpack-1/package.json').version, require('webpack-1')],
  [require('webpack-2/package.json').version, require('webpack-2')],
  [require('webpack-3/package.json').version, require('webpack-3')],
  [require('webpack-4/package.json').version, require('webpack-4')],
  [require('webpack-latest/package.json').version, require('webpack-latest')],
])('Webpack %s', (webpackVersion, webpack) => {
  const testChangesFlow = (...args: PartialTestArguments) => _testChangesFlow(webpackVersion, webpack, ...args);
  describe('VerbosityLevelAllVariants', () => {
    describe.each([...generateOptions()])('%j', (opts) => {
      test.each([...generateSteps(opts)])('%j', testChangesFlow);
    });

    function* generateOptions(): Generator<WebpackNotifierPlugin.Options> {
      for (const excludeWarnings of [false, true]) {
        for (const alwaysNotify of [false, true]) {
          for (const onlyOnError of [false, true]) {
            for (const skipFirstNotification of [false, true]) {
              yield {excludeWarnings, alwaysNotify, onlyOnError, skipFirstNotification};
            }
          }
        }
      }
    }
    function* generateSteps(opts: WebpackNotifierPlugin.Options): Generator<[string[], WebpackNotifierPlugin.Options]> {
      for (const firsStep of ['successful', 'warning', 'error']) {
        yield [[firsStep], opts];
        for (const secondStep of ['successful', 'warning', 'error']) {
          yield [[firsStep, secondStep], opts];
          for (const thirdStep of ['successful', 'warning', 'error']) {
            yield [[firsStep, secondStep, thirdStep], opts];
          }
        }
      }
    }
  });
});