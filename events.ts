type EventCtx = {
	[k: string]: any;
};

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
	const listeners: Listeners = {};

	const emit: Emitters = (event: keyof Listeners, ctx: any) => listeners[event].forEach(listener => listener(ctx));

	const on: EventTypes = (event: keyof Listeners, listener: any) => {
		listeners[event].push(listener);
	};

	const off: EventTypes = (event: keyof Listeners, listener) => {
		const idx = listeners[event].findIndex(l => l === listener);
		listeners[event].splice(idx, 1);
	};

	return { emit, on, off };
};
