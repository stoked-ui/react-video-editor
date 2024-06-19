import PropTypes, { InferProps } from "prop-types";
import React from "react";

interface DetailProps {
  file: NonNullable<InferProps<{
    key: string;
    name: string;
    extension: string;
    url: string;
  }>>;
  close: () => void;
}

const Detail: React.FC<DetailProps> = ({ file, close }) => {
  const handleCloseClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();
    close();
  };

  const name = file.key.split('/').pop();

  return (
    <div>
      <h2>Item Detail</h2>
      <dl>
        <dt>Key</dt>
        <dd>{file.key}</dd>

        <dt>Name</dt>
        <dd>{name}</dd>
      </dl>
      <a href="#" onClick={handleCloseClick}>Close</a>
    </div>
  );
};

Detail.propTypes = {
  file: PropTypes.shape({
    key: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    extension: PropTypes.string.isRequired,
    url: PropTypes.string,
  }).isRequired,
  close: PropTypes.func.isRequired,
};

export default Detail;
