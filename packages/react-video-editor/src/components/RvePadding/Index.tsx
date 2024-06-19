import { FC, ReactNode } from 'react';
import './RvePadding.scss';
import '../RveVideo/RveVideo.scss';
import { useTheme } from '@mui/material/styles';

/**
 * Index is a functional component that wraps its children with a div.
 * This div has a class of 'rve-padding' and a padding defined by the theme's spacing.
 * The background color of the div is set to red.
 *
 * @param {ReactNode} children - The child elements to be wrapped by the div.
 * @returns {JSX.Element} A div that wraps the children with a specific class, padding, and background color.
 */
const Index: FC<{ children: ReactNode }> = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  // Use the theme from Material UI
  const theme = useTheme();

  // Return a div that wraps the children with a specific class, padding, and background color
  return (
    <div
      className={`rve-padding p-[${theme.spacing(3)}]`}
      style={{ backgroundColor: 'red' }}
    >
      {children}
    </div>
  );
};

export default Index;
