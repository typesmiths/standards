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

**Don't write a utility class or a namespace object.** A class of static methods, or `export const x = { a, b }`, groups functions by how they look, not what they are about. Each method goes on the class it works on; if none exists, that class is missing.

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
// Do: the treasury asks Funding for money back; Funding tells it each send.
await this.funding.giveBack(account, 300);
// …and, in Funding, as each send leaves its Safe:
await this.treasury.givenBack({ account, module: "funding", amount, from: safe.id, tx });

// Don't: the treasury picks Funding's account, finds Funding's code by the exchange's name and runs its steps.
const withdrawals = this.withdrawals.find((w) => w.venues.includes(place.venue));
const look = await withdrawals.send(place, cashOut);
if (look.state === "sent") {
	await this.sendOnToTreasury(place, look);
}
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
