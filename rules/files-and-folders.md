# Files and folders

If you can't tell what code does from its file names, the names are wrong. Every file has one purpose, and its name says it.

## File names

A file is named `<thing>.<role>.ts`: the one thing it holds, then its role. One thing per file.

| Role                                       | Holds                                                                                                                                       | Example                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `.entity.ts`                               | a domain object with identity and behaviour; its table mapping sits with it                                                                 | `order.entity.ts`                       |
| `.value.ts`                                | a value with no identity, including a shape read from JSON, HTTP or a database                                                              | `money.value.ts`, `route-path.value.ts` |
| `.model.ts`                                | a model of something that isn't a business entity (a file, a project on disk)                                                               | `project.model.ts`                      |
| `.service.ts`                              | a service: mechanics, answers, or a running process with `start()` and `stop()`                                                             | `trading.service.ts`                    |
| `.strategy.ts`                             | one kind of a Strategy pattern, or one kind of an algo base                                                                                 | `top-carry.strategy.ts`                 |
| `.state.ts`                                | one state of a State pattern                                                                                                                | `holding.state.ts`                      |
| `.factory.ts`                              | builds the objects of one kind                                                                                                              | `top-carry.factory.ts`                  |
| `.builder.ts`, `.registry.ts`, `.host.ts`  | builds a thing step by step; holds registrations; hosts running services                                                                    | `app.builder.ts`                        |
| `.repository.ts`                           | stores and loads one aggregate. An implementation is named for how it stores: `typeorm-order.repository.ts`                                 | `order.repository.ts`                   |
| `.contract.ts`                             | an interface other modules or packages rely on, with its token                                                                              | `clock.contract.ts`                     |
| `.port.ts`                                 | an application's interface to something outside it, with its token                                                                          | `brokerage.port.ts`                     |
| `.provider.ts`                             | a class implementing another package's contract                                                                                             | `fastify.provider.ts`                   |
| `.adapter.ts`                              | wraps an outside API (a vendor's client, a CLI) behind an interface the module owns                                                         | `kucoin.adapter.ts`                     |
| `.controller.ts`                           | HTTP handlers for one aggregate; they decide nothing                                                                                        | `orders.controller.ts`                  |
| `.handler.ts`                              | reacts to one event or request, asking the owners in order; decides nothing itself                                                          | `order-filled.handler.ts`               |
| `.command.ts`, `.action.ts`                | one thing a user or process asks for, a command line included                                                                               | `close-carry.command.ts`                |
| `.event.ts`                                | one domain event                                                                                                                            | `order-filled.event.ts`                 |
| `.error.ts`                                | one named error                                                                                                                             | `optimistic-lock.error.ts`              |
| `.plugin.ts`, `.decorator.ts`              | a plugin factory; a decorator                                                                                                               | `memory.plugin.ts`                      |
| `.module.ts`, `.config.ts`, `.mapping.ts`  | wiring; settings; a mapping between two shapes                                                                                              | `orders.module.ts`                      |
| `.const.ts`                                | named constants of one thing                                                                                                                | `order-topics.const.ts`                 |
| `.spec.ts`                                 | a test, beside the file it tests                                                                                                            | `order.entity.spec.ts`                  |
| `.cases.ts`, `.fixtures.ts`, `.harness.ts` | test code only, in `testing/`: cases every implementation of one interface passes; recorded or made-up data; a world several specs build on | `order.repository.cases.ts`             |

A project may add roles of its own (ledger has `.algo.ts` and `.venue.ts`). It lists them in its own guide before using them.

**Never:** `utils`, `helpers`, `common`, `shared`, `misc`, `lib-*`, `.types.ts`, `.store.ts`, `.calc.ts`, a bare `const.ts`, or a verb (`reconcile.ts`). A type lives beside the thing it describes. A store is a repository. A calculation is a method on what it calculates about.

## Folders

- **Folders are subdomains first** (`routing/`, `auth/`, `billing/`), then kinds inside one (`entities/`, `services/`, `errors/`) once it holds several things of that kind. A subfolder inside a kind only when one object has several files.
- **Each subdomain folder has an `index.ts`** that says what it exports. The `src/` root holds little but `index.ts`.
- **Specs sit beside the code they test.** `e2e/` suites that drive built output sit apart.
- **A new package exists only to manage dependencies or to stop an import cycle.** A feature is a folder, not a package.

## Packages and modules

- **A package or module has one job.** A base package holds contracts; provider packages implement them. Only the composition root names a provider.
- **Dependencies run one way.** In an application, a module is split by role: `<module>.contracts` (interfaces, tokens, events and the shapes other modules use; no dependencies), `<module>.domain` (everything that decides) and `<module>.api` (the edge: controllers, table mappings, migrations, handlers, the module's entry). `contracts ← domain ← api`, and other modules import only `*.contracts`. More in [modules](modules.md).
