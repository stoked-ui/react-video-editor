import { createFileRoute } from "@tanstack/react-router";
import { Demo } from "../pages/Demo.tsx";

export const Route = createFileRoute("/")({
	component: Demo,
});
