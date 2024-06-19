import React from 'react';

interface ActionProps {
  selectedItems: Array<{ key?: string, action?: string, keyDerived?: boolean }>;
  isFolder: boolean;
  icons: { [key: string]: React.ReactNode };
  nameFilter: string;

  canCreateFolder: boolean;
  onCreateFolder?: () => void;

  canRenameFile: boolean;
  onRenameFile?: () => void;

  canRenameFolder: boolean;
  onRenameFolder?: () => void;

  canDeleteFile: boolean;
  onDeleteFile?: () => void;

  canDeleteFolder: boolean;
  onDeleteFolder?: () => void;

  canDownloadFile: boolean;
  onDownloadFile?: () => void;

  canDownloadFolder: boolean;
  onDownloadFolder?: () => void;
}

const Actions: React.FC<ActionProps> = ({
  selectedItems,
  isFolder,
  icons,
  nameFilter,

  canCreateFolder,
  onCreateFolder,

  canRenameFile,
  onRenameFile,

  canRenameFolder,
  onRenameFolder,

  canDeleteFile,
  onDeleteFile,

  canDeleteFolder,
  onDeleteFolder,

  canDownloadFile,
  onDownloadFile,

  canDownloadFolder,
  onDownloadFolder,
} = {
  selectedItems: [],
  isFolder: false,
  icons: {},
  nameFilter: '',

  canCreateFolder: false,
  onCreateFolder: undefined,

  canRenameFile: false,
  onRenameFile: undefined,

  canRenameFolder: false,
  onRenameFolder: undefined,

  canDeleteFile: false,
  onDeleteFile: undefined,

  canDeleteFolder: false,
  onDeleteFolder: undefined,

  canDownloadFile: false,
  onDownloadFile: undefined,

  canDownloadFolder: false,
  onDownloadFolder: undefined,
}) => {
  let actions: React.ReactNode[] = [];

  if (selectedItems.length) {
    const selectedItemsAction = selectedItems.filter(item => item.action);
    if (selectedItemsAction.length === selectedItems.length && [...new Set(selectedItemsAction.map(item => item.action))].length === 1) {
      let actionText;
      switch (selectedItemsAction[0]!.action) {
        case 'delete':
          actionText = 'Deleting ...';
          break;
        case 'rename':
          actionText = 'Renaming ...';
          break;
        default:
          actionText = 'Moving ...';
          break;
      }

      actions = [(
        <div key={0} className="item-actions">
          {icons["Loading"]} {actionText}
        </div>
      )];
    } else {
      if (isFolder && canCreateFolder && !nameFilter) {
        actions.push (
          <li key="action-add-folder">
            <a onClick={onCreateFolder} href="#" role="button">
              {icons["Folder"]} &nbsp;Add Subfolder
            </a>
          </li>
        );
      }

      const itemsWithoutKeyDerived = selectedItems.find(item => !item.keyDerived);
      if (!itemsWithoutKeyDerived && !isFolder && canRenameFile && selectedItems.length === 1) {
        actions.push(
          <li key="action-rename">
            <a onClick={onRenameFile} href="#" role="button">
              {icons["Rename"]} &nbsp;Rename
            </a>
          </li>
        );
      } else if (!itemsWithoutKeyDerived && isFolder && canRenameFolder) {
        actions.push(
          <li key="action-rename">
            <a onClick={onRenameFolder} href="#" role="button">
              {icons["Rename"]} &nbsp;Rename
            </a>
          </li>
        );
      }

      if (!itemsWithoutKeyDerived && !isFolder && canDeleteFile) {
        actions.push(
          <li key="action-delete">
            <a onClick={onDeleteFile} href="#" role="button">
              {icons["Delete"]} &nbsp;Delete
            </a>
          </li>
        );
      } else if (!itemsWithoutKeyDerived && isFolder && canDeleteFolder) {
        actions.push(
          <li key="action-delete">
            <a onClick={onDeleteFolder} href="#" role="button">
              {icons["Delete"]} &nbsp;Delete
            </a>
          </li>
        );
      }

      if ((!isFolder && canDownloadFile) || (isFolder && canDownloadFolder)) {
        actions.push(
          <li key="action-download">
            <a onClick={isFolder ? onDownloadFolder : onDownloadFile} href="#" role="button">
              {icons["Download"]} &nbsp;Download
            </a>
          </li>
        );
      }

      if (actions.length) {
        actions = [(<ul key={actions.length} className="item-actions">{actions}</ul>)];
      } else {
        actions = [(<div key={0} className="item-actions">&nbsp;</div>)];
      }
    }
  } else {
    if (canCreateFolder && !nameFilter) {
      actions.push(
        <li key="action-add-folder">
          <a onClick={onCreateFolder} href="#" role="button">
            {icons["Folder"]} &nbsp;Add Folder
          </a>
        </li>
      );
    }

    if (actions.length) {
      actions = [(<ul key={actions.length} className="item-actions">{actions}</ul>)];
    } else {
      actions = [(<div  key={0}className="item-actions">&nbsp;</div>)];
    }
  }

  return <>{actions}</>;
}

export default Actions;
