import { defineConfig } from "vite";

export default defineConfig({
	publicDir: false,
	build: {
		lib: {
			entry: "src/components/reactionDisplay.ts",
			name: "ReactionDisplay",
			fileName: "reaction-display",
			formats: ["iife"],
		},
		outDir: "public",
		emptyOutDir: false,
	},
});
