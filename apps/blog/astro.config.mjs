import pagefind from "astro-pagefind";
import { defineConfig, passthroughImageService } from "astro/config";
import { fileURLToPath } from "node:url";
import { rehypeCallouts } from "./src/plugins/rehype-callouts.js";
import { rehypeCodeBlocks } from "./src/plugins/rehype-code-blocks.js";
import { rehypeImageCaptions } from "./src/plugins/rehype-image-captions.js";

export default defineConfig({
	output: "static",
	integrations: [pagefind()],
	image: {
		service: passthroughImageService()
	},
	markdown: {
		rehypePlugins: [rehypeCallouts, rehypeImageCaptions, rehypeCodeBlocks]
	},
	vite: {
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url))
			}
		}
	}
});
