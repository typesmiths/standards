#!/usr/bin/env node
// standards link [<dir>]: links <dir> (docs/standards) in the project to the installed rules, so
// people find them in the file tree and in search. A symlink, so it follows each new version;
// commit it once and every clone has it.
import { existsSync, lstatSync, mkdirSync, readlinkSync, symlinkSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const [command, dir = "docs/standards"] = process.argv.slice(2);
if (command !== "link") {
	console.error("Usage: standards link [<dir>]   (default: docs/standards)");
	process.exit(1);
}

const rules = resolve("node_modules/@decohere/standards/rules");
if (!existsSync(rules)) {
	console.error("Run this from the project's root, after installing @decohere/standards.");
	process.exit(1);
}
const link = resolve(dir);
const target = relative(dirname(link), rules);

const existing = lstatSync(link, { throwIfNoEntry: false });
if (existing?.isSymbolicLink() && readlinkSync(link) === target) {
	console.log(`${dir} already links to the rules.`);
} else if (existing != null) {
	console.error(
		`${dir} exists and isn't the link to the rules: move it, or pick another folder.`,
	);
	process.exit(1);
} else {
	mkdirSync(dirname(link), { recursive: true });
	symlinkSync(target, link, "dir");
	console.log(`${dir} → ${target}. Commit it.`);
}
