import React, { useState, useEffect, useRef } from "react";
import { DndProvider, DndProviderProps } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend';

import { DefaultDetail } from './components/details';
import { DefaultFilter } from './components/filters';
import { TableHeader } from './components/headers';
import { TableFile } from "./components/files";
import { TableFolder } from "./components/folders";
import { DefaultConfirmDeletion, MultipleConfirmDeletion } from './components/confirmations';
import { GroupByFolder } from './components/groupers';
import { SortByName } from './components/sorters';
import { isFolder } from './utils';
import { DefaultAction } from './components/actions';
import { JSX } from "react/jsx-runtime";
import IntrinsicAttributes = JSX.IntrinsicAttributes;

import "./styles/browser.sass?inline"

const SEARCH_RESULTS_PER_PAGE = 20;
const regexForNewFolderOrFileSelection = /.*\/__new__[/]?$/gm;

export interface IKeyedFile {
  key: string;
  name?: string | null;
  modified?: number;
  size?: number;
  draft?: boolean;
  children?: IKeyedFile[];
  newKey?: string;
  relativeKey?: string;
  keyDerived?: boolean;
  [key: string]: any;
}

export class KeyedFile implements IKeyedFile {
  key: string;
  name: string;
  modified?: number;
  size?: number;
  draft?: boolean;
  children?: KeyedFile[];
  newKey?: string;
  relativeKey?: string;
  keyDerived?: boolean;
  [key: string]: any;

  constructor(options: IKeyedFile) {
    const {
      key,
      name,
      modified,
      size,
      draft,
      children,
      newKey,
      relativeKey,
      keyDerived,
      ...rest
    } = options;
    const kids = children?.map((child) => new KeyedFile(child));
    this.key = key;
    this.name = name || this.getName();
    this.modified = modified;
    this.size = size;
    this.draft = draft;
    this.children = kids;
    this.newKey = newKey;
    this.relativeKey = relativeKey;
    this.keyDerived = keyDerived;
    for (const key in rest) {
      this[key] = rest[key];
    }
  }

  getName() {
    let name = this.key;
    const slashIndex = name.lastIndexOf('/');
    if (slashIndex !== -1) {
      name = name.substring(slashIndex + 1);
    }
    return name;
  }
}

interface BrowserProps {
  files: IKeyedFile[];
  actions?: React.ReactNode;
  showActionBar?: boolean;
  canFilter?: boolean;
  showFoldersOnFilter?: boolean;
  noFilesMessage?: string | React.ReactNode;
  noMatchingFilesMessage?: (filter: string) => string | React.ReactNode;
  showMoreResults?: string | React.ReactNode;

  group?: (files: KeyedFile[], root: string) => KeyedFile[];
  sort?: (files: KeyedFile[]) => KeyedFile[];

  icons?: {
    Folder?: React.ReactNode;
    FolderOpen?: React.ReactNode;
    File?: React.ReactNode;
    PDF?: React.ReactNode;
    Image?: React.ReactNode;
    Delete?: React.ReactNode;
    Rename?: React.ReactNode;
    Loading?: React.ReactNode;
    Download?: React.ReactNode;
  };

  nestChildren?: boolean;
  renderStyle?: 'list' | 'table';

  startOpen?: boolean;
  headerRenderer?: React.ComponentType<any> | null;
  headerRendererProps?: any;
  filterRenderer?: React.ComponentType<any>;
  filterRendererProps?: any;
  fileRenderer?: React.ComponentType<any>;
  fileRendererProps?: any;
  folderRenderer?: React.ComponentType<any>;
  folderRendererProps?: any;
  detailRenderer?: React.ComponentType<any>;
  detailRendererProps?: any;
  actionRenderer?: React.ComponentType<any>;
  confirmDeletionRenderer?: React.ComponentType<any>;
  confirmMultipleDeletionRenderer?: React.ComponentType<any>;

  onCreateFiles?: (files: IKeyedFile[], prefix: string) => void;
  onCreateFolder?: (key: string) => void;
  onMoveFile?: (oldKey: string, newKey: string) => void;
  onMoveFolder?: (oldKey: string, newKey: string) => void;
  onRenameFile?: (oldKey: string, newKey: string) => void;
  onRenameFolder?: (oldKey: string, newKey: string) => void;
  onDeleteFile?: (keys: string[]) => void;
  onDeleteFolder?: (key: string) => void;
  onDownloadFile?: (keys: string[]) => void;
  onDownloadFolder?: (keys: string[]) => void;

  onSelect?: (fileOrFolder: KeyedFile) => void;
  onSelectFile?: (file: KeyedFile) => void;
  onSelectFolder?: (folder: KeyedFile) => void;

  onPreviewOpen?: (file: KeyedFile) => void;
  onPreviewClose?: (file: KeyedFile) => void;

  onFolderOpen?: (folder: KeyedFile) => void;
  onFolderClose?: (folder: KeyedFile) => void;
}


function getItemProps(file: KeyedFile, browserProps: {
  openFolders: {[p: string]: boolean},
  activeAction: string | null,
  actionTargets: string[],
  selection: string[],
  nameFilter: string,
}) {
  return {
    key: `file-${file.key}`,
    fileKey: file.key,
    isSelected: (browserProps.selection.includes(file.key)),
    isOpen: file.key in browserProps.openFolders || browserProps.nameFilter,
    isRenaming: browserProps.activeAction === 'rename' && browserProps.actionTargets.includes(file.key),
    isDeleting: browserProps.activeAction === 'delete' && browserProps.actionTargets.includes(file.key),
    isDraft: !!file.draft,
  }
}

const defaultProps = {
  nestChildren: false,
  renderStyle: 'table',
  startOpen: false,
  headerRenderer: TableHeader,
  headerRendererProps: {},
  filterRenderer: DefaultFilter,
  filterRendererProps: {},
  fileRenderer: TableFile,
  fileRendererProps: {},
  folderRenderer: TableFolder,
  folderRendererProps: {},
  detailRenderer: DefaultDetail,
  detailRendererProps: {},
  actionRenderer: DefaultAction,
  confirmDeletionRenderer: DefaultConfirmDeletion,
  confirmMultipleDeletionRenderer: MultipleConfirmDeletion,
  group: GroupByFolder,
  sort: SortByName,
  files: [],
  showActionBar: true,
  canFilter: true,
  showFoldersOnFilter: false,
  noFilesMessage: 'No files',
  noMatchingFilesMessage: (filter: string) => `No files match "${filter}"`,
  showMoreResults: 'Show more results',
  icons: {},
  onSelect: () => {},
  onSelectFile: () => {},
  onSelectFolder: () => {},
  onPreviewOpen: () => {},
  onPreviewClose: () => {},
  onFolderOpen: () => {},
  onFolderClose: () => {},
};

const RawFileBrowser: React.FC<BrowserProps> = (rawProps) => {
  const props = {...defaultProps, ...rawProps};

  const defaultIcons =  props.icons || {};
  const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>({});
  const [selection, setSelection] = useState<string[]>([]);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [actionTargets, setActionTargets] = useState<string[]>([]);
  const [nameFilter, setNameFilter] = useState<string>('');
  const [searchResultsShown, setSearchResultsShown] = useState<number>(SEARCH_RESULTS_PER_PAGE);
  const [previewFile, setPreviewFile] = useState<KeyedFile | null>(null);
  const browserRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.renderStyle === 'table' && props.nestChildren) {
      console.warn('Invalid settings: Cannot nest table children in file browser');
    }

    const handleGlobalClick = (event: MouseEvent) => {
      if (!browserRef.current?.contains(event.target as Node)) {
        setSelection([]);
        setActionTargets([]);
        setActiveAction(null);
      }
    };

    window.addEventListener('click', handleGlobalClick);

    return () => {
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [props.renderStyle, props.nestChildren]);

  const getFile = (key: string): KeyedFile | undefined => {
    let hasPrefix = false;
    const exactFolder = props.files.find((f) => {
      if (f.key.startsWith(key)) {
        hasPrefix = true;
      }
      return f.key === key;
    });
    if (exactFolder) {
      return new KeyedFile(exactFolder);
    }
    if (hasPrefix) {
      return new KeyedFile({ key, name: key, modified: 0, size: 0, relativeKey: key });
    }
    return undefined;
  };

  const createFiles = (files: IKeyedFile[], prefix: string) => {
    setSelection([]);
    if (prefix) {
      setOpenFolders((prevOpenFolders) => ({
        ...prevOpenFolders,
        [prefix]: true,
      }));
    }
    props.onCreateFiles && props.onCreateFiles(files, prefix);
  };

  const createFolder = (key: string) => {
    setActiveAction(null);
    setActionTargets([]);
    setSelection([key]);
    props.onCreateFolder && props.onCreateFolder(key);
  };

  const moveFile = (oldKey: string, newKey: string) => {
    setActiveAction(null);
    setActionTargets([]);
    setSelection([newKey]);
    props.onMoveFile && props.onMoveFile(oldKey, newKey);
  };

  const moveFolder = (oldKey: string, newKey: string) => {
    setActiveAction(null);
    setActionTargets([]);
    setSelection([newKey]);
    setOpenFolders((prevOpenFolders) => {
      const newOpenFolders = { ...prevOpenFolders };
      if (oldKey in newOpenFolders) {
        newOpenFolders[newKey] = true;
      }
      return newOpenFolders;
    });
    props.onMoveFolder && props.onMoveFolder(oldKey, newKey);
  };

  const renameFile = (oldKey: string, newKey: string) => {
    setActiveAction(null);
    setActionTargets([]);
    setSelection([newKey]);
    props.onRenameFile && props.onRenameFile(oldKey, newKey);
  };

  const renameFolder = (oldKey: string, newKey: string) => {
    setActiveAction(null);
    setActionTargets([]);
    setOpenFolders((prevOpenFolders) => {
      const newOpenFolders = { ...prevOpenFolders };
      if (prevOpenFolders[oldKey]) {
        newOpenFolders[newKey] = true;
      }
      return newOpenFolders;
    });
    props.onRenameFolder && props.onRenameFolder(oldKey, newKey);
  };

  const deleteFile = (keys: string[]) => {
    setActiveAction(null);
    setActionTargets([]);
    setSelection([]);
    props.onDeleteFile && props.onDeleteFile(keys);
  };

  const deleteFolder = (key: string) => {
    setActiveAction(null);
    setActionTargets([]);
    setSelection([]);
    setOpenFolders((prevOpenFolders) => {
      const newOpenFolders = { ...prevOpenFolders };
      delete newOpenFolders[key];
      return newOpenFolders;
    });
    props.onDeleteFolder && props.onDeleteFolder(key);
  };

  const downloadFile = (keys: string[]) => {
    setActiveAction(null);
    setActionTargets([]);
    props.onDownloadFile && props.onDownloadFile(keys);
  };

  const downloadFolder = (keys: string[]) => {
    setActiveAction(null);
    setActionTargets([]);
    props.onDownloadFolder && props.onDownloadFolder(keys);
  };

  const beginAction = (action: string | null, keys: string[] | null) => {
    setActiveAction(action);
    setActionTargets(keys || []);
  };

  const endAction = () => {
    if (selection.some((sel) => sel.match(regexForNewFolderOrFileSelection))) {
      setSelection([]);
    }
    beginAction(null, null);
  };

  const select = (key: string, selectedType: 'file' | 'folder', ctrlKey: boolean, shiftKey: boolean) => {
    const shouldClearState = actionTargets.length && !actionTargets.includes(key);
    const selected = getFile(key);

    let newSelection = [key];
    if (ctrlKey || shiftKey) {
      const indexOfKey = selection.indexOf(key);
      if (indexOfKey !== -1) {
        newSelection = [...selection.slice(0, indexOfKey), ...selection.slice(indexOfKey + 1)];
      } else {
        newSelection = [...selection, key];
      }
    }

    setSelection(newSelection);
    if (shouldClearState) {
      setActionTargets([]);
      setActiveAction(null);
    }

    props.onSelect && props.onSelect(selected!);
    if (selectedType === 'file') {
      props.onSelectFile && props.onSelectFile(selected!);
    } else if (selectedType === 'folder') {
      props.onSelectFolder && props.onSelectFolder(selected!);
    }
  };

  const closeDetail = () => {
    setPreviewFile(null);
    props.onPreviewClose && props.onPreviewClose(previewFile!);
  };

  const preview = (file: KeyedFile) => {
    if (previewFile && previewFile.key !== file.key) {
      closeDetail();
    }
    setPreviewFile(file);
    props.onPreviewOpen && props.onPreviewOpen(file);
  };


  const handleShowMoreClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setSearchResultsShown((prevSearchResultsShown) => prevSearchResultsShown + SEARCH_RESULTS_PER_PAGE);
  };

  const toggleFolder = (folderKey: string) => {
    setOpenFolders((prevOpenFolders) => {
      const newOpenFolders = { ...prevOpenFolders };
      if (folderKey in newOpenFolders) {
        delete newOpenFolders[folderKey];
      } else {
        newOpenFolders[folderKey] = true;
      }
      return newOpenFolders;
    });
    const callback = openFolders[folderKey] ? 'onFolderClose' : 'onFolderOpen';
    props[callback] && props[callback]!(getFile(folderKey)!);
  };

  const openFolder = (folderKey: string) => {
    setOpenFolders((prevOpenFolders) => ({
      ...prevOpenFolders,
      [folderKey]: true,
    }));
    props.onFolderOpen && props.onFolderOpen(getFile(folderKey)!);
  };

  const updateFilter = (newValue: string) => {
    setNameFilter(newValue);
    setSearchResultsShown(SEARCH_RESULTS_PER_PAGE);
  };

  const getBrowserProps = () => {
    return {
      nestChildren: props.nestChildren,
      fileRenderer: props.fileRenderer,
      fileRendererProps: props.fileRendererProps,
      folderRenderer: props.folderRenderer,
      folderRendererProps: props.folderRendererProps,
      confirmDeletionRenderer: props.confirmDeletionRenderer,
      confirmMultipleDeletionRenderer: props.confirmMultipleDeletionRenderer,
      icons: props.icons,
      openFolders,
      nameFilter,
      selection,
      activeAction,
      actionTargets,
      select,
      openFolder,
      toggleFolder,
      beginAction,
      endAction,
      preview,
      createFiles: props.onCreateFiles ? createFiles : undefined,
      createFolder: props.onCreateFolder ? createFolder : undefined,
      renameFile: props.onRenameFile ? renameFile : undefined,
      renameFolder: props.onRenameFolder ? renameFolder : undefined,
      moveFile: props.onMoveFile ? moveFile : undefined,
      moveFolder: props.onMoveFolder ? moveFolder : undefined,
      deleteFile: props.onDeleteFile ? deleteFile : undefined,
      deleteFolder: props.onDeleteFolder ? deleteFolder : undefined,
      getItemProps,
    };
  };

  const handleActionBarRenameClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    beginAction('rename', selection);
  };

  const handleActionBarDeleteClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    beginAction('delete', selection);
  };

  const handleActionBarAddFolderClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (activeAction === 'createFolder') return;

    let addKey = selection.length ? `${selection[0]}/` : '';
    if (!addKey.endsWith('/__new__/')) addKey += '__new__/';

    setActionTargets([addKey]);
    setActiveAction('createFolder');
    setSelection([addKey]);
    if (selection.length && selection[0] !== undefined) {
      setOpenFolders({
        ...openFolders,
        [selection[0]]: true,
      });
    }
  };

  const handleMultipleDeleteSubmit = () => {
    const foldersToDelete = selection.filter(selection => selection.endsWith('/'));
    foldersToDelete.forEach((folder) => {
      deleteFolder(folder);
    })
    const filesToDelete = selection.filter(selection => !selection.endsWith('/'));
    filesToDelete.forEach((file) => {
      deleteFile([file]);
    });
  };

  const getFiles = () => {
    let files: KeyedFile[] = [...props.files].filter((file) => file).map((file) => new KeyedFile(file));
    if (activeAction === 'createFolder' && actionTargets && actionTargets.length && actionTargets[0] !== undefined) {
      const newFile = new KeyedFile({
        key: actionTargets[0],
        name: null,
        size: 0,
        draft: true
      });
      files.push(newFile);
    }
    if (nameFilter) {
      const terms = nameFilter.toLowerCase().split(' ');
      files = files.filter((file) => terms.every((term) => file.key.toLowerCase().includes(term)));
    }
    if (props.group) {
      files = props.group(files, '');
    }
    if (props.sort) {
      files = props?.sort?.(files);
    }
    return files;
  };

  const getSelectedItems = (files: KeyedFile[]) => {
    const selectedItems: KeyedFile[] = [];
    const findSelected = (item: KeyedFile) => {
      if (selection.includes(item.key)) {
        selectedItems.push(item);
      }
      if (item.children) {
        item.children.forEach(findSelected);
      }
    };
    files.forEach(findSelected);
    return selectedItems;
  };

  const renderFiles = (files: KeyedFile[], depth: number) => {
    const {
      fileRenderer,
      fileRendererProps,
      folderRenderer,
      folderRendererProps,
    } = props;
    const FileRenderer = fileRenderer;
    const FolderRenderer = folderRenderer;
    const browserProps = getBrowserProps();
    let renderedFiles: React.ReactNode[] = [];

    files.forEach((file) => {
      const thisItemProps = {
        ...browserProps.getItemProps(file, { ...browserProps }),
        depth: nameFilter ? 0 : depth,
      };

      if (!isFolder(file)) {
        renderedFiles.push(
          <FileRenderer
            {...file}
            {...thisItemProps}
            browserProps={browserProps}
            {...fileRendererProps}
            key={`file-${file.key}`}
          />
        );
      } else {
        if (props.showFoldersOnFilter || !nameFilter) {
          renderedFiles.push(
            <FolderRenderer
              {...file}
              {...thisItemProps}
              browserProps={browserProps}
              {...folderRendererProps}
              key={`file-${file.key}`}
            />
          );
        }
        if (nameFilter || (thisItemProps.isOpen && !browserProps.nestChildren)) {
          renderedFiles = renderedFiles.concat(renderFiles(file.children || [], depth + 1));
        }
      }
    });
    return renderedFiles;
  };


  const handleActionBarDownloadClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const files = getFiles();
    const selectedItems = getSelectedItems(files);
    if (selectedItems.length === 1 && selectedItems[0] && isFolder(selectedItems[0])) {
      downloadFolder(selection);
    } else {
      downloadFile(selection);
    }
  };

  const browserProps = getBrowserProps();
  const headerProps = {
    browserProps,
    fileKey: '',
    fileCount: props.files.length,
  };

  let renderedFiles: React.ReactNode;
  const files = getFiles();
  const selectedItems = getSelectedItems(files);

  let header;
  let contents: React.ReactNode = renderFiles(files, 0);

  if (props.renderStyle === 'table') {
    if (!React.Children.count(contents)) {
      contents = (
        <tr>
          <td colSpan={100}>
            {nameFilter ? props.noMatchingFilesMessage?.(nameFilter) : props.noFilesMessage}
          </td>
        </tr>
      );
    } else if (nameFilter) {
      const numFiles = React.Children.count(contents);
      contents = React.Children.toArray(contents).slice(0, searchResultsShown);
      if (numFiles > searchResultsShown) {
        contents = (
          <>
            {contents}
            <tr key="show-more">
              <td colSpan={100}>
                <a onClick={handleShowMoreClick} href="#">
                  {props.showMoreResults}
                </a>
              </td>
            </tr>
          </>
        );
      }
    }

    if (props.headerRenderer) {
      header = (
        <thead>
        <props.headerRenderer
          {...headerProps}
          {...props.headerRendererProps}
        />
        </thead>
      );
    }

    renderedFiles = (
      <table cellSpacing="0" cellPadding="0">
        {header}
        <tbody>{contents}</tbody>
      </table>
    );
  } else if (props.renderStyle === 'list') {
    if (!React.Children.count(contents)) {
      contents = (
        <p className="empty">
          {nameFilter ? props.noMatchingFilesMessage?.(nameFilter) : props.noFilesMessage}
        </p>
      );
    } else {
      let more
      if (nameFilter) {
        const numFiles = React.Children.count(contents);
        contents = React.Children.toArray(contents).slice(0, searchResultsShown);
        if (numFiles >  React.Children.count(contents)) {
          more = (
            <a onClick={handleShowMoreClick} href="#">
              {props.showMoreResults}
            </a>
          )
        }
      }
      contents = (
        <div>
          <ul>{contents}</ul>
          {more}
        </div>
      )
    }
    if (props.headerRenderer) {
      header = (
        <props.headerRenderer
          {...headerProps}
          {...props.headerRendererProps}
        />
      );
    }

    renderedFiles = (
      <div>
        {header}
        {contents}
      </div>
    );
  }

  const renderActionBar = (selectedItems: KeyedFile[]) => {
    const {
      icons,
      canFilter,
      filterRendererProps,
      filterRenderer,
      actionRenderer,
      onCreateFolder,
      onRenameFile,
      onRenameFolder,
      onDeleteFile,
      onDeleteFolder,
      onDownloadFile,
      onDownloadFolder,
    } = props;
    const Filter = filterRenderer || DefaultFilter;
    const Action = actionRenderer || DefaultAction;
    const selectionIsFolder = !!(selectedItems.length === 1 && selectedItems[0] && isFolder(selectedItems[0]));

    let filter;
    if (canFilter) {
      filter = (
        <Filter
          value={nameFilter}
          updateFilter={updateFilter}
          {...filterRendererProps}
        />
      );
    }

    const actions = (
      <Action
        selectedItems={selectedItems}
        isFolder={selectionIsFolder}
        icons={icons || defaultIcons}
        nameFilter={nameFilter}
        canCreateFolder={typeof onCreateFolder === 'function'}
        onCreateFolder={() => handleActionBarAddFolderClick}
        canRenameFile={typeof onRenameFile === 'function'}
        onRenameFile={() => handleActionBarRenameClick}
        canRenameFolder={typeof onRenameFolder === 'function'}
        onRenameFolder={() => handleActionBarRenameClick}
        canDeleteFile={typeof onDeleteFile === 'function'}
        onDeleteFile={() => handleActionBarDeleteClick}
        canDeleteFolder={typeof onDeleteFolder === 'function'}
        onDeleteFolder={() => handleActionBarDeleteClick}
        canDownloadFile={typeof onDownloadFile === 'function'}
        onDownloadFile={() => handleActionBarDownloadClick}
        canDownloadFolder={typeof onDownloadFolder === 'function'}
        onDownloadFolder={() => handleActionBarDownloadClick}
      />
    );

    return (
      <div className="action-bar">
        {filter}
        {actions}
      </div>
    );
  };

  const MultipleDelete = props.confirmMultipleDeletionRenderer || MultipleConfirmDeletion;
  const Detail = props.detailRenderer || DefaultDetail;
  return (
    <div className="rendered-react-keyed-file-browser">
      {props.actions}
      <div className="rendered-file-browser" ref={browserRef}>
        {props.showActionBar && renderActionBar(selectedItems)}
        {activeAction === 'delete' && selection.length > 1 && (
          <MultipleDelete
            handleDeleteSubmit={handleMultipleDeleteSubmit}
          />
        )}
        <div className="files">{renderedFiles}</div>
      </div>
      {previewFile !== null && (
        <Detail
          file={previewFile}
          close={closeDetail}
          {...props.detailRendererProps}
        />
      )}
    </div>
  );
};

const FileBrowser: React.FC<BrowserProps> = (props) => {
  return (
    <DndProvider  backend: HTML5Backend>
      <RawFileBrowser {...props} />
    </DndProvider>
  );
};

export { RawFileBrowser, FileBrowser };
