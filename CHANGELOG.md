# Changelog

## 0.4.0

- Minor, changes rules ([modules](rules/modules.md#inside-a-module)): the domain is pure domain logic and imports no contract type; dependencies run `domain ← api → contracts`. A controller or a contract provider calls a service, the service returns domain objects, and the edge maps them to the contract's types. Each aggregate's API is an interface in the contracts; a provider in the api implements it and is the only place that maps; controllers and bus handlers stay thin. Another module injects the same interface: the provider in one process, an HTTP client calling the controller once the modules are separate services, so it gets the same answer either way. Queries go direct through the interface; copies fed by events only for hot reads; contracts are plain data written to travel. Each shape is declared once, in the contracts: a request is one class for the controller and the client, carrying the HTTP framework's decorators, the one dependency a contracts package may take. An entity carries its table mapping as ORM decorators on itself; no separate mapping class.
- Minor: [lifetimes](rules/code.md#lifetimes): services per piece of work, singletons only for app-wide state and never a domain fact, a scope begun per piece of work through an injected scope factory, hosted services as thin wrappers.
- Minor: [tests](rules/tests.md): batch the work and test once at the end; the module's whole suite and the full suite are CI's.

## 0.3.0

- Minor: `pnpm exec standards link` links `docs/standards` in a project to the installed rules, so people find them in the file tree and in search ([use it in a project](README.md#use-it-in-a-project)).

## 0.2.0 (2026-11-23)

- Minor: every file role has its own row and one meaning ([files and folders](rules/files-and-folders.md#file-names)). `.entity` is any object with an identity and a lifecycle, a library's (a transaction) as well as an app's domain objects. A `.command` is the request as data and holds no behaviour; on a command line, its `.action` carries it out. `.host` runs other services, `.module` is wiring for the container or the command line, and `.builder`, `.registry` and `.mapping` each say what sets them apart.

## 0.1.0 (2026-11-22)

The first rules, from Decohere's code design and ledger's domain design: code (one class per job, loose functions, names, errors, the environment), files and folders, modules, tests, changing existing code, samples, and do's and don'ts.
