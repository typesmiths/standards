# Files and folders

If you can't tell what code does from its file names, the names are wrong. Every file has one purpose, and its name says it.

## File names

A file is named `<thing>.<role>.ts`: the one thing it holds, then its role. One thing per file.

Each role means one thing. The names come from domain-driven design, ports and adapters, and the classic design patterns; where those disagree, this table wins. Pick a role by what the thing is, not by what sits next to it.

| Role             | Holds                                                                                                                                                                     | Example                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `.entity.ts`     | an object with an identity and a lifecycle: its state changes, and two with equal fields are still two. In an app, a domain object, its table mapping on it as decorators | `order.entity.ts`, `memory-transaction.entity.ts` |
| `.value.ts`      | a value with no identity, immutable and compared by its fields, including a shape read from JSON, HTTP or a database                                                      | `money.value.ts`, `route-path.value.ts`           |
| `.model.ts`      | a model of something that isn't a business entity (a file, a project on disk)                                                                                             | `project.model.ts`                                |
| `.event.ts`      | one thing that happened, immutable, named in the past tense                                                                                                               | `order-filled.event.ts`                           |
| `.error.ts`      | one named error, ending in `Error`                                                                                                                                        | `optimistic-lock.error.ts`                        |
| `.service.ts`    | a class with no identity of its own that does one job: mechanics, answers, or a running process with `start()` and `stop()`                                               | `trading.service.ts`                              |
| `.repository.ts` | stores and loads one aggregate. An implementation is named for how it stores: `typeorm-order.repository.ts`                                                               | `order.repository.ts`                             |
| `.strategy.ts`   | one of several interchangeable ways to do the same job: one kind of a Strategy pattern, or of an algo base                                                                | `top-carry.strategy.ts`                           |
| `.state.ts`      | one state of a State pattern                                                                                                                                              | `holding.state.ts`                                |
| `.handler.ts`    | reacts to one event or request, asking the owners in order; decides nothing itself                                                                                        | `order-filled.handler.ts`                         |
| `.host.ts`       | runs other services and owns their lifecycle: starts them in order, stops them in reverse                                                                                 | `hosted-service.host.ts`                          |
| `.factory.ts`    | makes an object of one kind in one call, or picks which implementation to make                                                                                            | `top-carry.factory.ts`                            |
| `.builder.ts`    | makes an object over several calls, ending in `build()`                                                                                                                   | `app.builder.ts`                                  |
| `.registry.ts`   | holds things registered once by key, checks them as a set, and answers lookups                                                                                            | `memory-mappings.registry.ts`                     |
| `.mapping.ts`    | how one shape maps onto another (a class onto a table or a store), as data, with its `map…` helper; the code that applies it lives elsewhere                              | `memory-entity.mapping.ts`                        |
| `.contract.ts`   | an interface other modules or packages rely on, with its token                                                                                                            | `clock.contract.ts`                               |
| `.port.ts`       | an application's interface to something outside it, with its token                                                                                                        | `brokerage.port.ts`                               |
| `.provider.ts`   | a class implementing another package's contract                                                                                                                           | `fastify.provider.ts`                             |
| `.adapter.ts`    | wraps an outside API (a vendor's client, a CLI) behind an interface the module owns                                                                                       | `kucoin.adapter.ts`                               |
| `.plugin.ts`     | the function an app calls to add a package to its container                                                                                                               | `memory.plugin.ts`                                |
| `.decorator.ts`  | one decorator                                                                                                                                                             | `injectable.decorator.ts`                         |
| `.module.ts`     | wiring: registers a module's parts with the container, or a command line's commands with their actions                                                                    | `orders.module.ts`                                |
| `.controller.ts` | HTTP handlers for one aggregate; they decide nothing                                                                                                                      | `orders.controller.ts`                            |
| `.command.ts`    | one thing a user or process asks for, as data with no behaviour: a message's fields, or a command line's name, arguments and options                                      | `close-carry.command.ts`, `run.command.ts`        |
| `.action.ts`     | carries out one command line's command                                                                                                                                    | `run.action.ts`                                   |
| `.config.ts`     | the shape of a package's or module's settings, and their defaults                                                                                                         | `database.config.ts`                              |
| `.const.ts`      | named constants of one thing                                                                                                                                              | `order-topics.const.ts`                           |
| `.spec.ts`       | a test, beside the file it tests                                                                                                                                          | `order.entity.spec.ts`                            |
| `.cases.ts`      | test code only, in `testing/`: the cases every implementation of one interface passes                                                                                     | `order.repository.cases.ts`                       |
| `.fixtures.ts`   | test code only, in `testing/`: recorded or made-up data                                                                                                                   | `orders.fixtures.ts`                              |
| `.harness.ts`    | test code only, in `testing/`: a world several specs build on                                                                                                             | `trading.harness.ts`                              |

A project may add roles of its own (ledger has `.algo.ts` and `.venue.ts`). It lists them in its own guide before using them.

**Never:** `utils`, `helpers`, `common`, `shared`, `misc`, `lib-*`, `.types.ts`, `.store.ts`, `.calc.ts`, a bare `const.ts`, or a verb (`reconcile.ts`). A type lives beside the thing it describes. A store is a repository. A calculation is a method on what it calculates about.

## Folders

- **Folders are subdomains first** (`routing/`, `auth/`, `billing/`), then kinds inside one (`entities/`, `services/`, `errors/`) once it holds several things of that kind. A subfolder inside a kind only when one object has several files.
- **Each subdomain folder has an `index.ts`** that says what it exports. The `src/` root holds little but `index.ts`.
- **Specs sit beside the code they test.** `e2e/` suites that drive built output sit apart.
- **A new package exists only to manage dependencies or to stop an import cycle.** A feature is a folder, not a package.

## Packages and modules

- **A package or module has one job.** A base package holds contracts; provider packages implement them. Only the composition root names a provider.
- **Dependencies run one way.** In an application, a module is split by role: `<module>.contracts` (interfaces, tokens, events and the shapes other modules and clients use), `<module>.domain` (everything that decides) and `<module>.api` (the edge: controllers, contract providers, migrations, handlers, the module's entry). `domain ← api → contracts`, and other modules import only `*.contracts`. More in [modules](modules.md).
