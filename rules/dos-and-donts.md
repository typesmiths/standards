# Do's and don'ts

Each with the shape to write and the one to avoid. The rules behind them are in [code](code.md). A new entry comes in when reviews catch the same thing twice, in any project.

**Do return early.** Handle the case that ends the function first, so the main path isn't nested.

```ts
// Do
public find(key: string): Route | undefined {
	const route = this.routes.get(key);
	if (route == null) {
		return undefined;
	}
	if (!route.enabled) {
		return undefined;
	}
	return route;
}

// Don't
public find(key: string): Route | undefined {
	if (this.routes.has(key)) {
		const route = this.routes.get(key)!;
		if (route.enabled) {
			return route;
		}
	}
	return undefined;
}
```

**Do put every `if`, `else` and loop body in braces**, even one statement. Without them, a line added later looks inside the condition but runs every time.

```ts
// Do
for (const [key, row] of writes) {
	if (row === null) {
		table.delete(key);
	} else {
		table.set(key, row);
	}
}

// Don't
for (const [key, row] of writes) {
	if (row === null) table.delete(key);
	else table.set(key, row);
}
```

**Don't declare with `var`.** Use `const`, and `let` only when the value is reassigned.

```ts
// Do
const port = config.port ?? 3000;

// Don't
var port = config.port || 3000;
```

**Don't export a loose function for work that belongs to a thing.** Put it on the class it is about, or make a class whose job it is. Loose functions are only the [kinds listed](code.md#loose-functions).

```ts
// Do: route-path.value.ts
export class RoutePath {
	public constructor(private readonly value: string) {}

	public join(child: string): RoutePath {
		return new RoutePath(`${this.value}/${child}`.replace(/\/+/g, "/"));
	}
}

// Don't: route-path.ts
export function joinRoutePath(parent: string, child: string): string {
	return `${parent}/${child}`.replace(/\/+/g, "/");
}
```

**Don't write a utility class or a namespace object — and never disguise one as a service.** A class of static methods (even in a `.service.ts` file), or `export const x = { a, b }`, groups functions by how they look, not what they are about. Each method goes on the value or entity it works on; if none exists, that class is missing.

```ts
// Do: each on its own thing
export class ProjectName {
	/* parse(), toScope() */
}
export class PackageVersion {
	/* bump(), isPrerelease() */
}

// Don't: string.utils.ts
export class StringUtils {
	public static toScope(name: string): string {
		/* … */
	}
	public static bumpVersion(version: string): string {
		/* … */
	}
}
```

**Do take what a class needs through its constructor.** Don't reach for the container, a module-level singleton or `process.env` inside it: a test then has to know what the class secretly reads. A class that begins a scope per piece of work takes a scope factory through its constructor too ([lifetimes](code.md#lifetimes)).

```ts
// Do
@injectable()
export class ReportService {
	public constructor(@inject(ClockToken) private readonly clock: Clock) {}
}

// Don't
export class ReportService {
	private readonly clock = container.resolve<Clock>(ClockToken);
	private readonly debug = process.env.DEBUG === "1";
}
```

**Do throw a named error.** Don't throw a string or a bare `Error` a caller can only tell apart by its message.

```ts
// Do
throw new RouteConflictError(path);

// Don't
throw new Error(`route ${path} already exists`);
```

**Do write the business's process, not the infrastructure's.** The code says what happens in the business; the bank account and the payment provider are tools it calls ([modules](modules.md#model-the-real-world-process)).

```ts
// Do: a department gives a team a budget; the team says which account it spends from.
team.budgeted(1_000);
const account = team.spendsFrom(accounts);
await this.bank.send(account, 1_000);

// Don't: the code follows how money physically moves. Whatever lands in the account is
// forwarded and converted, because that's what the other side happens to need.
for (const landed of await this.account.newTransfers()) {
	await this.account.forward(landed, supplierAddress);
	await this.exchange.convert("USD", "EUR", landed.amount);
}
```

**Do ask another module for what you want, not how to do it.** It decides how, and tells you what happened ([modules](modules.md#how-modules-meet)).

```ts
// Do: the treasury asks the department for money back; the department reports each send.
await this.department.giveBack(account, 300);
// …and, in the department, as each send leaves its wallet:
await this.treasury.givenBack({ account, department: "sales", amount, from: wallet.id, tx });

// Don't: the treasury picks the department's account, looks up its code by bank name and runs its steps.
const withdrawals = this.withdrawals.find((w) => w.banks.includes(place.bank));
const look = await withdrawals.send(place, cashOut);
if (look.state === "sent") {
	await this.sendOnToTreasury(place, look);
}
```

**Don't extract a one-method calculation or single-caller query into its own service.** Put calculations on the object they are about, and keep read projections over the same repositories on one cohesive service ([code](code.md#one-class-per-job)).

```ts
// Do: the order answers whether it is expired; the service works with the repository.
if (order.isExpired(this.clock.now())) {
	order.expire();
}

// Don't: a 10-line injected service wrapping one check on someone else's fields.
@injectable()
export class OrderExpiryService {
	public constructor(@inject(ClockToken) private readonly clock: Clock) {}
	public isExpired(order: { expiresAt: Date }): boolean {
		return order.expiresAt < this.clock.now();
	}
}
```

**Don't decorate a class with `@injectable()` and construct it with `new`.** Either register and inject it through DI, or fold it into the class that owns that work ([code](code.md#one-class-per-job)).

```ts
// Do: injected once through the constructor, or a method on its owner.
public constructor(@inject(ExchangeConnections) private readonly connections: ExchangeConnections) {}

// Don't: @injectable() on the class, never registered, and constructed with new by every caller.
const account = await new PlaceAccounts(this.venues).at(connection);
```

**Do put code that only one type needs in that type's class.** Shared code calls a method on the object; it never checks which type it has ([code](code.md#one-class-per-job)).

```ts
// Do: each type of order says how it's priced; shared code asks it.
const price = order.priceFor(book);
await this.venue.place(order, price);

// Don't: shared code checks the type and carries each type's logic.
// Delete StopOrder and this is left with a branch for something that no longer exists.
let price: Decimal;
if (order instanceof LimitOrder) {
	price = order.limit;
} else {
	price = book.bestBid;
}
```

**Do use a Polymorphic Registry for mode- or capability-dependent implementations.** Put live and simulated implementations behind one interface and resolve them through one registry instead of parallel `Paper*` / `Live*` ports with `if (mode)` branches in callers ([modules](modules.md#one-code-path)).

```ts
// Do: one VenueRegistry owns mode isolation; callers stay mode-agnostic.
const venues = await this.venues.autoConnectFor(account.mode);
for (const venue of venues) {
	await this.connect(account, venue);
}

// Don't: parallel ports split by mode, forcing every caller to branch.
if (isSimulated(account.mode)) {
	for (const venue of await this.paperVenues.list()) {
		await this.connect(account, venue);
	}
} else {
	for (const venue of await this.liveVenues.list()) {
		await this.connect(account, venue);
	}
}
```
