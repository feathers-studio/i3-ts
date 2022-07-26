import { connect, run } from "./deno.ts";
import { Event } from "./events.ts";
import { decode, encode, equals, readAll } from "./util.ts";

export enum i3MSGTYPE {
	RUN_COMMAND,
	GET_WORKSPACES,
	SUBSCRIBE,
	GET_OUTPUTS,
	GET_TREE,
	GET_MARKS,
	GET_BAR_CONFIG,
	GET_VERSION,
	GET_BINDING_MODES,
	GET_CONFIG,
	SEND_TICK,
	SYNC,
	GET_BINDING_STATE,
}

export enum i3REPLYTYPE {
	COMMAND,
	WORKSPACES,
	SUBSCRIBE,
	OUTPUTS,
	TREE,
	MARKS,
	BAR_CONFIG,
	VERSION,
	BINDING_MODES,
	CONFIG,
	TICK,
	SYNC,
	BINDING_STATE,
}

export enum i3EVENTS {
	WORKSPACE,
	OUTPUT,
	MODE,
	WINDOW,
	BARCONFIG_UPDATE,
	BINDING,
	SHUTDOWN,
	TICK,
}

const i3_MAGIC = encode("i3-ipc");
const i3_HEADER = i3_MAGIC.length + 8;

const i3fmt = (type: i3MSGTYPE, payload: string = "") => {
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

const toEvent = (type: i3REPLYTYPE) => String(type);
const toRes = (type: i3REPLYTYPE) => String(type);

export async function Connect() {
	const path = (await run(["i3", "--get-socketpath"])).trim();

	const events = Event();
	const conn = await connect(path);

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
			const type = header.getUint32(4, true) as i3REPLYTYPE;
			const isEvent = type >>> 31 === 1;
			const trueType = isEvent ? toEvent(type & 0b01111111111111111111111111111111) : toRes(type);

			if (length === 0) {
				// no more payload to parse
				events.emit(trueType, {});
				continue;
			}

			{
				// start parsing payload

				// read until length
				const buf = new Uint8Array(length);
				const read = await readAll(conn, buf);

				if (read === null || read < length) throw new TypeError("Unexpected end of payload");

				events.emit(trueType, JSON.parse(decode(buf)));
			}
		}
	}

	listen();

	return {
		...events,
		message: (type: i3MSGTYPE, payload: string) => conn.write(i3fmt(type, payload)),
	};
}
