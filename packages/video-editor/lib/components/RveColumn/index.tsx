import { styled } from '@mui/material/styles';
import { Divider } from '@mui/material';

/**
 * Index is a styled div component from Material UI with the following CSS properties:
 * - display: flex
 * - flexDirection: column
 *
 * These properties make the Index a flexible container in the column direction.
 * This means the children of this component will be stacked vertically.
 *
 * @component
 * @example
 * ```jsx
 * <Index>
 *   <ChildComponent />
 * </Index>
 **/

export const RveColumn = styled('div', {
  name: 'MuiRveColumn',
})(() => ({
  display: 'flex',
  flexDirection: 'column',
})) as typeof Divider;
