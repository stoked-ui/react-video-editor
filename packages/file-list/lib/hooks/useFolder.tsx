import React, { ChangeEvent, useState } from 'react';
import { KeyedHookProps } from "../common";

export const useFolder = (props: KeyedHookProps) => {
  const {
    file: {name, key},
    newName: propNewName,
    isDraft,
    browserProps,
  } = props;

  function getName() {
    if (name) {
      return name;
    }
    const folders = key?.split('/');
    if (!folders) return undefined;
    return propNewName || folders[folders.length - 2];
  }

  const [newName, setNewName] = useState(isDraft ? 'New folder' : getName());

  const selectFolderNameFromRef = (element: HTMLInputElement) => {
    if (element) {
      const currentName = element.value
      element.setSelectionRange(0, currentName.length)
      element.focus()
    }
  }

  const handleFolderClick = (event: React.MouseEvent<HTMLLIElement | HTMLTableRowElement>) => {
    event.stopPropagation()
    props.browserProps.select(key, 'folder', event.ctrlKey || event.metaKey, event.shiftKey)
  }

  const handleFolderDoubleClick = (event: React.MouseEvent<HTMLLIElement | HTMLTableRowElement>) => {
    event.stopPropagation()
    toggleFolder()
  }

  const handleRenameClick = () => {
    if (!props.browserProps.renameFolder) {
      return
    }
    props.browserProps.beginAction('rename', key)
  }

  const handleNewNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value
    setNewName(newName)
  }

  const handleRenameSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!browserProps.renameFolder && !isDraft) {
      return;
    }
    const trimmedNewName = newName?.trim();
    if (trimmedNewName && trimmedNewName.length === 0 || ['/', '\\'].some((char) => trimmedNewName?.includes(char))) {
      return;
    }
    let newKey = key.substr(0, key.substr(0, key.length - 1).lastIndexOf('/'));
    if (newKey.length) {
      newKey += '/';
    }
    newKey += trimmedNewName;
    newKey += '/';
    if (isDraft) {
      browserProps.createFolder(newKey);
    } else {
      browserProps.renameFolder(key, newKey);
    }
  };

  const handleDeleteClick = () => {
    if (!props.browserProps.deleteFolder) {
      return
    }
    props.browserProps.beginAction('delete', key)
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
    browserProps.toggleFolder(key);
  };
/*
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
  }*/

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
//    connectDND,
  };
};
/*

const dragSource = {
  beginDrag(props: KeyedHookProps) {
    if (!props.browserProps.selection.length) {
      props.browserProps.select(props.file.key, 'folder');
    }
    return {
      key: props.file.key,
    };
  },
  endDrag(props: KeyedHookProps, monitor: any, component: any) {
    //moveFilesAndFolders(props, monitor, component);
  }
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

export { BaseFolderConnectors }; */
