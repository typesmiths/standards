# Typesmiths standards

Shared rules for Typesmiths' TypeScript projects, published to npm as `@decohere/standards`. The rules are Markdown in `rules/`; projects install the package and read them from `node_modules`. `.claude/CLAUDE.md` only imports this file.

## Writing rules

- **Every rule is general.** A rule here applies to every project. What one project alone needs belongs in that project's guide; a project-specific example is fine when it shows a general rule.
- **Every rule has its reason or its shape.** Say why, or show the code to write and the code to avoid.
- **One home per rule.** A rule lives on one page; other pages link to it.
- **No issue or PR numbers in the rules.** Say the reason in words. The link to a discussion goes in the commit and the PR.
- **Plain words**, for a developer or an agent new to the project.

## Releasing

A change to `rules/` adds a line to [CHANGELOG.md](CHANGELOG.md) under "Unreleased", and says whether it is a patch, minor or major ([versions](README.md#versions)). A release bumps `package.json`, moves the "Unreleased" lines under the new version, and pushes a `v<version>` tag. The publish workflow does the rest; never publish by hand.

## Checks

`pnpm check`: Prettier and relative links. Run it before committing.
