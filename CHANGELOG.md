# Changelog

## 0.5.0

- Minor ([modules](rules/modules.md#model-the-real-world-process), [do's and don'ts](rules/dos-and-donts.md)): model the real-world process. Code describes how the business works (who owns what, who decides, what happens next), not how the database, an exchange or a blockchain works. Infrastructure is a tool underneath, behind interfaces the domain defines; don't code to the database. This is the rule the others serve.
- Minor ([modules](rules/modules.md#how-modules-meet), [do's and don'ts](rules/dos-and-donts.md)): ask another module for what you want, not how to do it. It decides how and tells you what happened.
- Minor ([code](rules/code.md#one-class-per-job), [do's and don'ts](rules/dos-and-donts.md)): code that only one type needs goes in that type's class; shared code calls a method on the object and never checks which type it has. A Safe sends money where it's told; deciding where is not its job.
- Minor ([code](rules/code.md#methods-and-state)): keep public methods short, like a list of steps; store a status instead of working it out from other data.
- Minor ([files and folders](rules/files-and-folders.md)): use the words the business uses, and standard names where they exist.
- Changes rules ([tests](rules/tests.md), [files and folders](rules/files-and-folders.md#folders), [modules](rules/modules.md#inside-a-module)): only spec files go next to the code; test data, fakes, setups and contract tests go in `__fixtures__` next to the spec, and `testing/` holds only fakes other modules' tests use. `.cases.ts` is now `.contract-test.ts`. To update a project: move each such file next to the spec that uses it, and rename its `.cases.ts` files.
- Changes rules ([tests](rules/tests.md)): keep one test watcher running while you work, instead of testing once at the end. When a test fails, find the cause instead of rerunning. Tests run in milliseconds; browser tests check the screen. Test your code, not the framework. Fake what the code calls; block what it shouldn't.
- Minor ([changing code](rules/changing-code.md)): only build the end result, finish the whole change before showing it, and expand schemas before contracting them so deployed versions keep running during rollouts.
- Changes rules ([code](rules/code.md#one-class-per-job), [do's and don'ts](rules/dos-and-donts.md), [samples](rules/samples.md)): interfaces and tokens sit at boundaries (module contracts, domain ports, multi-implementation abstractions), while internal domain services are concrete injected classes. Don't split a service for a single caller or wrap a one-method calculation in a service; group cohesive read queries and never combine `@injectable()` with `new`.
- Minor ([modules](rules/modules.md), [files and folders](rules/files-and-folders.md), [samples](rules/samples.md)): clarify DTO naming (`*Dto`), `@Request`/`@Field` edge validation, plain provider mapping functions, domain-owned ownership/policy checks, one-way subdomain dependency graphs, explicit route authorization and fail-closed defaults, external side-effect/cross-process concurrency safety, and sharp roles for `.contract.ts`, `.port.ts`, `.policy.ts`, `.job.ts`, and `api/contract/`. Add a complete vertical-slice module sample and a real `beginScope()` hosted job sample.
- Minor ([code](rules/code.md#the-environment), [use it in a project](README.md#use-it-in-a-project)): secrets come from the environment or a secret store; add the starter CI/lint check list (`curly: "all"`, `knip`, boundary checks exempting `__fixtures__/`).
- Minor ([modules](rules/modules.md#inside-a-module), [do's and don'ts](rules/dos-and-donts.md)): dependencies inside a subdomain point one way — model types (`values/`, `entities/`, `errors/`, `policies/`, `interfaces/`) never import from `repositories/` or `services/`, and `repositories/` never import from `services/`. Shared domain types live in `values/` or `entities/`, and pure domain calculations belong on value objects rather than static-method `.service.ts` classes.
- Minor ([tests](rules/tests.md)): name sociable, use-case tests (the testing trophy) as the default over isolated unit tests, and separate browser tests (layout, navigation, and UX only) from coded tests (UI logic and cross-module workflows on a virtual clock).
- Minor ([modules](rules/modules.md#inside-a-module), [files and folders](rules/files-and-folders.md#folders)): split a domain into subdomains only when it has clear, sizable sub-areas; smaller single-context domains stay flat by kind directly under `src/`. Give each module directory a `README.md` and `design.svg` at its root, symlinked to `docs/domain/<module>/`.

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
