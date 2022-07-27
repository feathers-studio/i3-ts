import { i3_EVENT_TYPE } from "./enum.ts";
import { EventCtx } from "./event-types.ts";

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
type Intersect<T> = T extends {} ? UnionToIntersection<T[keyof T]> : never;

type Emitters = Intersect<{
	[Event in keyof EventCtx]: (event: Event, ctx: EventCtx[Event]) => void;
}>;

type Listeners = {
	[Event in keyof EventCtx]: ((ctx: EventCtx[Event]) => void)[];
};

type EventTypes = Intersect<{
	[Event in keyof EventCtx]: (event: Event, listener: Listeners[Event][number]) => void;
}>;

export const Event = () => {
	const listeners = Object.fromEntries(
		// There are 0-7 events, must be kept in sync with enum.ts > i3_EVENT_TYPE
		Array(8)
			.fill([])
			.map((each, idx) => [idx, each] as const),
		// help TypeScript because we know the correct types
	) as Listeners;

	const emit: Emitters = (event: i3_EVENT_TYPE, ctx: any) => listeners[event].forEach(listener => listener(ctx));

	const on: EventTypes = (event: i3_EVENT_TYPE, listener: any) => {
		listeners[event].push(listener);
	};

	const off: EventTypes = (event: i3_EVENT_TYPE, listener) => {
		const idx = listeners[event].findIndex(l => l === listener);
		listeners[event].splice(idx, 1);
	};

	return { emit, on, off };
};
