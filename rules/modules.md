# Modules

How an application models its business, is cut into modules, and how they meet. It is domain-driven design kept small: code that follows the real-world process, bounded contexts, one owner per fact, contracts between them.

## Model the real-world process

This is the core of domain-driven design, and the rule the others serve. Code describes how the business actually works: who owns what, who decides, and what happens in what order. It does not describe how the database, an exchange or a blockchain happens to work.

- **Start from the real process, in the business's words.** Before writing code, say what happens: "the treasury gives Funding money; Funding shares it out to its algos; each algo moves its money to the exchange it trades on; when the owner wants money back, the treasury asks Funding for it." Each step becomes an object and a method in the code, owned by whoever owns that step in the business.
- **Infrastructure is a tool the domain uses, not the shape of the code.** Databases, exchanges, blockchains and wallets sit underneath, behind interfaces the domain defines. Their limits (a table's columns, an exchange's minimum deposit, the coin an exchange trades in) are handled inside those tools, or decided by whoever owns that decision in the business. They never bend the process around them.
- **Don't code to the database.** A class isn't a table row with functions attached, and a process isn't a series of table updates. Design the objects and what they do first; the tables store them afterwards.
- **Signs you're coding to the infrastructure:** a class named after a technical step (`SendingOn`, `DepositRelay`); code that does something because of how money physically travels ("swap to USDT when it lands, because the exchange trades in USDT") rather than because someone in the business decided it; code that picks another module's code by an exchange's name; a status worked out from what's in the tables.
- **When the two don't fit, change the infrastructure code, not the process.** If the business says an algo decides where its money goes, the wallet gets a "send this there" the algo can call. The algo isn't rewritten to suit how the wallet used to forward money.

The other rules on this page, and on [code](code.md), follow from this one ([do and don't](dos-and-donts.md)).

## Cutting modules

- **A module is a bounded context, cut by intent:** where things change apart. Not by technology, and not by the shape of the data.
- **Each fact has one owner.** One module defines each concept and keeps its rules; others use it through that module's contract. If two modules each define an `Order`, one of them is wrong.
- **A module keeps its own data.** It never reads another module's tables, files or internals.

## How modules meet

- **Through contracts.** A module publishes interfaces, tokens, events and the shapes they carry in its `<module>.contracts` package. Other modules import nothing else from it. A contract is plain data in and out, written to travel: today a call may be in-process, later the same contract goes over a service bus, so it never carries a live object.
- **Each shape is declared once, in the contracts.** A request is one class that serves both the controller and the client: it carries the HTTP framework's decorators, which is the one dependency a contracts package may take. Never a type in the contracts and a copy of it at the edge or in a client. The domain's objects and events aren't copies: they are the domain's own, and the api maps them to the contract's shapes.
- **Ask another module for what you want, not how to do it.** Say what you need in its words, like "give me back 300". That module decides how to do it and tells you what happened. Don't choose its accounts, coins or steps, and don't look up its code by an exchange's name to run its steps yourself. If you do, your code breaks every time that module changes how it works ([do and don't](dos-and-donts.md)).
- **Through events, for what has happened.** The owner's domain raises its event, its api maps it to the contract's event and publishes it, and others subscribe. An event names a fact in the domain's words (`OrderFilled`), never a command in disguise.
- **The consumer's expectations live beside the provider**, as `<consumer>.contract.spec.ts`. A change that breaks a consumer fails in the provider's own tests.

## Inside a module

![A module's layers: callers reach an interface in the contracts, a provider maps, the domain returns domain objects](layers.svg)

- **Projects by role.** The domain decides; the api is the edge (controllers, contract providers, migrations, handlers, publishers, running processes and the module's entry) and decides nothing. The api depends on the domain and the contracts; the domain depends on neither: `domain ← api → contracts`.
- **The domain is pure domain logic.** It imports no contract type, neither its own module's requests and answers nor another module's interfaces. What it needs from another module it declares as its own interface, and the api implements that over the other module's contract.
- **Each aggregate's API is an interface in the contracts**, with its token, its request classes, its answers and its events. A **provider** in the api implements it (`<aggregate>.provider.ts`): it calls the domain's services and maps the domain objects they return to the contract's answers. It is the only place that maps, so every caller gets the same answer.
- **Services return domain objects.** A service asks repositories for aggregates and asks the aggregates' verbs. It never returns a wire shape (a date as text, a view).
- **Adapters stay thin.** A controller reads the HTTP request, calls its provider and returns what it gives; it maps nothing. A bus handler does the same for an event.
- **Every caller goes through the interface.** A page calls the controller over HTTP. Another module injects the interface's token: in one process it gets the provider itself; when the modules are separate services it gets an HTTP client implementing the same interface, which calls the controller and gets the same answer. Only that binding changes.
- **Querying another module:** ask it directly through its interface. Keep a copy of its data, fed by its events, only where a read is too hot to ask each time. The bus carries events, not queries.
- **A domain is cut by subdomain first**, then by kind inside each: `entities/`, `values/`, `services/`, `strategies/`, `factories/`, `repositories/`, `errors/`, only the kinds it has.
- **An api is laid out by kind:** `controllers/`, `providers/`, `migrations/`, `handlers/`, `publishers/`, `processes/`, with the module's `.module.ts` and config at its root. Test files other than specs go in `__fixtures__` ([tests](tests.md)); `testing/` holds only the fakes other modules' tests use.
- **One repository per aggregate root**, in the domain. An entity carries its own table mapping, as the ORM's decorators on its class: that is the one outside package a domain may import, and only for that. No second class or schema per table.

## HTTP

- **A controller is one aggregate,** named for it, its routes under its plural noun: `orders.controller.ts` serves `/orders`.
- **Reads and edits are the HTTP verbs** on the resource: `GET`, `POST`, `PATCH`, `DELETE`, and `PUT` to set a value.
- **An operation on one is `POST /<aggregate>/:id/<operation>`** in the domain's word (`/orders/:id/cancel`); one on them all sits on the collection (`POST /orders/pause`). Children stay under their parent (`/orders/:id/fills`).

## One code path

Test, paper and live run the same code. What differs (a venue, a clock, a market) is injected; product code never branches on a mode or an environment.
