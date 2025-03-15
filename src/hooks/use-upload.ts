import { useMemo } from "react";
import { LegalsConfig } from "@mrmmh/s3";
import { useUpload as useDefaultUpload, usePreventUnload } from "../base";
import type { InitialUploads } from "../base/types";

export function useUpload({
    legalsConfigs,
    maxFileSizeMB,
    maxFilesToUpload,
    initial,
}: {
    legalsConfigs: LegalsConfig;
    maxFilesToUpload: number;
    maxFileSizeMB: number;
    initial?: InitialUploads;
}) {
    const { files, reducer } = useDefaultUpload(initial);
    //! perevent hard reload when files are present for upload
    usePreventUnload(files.length > 0);

    const getAcceptObj = useMemo(() => {
        const fn = (legalsConfigs: LegalsConfig) => {
            let obj: { [key: string]: string[] } = {};
            for (const conf in legalsConfigs) {
                obj = {
                    ...obj,
                    ...Object.fromEntries(
                        legalsConfigs[conf as keyof typeof legalsConfigs].map(
                            ([mimetype, ext]) => [mimetype, [ext]],
                        ),
                    ),
                };
            }
            return obj;
        };
        return fn(legalsConfigs);
    }, [legalsConfigs]);

    const uploadConfigs = useMemo(
        () => ({
            accept: getAcceptObj,
            maxFiles: maxFilesToUpload,
            maxSize: maxFileSizeMB * 1024 * 1024, // 100 MG,
        }),
        [getAcceptObj, maxFileSizeMB, maxFilesToUpload],
    );

    const manager = useMemo(
        () => ({
            files,
            reducer,
            uploadConfigs,
        }),
        [files, reducer, uploadConfigs],
    );

    return manager;
}
