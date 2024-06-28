import React from 'react';
import ClassNames from 'classnames';

interface HeaderProps {
  select: (fileKey: string) => void;
  fileKey: string;
  // connectDropTarget: ConnectDropTarget;
  isOver: boolean;
  isSelected: boolean;
  browserProps: {
    createFiles?: (files: File[], path: string) => void;
    moveFolder?: (oldKey: string, newKey: string) => void;
    moveFile?: (oldKey: string, newKey: string) => void;
  };
}

export const RawHeader: React.FC<HeaderProps> = props => {
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

  return header;
  /*
   if (
   typeof props.browserProps.createFiles === 'function' ||
   typeof props.browserProps.moveFile === 'function' ||
   typeof props.browserProps.moveFolder === 'function'
   ) {
   //return props.connectDropTarget(header);
   } else {
   return header;
   }*/
};

export const Header: React.FC<HeaderProps> = props => {
  return <RawHeader {...props} />;
};
export type { HeaderProps };
