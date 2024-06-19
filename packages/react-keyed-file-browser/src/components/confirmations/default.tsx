import React from 'react';

interface ConfirmDeletionProps {
  children: React.ReactNode;
  handleDeleteSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleFileClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  url?: string;
}

const ConfirmDeletion: React.FC<ConfirmDeletionProps> = ({
  children,
  handleDeleteSubmit,
  handleFileClick,
  url = '#',
}) => {
  return (
    <form className="deleting" onSubmit={handleDeleteSubmit}>
      <a href={url} download="download" onClick={handleFileClick}>
        {children}
      </a>
      <div>
        <button type="submit">
          Confirm Deletion
        </button>
      </div>
    </form>
  );
}

export default ConfirmDeletion;
