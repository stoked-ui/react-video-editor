import React, { ChangeEvent } from 'react';

interface FilterProps {
  value: string;
  updateFilter: (newValue: string) => void;
}

const Filter: React.FC<FilterProps> = ({ value, updateFilter }) => {
  const handleFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    updateFilter(newValue);
  };

  return (
    <input
      type="search"
      placeholder="Filter files"
      value={value}
      onChange={handleFilterChange}
    />
  );
};

export default Filter;
