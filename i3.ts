import { connect, run } from "./deno.ts";
import { Event } from "./events.ts";
import { encode } from "./util.ts";

export const enum i3MSGTYPE {
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

export const enum i3REPLYTYPE {
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

const i3_MAGIC = encode("i3-ipc");

const i3fmt = (type: i3MSGTYPE, payload: string = "") => {
	const pl = encode(payload);
	const buf = new Uint8Array(i3_MAGIC.length + 8 + pl.length);
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
	const conn = await connect(path);

	const events = Event();

	return {
		...events,
		message: (type: i3MSGTYPE, payload: string) => conn.write(i3fmt(type, payload)),
	};
}

const i3 = await Connect();
i3.message(i3MSGTYPE.RUN_COMMAND, "exec screen");
