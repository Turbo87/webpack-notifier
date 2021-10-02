// Type definitions imported from DefinitielyTyped for webpack-notifier 1.13
// Project: https://github.com/Turbo87/webpack-notifier#readme
// Definitions by: Benjamin Lim <https://github.com/bumbleblym>
//                 Piotr Błażejewicz <https://github.com/peterblazejewicz>
//                 Alexandre Germain <https://github.com/gerkindev>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.9

import { Plugin } from 'webpack';

export = WebpackNotifierPlugin;

declare const WebpackNotifierPlugin: {new (options?: WebpackNotifierPlugin.Options): Plugin};

declare namespace WebpackNotifierPlugin {
    interface Options {
        alwaysNotify?: boolean | undefined;
        contentImage?: {[key in 'success' | 'warning' | 'error']: string} | string | undefined;
        excludeWarnings?: boolean | undefined;
        onlyOnError?: boolean | undefined;
        skipFirstNotification?: boolean | undefined;
        title?: string | undefined;
        /**
         * Use emoji in notifications
         */
        emoji?: boolean | undefined;
    }

    /** @deprecated use Options */
    type Config = Options;
}
