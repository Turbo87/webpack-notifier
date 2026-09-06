import WebpackNotifierPlugin, {Options} from '../';
import nodeNotifier = require('node-notifier');

const notify = nodeNotifier.notify;
// `notificationConstructorOptions` is exported by __mocks__/node-notifier.ts
// and is absent from the @types/node-notifier declarations
const notificationConstructorOptions = (nodeNotifier as unknown as {
  notificationConstructorOptions: unknown[];
}).notificationConstructorOptions;

// index.d.ts only declares `apply()`, but `compilationDone()` exists at
// runtime — the intersection type below models that.
type PluginWithCompilationDone = WebpackNotifierPlugin & {
  compilationDone: (stats: FakeStats) => void;
};

function createPlugin(options?: Options): PluginWithCompilationDone {
  return new WebpackNotifierPlugin(options) as PluginWithCompilationDone;
}

interface FakeModuleError {
  module: {rawRequest: string};
  error: Error;
}

interface FakeCompilation {
  errors: FakeModuleError[];
  warnings: FakeModuleError[];
  children: FakeCompilation[];
}

interface FakeStats {
  hasErrors: () => boolean;
  hasWarnings: () => boolean;
  compilation: FakeCompilation;
}

function createErrorStats(errorMessage: string): FakeStats {
  return {
    hasErrors: () => true,
    hasWarnings: () => false,
    compilation: {
      errors: [{
        module: {rawRequest: 'src/broken-module.js'},
        error: new Error(errorMessage),
      }],
      warnings: [],
      children: [],
    },
  };
}

function createSuccessStats(): FakeStats {
  return {
    hasErrors: () => false,
    hasWarnings: () => false,
    compilation: {
      errors: [],
      warnings: [],
      children: [],
    },
  };
}

const LOREM_IPSUM_SENTENCE =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ';

function loremIpsum(length: number): string {
  const repeated = LOREM_IPSUM_SENTENCE.repeat(
    Math.ceil(length / LOREM_IPSUM_SENTENCE.length)
  );
  return repeated.slice(0, length);
}

function notifyOptions() {
  return (notify as jest.Mock).mock.calls[0][0];
}

beforeEach(() => {
  (notify as jest.Mock).mockReset();
  notificationConstructorOptions.length = 0;
});

describe('WebpackNotifierPlugin (unit, no webpack)', () => {
  test('truncates overly long error messages', () => {
    const plugin = createPlugin();
    const errorText = 'x'.repeat(45000);
    plugin.compilationDone(createErrorStats(errorText));

    const fullMessage = 'Error: src/broken-module.js\nError: ' + errorText;
    // 40035 characters are cut off: 45035 total, 5000 kept
    expect(notifyOptions().message).toBe(
      fullMessage.slice(0, 5000) + '\n(message truncated: 40035 characters)'
    );
  });

  test('leaves short error messages untouched', () => {
    const plugin = createPlugin();
    plugin.compilationDone(createErrorStats('Syntax error'));

    expect(notify).toHaveBeenCalledTimes(1);
    expect(notifyOptions().message).toBe('Error: src/broken-module.js\nError: Syntax error');
  });

  test('passes the full message to a custom title function', () => {
    let fullMessageLength = 0;
    const plugin = createPlugin({
      title: ({message}: {message: string}) => {
        fullMessageLength = message.length;
        return 'Custom title';
      },
    });
    plugin.compilationDone(createErrorStats('y'.repeat(50000)));

    expect(fullMessageLength).toBeGreaterThan(5000);
    expect(notifyOptions().title).toBe('Custom title');
  });

  test('truncates overly long custom titles', () => {
    const plugin = createPlugin({title: 'T'.repeat(100000)});
    plugin.compilationDone(createErrorStats('Syntax error'));

    expect(notifyOptions().title.length).toBe(1000);
  });

  test('keeps Lorem Ipsum messages that exactly hit the limits', () => {
    const plugin = createPlugin({title: loremIpsum(1000)});
    // 'Error: src/broken-module.js\nError: ' is 35 characters long, keeping
    // the final message at exactly 5000 characters
    plugin.compilationDone(createErrorStats(loremIpsum(5000 - 35)));

    expect(notifyOptions().title.length).toBe(1000);
    expect(notifyOptions().message.length).toBe(5000);
    expect(notifyOptions().message.includes('truncated')).toBe(false);
  });

  test('forwards node-notifier options from the plugin root to notify()', () => {
    // TODO mark as deprecate at v2.x
    const plugin = createPlugin({appID: 'com.squirrel.your.app'} as Options & {appID: string});
    plugin.compilationDone(createSuccessStats());

    expect(notify).toHaveBeenCalledTimes(1);
    expect(notifyOptions().appID).toBe('com.squirrel.your.app');
  });

  test('drops node-notifier message/icon aliases from notifyOptions', () => {
    const plugin = createPlugin({
      notifyOptions: {
        text: 'x'.repeat(40000),
        appIcon: 'icon.png',
        appName: 'MyApp',
        i: 'icon2.png',
      },
    });
    plugin.compilationDone(createSuccessStats());

    expect(notify).toHaveBeenCalledTimes(1);
    expect(notifyOptions().message).toBe('Build successful');
    expect(notifyOptions()).not.toHaveProperty('text');
    expect(notifyOptions()).not.toHaveProperty('appIcon');
    expect(notifyOptions()).not.toHaveProperty('appName');
    expect(notifyOptions()).not.toHaveProperty('i');
  });

  test('forwards notifyOptions to node-notifier without the container itself', () => {
    const plugin = createPlugin({notifyOptions: {appID: 'com.squirrel.your.app'}});
    plugin.compilationDone(createSuccessStats());

    expect(notifyOptions().appID).toBe('com.squirrel.your.app');
    expect(notifyOptions()).not.toHaveProperty('notifyOptions');
  });

  test('uses the custom notifier with notifierOptions', () => {
    let constructorOptions: unknown;
    class FakeNotifier {
      constructor(options: unknown) {
        constructorOptions = options;
      }
      notify(options: unknown) {
        (notify as jest.Mock)(options);
      }
    }

    const plugin = createPlugin({
      notifier: FakeNotifier,
      notifierOptions: {withFallback: false},
    });
    plugin.compilationDone(createSuccessStats());

    expect(constructorOptions).toEqual({withFallback: false});
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notifyOptions().message).toBe('Build successful');
  });

  test('throws on an unknown notifier name', () => {
    const real = jest.requireActual('node-notifier') as Record<string, unknown>;
    expect(real['UnknownNotifier']).toBeUndefined();
    expect(() => createPlugin({notifier: 'UnknownNotifier'})).toThrow(/unknown notifier/);
  });

  test('resolves real node-notifier notifier names', () => {
    const real = jest.requireActual('node-notifier') as Record<string, unknown>;
    const names = ['NotificationCenter', 'WindowsToaster', 'WindowsBalloon', 'Growl', 'NotifySend'];
    for (const name of names) {
      const Notifier = real[name] as (new () => {notify: unknown}) | undefined;
      expect(typeof Notifier).toBe('function');
      expect(typeof new (Notifier as new () => {notify: unknown})().notify).toBe('function');
    }
  });

  test('uses notifierOptions without notifier to create the platform default notifier', () => {
    createPlugin();

    expect(notificationConstructorOptions).toEqual([{withFallback: true}]);

    const plugin = createPlugin({notifierOptions: {customPath: 'C:/custom/my.exe'}});
    plugin.compilationDone(createSuccessStats());

    expect(notificationConstructorOptions).toEqual([
      {withFallback: true},
      {customPath: 'C:/custom/my.exe'},
    ]);
    expect(notify).toHaveBeenCalledTimes(1);
    expect(notifyOptions().message).toBe('Build successful');
  });
});
