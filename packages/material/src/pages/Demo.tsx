import React from "react";
import { MaterialUiDemo } from "./MaterialUiDemo.tsx";
import { BasicDemo } from "./BasicDemo.tsx";

export const DemoImplementations: React.FC = () => {
	try {
		// Attempt to import the peer dependency
		import('@mui/material');

		return <MaterialUiDemo />
	} catch (e) {
		// Handle the case where the peer dependency is not available
		console.error('Peer dependency not found or failed to load:', e);
	}

	return <BasicDemo/>;
};
