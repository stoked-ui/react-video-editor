// Importing the styled function from @mui/material/styles
import { styled } from '@mui/material/styles';

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
const RveRow = styled('div', {
  name: 'MuiRveRow',
})(() => ({
  display: 'flex',
  flexDirection: 'row',
}));

export default RveRow;
