import type React from 'react';
import type { MouseEvent } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import { useState } from 'react';
import { useRveContext } from '../Rve/RveProvider';
import { styled } from '@mui/material/styles';
import { CloudUpload } from '@mui/icons-material';
import { RveThemeToggle } from '../RveThemeToggle';
import '../../styles/tailwind.css';
import './RveDropzone.scss';
import invariant from 'tiny-invariant';
import type { jsx } from '@emotion/react';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { dropTargetForExternal, monitorForExternal } from '@atlaskit/pragmatic-drag-and-drop/external/adapter';
import { containsFiles } from '@atlaskit/pragmatic-drag-and-drop/external/file';
import { preventUnhandled } from '@atlaskit/pragmatic-drag-and-drop/prevent-unhandled';
import { fromEvent } from '@stokedui/file-selector';
import type { FileWithPath } from '@stokedui/file-selector';

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

type UserUpload = {
  type: 'image';
  dataUrl: string;
  name: string;
  size: number;
};

/**
 * RveDropzoneComponent function
 * @function
 * @param {object} inProps - The initial properties
 * @param {ref} ref - The reference to the component
 * @returns {JSX.Element} - The rendered component
 */
function RveDropzoneComponent(inProps: RveDropzoneProps): jsx.JSX.Element {
  const editorCtx = useRveContext();
  const ref = useRef<HTMLDivElement | null>(null);
  const [cssModifier, setCssModifier] = useState<string>('');
  const [uploads, setUploads] = useState<UserUpload[]>([]);

  /**
   * Creating a stable reference so that we can use it in our unmount effect.
   *
   * If we used uploads as a dependency in the second `useEffect` it would run
   * every time the uploads changed, which is not desirable.
   */
  const stableUploadsRef = useRef<UserUpload[]>(uploads);
  useEffect(() => {
    stableUploadsRef.current = uploads;
  }, [uploads]);

  useEffect(() => {
    return () => {
      /**
       * MDN recommends explicitly releasing the object URLs when possible,
       * instead of relying just on the browser's garbage collection.
       */
      stableUploadsRef.current.forEach(upload => {
        URL.revokeObjectURL(upload.dataUrl);
      });
    };
  }, []);

  const addUpload = useCallback((file: File | null) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      return;
    }

    const upload: UserUpload = {
      type: 'image',
      dataUrl: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    };
    setUploads(current => [...current, upload]);
  }, []);

  const onFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.currentTarget.files ?? []);
      files.forEach(addUpload);
    },
    [addUpload]
  );


  useEffect(() => {
    if (!ref.current) return () => undefined;
    const el = ref.current;
    invariant(el);
    return combine(
      dropTargetForExternal({
        element: el,
        canDrop: containsFiles,
        onDragEnter: event => {
          console.log('on drag leave event', event);
          setCssModifier(' drop-drag');
          console.log('drag-drop');
        },
        onDragLeave: event => {
          console.log('on drag leave event', event);
          setCssModifier('');
        },
        onDrop: event => {
          fromEvent(event).then((files) => {
            if (files.data[0] as FileWithPath) {
              editorCtx.addFiles(files.data as FileWithPath[]).catch((error) => {
                console.log(error);
              })
            }
            console.log('external drop', files);
          });


          // await editorCtx.addFiles(files);
          /*files.forEach((file) => {
						if (file == null) {
							return;
						}
						if (!file.type.startsWith("image/")) {
							return;
						}
						//const reader = new FileReader();
						//reader.readAsDataURL(file);
						const upload: UserUpload = {
							type: "image",
							dataUrl: URL.createObjectURL(file),
							name: file.name,
							size: file.size,
						};
						console.log("upload", upload);
						setUploads((current) => [...current, upload]);
					});*/
        },
      }),
      monitorForExternal({
        canMonitor: containsFiles,
        onDragStart: () => {
          /*setState("potential");*/
          setCssModifier(' drop-drag');
          preventUnhandled.start();
        },
        onDrop: () => {
          /*setState("idle");*/
          setCssModifier('');
          preventUnhandled.stop();
        },
      })
    );
  });

  const dismissClick = (event: MouseEvent<HTMLDivElement>): void => {
    event.preventDefault();
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const onInputTriggerClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  /*const { refKey, ...input } = getInputProps();*/
  return (
    <>
      <RveDropzoneRoot ownerState={inProps} className={'rve-dropzone-root'}>
        <div className={`rve-dropzone drop-hover${cssModifier}`} ref={ref} onClick={onInputTriggerClick}>
          <input ref={inputRef} className={'dropzone-input'} id="file-input" onChange={onFileInputChange} type="file" accept="image/*" multiple />
          <div className={'drop-inner'} onClick={dismissClick}>
            <span className={'drag-drop'}>drag and drop files</span>
            <span className={'click-select mx-[1.5rem] my-[1rem]'}>click to select files</span>
            <RveThemeToggle sx={{ padding: '8px', position: 'absolute', right: '0' }} />
            <CloudUpload className={'upload-icon'} />
          </div>
        </div>
      </RveDropzoneRoot>
    </>
  );
}

/**
 * RveDropzoneFullTemplate function
 * @function
 * @param {object} props - The properties
 * @returns {JSX.Element} - The rendered component
 */
export default RveDropzoneComponent;
