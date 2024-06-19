export type FunctionComponent = React.ReactElement | null;

type HeroIconSVGProps = React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> &
	React.RefAttributes<SVGSVGElement>;
type IconProps = HeroIconSVGProps & {
	title?: string;
	titleId?: string;
};
export type Heroicon = React.FC<IconProps>;

import type {
	ComponentsOverrides,
	ComponentsVariants,
	Theme as MuiTheme,
} from '@mui/material/styles';
/*import type { RveDropzoneProps } from '@components/RveDropzone';*/

import type { IRveEditorProps } from '@components/Rve';
// Declare png module
declare module '*.png';

// Declare svg module
declare module '*.svg';

type Theme = Omit<MuiTheme, 'components'>;

declare module '@mui/material/styles' {
	interface TypeBackground {
		contrast: string;
		default: string;
		paper: string;
	}

	interface ComponentNameToClassKey {
		MuiRveEditor: 'padding';
		MuiRveVideo: 'root' | 'value';
		MuiRveDropzone: 'root';
	}

	interface ComponentsPropsList {
		MuiRveEditor: Partial<IRveEditorProps>;
		/*MuiRveDropzone: Partial<RveDropzoneProps>;*/
	}

	interface Components {
		MuiRveEditor?: {
			defaultProps?: ComponentsPropsList['MuiRveEditor'];
			styleOverrides?: ComponentsOverrides<Theme>['MuiRveEditor'];
			variants?: ComponentsVariants['MuiRveEditor'];
		};
		/*MuiRveDropzone?: {
			defaultProps?: ComponentsPropsList['MuiRveDropzone'];
			styleOverrides?: ComponentsOverrides<Theme>['MuiRveDropzone'];
			variants?: ComponentsVariants['MuiRveDropzone'];
		};*/
	}
}

declare global {
	interface Window {
		screenShotEditorResize: () => void;
		dropzoneResize: () => void;
	}
}

declare module '*.module.scss';
