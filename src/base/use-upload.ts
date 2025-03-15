import React from "react";
import { FileUploadDTO } from "@mrmmh/s3";
import { createReducer } from "./create-reducer";
import { InitialUploads } from "./types";

export function useUpload(initial?: InitialUploads) {
    const [files, reducer] = React.useReducer(
        createReducer<FileUploadDTO>,
        initial?.files ?? [],
    );

    React.useEffect(() => {
        // ! Revoke the data uris to avoid memory leaks
        return () => files.forEach((file) => URL.revokeObjectURL(file.src));
    }, [files]);

    const manager = React.useMemo(
        () => ({
            files,
            reducer,
        }),
        [files],
    );

    return manager;
}
