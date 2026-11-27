# Samples

Short, complete shapes to copy. Each names its file. They use [Crucible](https://github.com/typesmiths/decohere/tree/main/projects/crucible)'s decorators; any container that injects through constructors works the same way.

**A boundary interface, a rich entity, and a per-work service.** Calculations belong on the entity; the domain service coordinates repositories and boundary ports without creating a separate service per method.

```ts
// clock.contract.ts (shared kernel)
export interface Clock {
	now(): Date;
}
export const ClockToken = Symbol("Clock");

// order.entity.ts (orders.domain)
import { Column, Entity, PrimaryColumn, VersionColumn } from "typeorm";

@Entity({ name: "order" })
export class Order {
	@PrimaryColumn({ type: "uuid" })
	public id!: string;

	@Column({ name: "expires_at", type: "timestamptz" })
	public expiresAt!: Date;

	@Column({ type: "varchar", length: 16 })
	public status!: "open" | "expired" | "cancelled";

	@VersionColumn({ type: "integer", default: 1 })
	public version!: number;

	public isExpired(at: Date): boolean {
		return this.expiresAt < at;
	}

	public expireIfPast(at: Date): boolean {
		if (this.status !== "open" || !this.isExpired(at)) {
			return false;
		}
		this.status = "expired";
		return true;
	}
}

// order.service.ts (orders.domain — concrete class, no redundant interface)
import { inject, injectable } from "@decohere/crucible/decorators";
import { type Clock, ClockToken } from "@app/kernel";
import { Order } from "../entities/order.entity.js";
import { OrderNotFoundError } from "../errors/order-not-found.error.js";
import { OrderRepository } from "../repositories/order.repository.js";

@injectable()
export class OrderService {
	public constructor(
		@inject(OrderRepository) private readonly orders: OrderRepository,
		@inject(ClockToken) private readonly clock: Clock,
	) {}

	public async expire(id: string): Promise<Order> {
		const order = await this.orders.findById(id);
		if (!order) {
			throw new OrderNotFoundError(id);
		}
		order.expireIfPast(this.clock.now());
		await this.orders.save(order);
		return order;
	}
}
```

**The spec beside it.** It tests through the public face, with a small class standing in for the boundary interface.

```ts
// order.entity.spec.ts
import { describe, expect, it } from "vitest";
import { Order } from "./order.entity.js";

describe("Order", () => {
	it("expires an open order once its time has passed", () => {
		const order = Object.assign(new Order(), {
			id: "order-1",
			expiresAt: new Date("2026-11-22T09:00:00Z"),
			status: "open" as const,
		});
		expect(order.expireIfPast(new Date("2026-11-22T10:00:00Z"))).toBe(true);
		expect(order.status).toBe("expired");
	});
});
```

**A vertical module slice (`contracts` ← `api` → `domain`).** Wire shapes live in `*.contracts`, domain logic and ports live in `*.domain`, and `*.api` maps domain objects to DTOs in plain functions beside the provider.

```ts
// orders.contract.ts (orders.contracts)
import { Field, Request } from "@decohere/http";
import type { Actor } from "@app/kernel";

@Request("body")
export class PlaceOrder {
	@Field("body")
	public account!: string;

	@Field("body")
	public amount!: number;
}

export type OrderDto = {
	readonly id: string;
	readonly status: "open" | "expired" | "cancelled";
	readonly expiresAt: string;
};

export interface Orders {
	get(id: string, by: Actor): Promise<OrderDto>;
	place(request: PlaceOrder, by: Actor): Promise<OrderDto>;
}

export const OrdersToken = Symbol("orders.Orders");

// orders.provider.ts (orders.api — the one place that maps domain -> DTO)
import { inject, injectable } from "@decohere/crucible/decorators";
import type { Actor } from "@app/kernel";
import type { OrderDto, Orders, PlaceOrder } from "@app/orders.contracts";
import { type Order, OrderService } from "@app/orders.domain";

@injectable()
export class OrdersProvider implements Orders {
	public constructor(@inject(OrderService) private readonly orders: OrderService) {}

	public async get(id: string, by: Actor): Promise<OrderDto> {
		return orderDto(await this.orders.of(id, by));
	}

	public async place(request: PlaceOrder, by: Actor): Promise<OrderDto> {
		return orderDto(await this.orders.place(request.account, request.amount, by));
	}
}

function orderDto(order: Order): OrderDto {
	return {
		id: order.id,
		status: order.status,
		expiresAt: order.expiresAt.toISOString(),
	};
}

// orders.controller.ts (orders.api — thin HTTP adapter, explicit auth)
import {
	Authorize,
	Controller,
	CurrentUser,
	Get,
	Param,
	Post,
	type Principal,
} from "@decohere/http";
import { inject, injectable } from "@decohere/crucible/decorators";
import { actorOf } from "@app/kernel";
import { type OrderDto, type Orders, OrdersToken, PlaceOrder } from "@app/orders.contracts";

@Controller({ prefix: "/orders" })
@injectable()
export class OrdersController {
	public constructor(@inject(OrdersToken) private readonly orders: Orders) {}

	@Authorize("read", "Orders")
	@Get("/:id")
	public get(@Param("id") id: string, @CurrentUser() principal: Principal): Promise<OrderDto> {
		return this.orders.get(id, actorOf(principal));
	}

	@Authorize("write", "Orders")
	@Post()
	public place(body: PlaceOrder, @CurrentUser() principal: Principal): Promise<OrderDto> {
		return this.orders.place(body, actorOf(principal));
	}
}
```

**A base class and its kinds.** The base says what every kind does and does the shared part once; each kind fills in its own.

```ts
// order.entity.ts
export abstract class Order {
	protected constructor(
		public readonly id: OrderId,
		protected readonly quantity: Quantity,
	) {}

	public abstract canFillAt(price: Price): boolean;

	public fill(price: Price): Fill {
		if (!this.canFillAt(price)) {
			throw new OrderNotFillableError(this.id, price);
		}
		return new Fill(this.id, this.quantity, price);
	}
}

// limit-order.entity.ts
export class LimitOrder extends Order {
	public constructor(
		id: OrderId,
		quantity: Quantity,
		private readonly limit: Price,
	) {
		super(id, quantity);
	}

	public canFillAt(price: Price): boolean {
		return price.isAtOrBelow(this.limit);
	}
}
```

**A named error.** One class per file, its `name` set, the cause passed on.

```ts
// dependency-unavailable.error.ts
export class DependencyUnavailableError extends Error {
	public override readonly name = "DependencyUnavailableError";

	public constructor(
		public readonly dependency: string,
		reason?: string,
		options?: ErrorOptions,
	) {
		super(
			reason == null
				? `${dependency} is unavailable`
				: `${dependency} is unavailable: ${reason}`,
			options,
		);
	}
}
```

**A running process.** One hosted service with a start and a stop; its schedule and status are its own. Each turn begins and disposes its own scope through an injected scope factory, and never overlaps itself ([lifetimes](code.md#lifetimes)).

```ts
// order-expiry.job.ts
import { type LifetimeScope, LifetimeScopeToken } from "@decohere/core/composition";
import type { HostedService } from "@decohere/core/hosting";
import { inject, injectable } from "@decohere/crucible/decorators";
import { type Clock, ClockToken } from "@app/kernel";
import { OrderService } from "@app/orders.domain";

@injectable()
export class OrderExpiryJob implements HostedService {
	private timer: NodeJS.Timeout | undefined;
	private running = false;
	private lastRunAt: Date | undefined;

	public constructor(
		@inject(LifetimeScopeToken) private readonly scopes: LifetimeScope,
		@inject(ClockToken) private readonly clock: Clock,
	) {}

	public get lastRun(): Date | undefined {
		return this.lastRunAt;
	}

	public async start(): Promise<void> {
		this.timer = setInterval(() => {
			void this.runOnce();
		}, 60_000);
	}

	public async stop(): Promise<void> {
		clearInterval(this.timer);
		this.timer = undefined;
	}

	private async runOnce(): Promise<void> {
		if (this.running) {
			return;
		}
		this.running = true;
		try {
			await using scope = this.scopes.beginScope();
			await scope.resolve(OrderService).expireOverdue();
			this.lastRunAt = this.clock.now();
		} finally {
			this.running = false;
		}
	}
}
```

**Code that needs the environment takes it as a value.** The entry point reads `process.env` once and passes it in.

```ts
// static-mount.service.ts (library): no process.env here
export class StaticMountService {
	public constructor(private readonly development: boolean) {}
}

// main.ts (the app's entry): reads the environment once
const development = process.env.NODE_ENV === "development";
```
