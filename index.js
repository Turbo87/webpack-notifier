var stripANSI = require('strip-ansi');
var path = require('path');
var os = require('os');
var nodeNotifier = require('node-notifier');

var DEFAULT_LOGO = path.join(__dirname, 'logo.png');
var MAX_NOTIFICATION_MESSAGE_LENGTH = 5000;
var MAX_NOTIFICATION_TITLE_LENGTH = 1000;

function WebpackNotifierPlugin(options) {
  // defaults mirror the notifier instance node-notifier creates for the OS
  this.options = Object.assign(
    {},
    { notifier: nodeNotifier.Notification, notifierOptions: { withFallback: true } },
    options
  );
  this.notifier = this.createNotifier();
  this.lastBuildSucceeded = false;
  this.isFirstBuild = true;
}
module.exports = WebpackNotifierPlugin;

function findFirstDFS(compilation, key) {
  var match = compilation[key][0];
  if (match) {
    return match;
  }

  var children = compilation.children;
  for (var i = 0; i < children.length; i += 1) {
    match = findFirstDFS(children[i], key);
    if (match) {
      return match;
    }
  }
}

WebpackNotifierPlugin.prototype.createNotifier = function createNotifier() {
  var Notifier = typeof this.options.notifier === 'string'
    ? nodeNotifier[this.options.notifier]
    : this.options.notifier;

  if (typeof Notifier !== 'function') {
    throw new Error(
      'webpack-notifier: unknown notifier "' + this.options.notifier + '". '
        + 'Expected one of node-notifier exports: NotificationCenter, '
        + 'WindowsToaster, WindowsBalloon, Growl, NotifySend'
    );
  }

  return new Notifier(this.options.notifierOptions);
};

// Notification messages are passed to the OS notification daemon as command
// line arguments. Windows rejects command lines longer than 32767 characters,
// and the SnoreToast binary hangs for messages above ~12000 characters.
// Truncating notifications keeps them working on all platforms.
function truncateMessage(message) {
  if (message.length > MAX_NOTIFICATION_MESSAGE_LENGTH) {
    var truncatedCount = message.length - MAX_NOTIFICATION_MESSAGE_LENGTH;
    return message.slice(0, MAX_NOTIFICATION_MESSAGE_LENGTH)
      + '\n(message truncated: ' + truncatedCount + ' characters)';
  }
  return message;
}

function truncateTitle(title) {
  if (typeof title === 'string' && title.length > MAX_NOTIFICATION_TITLE_LENGTH) {
    return title.slice(0, MAX_NOTIFICATION_TITLE_LENGTH);
  }
  return title;
}

WebpackNotifierPlugin.prototype.compileEndOptions = function compileEndOptions(stats) {
  if (this.isFirstBuild) {
    this.isFirstBuild = false;

    if (this.options.skipFirstNotification) {
      return {};
    }
  }

  var imageFromOptions = ('contentImage' in this.options)
    ? this.options.contentImage
    : DEFAULT_LOGO;

  var successImage = '';
  var warningsImage = '';
  var errorsImage = '';
  if (typeof imageFromOptions === 'object') {
    successImage = imageFromOptions.success;
    warningsImage = imageFromOptions.warning;
    errorsImage = imageFromOptions.error;
  } else {
    successImage = imageFromOptions;
    warningsImage = imageFromOptions;
    errorsImage = imageFromOptions;
  }

  var hasEmoji = this.options.emoji;
  var error;
  var contentImage;
  var status;
  if (this.hasErrors(stats)) {
    error = findFirstDFS(stats.compilation, 'errors');
    contentImage = errorsImage;
    status = 'error';
  } else if (this.options.onlyOnError) {
    return {};
  } else if (this.hasWarnings(stats) && !this.options.excludeWarnings) {
    error = findFirstDFS(stats.compilation, 'warnings');
    contentImage = warningsImage;
    status = 'warning';
  } else if (!this.lastBuildSucceeded || this.options.alwaysNotify) {
    this.lastBuildSucceeded = true;
    return {
      message: (hasEmoji ? '✅ ' : '') + 'Build successful',
      contentImage: successImage,
      status: 'success'
    };
  } else {
    return {};
  }

  this.lastBuildSucceeded = false;

  var message = '';
  if (error.module && error.module.rawRequest) {
    message = error.module.rawRequest + '\n';
  }

  if (error.error) {
    message = (hasEmoji ? '❌ ' : '') + 'Error: ' + message + error.error.toString();
  } else if (error.warning) {
    message = (hasEmoji ? '⚠️ ' : '') + 'Warning: ' + message + error.warning.toString();
  } else if (error.message) {
    message = (hasEmoji ? '⚠️ ' : '') + 'Warning: ' + message + error.message.toString();
  }

  return {
    message: stripANSI(message),
    contentImage: contentImage,
    status: status
  };
};

WebpackNotifierPlugin.prototype.hasErrors = function hasErrors(stats) {
  return stats.hasErrors()
      || stats.compilation.children.some(child => child.getStats().hasErrors());
};

WebpackNotifierPlugin.prototype.hasWarnings = function hasWarnings(stats) {
  return stats.hasWarnings()
      || stats.compilation.children.some(child => child.getStats().hasWarnings());
};

WebpackNotifierPlugin.prototype.compilationDone = function compilationDone(stats) {
  var { message, contentImage, status } = this.compileEndOptions(stats);
  if (message) {
    var title = this.options.title ? this.options.title : 'Webpack';
    if (typeof title === 'function') {
      title = title({
        msg: message, // compatibility with v1.11.0
        message: message,
        status: status
      });
    }

    var icon = (os.platform() === 'win32' || os.platform() === 'linux')
      ? contentImage
      : undefined;

    // plugin-level options are not node-notifier options and are not forwarded
    var options = Object.assign({}, this.options);
    delete options.notifyOptions;
    delete options.notifier;
    delete options.notifierOptions;
    Object.assign(options, this.options.notifyOptions);

    this.notifier.notify(Object.assign(
      options,
      {
        title: truncateTitle(title),
        message: truncateMessage(message),
        contentImage,
        icon
      }
    ));
  }
};

WebpackNotifierPlugin.prototype.apply = function apply(compiler) {
  if (compiler.hooks) {
    var plugin = { name: 'Notifier' };

    compiler.hooks.done.tap(plugin, this.compilationDone.bind(this));
  } else {
    compiler.plugin('done', this.compilationDone.bind(this));
  }
};
