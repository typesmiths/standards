# Do's and don'ts

Each with the shape to write and the one to avoid. The rules behind them are in [code](code.md). A new entry comes in when reviews catch the same thing twice, in any project.

**Do return early.** Handle the case that ends the function first, so the main path isn't nested.

```ts
// Do
public find(key: string): Route | undefined {
	const route = this.routes.get(key);
	if (route == null) return undefined;
	if (!route.enabled) return undefined;
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

**Do take what a class needs through its constructor.** Don't reach for the container, a module-level singleton or `process.env` inside it: a test then has to know what the class secretly reads.

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
