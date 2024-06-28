import React, { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
//import { DndProvider} from "react-dnd";
import { KeyedFile, isFolder } from '../../common';
import type { IKeyedFile } from '../../common';
import { Details } from '../Details';
import { Filter } from '../Filter';
import { Header } from '../Header';
import { RawTableFile } from '../Files';
import type { RawListFile } from '../Files';
import { RawTableFolder } from '../Folders';
import type { RawListFolder } from '../Folders';
import { ConfirmDelete, ConfirmMultipleDelete } from '../Confirm';
import { GroupByFolder } from '../Groupers';
import { SortByName } from '../Sorters';
import { Actions } from '../Actions';

import '../../styles/browser.sass?inline';

const SEARCH_RESULTS_PER_PAGE = 20;
const regexForNewFolderOrFileSelection = /.*\/__new__[/]?$/gm;

interface BrowserProps {
  files: IKeyedFile[];
  actions?: React.ReactNode;
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
  headerRenderer?: typeof Header | null;
  headerRendererProps?: any;
  filterRenderer?: typeof Filter;
  filterRendererProps?: any;
  fileRenderer?: typeof RawTableFile | typeof RawListFile;
  fileRendererProps?: any;
  folderRenderer?: typeof RawTableFolder | typeof RawListFolder;
  folderRendererProps?: any;
  detailRenderer?: typeof Details;
  detailRendererProps?: any;
  actionRenderer?: typeof Actions;
  confirmDeletionRenderer?: typeof ConfirmDelete;
  confirmMultipleDeletionRenderer?: typeof ConfirmMultipleDelete;

  onCreateFiles?: (files: KeyedFile[], prefix: string) => void;
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

function getItemProps(
  file: KeyedFile,
  browserProps: {
    openFolders: { [p: string]: boolean };
    activeAction: string | null;
    actionTargets: string[];
    selection: string[];
    nameFilter: string;
  }
) {
  return {
    fileKey: file.key,
    isSelected: browserProps.selection.includes(file.key),
    isOpen: file.key in browserProps.openFolders || browserProps.nameFilter,
    isRenaming: browserProps.activeAction === 'rename' && browserProps.actionTargets.includes(file.key),
    isDeleting: browserProps.activeAction === 'delete' && browserProps.actionTargets.includes(file.key),
    isDraft: !!file.draft,
  };
}

const defaultProps = {
  nestChildren: false,
  renderStyle: 'table',
  startOpen: false,
  headerRenderer: undefined,
  headerRendererProps: {},
  filterRenderer: Filter,
  filterRendererProps: {},
  fileRenderer: RawTableFile,
  fileRendererProps: {},
  folderRenderer: RawTableFolder,
  folderRendererProps: {},
  detailRenderer: Details,
  detailRendererProps: {},
  actionRenderer: Actions,
  confirmDeletionRenderer: ConfirmDelete,
  confirmMultipleDeletionRenderer: ConfirmMultipleDelete,
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

const RawFileList: FC<BrowserProps> = (rawProps: BrowserProps): JSX.Element => {
  const props = { ...defaultProps, ...rawProps };
  const defaultIcons = props.icons || {};
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
    const exactFolder = props.files.find(f => {
      if (f.key.startsWith(key)) {
        hasPrefix = true;
      }
      return f.key === key;
    });
    if (exactFolder) {
      return new KeyedFile(exactFolder);
    }
    if (hasPrefix) {
      return new KeyedFile({
        key,
        name: key,
        modified: 0,
        size: 0,
        relativeKey: key,
      });
    }
    return undefined;
  };

  const createFiles = (files: KeyedFile[], prefix: string) => {
    setSelection([]);
    if (prefix) {
      setOpenFolders(prevOpenFolders => ({
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
    setOpenFolders(prevOpenFolders => {
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
    setOpenFolders(prevOpenFolders => {
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
    setOpenFolders(prevOpenFolders => {
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
    if (selection.some(sel => sel.match(regexForNewFolderOrFileSelection))) {
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
    if (!selected) return;
    props.onSelect && props.onSelect(selected);
    if (selectedType === 'file') {
      props.onSelectFile && props.onSelectFile(selected);
    } else if (selectedType === 'folder') {
      props.onSelectFolder && props.onSelectFolder(selected);
    }
  };

  const closeDetail = () => {
    setPreviewFile(null);
    if (!previewFile) return;
    props.onPreviewClose && props.onPreviewClose(previewFile);
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
    setSearchResultsShown(prevSearchResultsShown => prevSearchResultsShown + SEARCH_RESULTS_PER_PAGE);
  };

  const toggleFolder = (folderKey: string) => {
    setOpenFolders(prevOpenFolders => {
      const newOpenFolders = { ...prevOpenFolders };
      if (folderKey in newOpenFolders) {
        delete newOpenFolders[folderKey];
      } else {
        newOpenFolders[folderKey] = true;
      }
      return newOpenFolders;
    });
    const callback = openFolders[folderKey] ? 'onFolderClose' : 'onFolderOpen';
    const folderFile = getFile(folderKey);
    if (!folderFile) return;
    props[callback] && props[callback](folderFile);
  };

  const openFolder = (folderKey: string) => {
    setOpenFolders(prevOpenFolders => ({
      ...prevOpenFolders,
      [folderKey]: true,
    }));
    const folderFile = getFile(folderKey);
    if (!folderFile) return;
    props.onFolderOpen && props.onFolderOpen(folderFile);
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
    foldersToDelete.forEach(folder => {
      deleteFolder(folder);
    });
    const filesToDelete = selection.filter(selection => !selection.endsWith('/'));
    filesToDelete.forEach(file => {
      deleteFile([file]);
    });
  };

  const getFiles = () => {
    let files: KeyedFile[] = [...props.files].filter(file => file).map(file => new KeyedFile(file));
    if (activeAction === 'createFolder' && actionTargets && actionTargets.length && actionTargets[0] !== undefined) {
      const newFile = new KeyedFile({
        key: actionTargets[0],
        name: null,
        size: 0,
        draft: true,
      });
      files.push(newFile);
    }
    if (nameFilter) {
      const terms = nameFilter.toLowerCase().split(' ');
      files = files.filter(file => terms.every(term => file.key.toLowerCase().includes(term)));
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
    const { fileRenderer, fileRendererProps, folderRenderer, folderRendererProps } = props;
    const FileRenderer = fileRenderer;
    const FolderRenderer = folderRenderer;
    const browserProps = getBrowserProps();
    let renderedFiles: React.ReactNode[] = [];

    files.forEach(file => {
      const thisItemProps = {
        ...browserProps.getItemProps(file, { ...browserProps }),
        depth: nameFilter ? 0 : depth,
      };

      if (!isFolder(file)) {
        renderedFiles.push(<FileRenderer file={file} {...thisItemProps} browserProps={browserProps} {...fileRendererProps} key={`file-${file.key}`} />);
      } else {
        if (props.showFoldersOnFilter || !nameFilter) {
          renderedFiles.push(<FolderRenderer file={file} {...thisItemProps} browserProps={browserProps} {...folderRendererProps} key={`file-${file.key}`} />);
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

  if (props.headerRenderer === undefined) {
    props.headerRenderer = Header;
  }

  const HeaderNode = props.headerRenderer;

  if (props.renderStyle === 'table') {
    if (!React.Children.count(contents)) {
      contents = (
        <tr>
          <td colSpan={100}>{nameFilter ? props.noMatchingFilesMessage?.(nameFilter) : props.noFilesMessage}</td>
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

    if (HeaderNode) {
      header = (
        <thead>
        <HeaderNode {...headerProps} {...props.headerRendererProps} />
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
      contents = <p className="empty">{nameFilter ? props.noMatchingFilesMessage?.(nameFilter) : props.noFilesMessage}</p>;
    } else {
      let more;
      if (nameFilter) {
        const numFiles = React.Children.count(contents);
        contents = React.Children.toArray(contents).slice(0, searchResultsShown);
        if (numFiles > React.Children.count(contents)) {
          more = (
            <a onClick={handleShowMoreClick} href="#">
              {props.showMoreResults}
            </a>
          );
        }
      }
      contents = (
        <div>
          <ul>{contents}</ul>
          {more}
        </div>
      );
    }
    if (HeaderNode) {
      header = <HeaderNode {...headerProps} {...props.headerRendererProps} />;
    }

    renderedFiles = (
      <div>
        {header}
        {contents}
      </div>
    );
  }

  const renderActionBar = (selectedItems: KeyedFile[]) => {
    const { icons, canFilter, filterRendererProps, filterRenderer, actionRenderer, onCreateFolder, onRenameFile, onRenameFolder, onDeleteFile, onDeleteFolder, onDownloadFile, onDownloadFolder } =
      props;
    const ActionNode = actionRenderer;
    const FilterNode = filterRenderer;
    const selectionIsFolder = !!(selectedItems.length === 1 && selectedItems[0] && isFolder(selectedItems[0]));

    let filter;
    if (canFilter) {
      filter = <FilterNode value={nameFilter} updateFilter={updateFilter} {...filterRendererProps} />;
    }

    const actions = (
      <ActionNode
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

  const MultipleDelete = props.confirmMultipleDeletionRenderer;
  const Detail = props.detailRenderer;
  return (
    <div className="stoked-file-list">
      {props.actions}
      <div className="rendered-file-browser" ref={browserRef}>
        {props.showActionBar && renderActionBar(selectedItems)}
        {activeAction === 'delete' && selection.length > 1 && <MultipleDelete handleDeleteSubmit={handleMultipleDeleteSubmit} />}
        <div className="files">{renderedFiles}</div>
      </div>
      {previewFile !== null && <Detail file={previewFile} close={closeDetail} {...props.detailRendererProps} />}
    </div>
  );
};

const FileList: FC<BrowserProps> = (props: BrowserProps): JSX.Element => {
  const [files, setFiles] = useState(props.files);
  if (files !== props.files) {
    setFiles(props.files);
  }
  return <RawFileList {...props} />;
};

export { RawFileList };
export default FileList;
