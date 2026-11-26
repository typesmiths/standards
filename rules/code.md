# Code

How TypeScript is written in a Typesmiths project: classes with one job each, talking through strict interfaces, constructor injection and events. A project's own guide adds what is particular to it and never contradicts this page.

## One class per job

1. **Every thing with state, a lifecycle, more than one implementation or a rule is a class with one job, named for it.** An order, a fill, an account, a router, a clock. One class defines each concept, in the module that owns it. There is no second `Order`, no per-caller copy, and no copy of its rules beside the caller.
2. **An object's behaviour is that object's job alone.** Its state is private, with read-only getters where others need to see it. Others ask it questions or tell it to do something through its methods; nobody reads its fields to decide for it. A calculation is a method on the thing it is about.
3. **What kinds share is an abstract base class**, not a helper module they all import. The base says what every kind must do, and each kind says how: `LimitOrder extends Order`, `TopCarryStrategy extends FundingArbAlgo`. A base lives in the module whose kinds extend it, and nothing is shared between modules until a second module really needs it.
4. **Code that only one algorithm needs goes in that algorithm's class.** Code shared by all algorithms calls a method on the algorithm when it needs something specific, like where its money should go (`algorithm.worksAt(algo, places)`). It never checks which algorithm it has, and no shared service buys USDT because today's algorithm happens to trade in it. Then deleting an algorithm deletes all of its code, and adding one is one new class. The same goes for exchanges, or anything else that comes in several types ([do and don't](dos-and-donts.md)).
5. **A service is an interface and a token, implemented by one injected class.** The token sits beside its interface, named `<Thing>Token`. Consumers depend on the interface, never on the class or its files.
6. **Collaborators do mechanics or answer questions; they don't decide for their caller.** The trading service knows what a limit order is and places it; whether to place one is the strategy's decision. A Safe sends money where it's told; deciding where is not its job.
7. **Classes talk through constructor injection or events.** A dependency arrives through the constructor as an interface. Something that has happened (an order filled, a price moved) is an event its owner publishes and others subscribe to. Nothing looks anything up: no `container.resolve` outside the composition root.
8. **Every running process is a hosted service with a start and a stop.** A poller, a watcher, a scheduled job: one class with `start()` and `stop()`, its schedule and status its own private state; what it does each time is a per-work service ([lifetimes](#lifetimes)).
9. **Many objects of one kind are built by that kind's factory.** Dependency injection makes services, one each; a factory, itself injected, makes the entities or algos there can be many of. Static `create` and `restore` are fine on entities and values with no service dependencies.

## Methods and state

- **Keep public methods short, like a list of steps.** Each line calls a well-named method and passes its result to the next: `const due = this.dueOf(algo); await this.safe.send(place, due);`. Put checks, maths and branches in private methods. In a long method every variable stays visible to the end, so changing one line can quietly change what happens further down.
- **Store a status; don't work it out from other data.** If an account goes through setup steps, save each step: whether it's done, and what it made (or the error). The account's status is then a simple check over its steps. Guessing it from other data (it's set up because its Safes exist) breaks as soon as a step is added.

## Lifetimes

1. **A service lives for one piece of work:** a request, a round, a job's turn. A hosted service (8) is the one that lives as long as the process. Its repositories and unit of work are that piece of work's, injected. Almost everything a request does is per piece of work.
2. **A singleton holds only what belongs to the whole app:** its config, a client, a connection, a stream, how a process runs. Never one piece of work's state, and never a domain fact: a fact that must outlive a piece of work is kept in the database.
3. **A service that starts a piece of work begins a scope** for it through a scope factory it takes in its constructor, resolves the per-work class from that scope, and disposes the scope when the work ends. The factory is the only way a class reaches the container. Resolving a per-work service from the root is an error.
4. **A hosted service is a thin wrapper** around its piece of work: its schedule and how it runs are its own; what it does each time is a per-work service. Shared behaviour goes in a class that uses the current scope.

## Loose functions

A loose exported function is only one of:

- a plugin factory, whose result goes into another tool's list of plugins (`typeOrm()`, Vite's `plugins: [react()]`);
- a decorator (`@injectable()`);
- a `define…` helper whose result is data (`defineConfig`, `defineMigration`);
- an `is…` or `has…` predicate;
- mechanics with no domain meaning (`sleep`, a byte encoder).

Anything that knows a domain word (a price, a fee, a route, a version) is a method on the class that owns that word. A group of related functions is a class, not a namespace object (`export const orders = { place, cancel }`) and not a class of static methods (`OrderUtils`). A `const` typed by an interface (`export const postgres: DatabaseSupport = { … }`) is a value implementing it, not a namespace object.

## Names

Functions do something; everything else is something.

- **Functions and methods are verbs:** `findWorkspaceRoot`, `place`, `build`. A predicate asks a question: `isExpired`, `hasEntry`.
- **Classes, types, values and getters are nouns:** `router.match(…)` reads "router: match"; `order.price` is a property.
- **Plugin factories are named for what they add**, as the tool's own plugins are: `.use(memory({ … }))`, not `createMemoryPlugin()`.
- **Interfaces have no `I` prefix**, as in TypeScript's own libraries: `Clock`, not `IClock`. An implementation is named for how it differs (`SystemClock`, `FixedClock`), and its token is `ClockToken`.
- **Errors are classes whose names end in `Error`**, one per file, thrown and never swallowed.
- Files and folders: [files and folders](files-and-folders.md).

## Errors

- **Throw a named error** a caller can catch by type, never a string or a bare `Error` told apart by its message. Pass the cause on (`{ cause }`).
- **Never silence an error to get past it:** no empty `catch`, no listener that only logs and carries on, no `any` or `@ts-expect-error` to turn a check green. The boundary (a request handler, a process's entry) logs and answers; nothing below it swallows.

## The environment

- **Library and domain code never reads `process.env`.** The entry point or a config source reads the environment once and passes values in. Code that needs to know whether it runs in development takes that as a constructor argument.
- **No test-only or CI-only branches** in product code, and no side effects on import.
- **Secrets come only from the process environment**, never from a file the code reads on its own, and are never printed or committed.

## Language

- ES modules, with `.js` extensions in TypeScript import paths.
- `const`, and `let` only for a value that is reassigned. Never `var`.
- Return early: handle the case that ends a function first, so the main path isn't nested.
- Every `if`, `else` and loop body is a block in braces, even a single `return`. A body without braces looks like it holds the next line too: add a second statement to it, or an `else`, and it silently runs whatever the condition. A project's linter enforces it (`curly: "all"` in oxlint and ESLint).
- One `Map` lookup with a null guard, not `has` and then `get!`.
- Never `import type` a class that is injected through its constructor: the import is erased, and the injector loses the type it reads.

The [do's and don'ts](dos-and-donts.md) show each of these as code.
