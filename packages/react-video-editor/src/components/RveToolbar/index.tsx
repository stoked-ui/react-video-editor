import { Button, Toolbar } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Cancel, Save } from '@mui/icons-material';
import './RveToolbar.scss';
import ThemeToggle from '../ThemeToggle';

/**
 * RveToolbar is a functional component that renders a toolbar with various buttons.
 * It uses Material UI for styling and structure.
 *
 * @component
 * @example
 * <RveToolbar />
 */
const RveToolbar = () => {
  return (
    <Toolbar className={'rve-toolbar'}>
      <div className={'toolbar-right'}>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
          sx={{ marginRight: '5px' }}
        >
          Upload Files
        </Button>
        <ThemeToggle button={true} />
      </div>
      <div className={'toolbar-right'}>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<Cancel />}
          color={'error'}
        >
          Cancel
        </Button>
        <Button
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<Save />}
          color={'secondary'}
        >
          Save
        </Button>
      </div>
    </Toolbar>
  );
};

export default RveToolbar;
