import { defineConfig } from "astro/config";
import { rehypeCallouts } from "./src/plugins/rehype-callouts.js";

export default defineConfig({
	markdown: {
		rehypePlugins: [rehypeCallouts]
	}
});
