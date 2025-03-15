import { useCallback, useMemo, useState } from "react";
import { FileTypeNames } from "@mrmmh/s3";
import type { ClientFileDTO, ClientFolderDTO, SelectionOptions } from "./types";

export function useSelect(
    {
        multiple = true,
        which = ["file", "folder"],
        fileTypes,
        selectedSetter,
    }: SelectionOptions = {
        multiple: true,
        which: ["file", "folder"],
    },
) {
    const [selectedFiles, setSelectedFiles] = useState<ClientFileDTO[]>([]);
    const [selectedFolders, setSelectedFolders] = useState<ClientFolderDTO[]>([]);
    const [selectionActive, setSelectionActive] = useState(true);

    const toggleFileSelection = useCallback(
        (file: ClientFileDTO) => {
            if (!which.includes("file")) return;
            if (fileTypes && !fileTypes.includes(file.type as FileTypeNames)) return;
            if (multiple) {
                return setSelectedFiles((selectedFiles) => {
                    if (
                        selectedFiles.some((selectedFile) => selectedFile.id === file.id)
                    ) {
                        return selectedFiles.filter(
                            (selectedFile) => selectedFile.id !== file.id,
                        );
                    }
                    return [...selectedFiles, file];
                });
            }

            setSelectedFolders([]);
            return setSelectedFiles((selectedFiles) => {
                if (selectedFiles.some((selectedFile) => selectedFile.id === file.id)) {
                    return [];
                }
                return [file];
            });
        },
        [fileTypes, multiple, which],
    );

    const toggleFolderSelection = useCallback(
        (folder: ClientFolderDTO) => {
            if (!which.includes("folder")) return;
            if (multiple) {
                return setSelectedFolders((selectedFolders) => {
                    if (
                        selectedFolders.some(
                            (selectedFolder) => selectedFolder.id === folder.id,
                        )
                    ) {
                        return selectedFolders.filter(
                            (selectedFolder) => selectedFolder.id !== folder.id,
                        );
                    }
                    return [...selectedFolders, folder];
                });
            }
            setSelectedFiles([]);
            return setSelectedFolders((selectededFolders) => {
                if (
                    selectededFolders.some(
                        (selectedFolder) => selectedFolder.id === folder.id,
                    )
                ) {
                    return [];
                }
                return [folder];
            });
        },
        [multiple, which],
    );

    const isFileSelected = useCallback(
        (fileId: string) => {
            return selectedFiles.some((file) => file.id === fileId);
        },
        [selectedFiles],
    );

    const isFolderSelected = useCallback(
        (folderId: string) => {
            return selectedFolders.some((folder) => folder.id === folderId);
        },
        [selectedFolders],
    );

    const clearFileSelection = useCallback(() => setSelectedFiles([]), []);
    const clearFolderSelection = useCallback(() => setSelectedFolders([]), []);
    const clearAllSelection = useCallback(() => {
        clearFileSelection();
        clearFolderSelection();
    }, [clearFileSelection, clearFolderSelection]);

    const activeSelection = useCallback(
        (active: boolean) => setSelectionActive(active),
        [],
    );

    const manager = useMemo(
        () => ({
            selectedFiles,
            selectedFolders,
            toggleFileSelection,
            toggleFolderSelection,
            isFileSelected,
            isFolderSelected,
            clearFileSelection,
            clearFolderSelection,
            clearAllSelection,
            selectionActive,
            activeSelection,
            selectedSetter,
        }),
        [
            activeSelection,
            clearAllSelection,
            clearFileSelection,
            clearFolderSelection,
            selectedSetter,
            isFileSelected,
            isFolderSelected,
            selectedFiles,
            selectedFolders,
            selectionActive,
            toggleFileSelection,
            toggleFolderSelection,
        ],
    );

    return manager;
}
