# Typesmiths standards

Shared rules for Typesmiths' TypeScript projects, published to npm as `@decohere/standards`. The rules are Markdown in `rules/`; projects install the package and read them from `node_modules`. `.claude/CLAUDE.md` only imports this file.

## Writing rules

- **Every rule is general.** A rule here applies to every project. What one project alone needs belongs in that project's guide; a project-specific example is fine when it shows a general rule.
- **Every rule has its reason or its shape.** Say why, or show the code to write and the code to avoid.
- **One home per rule.** A rule lives on one page; other pages link to it.
- **No issue or PR numbers in the rules.** Say the reason in words. The link to a discussion goes in the commit and the PR.
- **Plain words**, for a developer or an agent new to the project.

## Releasing

Edits collect on `main`, unreleased. A change to `rules/` adds its lines to [CHANGELOG.md](CHANGELOG.md) under the next version's heading, `## x.y.z`, saying whether it is a patch, minor or major ([versions](README.md#versions)). To release, raise `version` in `package.json` on `main` to match, then open a pull request from `main` into `release` and add it to the merge queue. The merge publishes: [publish](.github/workflows/publish.yml) puts the version on npm and tags it `v<version>`, so `release` is what's on npm. CI fails a release that changes `rules/` but keeps a version npm already has. Never publish or tag by hand.

## Checks

`pnpm check`: Prettier and relative links. `pnpm test`: the scripts' tests. `pnpm check:version`: whether the version is right for your change, against `origin/release`. Run them before committing.
