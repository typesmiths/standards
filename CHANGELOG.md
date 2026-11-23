# Changelog

## 0.4.0

- Minor: every `if`, `else` and loop body is a block in braces ([code](rules/code.md#language), [do's and don'ts](rules/dos-and-donts.md)), so a line added later can't sit outside its condition while looking inside it. Lint it with `curly: "all"`. The samples follow it.

## 0.3.0

- Minor: `pnpm exec standards link` links `docs/standards` in a project to the installed rules, so people find them in the file tree and in search ([use it in a project](README.md#use-it-in-a-project)).

## 0.2.0 (2026-11-23)

- Minor: every file role has its own row and one meaning ([files and folders](rules/files-and-folders.md#file-names)). `.entity` is any object with an identity and a lifecycle, a library's (a transaction) as well as an app's domain objects. A `.command` is the request as data and holds no behaviour; on a command line, its `.action` carries it out. `.host` runs other services, `.module` is wiring for the container or the command line, and `.builder`, `.registry` and `.mapping` each say what sets them apart.

## 0.1.0 (2026-11-22)

The first rules, from Decohere's code design and ledger's domain design: code (one class per job, loose functions, names, errors, the environment), files and folders, modules, tests, changing existing code, samples, and do's and don'ts.
