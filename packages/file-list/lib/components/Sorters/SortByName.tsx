import { SortComparer } from './SortComparer';
import { KeyedFile } from '../../common';

const naturalDraftComparer = (a: KeyedFile, b: KeyedFile): number => {
  if (a.draft && !b.draft) {
    return 1;
  } else if (b.draft && !a.draft) {
    return -1;
  }
  return SortComparer(a, b);
};

const naturalSort = (allFiles: KeyedFile[]): KeyedFile[] => {
  let folders: KeyedFile[] = [];
  let files: KeyedFile[] = [];

  for (let fileIndex = 0; fileIndex < allFiles.length; fileIndex++) {
    const file = allFiles[fileIndex];
    if (!file) continue;
    const keyFolders = (file.newKey || file.key).split('/');
    if (file.children) {
      const keyFolder = keyFolders[keyFolders.length - 2];
      if (keyFolder) {
        if (!file.key) {
          file.key = keyFolder;
        }
        folders.push(file);
      }
    } else {
      const keyFolder = keyFolders[keyFolders.length - 1];
      if (keyFolder) {
        if (!file.key) {
          file.key = keyFolder;
        }
        files.push(file);
      }
    }
  }

  files = files.sort(SortComparer);
  folders = folders.sort(naturalDraftComparer);

  for (let folderIndex = 0; folderIndex < folders.length; folderIndex++) {
    const folder = folders[folderIndex];
    if (!folder) continue;
    if (folder.children) {
      folder.children = naturalSort(folder.children);
    }
  }

  let sortedFiles: KeyedFile[] = [];
  sortedFiles = sortedFiles.concat(folders);
  sortedFiles = sortedFiles.concat(files);
  return sortedFiles;
};

const SortByName = (files: KeyedFile[]): KeyedFile[] => {
  return naturalSort(files);
};

export default SortByName;
