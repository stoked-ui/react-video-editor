import React, { JSXElementConstructor, ReactElement } from "react";
import ClassNames from 'classnames';

import { useFolder } from '../../hooks';
import { FileProps } from "../Files";
/*
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
  depth: number;
  size: number;
  modified: number | undefined;
}*/

const RawTableFolder: React.FC<FileProps> = (props) => {
  const {
    action, isDragging, isDeleting, isRenaming, isDraft, isOver, isSelected,
    browserProps, depth, file: { url }
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
    //connectDND,
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

  return <tr
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
  </tr>;
};

const TableFolder: React.FC<FileProps> = (props) => {
  return <RawTableFolder {...props} />;
}

export { RawTableFolder, TableFolder };
