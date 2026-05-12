import { defineConfig, passthroughImageService } from "astro/config";
import { rehypeCallouts } from "./src/plugins/rehype-callouts.js";
import { rehypeCodeBlocks } from "./src/plugins/rehype-code-blocks.js";
import { rehypeImageCaptions } from "./src/plugins/rehype-image-captions.js";

export default defineConfig({
	image: {
		service: passthroughImageService()
	},
	markdown: {
		rehypePlugins: [rehypeCallouts, rehypeImageCaptions, rehypeCodeBlocks]
	}
});
