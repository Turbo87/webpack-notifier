import WebpackNotifierPlugin = require('../');
import nodeNotifier = require('node-notifier');

const optionsArray: WebpackNotifierPlugin.Options[] = [
	{
		title: 'Webpack',
		contentImage: 'logo.png',
		excludeWarnings: true,
		alwaysNotify: true,
		skipFirstNotification: true,
		emoji: true,
	},
	{
		title: (data: {msg: string,message: string,status: string}) => 'Webpack',
	},
];

const plugins: WebpackNotifierPlugin[] = optionsArray.map(options => new WebpackNotifierPlugin(options));

// node-notifier options, typed from @types/node-notifier, are assignable to the
// plugin options (previously TS2322 against an index-signature type)
const notifyByLiteral = new WebpackNotifierPlugin({notifyOptions: {appID: 'com.squirrel.your.app'}});
const notifyBySubtitle = new WebpackNotifierPlugin({notifyOptions: {subtitle: 'a subtitle'}});

type ToasterNotify = NonNullable<
	Parameters<InstanceType<typeof nodeNotifier.WindowsToaster>['notify']>[0]
>;
const typedToasterNotify: ToasterNotify = {appID: 'com.squirrel.your.app', message: 'hi', id: 1};
const notifyByTypedVar = new WebpackNotifierPlugin({notifyOptions: typedToasterNotify});

const baseNotify: nodeNotifier.Notification = {message: 'hi', wait: true};
const notifyByBaseVar = new WebpackNotifierPlugin({notifyOptions: baseNotify});

const ctorOptions: nodeNotifier.Option = {withFallback: false, customPath: 'C:/custom/x'};
const byCtorOptions = new WebpackNotifierPlugin({notifierOptions: ctorOptions});

const byName = new WebpackNotifierPlugin({notifier: 'WindowsToaster'});
const byClass = new WebpackNotifierPlugin({notifier: nodeNotifier.WindowsToaster});

void [notifyByLiteral, notifyBySubtitle, notifyByTypedVar, notifyByBaseVar, byCtorOptions, byName, byClass, ...plugins];
