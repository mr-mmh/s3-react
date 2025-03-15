import { useCallback, useRef } from "react";

type Args = (string | null)[];
export function useCache<T>(fn: (...args: Args) => Promise<T>) {
    const cachedRes = useRef<Map<string, T> | null>(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const _fn = useCallback(fn, []);

    const hash = useCallback((...args: Args) => args.join("-"), []);

    const execute = useCallback(
        async (...args: Args) => {
            if (!cachedRes.current) {
                cachedRes.current = new Map();
            }

            const hArgs = hash(...args);
            if (cachedRes.current.has(hArgs)) {
                return cachedRes.current.get(hArgs) as T;
            } else {
                const res = await _fn(...args);
                console.log("miss cache", res);
                cachedRes.current.set(hArgs, res);
                return res;
            }
        },
        [_fn, hash],
    );

    const revalidate = useCallback(
        (...args: Args) => {
            if (cachedRes.current) {
                cachedRes.current.delete(hash(...args));
            }
        },
        [hash],
    );

    const clear = useCallback(() => {
        if (cachedRes.current && cachedRes.current.size) {
            cachedRes.current.clear();
        }
    }, []);

    return {
        hash,
        execute,
        revalidate,
        clear,
    };
}
