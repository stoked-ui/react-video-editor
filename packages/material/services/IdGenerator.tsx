const IdGenerator = () => {
  const generateId = (prefix: string, length: number) => {
    return `${prefix}-${Math.random()
      .toString(36)
      .slice(2, 2 + length)}`;
  };
  const newRowId = () => generateId('row', 7);
  const newActionId = () => generateId('action', 7);
  const newFileId = () => generateId('file', 7);
  return {
    newRowId,
    newFileId,
    newActionId,
  };
};

export default IdGenerator;
