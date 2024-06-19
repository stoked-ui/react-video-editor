// @ts-nocheck
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { moveFilesAndFolders } from './utils';

export interface useFolderProps {
  name?: string;
  fileKey: string;
  newName?: string;
  keyDerived?: boolean;
  isDraft?: boolean;
  isRenaming?: boolean;
  isDeleting?: boolean;
  connectDragSource: any;
  connectDropTarget: any;
  isDragging?: boolean;
  action?: string;
  browserProps: {
    select: (key: string, type: string, ctrlKey: boolean, shiftKey: boolean) => void;
    toggleFolder: (key: string) => void;
    beginAction: (action: string, key: string) => void;
    endAction: () => void;
    createFolder: (key: string) => void;
    renameFolder: (oldKey: string, newKey: string) => void;
    deleteFolder: (keys: string[]) => void;
    actionTargets: string[];
  };
}

const useFolder = (props: useFolderProps) => {
  const {
    name,
    fileKey,
    newName: propNewName,
    keyDerived,
    isDraft,
    isRenaming,
    isDeleting,
    connectDragSource,
    connectDropTarget,
    isDragging,
    action,
    browserProps,
  } = props;

  function getName() {
    if (name) {
      return name;
    }
    const folders = fileKey?.split('/');
    if (!folders) return undefined;
    return propNewName || folders[folders.length - 2];
  }

  const [newName, setNewName] = useState(isDraft ? 'New folder' : getName());

  const selectFolderNameFromRef = (element) => {
    if (element) {
      const currentName = element.value
      element.setSelectionRange(0, currentName.length)
      element.focus()
    }
  }

  const handleFolderClick = (event) => {
    event.stopPropagation()
    props.browserProps.select(props.fileKey, 'folder', event.ctrlKey || event.metaKey, event.shiftKey)
  }

  const handleFolderDoubleClick = (event) => {
    event.stopPropagation()
    toggleFolder()
  }

  const handleRenameClick = () => {
    if (!props.browserProps.renameFolder) {
      return
    }
    props.browserProps.beginAction('rename', props.fileKey)
  }

  const handleNewNameChange = (event) => {
    const newName = event.target.value
    setState({ newName: newName })
  }

  const handleRenameSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!browserProps.renameFolder && !isDraft) {
      return;
    }
    const trimmedNewName = newName.trim();
    if (trimmedNewName.length === 0 || ['/', '\\'].some((char) => trimmedNewName.includes(char))) {
      return;
    }
    let newKey = fileKey.substr(0, fileKey.substr(0, fileKey.length - 1).lastIndexOf('/'));
    if (newKey.length) {
      newKey += '/';
    }
    newKey += trimmedNewName;
    newKey += '/';
    if (isDraft) {
      browserProps.createFolder(newKey);
    } else {
      browserProps.renameFolder(fileKey, newKey);
    }
  };

  const handleDeleteClick = () => {
    if (!props.browserProps.deleteFolder) {
      return
    }
    props.browserProps.beginAction('delete', props.fileKey)
  }

  const handleDeleteSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!browserProps.deleteFolder) {
      return;
    }
    browserProps.deleteFolder(browserProps.actionTargets);
  };

  const handleCancelEdit = () => {
    browserProps.endAction();
  };

  const toggleFolder = () => {
    browserProps.toggleFolder(fileKey);
  };

  function connectDND(render: JSX.Element) {
    const inAction = isDragging || action;
    if (keyDerived) {
      if (
        typeof browserProps.moveFolder === 'function' &&
        !inAction &&
        !isRenaming &&
        !isDeleting
      ) {
        render = connectDragSource(render);
      }
      if (
        typeof browserProps.createFiles === 'function' ||
        typeof browserProps.moveFolder === 'function' ||
        typeof browserProps.moveFile === 'function'
      ) {
        render = connectDropTarget(render);
      }
    }
    return render;
  }

  return {
    newName,
    setNewName,
    selectFolderNameFromRef,
    getName,
    handleFolderClick,
    handleFolderDoubleClick,
    handleRenameClick,
    handleNewNameChange,
    handleRenameSubmit,
    handleDeleteClick,
    handleDeleteSubmit,
    handleCancelEdit,
    toggleFolder,
    connectDND,
  };
};

const dragSource = {
  beginDrag(props: BaseFolderProps) {
    if (!props.browserProps.selection.length) {
      props.browserProps.select(props.fileKey, 'folder');
    }
    return {
      key: props.fileKey,
    };
  },
  endDrag(props: BaseFolderProps, monitor: any, component: any) {
    moveFilesAndFolders(props, monitor, component);
  },
};

function dragCollect(connect: any, monitor: any) {
  return {
    connectDragPreview: connect.dragPreview(),
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
}

const BaseFolderConnectors = {
  dragSource,
  dragCollect,
};

export { useFolder, BaseFolderConnectors };
