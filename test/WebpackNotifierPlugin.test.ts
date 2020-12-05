import {contentImageSerializer, reduceArraySerializer, testChangesFlow} from './utils';

expect.addSnapshotSerializer(reduceArraySerializer);
expect.addSnapshotSerializer(contentImageSerializer);

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
    function title({msg}) {
      if (msg.startsWith('Error')) return 'build error ❌';
      if (msg.startsWith('Warning')) return 'build warning ⚠️';
      return 'build complete ✅';
    }
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
});
