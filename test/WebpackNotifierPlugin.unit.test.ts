import WebpackNotifierPlugin, {Options} from '../';
import {notify} from 'node-notifier';

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
});
