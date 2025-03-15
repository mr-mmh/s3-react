import { useCallback } from "react";

export function useClipboard() {
    const copyToClipboard = useCallback(async (text: string) => {
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
            return { error: "BrowserNotSupport" } as const;
        }

        try {
            await navigator.clipboard.writeText(text);
            return { success: true } as const;
        } catch {
            return { error: "Catch" } as const;
        }
    }, []);

    return copyToClipboard;
}
