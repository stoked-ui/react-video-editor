import type { ComponentsOverrides, ComponentsVariants, Theme as MuiTheme } from "@mui/material/styles";
import type { IRveEditorProps } from "@components/Rve";
import { FFmpegConverter } from './ffmpeg/FFmpegConverter.ts';
declare module "*.png";
declare module "*.svg";
type Theme = Omit<MuiTheme, "components">;
declare module "@mui/material/styles" {
  interface TypeBackground {
    contrast: string;
    default: string;
    paper: string;
  }
  interface ComponentNameToClassKey {
    MuiRveEditor: "padding";
    MuiRveVideo: "root" | "value";
    MuiRveDropzone: "root";
  }
  interface ComponentsPropsList {
    MuiRveEditor: Partial<IRveEditorProps>;
  }
  interface Components {
    MuiRveEditor?: {
      defaultProps?: ComponentsPropsList["MuiRveEditor"];
      styleOverrides?: ComponentsOverrides<Theme>["MuiRveEditor"];
      variants?: ComponentsVariants["MuiRveEditor"];
    };
  }
}
declare global {
  interface Window {
    screenShotEditorResize: () => void;
    dropzoneResize: () => void;
    ffmpeg: FFmpegConverter;
  }
}
declare module "*.module.scss";
export {};
