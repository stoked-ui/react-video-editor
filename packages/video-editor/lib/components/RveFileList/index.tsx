import type { FC, HTMLProps, ReactElement, ReactNode } from 'react';
import { useState } from 'react';
import ArticleIcon from '@mui/icons-material/Article';
import type { IRveFile } from '../../models/RveFile';
import { FileList } from '@stoked-ui/file-list';
import { KeyedFile } from '@stoked-ui/file-list';
import { GetIcons } from '@stoked-ui/file-list';
/*
import FileList from 'stokedui-file-list/FileList';
import KeyedFile from 'stokedui-file-list/KeyedFile';
import GetIcons from 'stokedui-file-list/GetIcons';
*/

import './RveFileList.scss';
import { useRveContext } from '../Rve/RveProvider';
import RveRow from '../RveRow';
import NotStartedIcon from '@mui/icons-material/NotStarted';

export interface IRveFileListProps extends HTMLProps<HTMLDivElement> {
  files?: IRveFile[];
  title?: string;
  variant?: 'padded' | 'minimized';
  icon?: ReactNode;
}

type KeyedFileType = KeyedFile;

const RveFileList = (props: IRveFileListProps = { title: 'Files', icon: <ArticleIcon /> }): ReactElement => {
  const fileList: Array<KeyedFileType> =
    props?.files?.map((file: IRveFile): KeyedFileType => {
      return new KeyedFile({ key: file.name!, modified: file.modified!, size: file.size! });
    }) || new Array<KeyedFileType>();

  const [files, setFiles] = useState(fileList);

  const handleCreateFiles = (createFiles: KeyedFile[], prefix: string): void => {
    const newFiles = createFiles.map((file: KeyedFile) => {
      let newKey = prefix;
      if (prefix !== '' && prefix.substring(prefix.length - 1, prefix.length) !== '/') {
        newKey += '/';
      }
      newKey += file.name;
      return {
        key: newKey,
        size: file.size,
        modified: Date.now(),
      };
    });

    const uniqueNewFiles: Array<KeyedFile> = [];
    newFiles.map(newFile => {
      let exists = false;
      files.map(existingFile => {
        if (existingFile.key === newFile.key) {
          exists = true;
        }
      });
      if (!exists) {
        uniqueNewFiles.push(new KeyedFile(newFile));
      }
    });
    setFiles([...files].concat(uniqueNewFiles));
  };

  const handleRenameFolder = (oldKey: string, newKey: string): void => {
    const newFiles: Array<KeyedFile> = [];
    files.map(file => {
      if (file.key.substr(0, oldKey.length) === oldKey) {
        newFiles.push(
          new KeyedFile({
            ...file,
            key: file.key.replace(oldKey, newKey),
            modified: Date.now(),
          })
        );
      } else {
        newFiles.push(file);
      }
    });
    setFiles(newFiles);
  };

  const handleRenameFile = (oldKey: string, newKey: string): void => {
    const newFiles: Array<KeyedFile> = [];
    files.map(file => {
      if (file.key === oldKey) {
        newFiles.push(
          new KeyedFile({
            ...file,
            key: newKey,
            modified: Date.now(),
          })
        );
      } else {
        newFiles.push(file);
      }
    });
    setFiles(newFiles);
  };

  const handleDeleteFolder = (folderKey: string): void => {
    const newFiles: Array<KeyedFile> = [];
    files.map(file => {
      if (file.key.substr(0, folderKey.length) !== folderKey) {
        newFiles.push(file);
      }
    });
    setFiles(newFiles);
  };

  const handleDeleteFile = (fileKey: string[]): void => {
    const newFiles: Array<KeyedFile> = files.filter(file => !fileKey.includes(file.key));
    setFiles(newFiles);
  };

  if (!fileList) {
    return <></>;
  }

  return (
    <div className={`rve-file-list`}>
      <div className={'rve-file-list-title'}>{props.title}</div>
      <FileList
        files={files}
        icons={GetIcons(4)}
        onCreateFiles={handleCreateFiles}
        onMoveFolder={handleRenameFolder}
        onMoveFile={handleRenameFile}
        onRenameFolder={handleRenameFolder}
        onRenameFile={handleRenameFile}
        onDeleteFolder={handleDeleteFolder}
        onDeleteFile={handleDeleteFile}
      />
    </div>
  );
};

export interface IRveFileListsProps extends HTMLProps<HTMLDivElement> {
  variant?: 'padded' | 'minimized';
}

const RveFileLists: FC<IRveFileListsProps> = (props: IRveFileListsProps) => {
  const editorCtx = useRveContext();
  const artifacts: IRveFile[] = editorCtx?.markers?.length ?? 0 > 1 ? editorCtx.markers! : [];
  if (editorCtx?.poster) {
    artifacts.push(editorCtx.poster);
  }

  return (
    <RveRow className={`rve-file-lists drop-hover`}>
      <div className={'drop-inner'}>
        <RveFileList title={'Original Videos'} files={editorCtx.originals} variant={props.variant} icon={<NotStartedIcon color={'success'} />} />
        <RveFileList title={'Attachment Files'} files={editorCtx.files} variant={props.variant} />
        <RveFileList title={'Artifacts'} files={artifacts} variant={props.variant} />
      </div>
    </RveRow>
  );
};

export default RveFileLists;
