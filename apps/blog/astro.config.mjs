import pagefind from "astro-pagefind";
import { defineConfig, passthroughImageService } from "astro/config";
import { fileURLToPath } from "node:url";
import { rehypeAccessibleEmbeds, remarkAccessibleRawHtml, remarkNormalizeContentHeadings } from "./src/plugins/rehype-accessible-embeds.js";
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
		remarkPlugins: [remarkAccessibleRawHtml, remarkNormalizeContentHeadings],
		rehypePlugins: [rehypeCallouts, rehypeImageCaptions, rehypeAccessibleEmbeds, rehypeCodeBlocks]
	},
	vite: {
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url))
			}
		}
	}
});
