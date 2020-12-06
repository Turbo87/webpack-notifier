export default class ChildCompilationPlugin {
  private levelCollectionKey: string;

  constructor(private level: string | boolean = false) {
    if (typeof level === 'string') {
      this.levelCollectionKey = level.toLowerCase() + 's';
    }
  }

  apply(compiler) {
    if ('hooks' in compiler) {
      compiler.hooks.thisCompilation.tap('ChildCompilationPlugin', this.handleHook.bind(this));
    } else {
      compiler.plugin('this-compilation', this.handleHook.bind(this));
    }
  }

  handleHook(compilation) {
    const childCompiler = compilation.createChildCompiler(`CHILD COMPILATION`);
    childCompiler.runAsChild((err, entries, compilation) => {
      if (this.level) {
        compilation[this.levelCollectionKey]
          .push(new Error(`Child Compilation ${this.level}`));
      }
    });
  }
};
