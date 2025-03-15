import { useCallback, useMemo, useState } from "react";

export function useFolderPaths() {
    // ! root folder (null) not included.
    const [folderPaths, setFolderPaths] = useState<
        { folderId: string; folderName: string }[]
    >([]);

    const reset = useCallback(() => setFolderPaths([]), []);

    const adjust = useCallback(
        (newPath: { folderId: string; folderName: string }) =>
            setFolderPaths((prev) => {
                const newPathIndex = prev.findIndex(
                    (path) => path.folderId === newPath.folderId,
                );
                if (newPathIndex === -1) {
                    return [...prev, newPath];
                }
                return prev.slice(0, newPathIndex + 1);
            }),
        [],
    );

    const manager = useMemo(
        () => ({
            folderPaths,
            reset,
            adjust,
        }),
        [adjust, folderPaths, reset],
    );

    return manager;
}
