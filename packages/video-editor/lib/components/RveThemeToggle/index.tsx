import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import {  useState } from 'react';
import { useTheme } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/system';
import { Button } from '@mui/material';
import '../../styles/tailwind.css';
import './ThemeToggle.scss';

export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
});

export const RveThemeToggle = (
  props: {
    button?: boolean,
    variant?: string;
    sx?: SxProps<Theme> | undefined;
  },
): JSX.Element => {
  const getThemeColor = (themeName: string) => {
    if (props.button) {
      return 'white';
    }
    return themeName === 'light' ? 'white' : 'black';
  };
  const colorMode = React.useContext(ColorModeContext);
  const [themeColor, setThemeColor] = useState<null | 'black' | 'white'>(null);
  const toggle = (name: string) => {
    colorMode.toggleColorMode();
    setThemeColor(getThemeColor(name === 'light' ? 'dark' : 'light'));
  };
  const theme = useTheme();

  if (themeColor === null) {
    setThemeColor(getThemeColor(theme.palette.mode));
    return <></>;
  }

  if (props.button) {
    return (
      <Button
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        onClick={() => toggle(theme.palette.mode)}
        sx={{ color: themeColor }}
      >
        {theme.palette.mode === 'dark' ? (
          <Brightness7Icon />
        ) : (
          <Brightness4Icon />
        )}
      </Button>
    );
  }
  return (
    <Box className={'theme-toggle'} color={themeColor} sx={props.sx}>
      <IconButton
        sx={[
          theme.palette.mode === 'light' && {
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,.3)',
            },
          },
          theme.palette.mode === 'dark' && {
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,.3)',
            },
          },
        ]}
        onClick={() => toggle(theme.palette.mode)}
        color="inherit"
      >
        {theme.palette.mode === 'dark' ? (
          <Brightness7Icon />
        ) : (
          <Brightness4Icon />
        )}
      </IconButton>
    </Box>
  );
}
