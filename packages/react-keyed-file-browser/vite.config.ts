import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { transformWithEsbuild } from "vite";
import { defineConfig } from "vitest/config";
import path from "node:path";
import { nodePolyfills } from "vite-plugin-node-polyfills";
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		{
			name: 'treat-js-files-as-jsx',
			async transform(code, id) {
				if (!id.match(/src\/.*\.js$/))  return null

				// Use the exposed transform from vite, instead of directly
				// transforming with esbuild
				return transformWithEsbuild(code, id, {
					loader: 'jsx',
					jsx: 'automatic',
				})
			},
		},
		react(), TanStackRouterVite(), nodePolyfills()],
	server: {
		host: true,
		strictPort: true,
	},
	test: {
		environment: "jsdom",
		setupFiles: ["./vitest.setup.ts"],
		css: true,
	},
	build: {
		sourcemap: true,
		lib: {
			entry: path.resolve(__dirname, 'src/lib.ts'),
			name: 'react-keyed-file-browser',
		},
		rollupOptions: {
			external: [/date-fns/, /vite-plugin-node-polyfills/],
			output: {
				globals: {
					"date-fns": "dateFns",
				}
			}
		},
	},
});
