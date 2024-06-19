import { createFileRoute } from "@tanstack/react-router";
import { Demo } from "../pages/Demo";

export const Route = createFileRoute("/")({
	component: Demo,

});
