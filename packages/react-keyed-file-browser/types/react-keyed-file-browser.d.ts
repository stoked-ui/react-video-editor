declare module 'react-keyed-file-browser' {
  type AnyObject = { [key: string]: any };

  //#region icons
  import { ReactNode } from 'react';
  declare function GroupByFolder(files, root): ReactNode;
  declare function GroupByModifiedRelative(files, root): ReactNode;
  export const Groupers = {
    GroupByFolder,
    GroupByModifiedRelative,
  }

  declare function ListThumbnailFile(files, root): ReactNode;
  declare function SimpleListThumbnailFile(files, root): ReactNode;
  declare function TableFile(files, root): ReactNode;
  declare function RawListThumbnailFile(files, root): ReactNode;
  declare function RawTableFile(files, root): ReactNode;

  export const FileRenderers = {
    ListThumbnailFile,
    SimpleListThumbnailFile,
    TableFile,

    RawListThumbnailFile,
    RawTableFile,
  }

  declare function ListThumbnailFolder(files, root): ReactNode;
  declare function TableFolder(files, root): ReactNode;
  declare function RawListThumbnailFolder(files, root): ReactNode;
  declare function RawTableFolder(files, root): ReactNode;

  export const FolderRenderers = {
    ListThumbnailFolder,
    TableFolder,

    RawListThumbnailFolder,
    RawTableFolder,
  }

  export interface IIcons {
    File: JSX.Element;
    Image: JSX.Element;
    Video: JSX.Element;
    Audio: JSX.Element;
    Archive: JSX.Element;
    Word: JSX.Element;
    Excel: JSX.Element;
    PowerPoint: JSX.Element;
    Text: JSX.Element;
    PDF: JSX.Element;
    Rename: JSX.Element;
    Folder: JSX.Element;
    FolderOpen: JSX.Element;
    Delete: JSX.Element;
    Loading: JSX.Element;
    Download: JSX.Element;
  }

  declare function FontAwesome( majorVersion?: number): IIcons
  export const Icons = {
    FontAwesome
  }
  //#endregion icons

  export interface FileBrowserFile {
    key: string;
    modified: number;
    size: number;
  }

  export interface FileBrowserFolder extends FileBrowserFile {}

  //#region props
  export interface TableHeaderRenderProps {
    select?: (fileKey: string) => void;
    fileKey?: string;

    connectDropTarget?: (headerElem: JSX.Element) => JSX.Element;
    isOver?: boolean;
    isSelected?: boolean;

    browserProps?: {
      createFiles?: (files: FileBrowserFile[], prefix: string) => void;
      moveFolder?: (oldFolderKey: string, newFolderKey: string) => void;
      moveFile?: (oldFileKey: string, newFileKey: string) => void;
    };
  }

  export interface FilterRendererProps {
    value: string;
    updateFilter: (newValue: string) => void;
  }

  export interface FileBrowserProps {
    files: FileBrowserFile[];
    actions?: JSX.Element;
    showActionBar?: boolean;
    canFilter?: boolean;
    noFilesMessage?: string | JSX.Element;

    group?: () => void;
    sort?: () => void;

    icons?: IIcons;

    nestChildren?: boolean;
    renderStyle?: 'list' | 'table';

    startOpen?: boolean;

    headerRenderer?: (() => JSX.Element) | null;
    headerRendererProps?: TableHeaderRenderProps;
    filterRenderer?: () => JSX.Element;
    filterRendererProps?: FilterRendererProps;
    fileRenderer?: () => JSX.Element;
    fileRendererProps?: AnyObject;
    folderRenderer?: () => JSX.Element;
    folderRendererProps?: AnyObject;
    detailRenderer?: () => JSX.Element;
    detailRendererProps?: AnyObject;
    actionRenderer?: () => JSX.Element;
    confirmDeletionRenderer?: () => void;
    confirmMultipleDeletionRenderer?: () => void;

    onCreateFiles?: (files: File[], prefix: string) => void;
    onCreateFolder?: (key: string) => void;
    onMoveFile?: (oldFileKey: string, newFileKey: string) => void;
    onMoveFolder?: (oldFolderKey: string, newFolderKey: string) => void;
    onRenameFile?: (oldFileKey: string, newFileKey: string) => void;
    onRenameFolder?: (oldFolderKey: string, newFolderKey: string) => void;
    onDeleteFile?: (fileKey: string) => void;
    onDeleteFolder?: (folderKey: string) => void;
    onDownloadFile?: (keys: string[]) => void;

    onSelect?: (fileOrFolder: FileBrowserFile | FileBrowserFolder) => void;
    onSelectFile?: (file: FileBrowserFile) => void;
    onSelectFolder?: (folder: FileBrowserFolder) => void;

    onPreviewOpen?: (file: FileBrowserFile) => void;
    onPreviewClose?: (file: FileBrowserFile) => void;

    onFolderOpen?: (folder: FileBrowserFolder) => void;
    onFolderClose?: (folder: FileBrowserFolder) => void;
  }
  //#endregion props

  export default function FileBrowser(any): JSX.Element;

}
