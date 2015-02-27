var path = require('path');
var notifier = require('node-notifier');

var DEFAULT_LOGO = path.join(__dirname, 'logo.png');

var WebpackNotifierPlugin = module.exports = function(options) {
    this.options = options || {};
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
        var contentImage = ('contentImage' in this.options) ?
            this.options.contentImage : DEFAULT_LOGO;

        notifier.notify({
            title: this.options.title || 'Webpack',
            message: msg,
            contentImage: contentImage,
        });
    }
};

WebpackNotifierPlugin.prototype.apply = function(compiler) {
    compiler.plugin('done', this.compilationDone.bind(this));
};
