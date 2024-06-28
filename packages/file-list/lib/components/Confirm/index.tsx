import React from 'react';

export interface ConfirmMultipleDeleteProps {
  handleDeleteSubmit: (event: any) => void;
}

export function ConfirmMultipleDelete(props: ConfirmMultipleDeleteProps) {
  return (
    <button className="deleting" onClick={props.handleDeleteSubmit}>
      Confirm Deletion
    </button>
  );
}

export interface ConfirmDeleteProps {
  children: React.ReactNode;
  handleDeleteSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleFileClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  url?: string;
}

export function ConfirmDelete(props: ConfirmDeleteProps) {
  const { children, handleDeleteSubmit, handleFileClick, url } = props;

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

