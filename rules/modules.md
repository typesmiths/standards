# Modules

How an application is cut into modules, and how they meet. It is domain-driven design kept small: bounded contexts, one owner per fact, contracts between them.

## Cutting modules

- **A module is a bounded context, cut by intent:** where things change apart. Not by technology, and not by the shape of the data.
- **Each fact has one owner.** One module defines each concept and keeps its rules; others use it through that module's contract. If two modules each define an `Order`, one of them is wrong.
- **A module keeps its own data.** It never reads another module's tables, files or internals.

## How modules meet

- **Through contracts.** A module publishes interfaces, tokens, events and the shapes they carry in its `<module>.contracts` package; that package has no dependencies. Other modules import nothing else from it.
- **Through events, for what has happened.** The owner publishes a domain event; others subscribe. An event names a fact in the domain's words (`OrderFilled`), never a command in disguise.
- **The consumer's expectations live beside the provider**, as `<consumer>.contract.spec.ts`. A change that breaks a consumer fails in the provider's own tests.

## Inside a module

- **Projects by role:** `contracts ← domain ← api`. The domain decides; the api is the edge (controllers, table mappings, migrations, handlers, publishers, running processes and the module's entry) and decides nothing.
- **A domain is cut by subdomain first**, then by kind inside each: `entities/`, `values/`, `services/`, `strategies/`, `factories/`, `repositories/`, `errors/`, `testing/`, only the kinds it has.
- **An api is laid out by kind:** `controllers/`, `tables/`, `migrations/`, `handlers/`, `publishers/`, `processes/`, `testing/`, with the module's `.module.ts` and config at its root.
- **One repository per aggregate root**, in the domain. The only storage-specific code is the api's table mappings.

## HTTP

- **A controller is one aggregate,** named for it, its routes under its plural noun: `orders.controller.ts` serves `/orders`.
- **Reads and edits are the HTTP verbs** on the resource: `GET`, `POST`, `PATCH`, `DELETE`, and `PUT` to set a value.
- **An operation on one is `POST /<aggregate>/:id/<operation>`** in the domain's word (`/orders/:id/cancel`); one on them all sits on the collection (`POST /orders/pause`). Children stay under their parent (`/orders/:id/fills`).

## One code path

Test, paper and live run the same code. What differs (a venue, a clock, a market) is injected; product code never branches on a mode or an environment.
