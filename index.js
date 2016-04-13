var path = require('path');
var os = require('os');
var spawn = require('child_process').spawn;
var notifier = require('node-notifier');
var template = require('es6-template-strings');

var DEFAULT_LOGO = path.join(__dirname, 'logo.png');

var WebpackNotifierPlugin = module.exports = function(options) {
    this.options = options || {};
    this.lastBuildSucceeded = false;

    if (this.options.editor) {
        var editor = this.options.editor;
        editor.args = editor.args || [];

        notifier.on('click', function(notifierObject, notifierOptions) {
            if (!notifierOptions.location) {
              return;
            }

            var command = template(editor.command, notifierOptions.location);
            var args = editor.args.map(function(arg) {
                return template(arg, notifierOptions.location);
            });

            if (command) {
                spawn(command, args);
            }
        });
    }
};

WebpackNotifierPlugin.prototype.compileMessage = function(stats) {
    var error;
    if (stats.hasErrors()) {
        error = stats.compilation.errors[0];

    } else if (stats.hasWarnings() && !this.options.excludeWarnings) {
        error = stats.compilation.warnings[0];

    } else if (!this.lastBuildSucceeded || this.options.alwaysNotify) {
        this.lastBuildSucceeded = true;
        return { body: 'Build successful' };

    } else {
        return;
    }

    this.lastBuildSucceeded = false;

    var rawRequest, resource, line, column;

    if (error.module) {
        rawRequest = error.module.rawRequest;
        resource = error.module.resource;
    }

    var errorOrWarning = error.error || error.warning;
    if (errorOrWarning && errorOrWarning.loc) {
        line = errorOrWarning.loc.line;
        column = errorOrWarning.loc.column;
    }

    var body = (error.error ? 'Error: ' : error.warning ? 'Warning: ' : '') +
               (rawRequest ? rawRequest + '\n' : '') +
               (errorOrWarning ? errorOrWarning.toString() : '');

    return {
        body: body,
        location: {
            file: resource,
            line: line,
            column: column
        }
    };
};

WebpackNotifierPlugin.prototype.compilationDone = function(stats) {
    var msg = this.compileMessage(stats);
    if (msg) {
        var contentImage = ('contentImage' in this.options) ?
            this.options.contentImage : DEFAULT_LOGO;

        notifier.notify({
            title: this.options.title || 'Webpack',
            message: msg.body,
            contentImage: contentImage,
            icon: (os.platform() === 'win32') ? contentImage : undefined,
            wait: !!this.options.editor,
            location: msg.location
        });
    }
};

WebpackNotifierPlugin.prototype.apply = function(compiler) {
    compiler.plugin('done', this.compilationDone.bind(this));
};
