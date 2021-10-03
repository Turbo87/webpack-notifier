import {Compiler} from 'webpack';
export default class ChildCompilationPlugin {
  private levelCollectionKey: string;

  constructor(private level: string | boolean = false) {
    if (typeof level === 'string') {
      this.levelCollectionKey = level.toLowerCase() + 's';
    }
  }

  apply(compiler: Compiler) {
    if ('hooks' in compiler) {
      compiler.hooks.thisCompilation.tap('ChildCompilationPlugin', this.handleHook.bind(this));
    } else {
      (compiler as any).plugin('this-compilation', this.handleHook.bind(this));
    }
  }

  handleHook(compilation: any) {
    const childCompiler = (compilation as any).createChildCompiler(`CHILD COMPILATION`);
    childCompiler.runAsChild((err: Error, entries: any, compilation: any) => {
      if (this.level) {
        (compilation as any)[this.levelCollectionKey]
          .push(new Error(`Child Compilation ${this.level}`));
      }
    });
  }
};
