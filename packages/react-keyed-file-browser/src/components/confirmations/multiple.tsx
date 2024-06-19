import React from 'react';

interface MultipleConfirmDeletionProps {
  handleDeleteSubmit: () => void;
}

const MultipleConfirmDeletion: React.FC<MultipleConfirmDeletionProps> = ({ handleDeleteSubmit }) => {
  return (
    <button className="deleting" onClick={handleDeleteSubmit}>
      Confirm Deletion
    </button>
  );
};

export default MultipleConfirmDeletion;
