import * as React from 'react';
import themes from '../styles/MuiTheme.module.scss';
import { createTheme } from "@mui/material/styles";
import type { Theme, PaletteOptions, PaletteColorOptions } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export const lightPaletteText = {
  primary: themes['muiLightPaletteTextPrimary'],
  secondary: themes['muiLightPaletteTextSecondary'],
  disabled: themes['muiLightPaletteTextDisabled'],
};

export const darkPaletteText = {
  primary: themes['muiDarkPaletteTextPrimary'],
  secondary: themes['muiDarkPaletteTextSecondary'],
  disabled: themes['muiDarkPaletteTextDisabled'],
};

export const paletteError: PaletteColorOptions | undefined = {
  light: themes['muiPaletteErrorLight'],
  main: themes['muiPaletteErrorMain'] || lightTheme.palette.error.main,
  dark: themes['muiPaletteErrorDark'],
};

export const commonColors = {
  black: themes['muiPaletteCommonBlack'],
  white: themes['muiPaletteCommonWhite'],
};


export default function useRveTheme(): {
  theme: Theme;
  colorMode: { toggleColorMode: () => void };
  themeName: 'light' | 'dark';
} {
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  const theme = React.useMemo(
    function () {
      let paletteExt: PaletteOptions = {
        divider: themes['muiLightPaletteDivider'],
        text: lightPaletteText,
        common: commonColors,
        primary: {
          light: themes['muiLightPalettePrimaryLight'],
          main: themes['muiLightPalettePrimaryMain'] || lightTheme.palette.primary.main,
          dark: themes['muiLightPalettePrimaryDark'],
          contrastText: darkPaletteText.primary,
        },
        secondary: {
          light: themes['muiLightPaletteSecondaryLight'],
          main: themes['muiLightPaletteSecondaryMain'] || lightTheme.palette.secondary.main,
          dark: themes['muiLightPaletteSecondaryDark'],
          contrastText: darkPaletteText.primary,
        },
        background: {
          contrast: themes['muiLightPaletteBackgroundContrast'],
          paper: themes['muiLightPaletteBackgroundPaper'],
          default: themes['muiLightPaletteBackgroundDefault'],
        },
        error: paletteError,
      };

      if (mode === 'dark') {
        paletteExt = {
          divider: themes['muiDarkPaletteDivider'],
          text: darkPaletteText,
          primary: {
            light: themes['muiDarkPalettePrimaryLight'],
            main: themes['muiDarkPalettePrimaryMain'] || darkTheme.palette.primary.main,
            dark: themes['muiDarkPalettePrimaryDark'],
            contrastText: darkPaletteText.primary,
          },
          common: commonColors,
          secondary: {
            light: themes['muiDarkPaletteSecondaryLight'],
            main: themes['muiDarkPaletteSecondaryMain'] || darkTheme.palette.secondary.main,
            dark: themes['muiDarkPaletteSecondaryDark'],
            contrastText: darkPaletteText.primary,
          },
          background: {
            contrast: themes['muiDarkPaletteBackgroundContrast'],
            paper: themes['muiDarkPaletteBackgroundPaper'],
            default: themes['muiDarkPaletteBackgroundDefault'],
          },
          error: paletteError,
        };
      }
      return createTheme({
        palette: {
          mode,
          ...paletteExt,
        },
        components: {
          MuiRveEditor: {
            styleOverrides: {
              padding: themes['muiRveEditorRootPadding'],
            },
          },
        },
      });
    },
    [mode]
  );
  return { theme, colorMode, themeName: mode };
}
