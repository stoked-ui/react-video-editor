import React from 'react';
import { useMediaFileContext } from "../../lib";

export const BasicDemo: React.FC = () => {
  const editorCtx = useMediaFileContext();
  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    await editorCtx.addFiles(e);
  }
  return (
    <div>
      <h1>Material UI Demo</h1>
      <input color="primary" type={'file'} onChange={onFileInputChange}>
        Hello World
      </input>
    </div>
  );
}
