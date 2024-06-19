import React from 'react';
import ClassNames from 'classnames';
import { DragSource, DropTarget, ConnectDragSource, ConnectDropTarget } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { formatDistanceToNow } from 'date-fns';
import flow from 'lodash.flow';

import { useFile, BaseFileConnectors } from './../../base-file';
import { fileSize } from './utils';
import { KeyedFile } from "../../browser.tsx";

export interface RawListThumbnailFileProps {
  fileKey: string;
  url: string;
  thumbnail_url?: string;
  action?: string;
  isDragging?: boolean;
  isRenaming?: boolean;
  isSelected?: boolean;
  isSelectable?: boolean;
  isOver?: boolean;
  isDeleting?: boolean;
  showName?: boolean;
  showSize?: boolean;
  showModified?: boolean;
  browserProps: any;
  connectDragPreview: ConnectDragSource;
  connectDropTarget: ConnectDropTarget;
  size: number;
  modified: number;
}

const RawListThumbnailFile: React.FC<RawListThumbnailFileProps & KeyedFile> = (props) => {
  const {
    thumbnail_url: thumbnailUrl, action, url,
    isDragging, isRenaming, isSelected, isSelectable, isOver, isDeleting,
    showName = true, showSize = true, showModified = true, browserProps, connectDragPreview,
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
  } = useFile({...props.browserProps, ...(props as KeyedFile)} );

  let icon;
  if (thumbnailUrl) {
    icon = (
      <div
        className="image"
        style={{
          backgroundImage: 'url(' + thumbnailUrl + ')',
        }}
      />
    );
  } else {
    icon = browserProps.icons[getFileType()] || browserProps.icons.File;
  }

  const inAction = (isDragging || action);

  const ConfirmDeletionRenderer = browserProps.confirmDeletionRenderer;

  let name;
  if (showName) {
    if (!inAction && isDeleting && browserProps.selection.length === 1) {
      name = (
        <ConfirmDeletionRenderer
          handleDeleteSubmit={handleDeleteSubmit}
          handleFileClick={handleFileClick}
          url={url}
        >
          {getName()}
        </ConfirmDeletionRenderer>
      );
    } else if (!inAction && isRenaming) {
      name = (
        <form className="renaming" onSubmit={handleRenameSubmit}>
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
        <a href={url} download="download" onClick={handleFileClick}>
          {getName()}
        </a>
      );
    }
  }

  let size;
  if (showSize) {
    if (!isRenaming && !isDeleting) {
      size = (
        <span className="size"><small>{fileSize(props.size)}</small></span>
      );
    }
  }

  let modified;
  if (showModified) {
    if (!isRenaming && !isDeleting) {
      modified = (
        <span className="modified">
          Last modified: {formatDistanceToNow(props.modified, { addSuffix: true })}
        </span>
      );
    }
  }

  let rowProps = {};
  if (isSelectable) {
    rowProps = {
      onClick: handleItemClick,
    };
  }

  let row = (
    <li
      className={ClassNames('file', {
        pending: action,
        dragging: isDragging,
        dragover: isOver,
        selected: isSelected,
      })}
      onDoubleClick={handleItemDoubleClick}
      {...rowProps}
    >
      <div className="item">
        <span className="thumb">{icon}</span>
        <span className="name">{name}</span>
        {size}
        {modified}
      </div>
    </li>
  );

  if (typeof browserProps.moveFile === 'function') {
    const preview = connectDragPreview(row);
    if (preview !== null) {
      row = preview;
    }
  }

  return connectDND(row);
};

const ListThumbnailFile = flow(
  DragSource('file', BaseFileConnectors.dragSource, BaseFileConnectors.dragCollect),
  DropTarget(['file', 'folder', NativeTypes.FILE], BaseFileConnectors.targetSource, BaseFileConnectors.targetCollect)
)(RawListThumbnailFile);

export default ListThumbnailFile;
export { RawListThumbnailFile };
