var exec = require('child_process').exec;


var STRATEGIES = {
    'darwin': function(msg) {
        exec('terminal-notifier -title Webpack -message ' + msg);
    },
    'linux': function(msg) {
        exec('notify-send Webpack ' + msg);
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
        strategy = process.platform;
    }

    if (STRATEGIES.hasOwnProperty(strategy)) {
        this.notifier = STRATEGIES[strategy];
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
        return 'Successful build';
    }
};


WebpackErrorNotificationPlugin.prototype.compilationDone = function(stats) {
    var msg = this.compileMessage(stats);
    if (msg) {
        msg = '"' + msg.replace('"', '\\"') + '"';
        this.notifier(msg);
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
