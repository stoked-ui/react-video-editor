import React from 'react';
import ListThumbnailFile, { RawListThumbnailFileProps } from './list-thumbnail';

const SimpleListThumbnailFile: React.FC<RawListThumbnailFileProps> = (props) => {
  return (
    <ListThumbnailFile
      {...props}
      showName={false}
      showSize={false}
      showModified={false}
      isSelectable={false}
    />
  );
}

export default SimpleListThumbnailFile;
