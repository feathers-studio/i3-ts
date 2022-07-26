export const encode = (s: string) => new TextEncoder().encode(s);
export const decode = (b: Uint8Array) => new TextDecoder().decode(b);

export const hex = (buf: Uint8Array) =>
	Array.prototype.map.call(new Uint8Array(buf), (x: number) => x.toString(16).padStart(2, "0")).join(" ");

export function copy(src: Uint8Array, dst: Uint8Array, off = 0): number {
	off = Math.max(0, Math.min(off, dst.byteLength));
	const dstBytesAvailable = dst.byteLength - off;
	if (src.byteLength > dstBytesAvailable) {
		src = src.subarray(0, dstBytesAvailable);
	}
	dst.set(src, off);
	return src.byteLength;
}

export const equals = (a: Uint8Array, b: Uint8Array) => a.every((x, i) => x === b[i]);

export async function readAll(src: Deno.Reader, dst: Uint8Array) {
	let n = 0;
	while (n < dst.byteLength) {
		const read = await src.read(dst.subarray(n));

		// reader has ended
		if (read === null)
			if (n === 0) return null;
			else return n;

		n += read;
	}

	return n;
}
