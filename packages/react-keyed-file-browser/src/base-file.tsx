import React, { useState, useEffect } from 'react';
import { moveFilesAndFolders } from './utils';
import { extensionMapping } from './constants';

export interface FileBrowserProps {
  icons: { [key: string]: React.ReactNode };
  select: (fileKey: string, fileType: string, ctrlKey?: boolean, shiftKey?: boolean) => void;
  beginAction: (actionType: string, fileKey: string) => void;
  endAction: () => void;
  preview: (file: { url: string; name: string; key: string; extension: string }) => void;
  createFiles?: (files: File[], path: string) => void;
  moveFile?: (oldKey: string, newKey: string) => void;
  moveFolder?: (oldKey: string, newKey: string) => void;
  renameFile?: (oldKey: string, newKey: string) => void;
  deleteFile?: (fileKeys: string[]) => void;
  actionTargets: string[];
  selection: string[];
  openFolder: (path: string) => void;
}

export interface UseFileProps {
  fileKey: string;
  url: string;
  newKey?: string;
  isRenaming?: boolean;
  connectDragSource: (element: React.ReactNode) => React.ReactNode;
  connectDropTarget: (element: React.ReactNode) => React.ReactNode;
  isDragging?: boolean;
  action?: string;
  browserProps: FileBrowserProps;
}

const useFile = (props: UseFileProps) => {
  const getName = () => {
    let name = props.newKey || props.fileKey;
    const slashIndex = name?.lastIndexOf('/');
    if (slashIndex !== -1) {
      name = name.substr(slashIndex + 1);
    }
    return name;
  };

  const [newName, setNewName] = useState(getName());

  useEffect(() => {
    setNewName(getName());
  }, [props.newKey, props.fileKey]);

  const getExtension = () => {
    const blobs = props.fileKey.split('.');
    return blobs[blobs.length - 1]?.toLowerCase().trim() || '';
  };

  const getFileType = () => {
    return extensionMapping[getExtension()] || 'File';
  };

  const selectFileNameFromRef = (element: HTMLInputElement | null) => {
    if (element) {
      const currentName = element.value;
      const pointIndex = currentName.lastIndexOf('.');
      element.setSelectionRange(0, pointIndex || currentName.length);
      element.focus();
    }
  };

  const handleFileClick = (event?: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event && event.preventDefault();
    props.browserProps.preview({
      url: props.url,
      name: getName(),
      key: props.fileKey,
      extension: getExtension(),
    });
  };

  const handleItemClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    props.browserProps.select(props.fileKey, 'file', event.ctrlKey || event.metaKey, event.shiftKey);
  };

  const handleItemDoubleClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation();
    handleFileClick();
  };

  const handleRenameClick = () => {
    if (!props.browserProps.renameFile) {
      return;
    }
    props.browserProps.beginAction('rename', props.fileKey);
  };

  const handleNewNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setNewName(newName);
  };

  const handleRenameSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) {
      event.preventDefault();
    }
    if (!props.browserProps.renameFile) {
      return;
    }
    const trimmedName = newName.trim();
    if (trimmedName.length === 0) {
      // todo: move to props handler
      return;
    }
    const invalidChar = ['/', '\\'];
    if (invalidChar.some((char) => trimmedName.indexOf(char) !== -1)) return;
    // todo: move to props handler
    let newKey = trimmedName;
    const slashIndex = props.fileKey.lastIndexOf('/');
    if (slashIndex !== -1) {
      newKey = `${props.fileKey.substr(0, slashIndex)}/${trimmedName}`;
    }
    props.browserProps.renameFile(props.fileKey, newKey);
  };

  const handleDeleteClick = () => {
    if (!props.browserProps.deleteFile) {
      return;
    }
    props.browserProps.beginAction('delete', props.fileKey);
  };

  const handleDeleteSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!props.browserProps.deleteFile) {
      return;
    }
    props.browserProps.deleteFile(props.browserProps.actionTargets);
  };

  const handleCancelEdit = () => {
    props.browserProps.endAction();
  };

  const connectDND = (render: React.ReactNode) => {
    const inAction = props.isDragging || props.action;
    if (typeof props.browserProps.moveFile === 'function' && !inAction && !props.isRenaming) {
      render = props.connectDragSource(render);
    }
    if (
      typeof props.browserProps.createFiles === 'function' ||
      typeof props.browserProps.moveFile === 'function' ||
      typeof props.browserProps.moveFolder === 'function'
    ) {
      render = props.connectDropTarget(render);
    }
    return render;
  };

  return {
    newName,
    setNewName,
    getName,
    getExtension,
    getFileType,
    selectFileNameFromRef,
    handleFileClick,
    handleItemClick,
    handleItemDoubleClick,
    handleRenameClick,
    handleNewNameChange,
    handleRenameSubmit,
    handleDeleteClick,
    handleDeleteSubmit,
    handleCancelEdit,
    connectDND,
  };
};

const dragSource = {
  beginDrag(props: UseFileProps) {
    if (!props.browserProps.selection.length || !props.browserProps.selection.includes(props.fileKey)) {
      props.browserProps.select(props.fileKey, 'file');
    }
    return {
      key: props.fileKey,
    };
  },

  endDrag(props: UseFileProps, monitor: any) {
    moveFilesAndFolders(props, monitor);
  },
};

function dragCollect(connect: any, monitor: any) {
  return {
    connectDragPreview: connect.dragPreview(),
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
}

const targetSource = {
  drop(props: UseFileProps, monitor: any) {
    if (monitor.didDrop()) {
      return;
    }
    const key = props.newKey || props.fileKey;
    const slashIndex = key.lastIndexOf('/');
    const path = slashIndex !== -1 ? key.substr(0, slashIndex + 1) : '';
    const item = monitor.getItem();
    if (item.files && props.browserProps.createFiles) {
      props.browserProps.createFiles(item.files, path);
    }
    return {
      path: path,
    };
  },
};

function targetCollect(connect: any, monitor: any) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver({ shallow: true }),
  };
}

const BaseFileConnectors = {
  dragSource,
  dragCollect,
  targetSource,
  targetCollect,
};

export { useFile, BaseFileConnectors };
