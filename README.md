# Typesmiths standards

The rules every Typesmiths TypeScript project follows: classes with one job each, talking through strict interfaces; files named for what they hold; modules cut by domain; tests beside the code. Each project installs them as a package and takes new versions as dependency updates, so a rule changes in one place and reaches every project through its own pull request and CI.

**[Read the rules](rules/)**, starting with [code](rules/code.md). Copy from the [samples](rules/samples.md); check against the [do's and don'ts](rules/dos-and-donts.md).

## Use it in a project

1. **Install it** as a dev dependency:

   ```bash
   pnpm add -D @decohere/standards
   ```

   Until the first npm release, install a tag from GitHub instead: `pnpm add -D github:typesmiths/standards#v0.1.0`.

2. **Point the project's agents at it.** In `AGENTS.md`, before the project's own rules:

   ```markdown
   Before changing code, read the shared rules in `node_modules/@decohere/standards/rules/README.md`,
   in the order it gives. This file adds what is particular to this project; where it is silent,
   the shared rules apply.
   ```

   Claude Code can also load them every session: in `.claude/CLAUDE.md`, add the line `@../node_modules/@decohere/standards/rules/README.md`.

3. **Take updates automatically.** Add `.github/dependabot.yml`, or add this entry to it:

   ```yaml
   version: 2
   updates:
     - package-ecosystem: npm
       directory: /
       schedule:
         interval: daily
       allow:
         - dependency-name: "@decohere/standards"
   ```

   Each new version arrives as a pull request. The [changelog](CHANGELOG.md) in it says what changed; CI runs the project's own checks against it.

4. **Link them where people look.** `pnpm exec standards link` makes `docs/standards` a link to the installed rules, so they show in the file tree and in search, and follow each new version. Commit the link. (GitHub's web view can't follow it into `node_modules`.)

5. **Keep the project's own guide short.** It lists what is particular to the project (its modules, extra file roles, where it differs on purpose) and links here for everything else. It doesn't copy these rules: a copy drifts.

## Versions

Semantic versions. A patch rewords without changing a rule. A minor adds a rule or an example. A major changes or removes a rule, so code that followed the old one breaks the new one; its changelog entry says what to change. Before 1.0, a minor may also change a rule.

## Change a rule

Open a pull request here. Say which project showed the need, and give the shape to write and the one to avoid. Add its lines to the [changelog](CHANGELOG.md). Changes collect on `main`; a release is a pull request from `main` into `release` with the version raised, and merging it puts it on npm ([publish](.github/workflows/publish.yml)), so `release` is what's on npm.

## Working on this repo

Open the folder in VS Code and choose **Reopen in Container**: the [dev container](.devcontainer/devcontainer.json) is Decohere's published image (Node and pnpm), and runs `pnpm install`; nothing is installed on the host. [AGENTS.md](AGENTS.md) has the instructions. `pnpm check` runs Prettier and checks every relative link.
