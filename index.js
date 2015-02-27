var path = require('path');
var notifier = require('node-notifier');

var DEFAULT_LOGO = path.join(__dirname, 'logo.png');

var WebpackNotifierPlugin = module.exports = function(options) {
    this.options = options || {};
    this.lastBuildSucceeded = false;
};

WebpackNotifierPlugin.prototype.compileMessage = function(stats) {
    var error;
    if (stats.hasErrors()) {
        error = stats.compilation.errors[0];

    } else if (stats.hasWarnings() && !this.options.excludeWarnings) {
        error = stats.compilation.warnings[0];

    } else if (!this.lastBuildSucceeded) {
        this.lastBuildSucceeded = true;
        return 'Build successful';
    }
    if (!error) {
      return;
    }

    this.lastBuildSucceeded = false;

    var message = error.module.rawRequest;
    if (error.error)
        message += '\n' + error.error.toString();
    else if (error.warning)
        message += '\n' + error.warning.toString();

    return message;
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
