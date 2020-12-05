export default class CustomWarningPlugin {
  apply(compiler) {
    if ('hooks' in compiler) {
      compiler.hooks.shouldEmit.tap('CustomWarningPlugin', this.handleHook);
    } else {
      compiler.plugin('should-emit', this.handleHook);
    }
  }
  handleHook(compilation) {
    compilation.warnings.push(Object.assign(
      new Error('Custom Warning'),
      {warning: 'Custom Warning message'}
    ));
  }
};