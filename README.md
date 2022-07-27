# i3-ts

Modern, smart TypeScript bindings for the i3 window manager over [ipc](https://i3wm.org/docs/ipc.html). This library can be used to script and control i3.

You must have i3 and i3-ipc installed.

> Note: This project currently only supports Deno; however that may change in the future.

## API

The API closely mimics i3-ipc; however with i3-ts, you don't need to listen on events for message replies. All messages are strongly typed and promisified.

```TypeScript
import { Connect, Enums, Events } from "https://domain/path/to/i3-ts/mod.ts";

// creating an instance
const i3 = await Connect();

// sending a message
const [{ success }] = await i3.runCommand("exec flameshot");
const workspaces = await i3.getWorkspaces();
const outputs = await i3.getOutputs();

// listening on events
i3.on(Events.Workspace, ctx => {
	console.log(ctx.change); // "focus"
});
```
