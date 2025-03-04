import React, { createContext, useContext } from "react";
import type { Context } from "react";
import type { ReactNode } from "react";
import createCache from "@emotion/cache";
import type { EmotionCache } from "@emotion/cache";

const {
    getDoExistsTssDefaultEmotionCacheMemoizedValue,
    getTssDefaultEmotionCache,
    reactContext,
} = (() => {
    type SharedContext = {
        reactContext: Context<EmotionCache | undefined>;
        getTssDefaultEmotionCache: (params?: {
            doReset: boolean;
        }) => EmotionCache;
        getDoExistsTssDefaultEmotionCacheMemoizedValue: () => boolean;
    };

    const propertyKey = "__tss-react_context";

    const peerDepObj: Record<typeof propertyKey, SharedContext | undefined> =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createContext as any;

    let sharedContext = peerDepObj["__tss-react_context"];

    if (sharedContext === undefined) {
        const {
            getTssDefaultEmotionCache,
            getDoExistsTssDefaultEmotionCacheMemoizedValue,
        } = (() => {
            let cache: EmotionCache | undefined = undefined;

            /**
             * Lazily initialized singleton
             * If doReset is set to true the memoized instance will be
             * discarded and a new one created.
             * */
            function getTssDefaultEmotionCache(params?: {
                doReset: boolean;
            }): EmotionCache {
                const { doReset = false } = params ?? {};

                if (doReset) {
                    cache = undefined;
                }

                if (cache === undefined) {
                    cache = createCache({ "key": "tss" });
                }

                return cache;
            }

            return {
                getTssDefaultEmotionCache,
                "getDoExistsTssDefaultEmotionCacheMemoizedValue": () =>
                    cache !== undefined,
            };
        })();

        sharedContext = {
            getTssDefaultEmotionCache,
            getDoExistsTssDefaultEmotionCacheMemoizedValue,
            "reactContext": createContext<EmotionCache | undefined>(undefined),
        };

        Object.defineProperty(peerDepObj, propertyKey, {
            "configurable": false,
            "enumerable": false,
            "writable": false,
            "value": sharedContext,
        });
    }

    return sharedContext;
})();

export {
    getDoExistsTssDefaultEmotionCacheMemoizedValue,
    getTssDefaultEmotionCache,
};

export function useTssEmotionCache() {
    const cacheExplicitlyProvidedForTss = useContext(reactContext);

    return cacheExplicitlyProvidedForTss ?? getTssDefaultEmotionCache();
}

export function TssCacheProvider(props: {
    value: EmotionCache;
    children: ReactNode;
}) {
    const { children, value } = props;

    return (
        <reactContext.Provider value={value}>{children}</reactContext.Provider>
    );
}
