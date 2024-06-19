import { isFolder } from '../../utils';
import { KeyedFile } from "../../browser.tsx";

interface Folder {
  contents: KeyedFile[];
  children: { [key: string]: Folder };
  [key: string]: any;
}

export default function GroupByFolder(files: KeyedFile[], root: string): KeyedFile[] {
  const fileTree: Folder = {
    contents: [],
    children: {},
  };

  files.forEach((file) => {
    file.relativeKey = (file.newKey || file.key).substr(root.length);
    let currentFolder: Folder = fileTree;
    const folders = file.relativeKey.split('/');
    folders.forEach((folder, folderIndex) => {
      if (folderIndex === folders.length - 1 && isFolder(file)) {
        for (const key in file) {
          currentFolder[key] = file[key];
        }
      }
      if (folder === '') {
        return;
      }
      const isAFile = !isFolder(file) && folderIndex === folders.length - 1;
      if (isAFile) {
        const aFile = new KeyedFile({
          ...file,
          keyDerived: true,
        });
        currentFolder.contents.push(aFile);
      } else {
        if (!(folder in currentFolder.children)) {
          currentFolder.children[folder] = {
            contents: [],
            children: {},
          };
        }
        const subFolder = currentFolder.children[folder];
        if (subFolder) {
          currentFolder = subFolder;
        }
      }
    });
  });

  function addAllChildren(level: Folder, prefix: string): KeyedFile[] {
    if (prefix !== '') {
      prefix += '/';
    }
    let files: KeyedFile[] = [];
    for (const folder in level.children) {
      let levelChildren: KeyedFile[] | undefined = undefined;
      const children = level.children[folder];
      if (children) {
        levelChildren = addAllChildren(children, prefix + folder);
      }
      const newFile = new KeyedFile({
        ...level.children[folder],
        name: null,
        contents: undefined,
        keyDerived: true,
        key: root + prefix + folder + '/',
        relativeKey: prefix + folder + '/',
        children: levelChildren,
        size: 0,
      });
      files.push(newFile);
    }
    files = files.concat(level.contents);
    return files;
  }

  return addAllChildren(fileTree, '');
}
