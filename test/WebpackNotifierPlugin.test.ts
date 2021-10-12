import {join} from 'path';
import {contentImageSerializer, reduceArraySerializer, testChangesFlow as _testChangesFlow, PartialTestArguments} from './helpers/utils';
import CustomWarningPlugin from './helpers/CustomWarningPlugin';
import ChildCompilationPlugin from './helpers/ChildCompilationPlugin';

expect.addSnapshotSerializer(reduceArraySerializer);
expect.addSnapshotSerializer(contentImageSerializer);

describe.each([
  ['1', require('webpack-1/package.json').version, require('webpack-1')],
  ['2', require('webpack-2/package.json').version, require('webpack-2')],
  ['3', require('webpack-3/package.json').version, require('webpack-3')],
  ['4', require('webpack-4/package.json').version, require('webpack-4')],
  ['5', require('webpack-5/package.json').version, require('webpack-5')],
  ['latest', require('webpack-latest/package.json').version, require('webpack-latest')],
])('webpack@%s', (name, webpackVersion, webpack) => {
  const testChangesFlow = (...args: PartialTestArguments) => _testChangesFlow(webpackVersion, webpack, ...args);
  describe('WebpackNotifierPlugin', () => {
    describe('one compilation', () => {
      test.each([
        [['successful'], undefined],
        [['error'], undefined],
        [['warning'], undefined],
      ])('%j %j', testChangesFlow);
    });
    describe('title', () => {
      test.each([
        [['successful'], {title: 'Webpack'}],
        [['successful'], {title}],
        [['error'], {title}],
        [['warning'], {title}],
      ])('%j %j', testChangesFlow);
      function title({msg}: {msg: string}) {
        if (msg.startsWith('Error')) return 'build error ❌';
        if (msg.startsWith('Warning')) return 'build warning ⚠️';
        return 'build complete ✅';
      }
      describe('new title function API', () => {
        test.each([
          [['successful'], {title: 'Webpack'}],
          [['successful'], {title}],
          [['error'], {title}],
          [['warning'], {title}],
        ])('%j %j', testChangesFlow);
        function title(params: {status: string, message: string}) {
          return `Build status is ${params.status} with message ${params.message}`;
        }
      });
    });
    describe('emoji message', () => {
        test.each<PartialTestArguments>([
        [['successful'], {emoji: true}],
        [['error'], {emoji: true}],
        [['warning'], {emoji: true}],
        [['successful'], {emoji: true}, {plugins: [new CustomWarningPlugin()]}],
      ])('%j %j %j', testChangesFlow);
    });
    describe('contentImage', () => {
      const contentImage = {
        success: join(__dirname, '../successImage.png'),
        warning: join(__dirname, '../warningsImage.png'),
        error: join(__dirname, '../errorsImage.png')
      };
      test.each([
        [['successful'], {
          contentImage: join(__dirname, '../another-logo.png')
        }],
      ])('%j {contentImage: "../another-logo.png"}', testChangesFlow);
      test.each([
        [['successful'], {contentImage}],
        [['error'], {contentImage}],
        [['warning'], {contentImage}],
      ])('%j {contentImage: {success: "../successImage.png"}, error: "../errorImage.png"}, warning: "../warningImage.png"}}', testChangesFlow);
    });
    describe('verbosity level configuration', () => {
      describe('Default', () => {
        test.each([
          [['successful', 'successful', 'successful'], undefined],
          [['error', 'error', 'successful'], undefined],
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

    describe('custom warning', () => {// TODO maybe deprecated
      test.each([
        [['successful'], undefined, {plugins: [new CustomWarningPlugin()]}],
      ])('%j %j', testChangesFlow);
    });
    describe('child compilation errors', () => {
      test.each([
        [['successful'], undefined, {plugins: [new ChildCompilationPlugin('Warning')]}],
        [['successful'], undefined, {plugins: [new ChildCompilationPlugin('Error')]}],
        [['successful'], undefined, {plugins: [new ChildCompilationPlugin(), new ChildCompilationPlugin('Warning')]}],
      ])('%j %j %j', testChangesFlow, 10e3);
    });
  });
});