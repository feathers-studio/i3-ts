import { Event } from "./events.ts";
import { connect, run } from "./deno.ts";
import { decode, encode, equals, readAll, UnionToIntersection } from "./util.ts";
import { i3_MSG_TYPE } from "./enum.ts";
import { Messages } from "./message-types.ts";

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

	const { emit, off, on } = Event();
	const conn = await connect(path);
	const queue: [i3_MSG_TYPE, (v: any) => void][] = [];

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
				emit(
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

	const i3 = {
		on,
		off,
		message: (<T extends i3_MSG_TYPE>(
			type: i3_MSG_TYPE,
			payload: Messages[T]["payload"],
		): Promise<Messages[T]["reply"]> =>
			new Promise(r => {
				// TODO: special handling if payload is restart / exit

				return conn
					.write(
						i3fmt(
							type,
							// object or array, serialise as-is
							payload && typeof payload === "object"
								? JSON.stringify(payload)
								: // if null, send empty string; otherwise send string
								  payload || "",
						),
					)
					.then(() => queue.push([type, r]));
			})) as UnionToIntersection<
			{
				[k in keyof Messages]: (type: k, payload: Messages[k]["payload"]) => Promise<Messages[k]["reply"]>;
			}[keyof Messages]
		>,
		runCommand: (payload: Messages[i3_MSG_TYPE.RUN_COMMAND]["payload"]) =>
			i3.message(i3_MSG_TYPE.RUN_COMMAND, payload),
		getWorkspaces: () => i3.message(i3_MSG_TYPE.GET_WORKSPACES, null),
		subscribe: (payload: Messages[i3_MSG_TYPE.SUBSCRIBE]["payload"]) => i3.message(i3_MSG_TYPE.SUBSCRIBE, payload),
		getOutputs: () => i3.message(i3_MSG_TYPE.GET_OUTPUTS, null),
		getTree: () => i3.message(i3_MSG_TYPE.GET_TREE, null),
		getMarks: () => i3.message(i3_MSG_TYPE.GET_MARKS, null),
		getBarConfig: () => i3.message(i3_MSG_TYPE.GET_BAR_CONFIG, null),
		getVersion: () => i3.message(i3_MSG_TYPE.GET_VERSION, null),
		getBindingModes: () => i3.message(i3_MSG_TYPE.GET_BINDING_MODES, null),
		getConfig: () => i3.message(i3_MSG_TYPE.GET_CONFIG, null),
		sendTick: (payload: Messages[i3_MSG_TYPE.SEND_TICK]["payload"]) => i3.message(i3_MSG_TYPE.SEND_TICK, payload),
		sync: (payload: Messages[i3_MSG_TYPE.SYNC]["payload"]) => i3.message(i3_MSG_TYPE.SYNC, payload),
		getBindingState: (payload: Messages[i3_MSG_TYPE.SYNC]["payload"]) => i3.message(i3_MSG_TYPE.SYNC, payload),
	};

	return i3;
}
