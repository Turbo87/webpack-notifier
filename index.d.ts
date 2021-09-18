// Type definitions for webpack-notifier 1.13
// Project: https://github.com/Turbo87/webpack-notifier#readme
// Definitions by: Benjamin Lim <https://github.com/bumbleblym>
//                 Piotr Błażejewicz <https://github.com/peterblazejewicz>
//                 Alexandre Germain <https://github.com/gerkindev>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.9

import { Plugin } from 'webpack';

export = WebpackNotifierPlugin;

declare class WebpackNotifierPlugin extends Plugin {
    constructor(options?: WebpackNotifierPlugin.Options);
}

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
         * @default false
         */
        emoji?: boolean | undefined;
    }

    /** @deprecated use Options */
    type Config = Options;
}