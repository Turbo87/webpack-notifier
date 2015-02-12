var path = require('path');
var notifier = require('node-notifier');

var WebpackNotifierPlugin = module.exports = function() {
    this.lastBuildSucceeded = false;
};

WebpackNotifierPlugin.prototype.compileMessage = function(stats) {
    var error;
    if (stats.hasWarnings()) {
        error = stats.compilation.warnings[0];
    }
    if (stats.hasErrors()) {
        error = stats.compilation.errors[0];
    }

    if (error) {
        try {
            this.lastBuildSucceeded = false;
            return error.module.rawRequest + '\n' + error.error.toString();
        } catch (e) {
            return "Unknown error or warning";
        }
    }

    if (!this.lastBuildSucceeded) {
        this.lastBuildSucceeded = true;
        return 'Build successful';
    }
};

WebpackNotifierPlugin.prototype.compilationDone = function(stats) {
    var msg = this.compileMessage(stats);
    if (msg) {
        notifier.notify({
            title: 'Webpack',
            message: msg,
            contentImage: path.join(__dirname, 'logo.png')
        });
    }
};

WebpackNotifierPlugin.prototype.apply = function(compiler) {
    compiler.plugin('done', this.compilationDone.bind(this));
};
