import { defineConfig } from "astro/config";
import { calloutPreprocessPlugin } from "./src/plugins/callout-preprocess.js";
import { rehypeCallouts } from "./src/plugins/rehype-callouts.js";

export default defineConfig({
	vite: {
		plugins: [calloutPreprocessPlugin()]
	},
	markdown: {
		rehypePlugins: [rehypeCallouts]
	}
});
