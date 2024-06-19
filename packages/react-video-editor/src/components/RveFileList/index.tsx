import React, { FC, HTMLProps, ReactElement, ReactNode} from "react";
import { useState } from "react";
import ArticleIcon from '@mui/icons-material/Article';
import type { IRveFile } from '@store/RveFile';
import { KeyedFile, RawFileBrowser } from "@stokedconsulting/react-keyed-file-browser";
import { Icons } from "@stokedconsulting/react-keyed-file-browser";
import { FileBrowser } from '@stokedconsulting/react-keyed-file-browser';
import './RveFileList.scss';
import { useRveContext } from '@components/Rve/RveProvider';
import RveRow from '@components/RveRow';
import NotStartedIcon from '@mui/icons-material/NotStarted';
import Moment from 'moment'
import { IKeyedFile } from "@stokedconsulting/react-keyed-file-browser/src/browser.tsx";

export interface IRveFileListProps extends HTMLProps<HTMLDivElement> {
  files?: IRveFile[];
  title?: string;
  variant?: 'padded' | 'minimized';
  icon?: ReactNode;
}

const RveFileList = (
  props: IRveFileListProps = { title: 'Files', icon: <ArticleIcon /> }
): ReactElement => {
  const fileList: Array<KeyedFile> = props?.files?.map(
    (file: IRveFile): KeyedFile => {
      return new KeyedFile({ key: file.name!, modified: file.modified!, size: file.size! });
    }) || new Array<KeyedFile>();

  const [files, setFiles] = useState(fileList);

  const handleCreateFiles = (createFiles: IKeyedFile[], prefix: string): void => {
    const newFiles = createFiles.map((file: IKeyedFile) => {
      let newKey = prefix
      if (prefix !== '' && prefix.substring(prefix.length - 1, prefix.length) !== '/') {
        newKey += '/'
      }
      newKey += file.name
      return {
        key: newKey, size: file.size, modified: +Moment(),
      }
    });

    const uniqueNewFiles: Array<KeyedFile> = []
    newFiles.map((newFile) => {
      let exists = false
      files.map((existingFile) => {
        if (existingFile.key === newFile.key) {
          exists = true
        }
      })
      if (!exists) {
        uniqueNewFiles.push(new KeyedFile(newFile))
      }
    });
    setFiles([...files].concat(uniqueNewFiles));
  }

  const handleRenameFolder = (oldKey: string, newKey: string): void => {
    const newFiles: Array<KeyedFile> = []
    files.map((file) => {
      if (file.key.substr(0, oldKey.length) === oldKey) {
        newFiles.push(new KeyedFile({
          ...file,
          key: file.key.replace(oldKey, newKey),
          modified: +Moment(),
        }))
      } else {
        newFiles.push(file)
      }
    })
    setFiles(newFiles);
  };

  const handleRenameFile = (oldKey: string, newKey: string): void => {
    const newFiles: Array<KeyedFile> = []
    files.map((file) => {
      if (file.key === oldKey) {
        newFiles.push(new KeyedFile({
          ...file,
          key: newKey,
          modified: +Moment(),
        }))
      } else {
        newFiles.push(file)
      }
    })
    setFiles(newFiles);
  };

  const handleDeleteFolder = (folderKey: string): void => {
    const newFiles: Array<KeyedFile> = []
    files.map((file) => {
      if (file.key.substr(0, folderKey.length) !== folderKey) {
        newFiles.push(file)
      }
    })
    setFiles(newFiles);
  };

  const handleDeleteFile = (fileKey: string[]): void => {
    const newFiles: Array<KeyedFile> = files.filter((file) => !fileKey.includes(file.key));
    setFiles(newFiles);
  }

  if (!fileList) {
    return <></>;
  }
  return (<div className={`rve-file-list`}>
    <div className={'rve-file-list-title'}>{props.title}</div>
    <FileBrowser
      files={files}
      icons={Icons.FontAwesome(4)}
      onCreateFiles={handleCreateFiles}
      onMoveFolder={handleRenameFolder}
      onMoveFile={handleRenameFile}
      onRenameFolder={handleRenameFolder}
      onRenameFile={handleRenameFile}
      onDeleteFolder={handleDeleteFolder}
      onDeleteFile={handleDeleteFile}
    />
  </div>);
};

export interface IRveFileListsProps extends HTMLProps<HTMLDivElement> {
  variant?: 'padded' | 'minimized';
}

const RveFileLists: FC<IRveFileListsProps> = (props: IRveFileListsProps) => {
  const editorCtx = useRveContext();
  const artifacts: IRveFile[] =
    editorCtx?.markers?.length ?? 0 > 1 ? editorCtx.markers! : [];
  if (editorCtx?.poster) {
    artifacts.push(editorCtx.poster);
  }

  return (
    <RveRow
      className={`rve-file-lists drop-hover`}
    >
      <div className={'drop-inner'}>
        <RveFileList
          title={'Original Videos'}
          files={editorCtx.originals}
          variant={props.variant}
          icon={<NotStartedIcon color={'success'} />}
        />
        <RveFileList
          title={'Attachment Files'}
          files={editorCtx.files}
          variant={props.variant}
        />
        <RveFileList
          title={'Artifacts'}
          files={artifacts}
          variant={props.variant}
        />
      </div>
    </RveRow>
  );
};

export default RveFileLists;
