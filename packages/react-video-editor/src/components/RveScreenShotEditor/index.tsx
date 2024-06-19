import { Fab } from '@mui/material';
import ScreenshotMonitorIcon from '@mui/icons-material/ScreenshotMonitor';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { styled } from '@mui/material/styles';
import { IVideoFile } from '@store/VideoFile';

/**
 * RveVideoScreenShotEditor is a styled div component
 */
const RveVideoScreenShotEditor = styled('div', {
  name: 'MuiRveVideoScreenShot',
})(() => ({}));

/**
 * Index is a functional component that takes a video object as a prop
 * @param {IVideoFile} video - The video object
 * @returns {JSX.Element} - Returns a JSX element
 */
function Index({ video }: { video: IVideoFile }) {
  return (
    <RveVideoScreenShotEditor className={'rve-screenshot-editor'}>
      {/* Image element displaying the video poster */}
      <img
        src={video?.poster}
        alt={video?.name}
        className={'rve-screenshot'}
      />
      {/* Fab button for creating a screenshot */}
      <Fab
        color="primary"
        aria-label="Screenshot"
        className={'rve-screenshot-btn create'}
        size={'small'}
      >
        <ScreenshotMonitorIcon />
      </Fab>
      {/* Fab button for deleting a screenshot */}
      <Fab
        color="primary"
        aria-label="Screenshot"
        className={'rve-screenshot-btn delete'}
        size={'small'}
      >
        <HighlightOffIcon />
      </Fab>
    </RveVideoScreenShotEditor>
  );
}

/**
 * Default export of Index component
 */
export default Index;
