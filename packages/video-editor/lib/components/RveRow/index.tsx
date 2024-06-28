// Importing the styled function from @mui/material/styles
import { styled } from '@mui/material/styles';
import { Divider } from '@mui/material';

/**
 * Index is a styled div component from Material UI with the following CSS properties:
 * - display: flex
 * - flexDirection: row
 *
 * The name of the component is 'MuiRveRow'.
 *
 * @component
 * @example
 * ```jsx
 * <Index>
 *   <div>Child 1</div>
 *   <div>Child 2</div>
 * </Index>
 **/

export const RveRow = styled('div', {
  name: 'MuiRveRow',
})(() => ({
  display: 'flex',
  flexDirection: 'row',
})) as typeof Divider

export default RveRow;
