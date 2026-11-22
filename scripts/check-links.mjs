// Fails when a relative link in a Markdown file points at a file that doesn't exist.
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";

function markdownFiles(dir) {
	return readdirSync(dir).flatMap((name) => {
		if (name.startsWith(".") || name === "node_modules") return [];
		const path = join(dir, name);
		if (statSync(path).isDirectory()) return markdownFiles(path);
		return name.endsWith(".md") ? [path] : [];
	});
}

const broken = markdownFiles(".").flatMap((file) => {
	const text = readFileSync(file, "utf8").replace(/```[\s\S]*?```/g, "");
	return [...text.matchAll(/\]\(([^)\s]+)\)/g)]
		.map((match) => match[1])
		.filter((target) => !/^(https?:|mailto:|#)/.test(target))
		.filter((target) => !existsSync(join(dirname(file), target.split("#")[0])))
		.map((target) => `${file}: ${target}`);
});

if (broken.length > 0) {
	console.error(`Broken links:\n${broken.join("\n")}`);
	process.exit(1);
}
