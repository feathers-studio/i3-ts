import { decode } from "./util.ts";

export const run = async (cmd: string[]) => {
	const p = Deno.run({
		cmd: cmd,
		stdout: "piped",
		stderr: "piped",
	});

	const status = await p.status();

	if (!status.success) {
		throw new Error(decode(await p.stderrOutput()));
	}

	return decode(await p.output());
};

export const connect = (path: string) => Deno.connect({ transport: "unix", path });
