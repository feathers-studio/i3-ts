import { Event } from "./events.ts";
import { connect, run } from "./deno.ts";
import { decode, encode, equals, readAll } from "./util.ts";
import { i3_EVENT_TYPE, i3_MSG_TYPE, i3_REPLY_TYPE } from "./enum.ts";

const i3_MAGIC = encode("i3-ipc");
const i3_HEADER = i3_MAGIC.length + 8;

const i3fmt = (type: i3_MSG_TYPE, payload: string = "") => {
	const pl = encode(payload);
	const buf = new Uint8Array(i3_HEADER + pl.length);
	const dv = new DataView(buf.buffer);

	let offset = 0;

	// write magic
	buf.set(i3_MAGIC, offset);

	offset = i3_MAGIC.length;

	// write payload length
	dv.setUint32(offset, pl.length, true);
	offset += 4;

	// write msg type
	dv.setUint32(offset, type, true);
	offset += 4;

	// write payload
	buf.set(pl, offset);

	return buf;
};

export async function Connect() {
	const path = (await run(["i3", "--get-socketpath"])).trim();

	const events = Event();
	const conn = await connect(path);
	const queue: [i3_MSG_TYPE, (v: unknown) => void][] = [];

	async function listen() {
		const b = new Uint8Array(i3_HEADER);
		while (true) {
			const read = await readAll(conn, b);
			if (read === null) return;

			let offset = i3_MAGIC.length;

			if (read < i3_HEADER) continue;
			if (!equals(i3_MAGIC, b.slice(0, offset)))
				throw new TypeError("Unexpected sequence; magic header expected");

			// b is at least header length
			const header = new DataView(b.buffer, offset, 8);
			const length = header.getUint32(0, true);
			const type = header.getUint32(4, true);

			// check if high bit is 1
			const isEvent = type >>> 31 === 1;

			let payload = {};

			if (length > 0) {
				// read until length
				const buf = new Uint8Array(length);
				const read = await readAll(conn, buf);

				if (read === null || read < length) throw new TypeError("Unexpected end of payload");
				payload = JSON.parse(decode(buf));
			}

			if (isEvent)
				events.emit(
					// mask high bit
					type & 0b01111111111111111111111111111111,
					// @ts-expect-error cannot correctly type payload without runtime type-checking
					payload,
				);
			else {
				const [expected, resolve] = queue.shift() || [];
				if (!resolve) throw new Error("Unexpected response from i3");
				if (type !== expected) throw new TypeError("Unexpected response type");
				resolve(payload);
			}
		}
	}

	listen();

	return {
		...events,
		message: (type: i3_MSG_TYPE, payload: string) =>
			new Promise(r => {
				conn.write(i3fmt(type, payload));
				queue.push([type, r]);
			}),
	};
}
