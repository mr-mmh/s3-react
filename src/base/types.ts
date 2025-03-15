import type { FileDTO, FileTypeNames, FileUploadDTO, FolderDTO } from "@mrmmh/s3";

export type ClientFolderDTO = FolderDTO & { optimistic?: boolean };
export type ClientFileDTO = FileDTO & { optimistic?: boolean };
export { FileUploadDTO };
export type InitialUploads = {
    files: FileUploadDTO[];
};

export type SelectionOptions = {
    multiple?: boolean;
    which?: ("file" | "folder")[];
    fileTypes?: FileTypeNames[];
    selectedSetter?: (files: ClientFileDTO[], folders: ClientFolderDTO[]) => void;
};
