import React from 'react';
import { DragSource, DropTarget } from "react-dnd";
import { NativeTypes } from 'react-dnd-html5-backend';
import flow from 'lodash.flow';

import { useFolder, BaseFolderConnectors } from '../../base-folder';
import { BaseFileConnectors } from '../../base-file';
// import { isFolder } from '../../utils';

import ClassNames from "classnames";
import { isFolder } from "../../utils.tsx";
import { KeyedFile } from "../../browser.tsx";

interface RawListThumbnailFolderProps {
  isOpen: boolean;
  isDragging: boolean;
  isDeleting: boolean;
  isRenaming: boolean;
  isDraft: boolean;
  isOver: boolean;
  isSelected: boolean;
  url: string;
  action: any;
  browserProps: any;
  depth: number;
  keyDerived: boolean;
  connectDragPreview: any;
  connectDragSource: any;
  connectDropTarget: any;
  name?: string;
  fileKey: string;
  newName?: string;
}

const RawListThumbnailFolder: React.FC<RawListThumbnailFolderProps & KeyedFile> = (props) => {
  const {
    isOpen,
    isDragging,
    isDeleting,
    isRenaming,
    isDraft,
    isOver,
    isSelected,
    url,
    action,
    browserProps,
    depth,
    keyDerived,
    connectDragPreview,
  } = props;

  const {
    newName,
    getName,
    selectFolderNameFromRef,
    handleDeleteSubmit,
    handleCancelEdit,
    toggleFolder,
    handleFolderClick,
    handleFolderDoubleClick,
    handleNewNameChange,
    handleRenameSubmit,
    connectDND,
  } = useFolder(props);

  const icon = browserProps.icons[isOpen ? 'FolderOpen' : 'Folder']

  const inAction = (isDragging || action)

  const ConfirmDeletionRenderer = browserProps.confirmDeletionRenderer

  let name
  if (!inAction && isDeleting && browserProps.selection.length === 1) {
    name = (<ConfirmDeletionRenderer
        handleDeleteSubmit={handleDeleteSubmit}
        // handleFileClick={handleFileClick}
        url={url}
      >
        {getName()}
      </ConfirmDeletionRenderer>)
  } else if ((!inAction && isRenaming) || isDraft) {
    name = (<div>
        <form className="renaming" onSubmit={handleRenameSubmit}>
          <input
            type="text"
            ref={selectFolderNameFromRef}
            value={newName}
            onChange={handleNewNameChange}
            onBlur={handleCancelEdit}
            autoFocus
          />
        </form>
      </div>)
  } else {
    name = (<div>
        <a onClick={toggleFolder}>
          {getName()}
        </a>
      </div>)
  }

  let children;
  if (isOpen && browserProps.nestChildren) {
    // TODO: the original has children set to [] here which does not make sense to me rn
    children = props.children?.map((file: any) => {
      const thisItemProps = {
        ...browserProps.getItemProps(file, browserProps),
        depth: depth + 1,
      };

      if (!isFolder(file)) {
        return (
          <browserProps.fileRenderer
            key={file.key}
            {...file}
            {...thisItemProps}
            browserProps={browserProps}
            {...browserProps.fileRendererProps}
          />
       );
      } else {
        return (
          <browserProps.folderRenderer
            key={file.key}
            {...file}
            {...thisItemProps}
            browserProps={browserProps}
            {...browserProps.folderRendererProps}
          />
        );
      }
    }) || [];

    children = children.length ? (<ul style={{ padding: '0 8px', paddingLeft: '16px' }}>{children}</ul>) : (<p>No items in this folder</p>);
  }

  let folder = (<li
      className={ClassNames('folder', {
        expanded: isOpen && browserProps.nestChildren, pending: action, dragging: isDragging, dragover: isOver, selected: isSelected,
      })}
      onClick={handleFolderClick}
      onDoubleClick={handleFolderDoubleClick}
    >
      <div className="item">
        <span className="thumb">{icon}</span>
        <span className="name">{name}</span>
      </div>
      {children}
    </li>)
  if (typeof browserProps.moveFolder === 'function' && keyDerived) {
    folder = connectDragPreview(folder)
  }

  return connectDND(folder);
}

const ListThumbnailFolder = flow(
  DragSource("folder", BaseFolderConnectors.dragSource, BaseFolderConnectors.dragCollect),
  DropTarget(['file', 'folder', NativeTypes.FILE], BaseFileConnectors.targetSource, BaseFileConnectors.targetCollect)
)(RawListThumbnailFolder)

export default ListThumbnailFolder;
export { RawListThumbnailFolder };
