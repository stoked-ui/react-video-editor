import React from 'react';
import ClassNames from 'classnames';
import { DropTarget, ConnectDropTarget } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { BaseFileConnectors } from '../../base-file';

interface RawTableHeaderProps {
  select: (fileKey: string) => void;
  fileKey: string;
  connectDropTarget: ConnectDropTarget;
  isOver: boolean;
  isSelected: boolean;
  browserProps: {
    createFiles?: (files: File[], path: string) => void;
    moveFolder?: (oldKey: string, newKey: string) => void;
    moveFile?: (oldKey: string, newKey: string) => void;
  };
}

const RawTableHeader: React.FC<RawTableHeaderProps> = (props) => {
  const handleHeaderClick = () => {
    props.select(props.fileKey);
  };

  const header = (
    <tr
      className={ClassNames('folder', {
        dragover: props.isOver,
        selected: props.isSelected,
      })}
      onClick={handleHeaderClick}
    >
      <th>File</th>
      <th className="size">Size</th>
      <th className="modified">Last Modified</th>
    </tr>
  );

  if (
    typeof props.browserProps.createFiles === 'function' ||
    typeof props.browserProps.moveFile === 'function' ||
    typeof props.browserProps.moveFolder === 'function'
  ) {
    return props.connectDropTarget(header);
  } else {
    return header;
  }
};

const TableHeader = DropTarget(
  ['file', 'folder', NativeTypes.FILE],
  BaseFileConnectors.targetSource,
  BaseFileConnectors.targetCollect
)(RawTableHeader);

export default TableHeader;
export { RawTableHeader };
