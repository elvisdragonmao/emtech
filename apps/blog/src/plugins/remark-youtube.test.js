import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { remarkYoutube } from "./remark-youtube.js";

const paragraph = value => ({ type: "paragraph", children: [{ type: "text", value }] });

const transform = children => {
	const tree = { type: "root", children };
	const file = {
		fail(message) {
			throw new Error(message);
		}
	};

	remarkYoutube()(tree, file);
	return tree;
};

const youtubeShortcode = (attributes = 'id="3NV8ZQtfQm0" title="HTML 基礎教學影片"') => paragraph(`{{youtube ${attributes}}}`);

describe("remarkYoutube", () => {
	it("creates a privacy-enhanced, accessible embed", () => {
		const embed = youtubeShortcode();
		transform([embed]);

		assert.equal(embed.data.hName, "iframe");
		assert.deepEqual(embed.data.hChildren, []);
		assert.deepEqual(embed.children, []);
		assert.deepEqual(embed.data.hProperties, {
			className: ["youtube-embed"],
			src: "https://www.youtube-nocookie.com/embed/3NV8ZQtfQm0",
			title: "HTML 基礎教學影片",
			width: 1280,
			height: 720,
			loading: "lazy",
			frameBorder: 0,
			allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
			referrerPolicy: "strict-origin-when-cross-origin",
			allowFullScreen: true
		});
	});

	it("accepts the typographic quotes produced by Astro smartypants", () => {
		const embed = youtubeShortcode("id=“3NV8ZQtfQm0” title=“The Chainsmokers – Don’t Let Me Down”");
		transform([embed]);

		assert.equal(embed.data.hProperties.src, "https://www.youtube-nocookie.com/embed/3NV8ZQtfQm0");
		assert.equal(embed.data.hProperties.title, "The Chainsmokers – Don’t Let Me Down");
	});

	it("automatically links an immediately following video description", () => {
		const embed = youtubeShortcode();
		const description = paragraph("影片替代內容：這支影片介紹 HTML 基礎。");
		transform([embed, description]);

		assert.equal(embed.data.hProperties.ariaDescribedBy, "youtube-3NV8ZQtfQm0-description");
		assert.equal(description.data.hProperties.id, "youtube-3NV8ZQtfQm0-description");
	});

	it("does not link ordinary following prose as a description", () => {
		const embed = youtubeShortcode();
		const prose = paragraph("接下來繼續閱讀文章內容。");
		transform([embed, prose]);

		assert.equal(embed.data.hProperties.ariaDescribedBy, undefined);
		assert.equal(prose.data, undefined);
	});

	it("requires an 11-character video id", () => {
		assert.throws(() => transform([youtubeShortcode('id="too-short" title="影片"')]), /valid 11-character video `id`/);
	});

	it("requires an accessible title", () => {
		assert.throws(() => transform([youtubeShortcode('id="3NV8ZQtfQm0"')]), /accessible `title`/);
	});

	it("rejects unknown and duplicate attributes", () => {
		assert.throws(() => transform([youtubeShortcode('id="3NV8ZQtfQm0" title="影片" autoplay="true"')]), /Unsupported.*autoplay/);
		assert.throws(() => transform([youtubeShortcode('id="3NV8ZQtfQm0" id="lOecpIqOjjY" title="影片"')]), /Duplicate.*id/);
	});

	it("ignores shortcode text inside inline code", () => {
		const inlineCode = {
			type: "paragraph",
			children: [{ type: "inlineCode", value: '{{youtube id="3NV8ZQtfQm0" title="影片"}}' }]
		};
		transform([inlineCode]);

		assert.equal(inlineCode.data, undefined);
	});
});
