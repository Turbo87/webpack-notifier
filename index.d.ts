// Type definitions imported from DefinitielyTyped for webpack-notifier 1.13
// Project: https://github.com/Turbo87/webpack-notifier#readme
// Definitions by: Benjamin Lim <https://github.com/bumbleblym>
//                 Piotr Błażejewicz <https://github.com/peterblazejewicz>
//                 Alexandre Germain <https://github.com/gerkindev>
//                 Gvozdev Viktor <https://github.com/Gvozd>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.9

import { Compiler } from 'webpack';

export = WebpackNotifierPlugin;

declare class WebpackNotifierPlugin {
    constructor(options?: WebpackNotifierPlugin.Options);
    apply(compiler: Compiler): void;
}

declare namespace WebpackNotifierPlugin {
    interface Options {
        alwaysNotify?: boolean;
        contentImage?: {[key in 'success' | 'warning' | 'error']: string} | string;
        excludeWarnings?: boolean;
        onlyOnError?: boolean;
        skipFirstNotification?: boolean;
        title?: string | TitleGetter;
        /**
         * Use emoji in notifications
         */
        emoji?: boolean;
        /**
         * Additional options passed to `node-notifier` on every notification
         *
         * @since v1.17.0
         */
        notifyOptions?: {[key: string]: unknown};
        /**
         * `node-notifier` notifier to use: the name of one of its exported
         * notifier classes ('NotificationCenter', 'WindowsToaster',
         * 'WindowsBalloon', 'Growl', 'NotifySend') or the class itself
         *
         * @since v1.17.0
         */
        notifier?: string | NotifierConstructor;
        /**
         * Options passed to the notifier constructor (see `notifier`)
         *
         * @since v1.17.0
         */
        notifierOptions?: {[key: string]: unknown};
    }

    type NotifierConstructor = new (options?: object) => {
        notify(options: object, callback?: (...args: unknown[]) => void): unknown;
    };

    /** @deprecated use Options */
    type Config = Options;

    type TitleGetter = (data: {msg: string,message: string,status: string}) => string;
}
