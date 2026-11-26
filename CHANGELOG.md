# Changelog

## 0.5.0

- Minor ([modules](rules/modules.md#how-modules-meet), [do's and don'ts](rules/dos-and-donts.md)): ask the owner for an outcome, never for its mechanism. A caller names what it wants in the owner's words; the owner decides how and from where, and tells it what happened. Never pick another module's places or steps, or find its code by a venue's name to drive it.
- Minor ([code](rules/code.md#one-class-per-job), [do's and don'ts](rules/dos-and-donts.md)): nothing above the kinds knows one of them. What one kind needs is a method every kind answers through the base, so dropping a kind drops its logic. A Safe sends what it's asked; where money goes is its owner's.
- Minor ([code](rules/code.md#methods-and-state)): a public method reads like a story, each step a call with explicit inputs and one result; state is kept on its owner as records of what was done, never inferred from other facts.
- Minor ([files and folders](rules/files-and-folders.md)): names are the domain's words, the language a developer and the product's owner share; a standard thing keeps its standard name.
- Changes rules ([tests](rules/tests.md), [files and folders](rules/files-and-folders.md#folders), [modules](rules/modules.md#inside-a-module)): only specs sit beside code; fixtures, fakes, harnesses and contract tests go in `__fixtures__` beside the spec that needs them, and `testing/` holds only the stand-ins a module publishes for others. `.cases.ts` becomes `.contract-test.ts`: it's a contract test. To change: move each test-only file next to the spec that uses it and rename `.cases.ts` files.
- Changes rules ([tests](rules/tests.md)): one watch runs the tests your saves touch while you work, instead of batching and testing once at the end; isolate a failure by reading the code and writing the smallest test, never by rerunning. Behaviour is proved in milliseconds (no simulated waits), browser tests prove screens, and tests check what the code decides, not that a framework works. A neighbour the code asks is a fake that answers; a throwing stand-in only for one it must never reach.
- Minor ([changing code](rules/changing-code.md)): build the final state only, with no code for leftovers; finish a change whole before showing it.

## 0.4.0

- Minor, changes rules ([modules](rules/modules.md#inside-a-module)): the domain is pure domain logic and imports no contract type; dependencies run `domain ← api → contracts`. Each aggregate's API is an interface in the contracts; a provider in the api implements it, calls the domain's services, which return domain objects, and is the only place that maps them to the contract's types. Controllers and bus handlers stay thin: they call the provider. Another module injects the same interface: the provider in one process, an HTTP client calling the controller once the modules are separate services, so it gets the same answer either way. Queries go direct through the interface; copies fed by events only for hot reads; contracts are plain data written to travel. Each shape is declared once, in the contracts: a request is one class for the controller and the client, carrying the HTTP framework's decorators, the one dependency a contracts package may take. An entity carries its table mapping as ORM decorators on itself; no separate mapping class.
- Minor: [lifetimes](rules/code.md#lifetimes): services per piece of work, singletons only for app-wide state and never a domain fact, a scope begun per piece of work through an injected scope factory, hosted services as thin wrappers.
- Minor: [tests](rules/tests.md): batch the work and test once at the end; the module's whole suite and the full suite are CI's.
- Minor: every `if`, `else` and loop body is a block in braces ([code](rules/code.md#language), [do's and don'ts](rules/dos-and-donts.md)), so a line added later can't sit outside its condition while looking inside it. Lint it with `curly: "all"`. The samples follow it.

## 0.3.0

- Minor: `pnpm exec standards link` links `docs/standards` in a project to the installed rules, so people find them in the file tree and in search ([use it in a project](README.md#use-it-in-a-project)).

## 0.2.0 (2026-11-23)

- Minor: every file role has its own row and one meaning ([files and folders](rules/files-and-folders.md#file-names)). `.entity` is any object with an identity and a lifecycle, a library's (a transaction) as well as an app's domain objects. A `.command` is the request as data and holds no behaviour; on a command line, its `.action` carries it out. `.host` runs other services, `.module` is wiring for the container or the command line, and `.builder`, `.registry` and `.mapping` each say what sets them apart.

## 0.1.0 (2026-11-22)

The first rules, from Decohere's code design and ledger's domain design: code (one class per job, loose functions, names, errors, the environment), files and folders, modules, tests, changing existing code, samples, and do's and don'ts.
