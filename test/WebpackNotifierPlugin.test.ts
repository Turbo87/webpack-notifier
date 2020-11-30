import {contentImageSerializer, reduceArraySerializer, testChangesFlow} from './utils';

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
