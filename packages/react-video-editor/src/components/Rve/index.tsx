/**
 * Index component
 *
 * This component is responsible for rendering the main editor interface for the RVE (React Video Editor).
 * It uses several child components to build up the interface, including a toolbar, a file list, a timeline, and a dropzone for file uploads.
 *
 * The component also includes a styled root element, which is styled based on the `variant` prop.
 *
 * @component
 * @example
 * <Index meta="left" variant="padded" padding="10px" />
 */
import type { FC, HTMLProps, ReactNode } from "react";
import { RveProvider, useRveContext } from './RveProvider';
import './Rve.scss';
import { styled, useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import RveDropzone from '@components/RveDropzone';
import RveToolbar from '@components/RveToolbar';
import RveRow from '@components/RveRow';
import RveFileLists from '@components/RveFileList';
import RveTimeline from '@components/RveTimeline';
import type { PlyrProps } from 'plyr-react';

/**
 * Type for the meta prop, which determines the position of the meta column.
 */
type LeftRightProps = 'left' | 'right';

/**
 * Props for the Index component.
 */
export interface IRveEditorProps extends HTMLProps<HTMLButtonElement> {
  meta?: LeftRightProps;
  padding?: string;
  variant?: 'padded' | 'minimized';
}

/**
 * @extends IRveEditorProps
 */
export interface RveEditorOwnerState extends IRveEditorProps {
  // …key value pairs for the internal state that you want to style the slot
  // but don't want to expose to the users
}

/**
 * @type {IRveEditorProps}
 */
export const RveEditorPropsDefault: IRveEditorProps = {
  meta: 'left',
  variant: 'padded',
  padding: '10px',
};

const RveEditorRoot = styled('div', {
  name: 'MuiRveEditorRoot',
  slot: 'root',
})<{ ownerState: RveEditorOwnerState }>(({ theme, ownerState }) => ({
  ...(ownerState.variant === 'padded' && {
    backgroundColor: theme.palette.background.paper,
    padding: ownerState.padding,
  }),
  ...(ownerState.variant === 'minimized' && {
    padding: '0',
  }),
}));

/**
 * @type {React.FC<IRveEditorProps & PlyrProps>}
 */
const RveEditorLayout: FC<IRveEditorProps & PlyrProps> = ({
  meta = RveEditorPropsDefault.meta,
  padding = RveEditorPropsDefault.padding,
  variant = RveEditorPropsDefault.variant,
  className,
  source,
  options,
}: IRveEditorProps & PlyrProps) => {
  const theme = useTheme();
  const editorCtx = useRveContext();
  const first = editorCtx.first();
  const textCls =
    theme.palette.mode === 'dark' ? '.dark .text-field' : '.light .text-field';
  const metaColumn = (
    <div className={'rve-meta'}>
      <TextField
        required
        id="title"
        label="Title"
        variant={'outlined'}
      />
      <TextField
        id="description"
        multiline={true}
        rows={4}
        label="Description"
        variant={'outlined'}
        className={textCls}
      />
    </div>
  );

  const ColumnLeft = (): ReactNode => (meta === 'left' && first ? metaColumn : <></>);
  const ColumnRight = (): ReactNode => (meta === 'right' && first ? metaColumn : <></>);

  if (!editorCtx.originals?.length) {
    return <div className={`fullscreen-wrap ${theme.palette.mode}`}>
      <RveDropzone/>
    </div>;
  }
  return (
    <RveEditorRoot
        className={`rve ${theme.palette.mode} ${className}`}
      ownerState={{ padding, meta, variant }}
    >
      <RveRow className={'rve-primary-row'}>
        <ColumnLeft />

        <ColumnRight />
      </RveRow>
      {/*<RveToolbar />*/}
      <RveFileLists />
    </RveEditorRoot>
  );
};

/**
 * @type {React.FC<IRveEditorProps & PlyrProps>}
 */
const Rve: FC<IRveEditorProps & PlyrProps> = (
  props: IRveEditorProps & PlyrProps
) => {
  return (
    <RveProvider>
      <RveEditorLayout {...props} />
    </RveProvider>
  );
};

export default Rve;
