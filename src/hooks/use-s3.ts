"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    useTransition,
} from "react";
import {
    CreateFolderArgs,
    createS3Client,
    S3ClientConfigs,
    TrashFilesArgs,
    TrashFoldersArgs,
    UpdateFolderArgs,
} from "@mrmmh/s3";
import { useFiles, useFolderPaths, useFolders, useSelect } from "../base";
import { useCache } from "./use-cache";
import { useUpload } from "./use-upload";
import { useWindows } from "./use-windows";
import type {
    ClientFileDTO,
    ClientFolderDTO,
    SelectionOptions,
} from "../base/types";

export type UseS3Options = {
    mode?: "normal" | "selection";
    selectionOptions?: SelectionOptions;
    enablePath?: boolean;
};

export type NotificationContext = {
    message: string;
    level: "info" | "warn" | "error";
};

export type NotificationFn = (announcement: NotificationContext) => any;
export type NotificationsConfig = "off" | "log" | NotificationFn;

export type UseBucketOpts = {
    clientConfig: S3ClientConfigs;
    options?: UseS3Options;
};

export function useS3(opts: UseBucketOpts) {
    const { clientConfig, options } = opts;
    const SDK = useMemo(
        () => createS3Client(clientConfig).sdk,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const { execute, revalidate } = useCache(async (folderId) => {
        return await SDK.getFolderData({ folderId }).run();
    });

    const folderManager = useFolders();
    const fileManager = useFiles();
    const folderPathsManager = useFolderPaths();
    const selectionManager = useSelect(options?.selectionOptions);
    const windowManager = useWindows();
    const fileUploadManager = useUpload({
        legalsConfigs: SDK.fileInspector.legals,
        maxFilesToUpload: SDK.fileInspector.maxFilesToUpload,
        maxFileSizeMB: SDK.fileInspector.maxFileSizeMB,
    });

    const currentFolderId = useRef<string | null>(null);

    const { updateMoveDetails, toggleWindow, isOpenUploadFilesWindow } =
        windowManager;

    const [isLoadingFolder, startLoadFolder] = useTransition();
    const [isOperating, startOperation] = useTransition();
    const [initilizing, setInitilizing] = useState(true);

    const revalidateFolderCache = useCallback(
        (folderId: string | null) => {
            revalidate(folderId);
        },
        [revalidate],
    );

    const loadFolder = useCallback(
        async (folderId: string | null) => {
            startLoadFolder(async () => {
                currentFolderId.current = folderId;
                if (window && options?.enablePath) {
                    const pathname = window.location.pathname;
                    const newPath = `${pathname}${folderId ? `?path=${folderId}` : ""}`;
                    window.history.replaceState(null, "", newPath);
                }
                const res = await execute(folderId);
                // const { run } = SDK.getFolderData({ folderId, bucketId });
                // const res = await run();
                if (!res.success) {
                    //TODO
                    console.error("error", res.error);
                    revalidate(folderId);
                    return;
                }
                const { files, folder, subfolders } = res.result;
                folderManager.replaceFolder(folder);
                folderManager.subfolderReducer({
                    type: "replace",
                    payload: subfolders,
                });
                fileManager.reducer({ type: "replace", payload: files });
                if (folder === null) {
                    folderPathsManager.reset();
                } else {
                    folderPathsManager.adjust({
                        folderId: folder.id,
                        folderName: folder.name,
                    });
                }
                if (windowManager.moveDetails !== null) return;
                selectionManager.clearAllSelection();
                return;
            });
        },
        [
            options?.enablePath,
            execute,
            folderManager,
            fileManager,
            windowManager.moveDetails,
            selectionManager,
            revalidate,
            folderPathsManager,
        ],
    );

    const createFolder = useCallback(
        async (data: CreateFolderArgs) => {
            startOperation(async () => {
                const date = new Date();
                folderManager.optimisticSubfolderReducer({
                    type: "add",
                    payload: [
                        {
                            id: `optimistic-${date.getTime()}`,
                            name: data.name,
                            parentId: data.parentId,
                            optimistic: true,
                            createdAt: date,
                            updatedAt: date,
                        },
                    ],
                });

                const { run } = SDK.createFolder(data);
                const res = await run();
                if (!res.success) {
                    //TODO
                    console.error("error", res);
                    return;
                }
                revalidateFolderCache(res.result.parentId);
                folderManager.subfolderReducer({
                    type: "add",
                    payload: [res.result],
                });
            });
        },
        [folderManager, SDK, revalidateFolderCache],
    );

    const updateFolder = useCallback(
        async (data: UpdateFolderArgs) => {
            startOperation(async () => {
                folderManager.optimisticSubfolderReducer({
                    type: "patch",
                    payload: [{ ...data, optimistic: true }],
                });

                const { run } = SDK.updateFolder(data);
                const res = await run();
                if (!res.success) {
                    //TODO
                    console.error("error", res);
                    return;
                }
                //TODO: toast or anything
                revalidateFolderCache(res.result.parentId);
                folderManager.subfolderReducer({
                    type: "patch",
                    payload: [res.result],
                });
            });
        },
        [folderManager, SDK, revalidateFolderCache],
    );

    const trashFiles = useCallback(
        async (data: TrashFilesArgs) => {
            startOperation(async () => {
                fileManager.optimisticReducer({
                    type: "remove",
                    payload: data.fileIds,
                });

                const { run } = SDK.trashFiles(data);
                const res = await run();
                if (!res.success) {
                    //TODO
                    console.error("error", res);
                    windowManager.filesToDelete = [];
                    return;
                }
                //TODO: toast or anything
                fileManager.reducer({
                    type: "remove",
                    payload: data.fileIds,
                });
                windowManager.filesToDelete = [];
                selectionManager.clearAllSelection();
            });
        },
        [fileManager, SDK, windowManager, selectionManager],
    );

    const trashFolders = useCallback(
        async (data: TrashFoldersArgs) => {
            startOperation(async () => {
                folderManager.optimisticSubfolderReducer({
                    type: "remove",
                    payload: data.folderIds,
                });

                const { run } = SDK.trashFolders(data);
                const res = await run();
                if (!res.success) {
                    //TODO
                    console.error("error", res);
                    return;
                }
                //TODO: toast or anything
                folderManager.subfolderReducer({
                    type: "remove",
                    payload: data.folderIds,
                });
                selectionManager.clearAllSelection();
            });
        },
        [folderManager, SDK, selectionManager],
    );

    const moveToFolder = useCallback(
        async (data: {
            desFolderId: string | null;
            fromFolderId: string | null;
            files: ClientFileDTO[];
            folders?: ClientFolderDTO[];
        }) => {
            startOperation(async () => {
                const { desFolderId, files, folders } = data;
                if (folders && folders?.length) {
                    folderManager.optimisticSubfolderReducer({
                        type: "add",
                        payload: [
                            ...folders.map((folder) => ({
                                ...folder,
                                id: `optimistic-${folder.id}`,
                                optimistic: true,
                            })),
                        ],
                    });
                }

                if (files.length) {
                    fileManager.optimisticReducer({
                        type: "add",
                        payload: [
                            ...files.map((file) => ({
                                ...file,
                                id: `optimistic-${file.id}`,
                                optimistic: true,
                            })),
                        ],
                    });
                }

                const { run } = SDK.moveToFolder({
                    desFolderId,
                    filesIds: files.map((file) => file.id),
                    foldersIds: folders?.map((folder) => folder.id),
                });
                const res = await run();
                if (!res.success) {
                    //TODO
                    console.error("error", res);
                    return;
                }

                //TODO: toast or anything
                if (folders?.length) {
                    folderManager.subfolderReducer({
                        type: "add",
                        payload: folders,
                    });
                }

                if (files.length) {
                    fileManager.reducer({ type: "add", payload: files });
                }

                selectionManager.clearAllSelection();
                updateMoveDetails(null);
                revalidateFolderCache(data.fromFolderId);
                revalidateFolderCache(data.desFolderId);
            });
        },
        [
            SDK,
            fileManager,
            folderManager,
            revalidateFolderCache,
            selectionManager,
            updateMoveDetails,
        ],
    );

    const onDropFiles = useCallback(
        (files: File[]) => {
            const acceptedFiles: File[] = [];
            for (const file of files) {
                if (!SDK.fileInspector.isFileLegal(file)) {
                    continue;
                }
                if (!SDK.fileInspector.isFileSizeLegal(file)) {
                    continue;
                }
                acceptedFiles.push(file);
            }
            if (acceptedFiles?.length) {
                fileUploadManager.reducer({
                    type: "add",
                    payload: [
                        ...acceptedFiles.map((file) =>
                            SDK.fileUtils.createFileUploadDTO(
                                file,
                                folderManager.folder,
                            ),
                        ),
                    ],
                });
                if (!isOpenUploadFilesWindow) {
                    toggleWindow("uploadFilesWindow");
                }
            }
        },
        [
            SDK.fileInspector,
            SDK.fileUtils,
            fileUploadManager,
            folderManager.folder,
            isOpenUploadFilesWindow,
            toggleWindow,
        ],
    );

    const clearAll = useCallback(() => {
        folderManager.replaceFolder(null);
        folderManager.subfolderReducer({ type: "replace", payload: [] });
        fileManager.reducer({ type: "replace", payload: [] });
        folderPathsManager.reset();
    }, [fileManager, folderManager, folderPathsManager]);

    useEffect(() => {
        if (!initilizing) return;

        let fId: string | null = null;
        if (window) {
            fId = new URLSearchParams(window.location.search).get("path");
        }
        async function init() {
            await loadFolder(fId ?? null);
        }
        init().then(() => setInitilizing(false));
        return () => clearAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const addUploadedFile = useCallback(
        (file: ClientFileDTO) => {
            if (file.folderId === currentFolderId.current) {
                fileManager.reducer({
                    type: "add",
                    payload: [file],
                });
            }
        },
        [fileManager],
    );

    return {
        // loading
        isLoadingFolder,
        initilizing,
        isOperating,

        // managers
        folderManager,
        fileManager,
        folderPathsManager,
        fileUploadManager,
        windowManager,
        selectionManager,

        // actions
        loadFolder,
        createFolder,
        updateFolder,
        trashFiles,
        trashFolders,
        moveToFolder,
        onDropFiles,
        addUploadedFile,

        // modes
        mode: options?.mode ?? "normal",

        // user
        SDK,
        revalidateFolderCache,
    };
}
