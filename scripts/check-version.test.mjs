import { deepStrictEqual, match } from "node:assert";
import { describe, it } from "node:test";
import { versionProblems } from "./check-version.mjs";

const changelog =
	"# Changelog\n\n## 0.2.0\n\nA new rule.\n\n## 0.1.0 (2026-11-22)\n\nThe first rules.\n";

describe("versionProblems", () => {
	it("passes a new version above npm's, with its changelog lines", () => {
		deepStrictEqual(
			versionProblems({
				version: "0.2.0",
				published: ["0.0.0-stage", "0.1.0"],
				rulesChanged: true,
				changelog,
			}),
			[],
		);
	});

	it("passes a change outside rules/ that keeps the published version", () => {
		deepStrictEqual(
			versionProblems({
				version: "0.1.0",
				published: ["0.1.0"],
				rulesChanged: false,
				changelog,
			}),
			[],
		);
	});

	it("fails a change to rules/ that keeps the published version", () => {
		const [problem] = versionProblems({
			version: "0.1.0",
			published: ["0.1.0"],
			rulesChanged: true,
			changelog,
		});
		match(problem, /rules\/ changed, but 0\.1\.0 is already on npm/);
	});

	it("fails the second of two changes raising to the same version, once the first is on npm", () => {
		const [problem] = versionProblems({
			version: "0.2.0",
			published: ["0.1.0", "0.2.0"],
			rulesChanged: true,
			changelog,
		});
		match(problem, /0\.2\.0 is already on npm/);
	});

	it("fails a version not above npm's highest", () => {
		const [problem] = versionProblems({
			version: "0.2.0",
			published: ["0.10.0"],
			rulesChanged: true,
			changelog,
		});
		match(problem, /isn't above 0\.10\.0/);
	});

	it("fails a new version with no changelog lines", () => {
		const empty = "# Changelog\n\n## 0.2.0\n\n## 0.1.0\n\nThe first rules.\n";
		const [problem] = versionProblems({
			version: "0.2.0",
			published: ["0.1.0"],
			rulesChanged: true,
			changelog: empty,
		});
		match(problem, /no lines under "## 0\.2\.0"/);
	});

	it("passes the first version of a package not on npm yet", () => {
		deepStrictEqual(
			versionProblems({ version: "0.2.0", published: [], rulesChanged: true, changelog }),
			[],
		);
	});
});
