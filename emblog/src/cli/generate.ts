import { runGenerator } from "../core/generator.js";

runGenerator().catch(() => {
	process.exitCode = 1;
});
