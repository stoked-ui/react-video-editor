import { MouseEvent, useCallback } from "react";
import { useState, forwardRef } from 'react';
import { useRveContext } from '../Rve/RveProvider';
import { styled, useThemeProps } from '@mui/material/styles';
import { CloudUpload } from '@mui/icons-material';
import ThemeToggle from '../ThemeToggle';
import '@styles/tailwind.css';
import './RveDropzone.scss';
import type { FileWithPath} from "react-dropzone";
import { useDropzone } from "react-dropzone";

/**
 * RveDropzoneProps interface
 * @interface
 * @property {string} variant - The variant of the dropzone, can be 'padded' or 'minimized'
 */
export interface RveDropzoneProps {
  variant?: 'padded' | 'minimized';
}

/**
 * RveDropzoneOwnerState interface
 * @interface
 * @extends RveDropzoneProps
 */
interface RveDropzoneOwnerState extends RveDropzoneProps {
  // …key value pairs for the internal state that you want to style the slot
  // but don't want to expose to the users
}

const RveDropzoneRoot = styled('div', {
  name: 'MuiRveDropzone',
  slot: 'root',
})<{ ownerState: RveDropzoneOwnerState }>(({ ownerState }) => ({
  ...(ownerState.variant === 'padded' && {
    padding: `10px`,
  }),
}));

/**
 * RveDropzoneComponent function
 * @function
 * @param {object} inProps - The initial properties
 * @param {ref} ref - The reference to the component
 * @returns {JSX.Element} - The rendered component
 */
const RveDropzoneComponent = forwardRef<HTMLDivElement, RveDropzoneProps>(
  function RveDropzoneComponent(inProps, ref) {

    const props = useThemeProps({ props: inProps, name: 'MuiRveDropzone' });
    const { variant } = props;
    const ownerState = { ...props, variant };
    const editorCtx = useRveContext();

    const [cssModifier, setCssModifier] = useState<string>('');
    const [dragging, setDragging] = useState<boolean>(false);

    const onDrop = useCallback(async (acceptedFiles: FileWithPath[]) => {
      await editorCtx.addFiles(acceptedFiles);
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
    const { getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

    if (!dragging && isDragActive) {
      setDragging(true);
      setCssModifier(' drop-drag');
    } else if (dragging && !isDragActive) {
      setDragging(false);
      setCssModifier('');
    }

    const dismissClick = (event: MouseEvent<HTMLDivElement>): void => {
      event.preventDefault();
    };

    if (!editorCtx?.loaded) {
      return <>loading ffmpeg</>;
    }

    return (
      <RveDropzoneRoot
        ref={ref}
        {...props}
        ownerState={ownerState}
        className={'rve-dropzone-root'}
      >
        <div
          className={`rve-dropzone drop-hover${cssModifier}`}
          { ...getRootProps() }
        >
          <input {...getInputProps()} />
          <div className={"drop-inner"} onClick={dismissClick}>
            <span className={"drag-drop"}>drag and drop files</span>
            <span className={"click-select mx-[1.5rem] my-[1rem]"}>
              click to select files
            </span>
            <ThemeToggle
              sx={{ padding: "8px", position: "absolute", right: "0" }}
            />
            <CloudUpload className={"upload-icon"} />
          </div>
        </div>
      </RveDropzoneRoot>);
  }
);

/**
 * RveDropzoneFullTemplate function
 * @function
 * @param {object} props - The properties
 * @returns {JSX.Element} - The rendered component
 */
export default RveDropzoneComponent;
