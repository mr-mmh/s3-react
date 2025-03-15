import { useCallback, useMemo, useOptimistic, useReducer, useState } from "react";
import { createReducer } from "./create-reducer";
import type { ClientFolderDTO } from "./types";

type InitialFolders = {
    folder: ClientFolderDTO | null;
    subFolders: ClientFolderDTO[];
};

export function useFolders(initial?: InitialFolders) {
    const [folder, setFolder] = useState<ClientFolderDTO | null>(initial?.folder ?? null);

    const _subfolderReducer = useMemo(() => createReducer<ClientFolderDTO>, []);
    const [subFolders, subfolderReducer] = useReducer(
        _subfolderReducer,
        initial?.subFolders ?? [],
    );

    const _optimisticSubfolderReducer = useMemo(() => createReducer<ClientFolderDTO>, []);
    const [optimisticSubfolders, optimisticSubfolderReducer] = useOptimistic(
        subFolders,
        _optimisticSubfolderReducer,
    );

    const replaceFolder = useCallback(
        (folder: ClientFolderDTO | null) => setFolder(folder),
        [],
    );

    const manager = useMemo(
        () => ({
            folder,
            subFolders: optimisticSubfolders,
            replaceFolder,
            subfolderReducer,
            optimisticSubfolderReducer,
        }),
        [folder, optimisticSubfolderReducer, optimisticSubfolders, replaceFolder],
    );

    return manager;
}
