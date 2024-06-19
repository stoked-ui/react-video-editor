import { DragSourceMonitor } from "react-dnd";
import { KeyedFile } from "./browser.tsx";

interface BrowserProps {
  selection: string[];
  openFolder: (path: string) => void;
  moveFolder?: (oldKey: string, newKey: string) => void;
  moveFile?: (oldKey: string, newKey: string) => void;
}

interface Props {
  browserProps: BrowserProps;
}

function isFolder(file: KeyedFile): boolean {
  return file.key.endsWith('/');
}

function moveFilesAndFolders(props: Props, monitor: DragSourceMonitor<{ key: string }, { path: string }>): undefined {
  if (!monitor.didDrop()) {
    return;
  }

  const dropResult = monitor.getDropResult();

  const folders: string[] = [];
  const files: string[] = [];

  props.browserProps.selection.forEach(selection => {
    selection.endsWith('/') ? folders.push(selection) : files.push(selection);
  });

  if (dropResult === null) {
    return;
  }

  props.browserProps.openFolder(dropResult.path);

  folders.forEach(selection => {
    const fileKey = selection;
    const fileNameParts = fileKey.split('/');
    const folderName = fileNameParts[fileNameParts.length - 2];

    const newKey = `${dropResult.path}${folderName}/`;
    // abort if the new folder name contains itself
    if (newKey.startsWith(fileKey)) return;

    if (newKey !== fileKey && props.browserProps.moveFolder) {
      props.browserProps.moveFolder(fileKey, newKey);
    }
  });

  files.forEach(selection => {
    const fileKey = selection;
    const fileNameParts = fileKey.split('/');
    const fileName = fileNameParts[fileNameParts.length - 1];
    const newKey = `${dropResult.path}${fileName}`;
    if (newKey !== fileKey && props.browserProps.moveFile) {
      props.browserProps.moveFile(fileKey, newKey);
    }
  });
}

export { isFolder, moveFilesAndFolders };
