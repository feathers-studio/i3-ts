import { i3_EVENT_TYPE, i3_MSG_TYPE, i3_REPLY_TYPE } from "./enum.ts";

export * from "./i3.ts";

// For convenient access
export namespace Enums {
	export import Messages = i3_MSG_TYPE;
	export import Replies = i3_REPLY_TYPE;
	export import Events = i3_EVENT_TYPE;
}

// For even more convenient access
export { i3_EVENT_TYPE as Events };

export { version, i3version } from "./version.ts";
