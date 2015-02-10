var path = require('path');
var notifier = require('node-notifier');

var STRATEGIES = {
    'darwin': function() {
        return new notifier.NotificationCenter()
    },
    'linux': function() {
        return new notifier.NotifySend()
    }
};


function WebpackErrorNotificationPlugin(strategy) {
    this.lastBuildSucceeded = false;
    this.notifier = null;

    if (typeof strategy === 'function') {
        this.notifier = strategy;
        return;
    }

    if (typeof strategy === 'undefined') {
        this.notifier = notifier;
    }

    if (STRATEGIES.hasOwnProperty(strategy)) {
        this.notifier = STRATEGIES[strategy]();
    }
};


WebpackErrorNotificationPlugin.prototype.compileMessage = function(stats) {
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


WebpackErrorNotificationPlugin.prototype.compilationDone = function(stats) {
    var msg = this.compileMessage(stats);
    if (msg) {
        this.notifier.notify({
            title: 'Webpack',
            message: msg,
            contentImage: path.join(__dirname, 'logo.png')
        });
    }
};


WebpackErrorNotificationPlugin.prototype.apply = function(compiler) {
    if (this.notifier === null) {
        console.log('Failed to set error notification.');
    } else {
        compiler.plugin('done', this.compilationDone.bind(this));
    }
};


module.exports = WebpackErrorNotificationPlugin;
