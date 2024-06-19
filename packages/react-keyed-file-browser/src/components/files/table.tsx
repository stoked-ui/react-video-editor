import React from 'react';
import ClassNames from 'classnames';
import { DragSource, DropTarget, ConnectDragSource, ConnectDropTarget } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { formatDistanceToNow } from 'date-fns';
import flow from 'lodash.flow';

import { DefaultConfirmDeletion } from '../confirmations';
import { useFile, BaseFileConnectors, UseFileProps } from './../../base-file';
import { fileSize } from './utils';

export interface RawTableFileProps {
  fileKey: string;
  isSelected?: boolean;
  isOver?: boolean;
  isDeleting?: boolean;
  connectDragPreview: ConnectDragSource;
  connectDropTarget: ConnectDropTarget;
  depth: number;
  size: number;
  modified: number | undefined;
}

const RawTableFile: React.FC<UseFileProps & RawTableFileProps> = (props) => {
  const {
    action, url, isDragging, isDeleting, isRenaming, isOver, isSelected,
    browserProps, connectDragPreview, depth, size, modified,
  } = props;

  const {
    newName,
    getName,
    getFileType,
    selectFileNameFromRef,
    handleFileClick,
    handleItemClick,
    handleItemDoubleClick,
    handleNewNameChange,
    handleRenameSubmit,
    handleDeleteSubmit,
    handleCancelEdit,
    connectDND,
  } = useFile(props);

  const icon = browserProps.icons[getFileType()] || browserProps.icons["File"];
  const inAction = isDragging || action;



  let name;
  if (!inAction && isDeleting && browserProps.selection.length === 1) {
    name = (
      <DefaultConfirmDeletion
        handleDeleteSubmit={handleDeleteSubmit}
        handleFileClick={handleFileClick}
        url={url}
      >
        {icon}
        {getName()}
      </DefaultConfirmDeletion>
    );
  } else if (!inAction && isRenaming) {
    name = (
      <form className="renaming" onSubmit={handleRenameSubmit}>
        {icon}
        <input
          ref={selectFileNameFromRef}
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
      <a href={url || '#'} download="download" onClick={handleFileClick}>
        {icon}
        {getName()}
      </a>
    );
  }

  let draggable = <div>{name}</div>;
  if (typeof browserProps.moveFile === 'function') {
    const connectDragSource = connectDragPreview(draggable);
    if (connectDragSource) {
      draggable = connectDragSource;
    }
  }

  const row = (
    <tr
      className={ClassNames('file', {
        pending: action,
        dragging: isDragging,
        dragover: isOver,
        selected: isSelected,
      })}
      onClick={handleItemClick}
      onDoubleClick={handleItemDoubleClick}
    >
      <td className="name">
        <div style={{ paddingLeft: (depth * 16) + 'px' }}>
          {draggable}
        </div>
      </td>
      <td className="size">{fileSize(size)}</td>
      <td className="modified">
        {typeof modified === 'undefined' ? '-' : formatDistanceToNow(modified, { addSuffix: true })}
      </td>
    </tr>
  );

  return connectDND(row);
};

const TableFile = flow(
  DragSource('file', BaseFileConnectors.dragSource, BaseFileConnectors.dragCollect),
  DropTarget(['file', 'folder', NativeTypes.FILE], BaseFileConnectors.targetSource, BaseFileConnectors.targetCollect)
)(RawTableFile);

export default TableFile;
export { RawTableFile };
