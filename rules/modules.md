# Modules

How an application models its business, is cut into modules, and how they meet. It is domain-driven design kept small: code that follows the real-world process, bounded contexts, one owner per fact, contracts between them.

## Model the real-world process

This is the core of domain-driven design, and the rule the others serve. Code describes how the business actually works: who owns what, who decides, and what happens in what order. It does not describe how the database, an exchange or a blockchain happens to work.

- **Start from the real process, in the business's words.** Before writing code, say what happens: "the treasury gives a department its budget; the department shares it out to its teams; each team moves its money to the account it spends from; when the company wants money back, the treasury asks the department for it." Each step becomes an object and a method in the code, owned by whoever owns that step in the business.
- **Infrastructure is a tool the domain uses, not the shape of the code.** Databases, exchanges, blockchains and wallets sit underneath, behind interfaces the domain defines. Their limits (a table's columns, an exchange's minimum deposit, the coin an exchange trades in) are handled inside those tools, or decided by whoever owns that decision in the business. They never bend the process around them.
- **Don't code to the database.** A class isn't a table row with functions attached, and a process isn't a series of table updates. Design the objects and what they do first; the tables store them afterwards.
- **Signs you're coding to the infrastructure:** a class named after a technical step (`SendingOn`, `DepositRelay`); code that does something because of how money physically travels ("convert it when it lands, because the other side takes euros") rather than because someone in the business decided it; code that picks another module's code by an exchange's name; a status worked out from what's in the tables.
- **When the two don't fit, change the infrastructure code, not the process.** If the business says a team decides where its money goes, the bank account gets a "send this there" the team can call. The team isn't rewritten to suit how the account used to forward money.

The other rules on this page, and on [code](code.md), follow from this one ([do and don't](dos-and-donts.md)).

## Cutting modules

- **A module is a bounded context, cut by intent:** where things change apart. Not by technology, and not by the shape of the data.
- **Each fact has one owner.** One module defines each concept and keeps its rules; others use it through that module's contract. If two modules each define an `Order`, one of them is wrong.
- **A module keeps its own data.** It never reads another module's tables, files or internals.

## How modules meet

- **Through contracts.** A module publishes interfaces, tokens, events and the shapes they carry in its `<module>.contracts` package. Other modules import nothing else from it — never another module's `*.domain` or `*.api`. A contract is plain, wire-safe data in and out (ISO strings for times, primitives, plain records and arrays — never `Date` or live objects): today a call may be in-process, later the same contract goes over a service bus or HTTP.
- **Name contract shapes consistently.** Response shapes end in `Dto` (`OrderDto`, `AccountDto`), so a provider reading both domain entities and wire shapes tells them apart at a glance. Request classes are named for what they ask (`PlaceOrder`, `CancelOrder`).
- **Each shape is declared once, in the contracts.** A request is one class that serves both the controller and the client: it carries the HTTP framework's `@Request` and `@Field` decorators (the one dependency a contracts package may take) so the HTTP edge validates wire shape once and domain services check only business rules. Never a type in the contracts and a copy of it at the edge or in a client. The domain's objects and events aren't copies: they are the domain's own, and the api maps them to the contract's shapes.
- **Shared universal values live in a kernel; behaviour goes behind ports.** Tiny value shapes shared across many modules (`Actor`, `Clock`) live in a shared kernel so modules don't invent identical copies. Calls to another module's behaviour go through a small domain-owned port (`.port.ts`) implemented by an adapter in `*.api` over the other module's `*.contracts`.
- **Ask another module for what you want, not how to do it.** Say what you need in its words, like "give me back 300". That module decides how to do it and tells you what happened. Don't choose its accounts, coins or steps, and don't look up its code by an exchange's name to run its steps yourself. If you do, your code breaks every time that module changes how it works ([do and don't](dos-and-donts.md)).
- **Through events, for what has happened.** The owner's domain raises its event, its api maps it to the contract's event and publishes it, and others subscribe. An event names a fact in the domain's words (`OrderFilled`), never a command in disguise.
- **One conformance test per contract, not one copy per consumer.** In a provider's `contract/` folder, write one `<contract>.contract.spec.ts` per published contract — running the real provider, any remote binding, and any `Fake*` exported in `testing/` against the same suite so fakes never drift from real code. For multi-provider interfaces (like a shared reporting port), each implementing module runs the shared suite in its own `contract/` folder. Consumer-specific expectations live in the consumer's own sociable tests: the monorepo typechecker checks shapes across every consumer, and the test runner tracks imports to re-run affected consumers when a contract or provider changes.

## Inside a module

![A module's layers: callers reach an interface in the contracts, a provider maps, the domain returns domain objects](layers.svg)

- **Projects by role.** The domain decides; the api is the edge (controllers, contract providers, adapters, migrations, handlers, publishers, running processes and the module's entry) and decides nothing. The api depends on the domain and the contracts; the domain depends on neither: `domain ← api → contracts`.
- **The domain is pure domain logic.** It imports no contract type, neither its own module's requests and answers nor another module's interfaces or domain packages. What it needs from outside it declares as its own port (`.port.ts`), and the api implements that over the outside client or the other module's contract.
- **Only split a domain into subdomains when it earns the folder level.** A small or single-concept domain stays flat by kind directly under `src/` (`entities/`, `values/`, `services/`, `repositories/`, `errors/`, `interfaces/`, only the kinds it has). Split into subdomain folders first — then by kind inside each — only when the module has genuinely distinct, sizable subdomains that change apart (e.g. `exchange/`, `transfers/`, `ledger/`, `algos/`). Don't invent subdomains that repeat the module's name or leave kind folders with a single file.
- **Subdomains form a one-way dependency graph.** When a domain is split into subdomains, they depend strictly one way with no cycles, checked in CI.
- **Dependencies inside a domain (or each subdomain) point one way.** Model types (`values/`, `entities/`, `errors/`, `policies/`, `interfaces/`) never import from `repositories/` or `services/`; `repositories/` never import from `services/`. Shared domain types live in `values/` or `entities/` where they belong, never exported out of a service or repository.
- **Each aggregate's API is an interface in the contracts**, with its token, its request classes, its DTOs and its events. A **provider** in the api implements it (`<aggregate>.provider.ts`): it calls the domain's services and maps the domain objects they return to DTOs using plain functions beside the provider (no reflection mapper library). It is the only place that maps, so every caller gets the same answer. If a provider only combines one or two other modules' contracts, call them directly in the provider without adding a pass-through domain service.
- **Services return domain objects.** A service asks repositories for aggregates and asks the aggregates' verbs. It never returns a wire shape (an ISO date string, a view) and never parses raw HTTP types.
- **Domain ownership and policy checks live in the domain.** Rules like "only the owner may act on a live account" live in the domain service (taking an `Actor`), not in a provider, so HTTP, bus handlers and in-process callers enforce the same rule. Don't pass an `Actor` into methods that ignore it.
- **Adapters stay thin.** A controller reads the HTTP request, calls its provider and returns what it gives; it maps nothing. A bus handler does the same for an event.
- **Every caller goes through the interface.** A page calls the controller over HTTP. Another module injects the interface's token: in one process it gets the provider itself; when the modules are separate services it gets an HTTP client implementing the same interface, which calls the controller and gets the same answer. Only that binding changes.
- **Querying another module:** ask it directly through its interface. Keep a copy of its data, fed by its events, only where a read is too hot to ask each time. The bus carries events, not queries.
- **An api is laid out by kind:** `controllers/`, `providers/`, `adapters/`, `migrations/`, `handlers/`, `publishers/`, `jobs/` (or `processes/`), `contract/` (for `<contract>.contract.spec.ts`), with the module's `.module.ts` and config at its root. Test files other than specs go in `__fixtures__` ([tests](tests.md)); `testing/` holds only the fakes other modules' tests use.
- **Every module root explains itself.** Keep a `README.md` (what the module is for, its entities, its rules, and where it meets other modules) and a `design.svg` diagram (contracts, api edge, domain structure, storage, and external boundaries) for each module. Store the canonical files under `docs/domain/<module>/` and symlink `README.md` and `design.svg` into the module's root directory so opening the module shows its purpose and design immediately without duplicating docs.
- **One repository per aggregate root**, in the domain. An entity carries its own table mapping, as the ORM's decorators on its class: that is the one outside package a domain may import, and only for that. No second class or schema per table.

## HTTP

- **A controller is one aggregate,** named for it, its routes under its plural noun: `orders.controller.ts` serves `/orders`.
- **Reads and edits are the HTTP verbs** on the resource: `GET`, `POST`, `PATCH`, `DELETE`, and `PUT` to set a value.
- **An operation on one is `POST /<aggregate>/:id/<operation>`** in the domain's word (`/orders/:id/cancel`); one on them all sits on the collection (`POST /orders/pause`). Children stay under their parent (`/orders/:id/fills`).
- **Every route declares its authorization explicitly** (`@Authorize(...)` or `@AllowAnonymous()`), checked statically in CI so no endpoint ships unprotected by omission. Security and policy checks fail closed when configuration is empty or missing.

## External side effects and concurrency

- **Persist intent before calling outside, and never clear an in-flight claim after a post-call booking error.** Record that a send or external action is in flight before calling the outside system. If the outside call succeeds and local follow-up throws, keep the claim intact and reconcile — clearing it causes a duplicate send on the next run.
- **Acquire uniqueness checks and locks before mutating collaborators.** Claim the aggregate's row or lock before moving money or changing another module, so a refused or duplicate request never leaves partial side effects behind.
- **In-process locks don't protect across processes.** An API server and a background worker don't share memory. Any state machine touched by more than one process uses a database lock, lease, or grace window before another process treats in-flight work as stopped.

## One code path

Test, paper and live run the same code. What differs (a venue, a clock, a market) is injected; product code never branches on a mode or an environment.
