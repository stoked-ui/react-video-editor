import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import fixReactVirtualized from 'esbuild-plugin-react-virtualized';
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
	plugins: [react(), TanStackRouterVite(), tsconfigPaths(), nodePolyfills()],
	optimizeDeps: {
		exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util', 'vite-plugin-node-polyfills'],
		esbuildOptions: {
			plugins: [fixReactVirtualized],
		},
	},
	server: {
		strictPort: true,
		headers: {
			'Cross-Origin-Opener-Policy': 'same-origin',
			'Cross-Origin-Embedder-Policy': 'require-corp',
		},
	},
	test: {
		environment: "jsdom",
		setupFiles: ["./vitest.setup.ts"],
		css: true,
	},
	resolve: {
		alias: {
			'@components': path.resolve(__dirname, 'src/components'),
			'@styles': path.resolve(__dirname, 'src/styles'),
			'@': path.resolve(__dirname, 'src')
		}
	},
});
