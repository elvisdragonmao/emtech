import courseCssThumbnail from "../content/course/frontend/css/thumbnail.webp";
import courseJsThumbnail from "../content/course/frontend/js/thumbnail.webp";
import courseWebsiteThumbnail from "../content/course/frontend/what-is-website/thumbnail.webp";
import hackmdThumbnail from "../content/post/hackmd/thumbnail.webp";
import htmlThumbnail from "../content/post/html/thumbnail.webp";
import huskyThumbnail from "../content/post/husky/thumbnail.webp";
import repoSubpageThumbnail from "../content/post/repo-subpage/thumbnail.webp";
import sitconThumbnail from "../content/post/sitcon2026-web/thumbnail.webp";

export type PrototypeImage = typeof htmlThumbnail;

export type ArticleCard = {
	title: string;
	href: string;
	image: PrototypeImage;
	tag: string;
	description?: string;
	category?: string;
	date?: string;
	readTime?: string;
};

export type CourseCard = {
	title: string;
	description: string;
	meta: string;
	lastUpdated: string;
	href: string;
	image: PrototypeImage;
	accent: "blue" | "purple" | "yellow";
};

export type CourseModule = {
	number: string;
	title: string;
	description: string;
	duration: string;
	image: PrototypeImage;
	href: string;
};

export const stats = [
	{ label: "Post", value: "320" },
	{ label: "Course", value: "4" },
	{ label: "Lived for", value: "4y 341d" }
];

export const featuredArticles: ArticleCard[] = [
	{
		title: "如何用 CSS 裝飾 HackMD 書本模式側邊欄",
		description: "側邊欄樣式、書本模式與共筆整理技巧。",
		category: "軟體開發",
		date: "2026.05.09",
		href: "/article/",
		image: hackmdThumbnail,
		tag: "#JavaScript"
	},
	{
		title: "JavaScript 教學：從入門到精通",
		description: "從 function、DOM 到事件監聽的互動基礎。",
		category: "程式教學",
		date: "2026.04.01",
		href: "/course/javascript/",
		image: courseJsThumbnail,
		tag: "#JavaScript"
	}
];

export const archiveArticles: ArticleCard[] = [
	{
		title: "環境建置與 HTML 完全指南",
		description: "從 VS Code、瀏覽器到第一份 HTML 文件。",
		category: "程式教學",
		date: "2026.03.26",
		readTime: "48 min",
		href: "/course/",
		image: htmlThumbnail,
		tag: "#程式教學"
	},
	{
		title: "基底是獸迷文化 (Furry)？認識不獸控制的獸圈",
		description: "關於網路社群、創作與身份認同的觀察。",
		category: "生活雜談",
		date: "2026.02.18",
		readTime: "8 min",
		href: "/article/",
		image: sitconThumbnail,
		tag: "#程式故事"
	},
	{
		title: "專案仔上交大？2025 資工特殊選才紀錄",
		description: "準備資料、面試心得與專案呈現策略。",
		category: "生活駭客",
		date: "2026.01.30",
		readTime: "16 min",
		href: "/article/",
		image: repoSubpageThumbnail,
		tag: "#程式故事"
	},
	{
		title: "什麼是網站？網頁基本原理",
		description: "Request、Response、DNS 與瀏覽器如何組成網站。",
		category: "程式教學",
		date: "2026.03.26",
		readTime: "48 min",
		href: "/course/",
		image: courseWebsiteThumbnail,
		tag: "#程式教學"
	},
	{
		title: "把 GitHub Pages 從 /repo 變成 /a/b：用多個 Repo 管理同站",
		description: "一個更好維護靜態網站部署的整理方式。",
		category: "軟體開發",
		date: "2026.02.04",
		readTime: "10 min",
		href: "/article/",
		image: repoSubpageThumbnail,
		tag: "#程式教學"
	},
	{
		title: "Husky 教學：逼你的團隊給我乖乖跑檢查",
		description: "用 git hooks 把格式、測試與 lint 放進流程。",
		category: "軟體開發",
		date: "2026.01.12",
		readTime: "14 min",
		href: "/article/",
		image: huskyThumbnail,
		tag: "#軟體開發"
	}
];

export const courses: CourseCard[] = [
	{
		title: "前端網頁開發入門",
		description: "建立 HTML、CSS、JavaScript 與網頁互動的完整心智模型。",
		meta: "零基礎 / 24 H / 課程",
		lastUpdated: "2026.05.08",
		href: "/course/",
		image: courseJsThumbnail,
		accent: "blue"
	},
	{
		title: "CSS 教學：從入門到精通",
		description: "從選擇器、盒模型、Flex 到排版與視覺細節。",
		meta: "零基礎 / 6.5 H / 課程",
		lastUpdated: "2026.04.28",
		href: "/course/",
		image: courseCssThumbnail,
		accent: "purple"
	},
	{
		title: "什麼是網站？前端入門必懂",
		description: "從瀏覽器、伺服器到 DNS，建立開發前最重要的網路直覺。",
		meta: "零基礎 / 8 H / 課程",
		lastUpdated: "2026.03.26",
		href: "/course/",
		image: courseWebsiteThumbnail,
		accent: "yellow"
	},
	{
		title: "看好了 GitHub Actions，我只示範一次",
		description: "把部署和檢查自動化，讓每次 push 都更安心。",
		meta: "零基礎 / 12 H / 課程",
		lastUpdated: "2026.03.18",
		href: "/course/",
		image: repoSubpageThumbnail,
		accent: "yellow"
	},
	{
		title: "不用庫也能酷：玩轉 CSS & JS 特效",
		description: "不用框架也能做出動畫、互動和微型特效。",
		meta: "零基礎 / 20 H / 課程",
		lastUpdated: "2026.02.11",
		href: "/course/",
		image: huskyThumbnail,
		accent: "blue"
	}
];

export const courseModules: CourseModule[] = [
	{
		number: "Module 01",
		title: "什麼是網站？網頁基本原理",
		description: "理解瀏覽器、伺服器、請求與回應，建立學前端前最重要的網路直覺。",
		duration: "48 min",
		image: courseWebsiteThumbnail,
		href: "/course/"
	},
	{
		number: "Module 02",
		title: "環境建置與 HTML 完全指南",
		description: "安裝工具、建立第一份 HTML 文件，掌握標籤與內容結構。",
		duration: "48 min",
		image: htmlThumbnail,
		href: "/course/"
	},
	{
		number: "Module 03",
		title: "CSS 教學：從入門到精通",
		description: "用選擇器、盒模型、Flex 與視覺規則排出可讀、可維護的版面。",
		duration: "48 min",
		image: courseCssThumbnail,
		href: "/course/"
	},
	{
		number: "Module 04",
		title: "JavaScript 教學：從入門到精通",
		description: "從基本語法、function、DOM 操作與 event listener 做出頁面互動。",
		duration: "48 min",
		image: courseJsThumbnail,
		href: "/course/javascript/"
	}
];

export const articleMeta = [
	{ label: "Date", value: "2026.05.09" },
	{ label: "Category", value: "軟體開發" },
	{ label: "Read", value: "12 min" },
	{ label: "Word", value: "2.4k" },
	{ label: "Last Mod", value: "2026.05.09" }
];

export const relatedArticles = archiveArticles.slice(0, 3);
