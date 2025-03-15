import { useCallback, useRef } from "react";

/**
 * Custom hook that returns a function to handle double-tap events.
 *
 * @param cb - Callback function to be executed on double-tap.
 * @returns A function that should be called to handle a double-tap event.
 *
 * use the handler in the `onTouchStart` event or any touch event.
 * @example
 * ```tsx
 * const handleDoubleTap = useDblTap(() => {
 *   console.log('Double tapped!');
 * });
 *
 * return <div onTouchStart={handleDoubleTap}>Tap me</div>;
 * ```
 */
const DOUBLE_TAP_DELAY = 300; // milliseconds
export function useDblTap(
    cb: (...args: any[]) => void,
    delay = DOUBLE_TAP_DELAY,
) {
    const lastTap = useRef(0);

    const handleDoubleTap = useCallback(() => {
        const now = Date.now();

        if (now - lastTap.current < delay) {
            cb();
        }
        lastTap.current = now;
    }, [cb]);

    return handleDoubleTap;
}
