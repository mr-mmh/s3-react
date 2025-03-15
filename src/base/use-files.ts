import { useMemo, useOptimistic, useReducer } from "react";
import { createReducer } from "./create-reducer";
import type { ClientFileDTO } from "./types";

type InitialFiles = {
    files: ClientFileDTO[];
};

export function useFiles(initial?: InitialFiles) {
    const [files, reducer] = useReducer(
        createReducer<ClientFileDTO>,
        initial?.files ?? [],
    );

    const [optimisticFiles, optimisticReducer] = useOptimistic(
        files,
        createReducer<ClientFileDTO>,
    );

    const manager = useMemo(
        () => ({
            files: optimisticFiles,
            reducer,
            optimisticReducer,
        }),
        [optimisticFiles, optimisticReducer],
    );

    return manager;
}
