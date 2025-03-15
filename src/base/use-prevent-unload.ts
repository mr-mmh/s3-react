import { useEffect } from "react";

export function usePreventUnload(prevent: boolean) {
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (prevent) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [prevent]);
}
