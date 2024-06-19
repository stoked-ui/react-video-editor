import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, type createRouter } from "@tanstack/react-router";
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import { ColorModeContext } from '@components/ThemeToggle';
import useRveTheme from '@hooks/useRveTheme';
import type { FunctionComponent } from "./common/types";

const queryClient = new QueryClient();

type AppProps = { router: ReturnType<typeof createRouter> };

const App = ({ router }: AppProps): FunctionComponent => {
	const { theme: theme, colorMode } = useRveTheme();
	return (
		<QueryClientProvider client={queryClient}>
			<RouterProvider router={router} />
			{/* <TanStackRouterDevelopmentTools
				router={router}
				initialIsOpen={false}
				position="bottom-right"
			/>
			<ReactQueryDevtools initialIsOpen={false} /> */}
			<StyledEngineProvider>
				<ColorModeContext.Provider value={colorMode}>
					<ThemeProvider theme={theme}>
						<CssBaseline />
						{/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}

					</ThemeProvider>
				</ColorModeContext.Provider>
			</StyledEngineProvider>
		</QueryClientProvider>
	);
};

export default App;
