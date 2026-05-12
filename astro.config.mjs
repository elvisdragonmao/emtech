import { defineConfig } from "astro/config";
import { rehypeCallouts } from "./src/plugins/rehype-callouts.js";
import { rehypeImageCaptions } from "./src/plugins/rehype-image-captions.js";

export default defineConfig({
	markdown: {
		rehypePlugins: [rehypeCallouts, rehypeImageCaptions]
	}
});
