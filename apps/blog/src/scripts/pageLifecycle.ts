type Cleanup = () => void;
type Setup = () => void | Cleanup;

declare global {
	interface Window {
		__emtechPageScriptCleanups?: Map<string, Cleanup>;
		__emtechPageLifecycleInstalled?: boolean;
	}
}

const getCleanups = () => {
	window.__emtechPageScriptCleanups ??= new Map<string, Cleanup>();
	return window.__emtechPageScriptCleanups;
};

const cleanup = (key: string) => {
	const cleanups = getCleanups();
	cleanups.get(key)?.();
	cleanups.delete(key);
};

const cleanupAll = () => {
	const cleanups = getCleanups();
	for (const runCleanup of cleanups.values()) {
		runCleanup();
	}
	cleanups.clear();
};

const installPageLifecycle = () => {
	if (window.__emtechPageLifecycleInstalled) return;
	window.__emtechPageLifecycleInstalled = true;
	document.addEventListener("astro:before-swap", cleanupAll);
};

export const setupPageLifecycle = (key: string, setup: Setup) => {
	installPageLifecycle();

	const run = () => {
		cleanup(key);
		const runCleanup = setup();
		if (typeof runCleanup === "function") {
			getCleanups().set(key, runCleanup);
		}
	};

	document.addEventListener("astro:page-load", run);
	run();
};
