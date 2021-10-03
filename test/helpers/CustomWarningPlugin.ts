import {Compiler} from 'webpack';
export default class CustomWarningPlugin {
  apply(compiler: Compiler) {
    if ('hooks' in compiler) {
      compiler.hooks.shouldEmit.tap('CustomWarningPlugin', this.handleHook);
    } else {
      (compiler as any).plugin('should-emit', this.handleHook);
    }
  }
  handleHook(compilation: any) {
    (compilation.warnings as Error[]).push(Object.assign(
      new Error('Custom Warning'),
      {warning: 'Custom Warning message'}
    ));
    return false;
  }
};