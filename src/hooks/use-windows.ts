import { useCallback, useMemo, useRef, useState } from "react";
import { useToggles } from "../base";
import { ClientFileDTO, ClientFolderDTO } from "../base/types";

type MoveDetail = {
    filesToMove: ClientFileDTO[];
    foldersToMove: ClientFolderDTO[];
    fromFolderId: string | null;
};

function isFileDTO(obj: ClientFileDTO | ClientFolderDTO): obj is ClientFileDTO {
    return "type" in obj;
}

export function useWindows() {
    const folderToEdit = useRef<ClientFolderDTO | null>(null);
    const filesToDelete = useRef<ClientFileDTO[]>([]);
    const foldersToDelete = useRef<ClientFolderDTO[]>([]);
    const fileToView = useRef<ClientFileDTO | null>(null);
    const folderToView = useRef<ClientFolderDTO | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [moveDetails, setMoveDetails] = useState<MoveDetail | null>(null);

    const { toggle: toggleWindow, ...isOpens } = useToggles({
        folderWindow: {
            preToggle(open) {
                if (open) {
                    folderToEdit.current = null;
                }
            },
        },
        uploadFilesWindow: {},
        viewWindow: {
            preToggle(open) {
                if (open) {
                    fileToView.current = null;
                    folderToView.current = null;
                }
            },
        },
        deleteWindow: {
            preToggle(open) {
                if (open) {
                    filesToDelete.current = [];
                    foldersToDelete.current = [];
                }
            },
        },
        moveWindow: {
            preToggle(open) {
                if (open) {
                    setMoveDetails(null);
                }
            },
        },
        trashWindow: {},
    });

    const updateMoveDetails = useCallback((moveDetail: MoveDetail | null) => {
        setMoveDetails(moveDetail);
    }, []);

    const _removeWindowSelection = useCallback(() => {
        if (window !== undefined) {
            window.getSelection()?.removeAllRanges();
        }
    }, []);

    // ? open windows
    const openFileInput = useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, []);

    const openViewWindow = useCallback(
        (fileOrFolder: ClientFileDTO | ClientFolderDTO) => {
            _removeWindowSelection();
            if (isFileDTO(fileOrFolder)) {
                fileToView.current = fileOrFolder;
            } else {
                folderToView.current = fileOrFolder;
            }
            toggleWindow("viewWindow");
        },
        [_removeWindowSelection, toggleWindow],
    );

    const openDeleteWindow = useCallback(
        (files: ClientFileDTO[] | null, folders?: ClientFolderDTO[] | null) => {
            _removeWindowSelection();
            if (!files && !folders) return;
            if (files && files.length) {
                filesToDelete.current = files;
            } else {
                filesToDelete.current = [];
            }

            if (folders && folders.length) {
                foldersToDelete.current = folders;
            } else {
                foldersToDelete.current = [];
            }
            toggleWindow("deleteWindow");
        },
        [_removeWindowSelection, toggleWindow],
    );

    const openFolderWindow = useCallback(
        (folder?: ClientFolderDTO) => {
            if (folder) {
                folderToEdit.current = folder;
            }
            toggleWindow("folderWindow", true);
        },
        [toggleWindow],
    );

    const openMoveWindow = useCallback(
        (moveDetail?: MoveDetail) => {
            _removeWindowSelection();
            if (moveDetail) {
                updateMoveDetails(moveDetail);
            }
            toggleWindow("moveWindow");
        },
        [_removeWindowSelection, toggleWindow, updateMoveDetails],
    );

    const clearDeleteData = useCallback((type: "file" | "folder" | "both") => {
        switch (type) {
            case "file":
                filesToDelete.current = [];
                return;
            case "folder":
                foldersToDelete.current = [];
                return;
            case "both":
                filesToDelete.current = [];
                foldersToDelete.current = [];
                return;
        }
    }, []);

    const manager = useMemo(
        () => ({
            openFileInput,
            openViewWindow,
            openDeleteWindow,
            openFolderWindow,
            openMoveWindow,
            toggleWindow,
            fileToView: fileToView.current,
            folderToView: folderToView.current,
            folderToEdit: folderToEdit.current,
            filesToDelete: filesToDelete.current,
            foldersToDelete: foldersToDelete.current,
            fileInputRef,
            moveDetails,
            updateMoveDetails,
            clearDeleteData,
            ...isOpens,
        }),
        [
            openFileInput,
            openViewWindow,
            openDeleteWindow,
            openFolderWindow,
            openMoveWindow,
            toggleWindow,
            moveDetails,
            updateMoveDetails,
            clearDeleteData,
            isOpens,
        ],
    );

    return manager;
}
