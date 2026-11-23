// Checks a release's version, so that merging it to release publishes what it should. Every merge to
// release publishes package.json's version if npm doesn't have it yet (.github/workflows/publish.yml),
// so a change to rules/ must raise the version, and every new version needs its changelog entry.
// Two changes raising to the same version can't both land: in the merge queue the second one meets
// the first's version already on npm, and fails here.
//
//   node scripts/check-version.mjs [<base>]   base: what the release is compared with (origin/release)
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

/** The x.y.z versions, highest first; prereleases (npm's placeholders) don't count. */
function releases(versions) {
	return versions
		.filter((version) => /^\d+\.\d+\.\d+$/.test(version))
		.map((version) => version.split(".").map(Number))
		.sort((a, b) => b[0] - a[0] || b[1] - a[1] || b[2] - a[2])
		.map((parts) => parts.join("."));
}

function isAbove(version, other) {
	return releases([version, other])[0] === version && version !== other;
}

/**
 * What's wrong with the change's version, or an empty list.
 *
 * @param {{ version: string, published: string[], rulesChanged: boolean, changelog: string }} change
 *   `published`: the versions on npm; `rulesChanged`: whether the change touches rules/.
 */
export function versionProblems({ version, published, rulesChanged, changelog }) {
	if (!/^\d+\.\d+\.\d+$/.test(version)) {
		return [`package.json's version, ${version}, isn't a release version (x.y.z).`];
	}
	if (published.includes(version)) {
		return rulesChanged
			? [
					`rules/ changed, but ${version} is already on npm: raise package.json's version ` +
						"(patch, minor or major: README.md#versions) and add its lines to CHANGELOG.md.",
				]
			: [];
	}
	const problems = [];
	const latest = releases(published)[0];
	if (latest != null && !isAbove(version, latest)) {
		problems.push(`${version} isn't above ${latest}, the highest version on npm.`);
	}
	const entry = new RegExp(
		`^## ${version.replaceAll(".", "\\.")}\\b.*\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`,
		"m",
	).exec(changelog);
	if (entry == null || entry[1].trim() === "") {
		problems.push(
			`CHANGELOG.md has no lines under "## ${version}": say what this version changes.`,
		);
	}
	return problems;
}

function publishedVersions(name) {
	try {
		const out = execFileSync("npm", ["view", name, "versions", "--json"], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		});
		return [JSON.parse(out)].flat();
	} catch (error) {
		if (String(error.stderr).includes("E404")) return [];
		throw error;
	}
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	const base = process.argv[2] ?? "origin/release";
	const { name, version } = JSON.parse(readFileSync("package.json", "utf8"));
	const changed = execFileSync(
		"git",
		["diff", "--name-only", `${base}...HEAD`, "--", "rules"],
		{
			encoding: "utf8",
		},
	);
	const problems = versionProblems({
		version,
		published: publishedVersions(name),
		rulesChanged: changed.trim() !== "",
		changelog: readFileSync("CHANGELOG.md", "utf8"),
	});
	if (problems.length > 0) {
		console.error(problems.join("\n"));
		process.exit(1);
	}
	console.log(`${name}@${version}: the version is right for this change.`);
}
