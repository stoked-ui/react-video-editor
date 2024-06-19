import { compareAsc } from 'date-fns';
import { KeyedFile } from '../../browser';

const lastModifiedSort = (allFiles: KeyedFile[]): KeyedFile[] => {
  const folders: KeyedFile[] = [];
  let files: KeyedFile[] = [];

  for (let fileIndex = 0; fileIndex < allFiles.length; fileIndex++) {
    const file = allFiles[fileIndex];
    if (file) {
      const keyFolders = (file.newKey || file.key).split('/');
      if (file.children) {
        // file.name = keyFolders[keyFolders.length - 2]
        folders.push(file);
      } else {
        const newFolder = keyFolders[keyFolders.length - 1];
        if (newFolder) {
          file.key = newFolder;
          files.push(file);
        }
      }
    }
  }

  files = files.sort((a: KeyedFile, b: KeyedFile) => compareAsc(new Date(a?.modified || 0), new Date(b?.modified || 0)));

  for (let folderIndex = 0; folderIndex < folders.length; folderIndex++) {
    const folder = folders[folderIndex];
    if (folder && folder.children) {
      folder.children = lastModifiedSort(folder.children);
    }
  }

  let sortedFiles: KeyedFile[] = [];
  sortedFiles = sortedFiles.concat(folders);
  sortedFiles = sortedFiles.concat(files);

  return sortedFiles;
};

const sortByLastModified = (files: KeyedFile[]): KeyedFile[] => {
  return lastModifiedSort(files);
};

export default sortByLastModified;
