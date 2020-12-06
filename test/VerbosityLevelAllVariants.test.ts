import {contentImageSerializer, reduceArraySerializer, testChangesFlow} from './helpers/utils';

expect.addSnapshotSerializer(reduceArraySerializer);
expect.addSnapshotSerializer(contentImageSerializer);

describe('VerbosityLevelAllVariants', () => {
  describe.each([...generateOptions()])('%j', (opts) => {
    test.each([...generateSteps(opts)])('%j', testChangesFlow);
  });

  function* generateOptions() {
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
  function* generateSteps(opts) {
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
