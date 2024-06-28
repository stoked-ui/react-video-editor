import React from 'react';

interface IKeyedFile {
  key: string;
  name?: string | null;
  modified?: number;
  size?: number;
  draft?: boolean;
  children?: IKeyedFile[];
  newKey?: string;
  relativeKey?: string;
  keyDerived?: boolean;
  [key: string]: any;
}
type KeyedHookProps = {
  file: KeyedFile;
  newKey?: string;
  newName?: string;
  keyDerived?: boolean;
  isDraft?: boolean;
  isRenaming?: boolean;
  isDeleting?: boolean;
  //connectDragSource: any;
  //connectDropTarget: any;
  isDragging?: boolean;
  action?: string;
  browserProps: {
    select: (key: string, type: string, ctrlKey?: boolean, shiftKey?: boolean) => void;
    toggleFolder: (key: string) => void;
    beginAction: (action: string, key: string) => void;
    endAction: () => void;
    createFolder: (key: string) => void;
    renameFolder: (oldKey: string, newKey: string) => void;
    deleteFolder: (keys: string[]) => void;
    actionTargets: string[];
    icons: { [key: string]: React.ReactNode };
    preview: (file: { url: string; name: string; key: string; extension: string }) => void;
    createFiles?: (files: File[], path: string) => void;
    moveFile?: (oldKey: string, newKey: string) => void;
    moveFolder?: (oldKey: string, newKey: string) => void;
    renameFile?: (oldKey: string, newKey: string) => void;
    deleteFile?: (fileKeys: string[]) => void;
    selection: string[];
    openFolder: (path: string) => void;
  };
};

const getName = (file: IKeyedFile) => {
  let name = file.key;
  const slashIndex = name.lastIndexOf('/');
  if (slashIndex !== -1) {
    name = name.substring(slashIndex + 1);
  }
  return name;
};

class KeyedFile implements IKeyedFile {
  key: string;
  name: string;
  modified?: number;
  size?: number;
  draft?: boolean;
  children?: KeyedFile[];
  newKey?: string;
  relativeKey?: string;
  keyDerived?: boolean;
  [key: string]: any;

  constructor(options: IKeyedFile) {
    const { key, name, modified, size, draft, children, newKey, relativeKey, keyDerived, ...rest } = options;
    const kids = children?.map(child => new KeyedFile(child));
    this.key = key;
    this.modified = modified;
    this.size = size;
    this.draft = draft;
    this.children = kids;
    this.newKey = newKey;
    this.relativeKey = relativeKey;
    this.keyDerived = keyDerived;
    for (const key in rest) {
      this[key] = rest[key];
    }
    this.name = name || getName(this);
  }
}

export type { IKeyedFile, KeyedHookProps };
export { KeyedFile };
export default KeyedFile;
