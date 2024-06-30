import { Button } from "@mui/material";

export const BasicDemo: React.FC = () => {
  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input change', e.target.files);
  }
  return (
    <div>
      <h1>Material UI Demo</h1>
      <Button variant="contained" color="primary" type={'file'} onChange={onFileInputChange}>
        Hello World
      </Button>
    </div>
  );
}
