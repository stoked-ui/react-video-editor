import React, { JSXElementConstructor, ReactElement } from "react";
import ClassNames from 'classnames';
import { DragSource, DropTarget, ConnectDragSource, ConnectDropTarget } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import flow from 'lodash.flow';

import { useFolder, useFolderProps, BaseFolderConnectors } from '../../base-folder';
import { BaseFileConnectors } from '../../base-file'

interface RawTableFolderProps {
  fileKey: string;
  action?: string;
  url: string;
  isDragging?: boolean;
  isRenaming?: boolean;
  isSelected?: boolean;
  isOver?: boolean;
  isDeleting?: boolean;
  browserProps: any;
  connectDragPreview: ConnectDragSource;
  connectDropTarget: ConnectDropTarget;
  depth: number;
  size: number;
  modified: number | undefined;
}

const RawTableFolder: React.FC<useFolderProps & RawTableFolderProps> = (props) => {
  const {
    action, url, isDragging, isDeleting, isRenaming, isDraft, isOver, isSelected,
    browserProps, connectDragPreview, depth
  } = props;

  const {
    newName,
    selectFolderNameFromRef,
    getName,
    handleFolderClick,
    handleFolderDoubleClick,
    handleNewNameChange,
    handleRenameSubmit,
    handleDeleteSubmit,
    handleCancelEdit,
    toggleFolder,
    connectDND,
  } = useFolder(props);

  const icon = browserProps.icons.Folder || browserProps.icons.FolderOpen;
  const inAction = isDragging || action;

  const ConfirmDeletionRenderer = browserProps.confirmDeletionRenderer;

  let name;
  if (!inAction && isDeleting && browserProps.selection.length === 1) {
    name = (
      <ConfirmDeletionRenderer
        handleDeleteSubmit={handleDeleteSubmit}
        handleFileClick={handleFolderDoubleClick}
        url={url}
      >
        {icon}
        {getName()}
      </ConfirmDeletionRenderer>
    );
  } else if ((!inAction && isRenaming) || isDraft) {
    name = (
      <form className="renaming" onSubmit={handleRenameSubmit}>
        {icon}
        <input
          ref={selectFolderNameFromRef}
          type="text"
          value={newName}
          onChange={handleNewNameChange}
          onBlur={handleCancelEdit}
          autoFocus
        />
      </form>
    );
  } else {
    name = (
      <div>
        <a onClick={toggleFolder}>
          {icon}
          {getName()}
        </a>
      </div>
    )
  }

  let draggable: ReactElement<any, string | JSXElementConstructor<any>> | null = <div>{name}</div>;
  if (typeof browserProps.moveFolder === 'function') {
    draggable = connectDragPreview(draggable);
  }

  const folder = (
    <tr
      className={ClassNames('folder', {
        pending: action,
        dragging: isDragging,
        dragover: isOver,
        selected: isSelected,
      })}
      onClick={handleFolderClick}
      onDoubleClick={handleFolderDoubleClick}
    >
      <td className="name">
        <div style={{ paddingLeft: (depth * 16) + 'px' }}>
          {draggable}
        </div>
      </td>
      <td />
      <td />
    </tr>
  )

  return connectDND(folder);
};

const TableFolder = flow(
  DragSource('folder', BaseFolderConnectors.dragSource, BaseFolderConnectors.dragCollect),
  DropTarget(['file', 'folder', NativeTypes.FILE], BaseFileConnectors.targetSource, BaseFileConnectors.targetCollect)
)(RawTableFolder);

export default TableFolder;
export { RawTableFolder };
