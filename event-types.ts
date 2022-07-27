import { i3_EVENT_TYPE } from "./enum.ts";
import { BarConfig, Node } from "./message-types.ts";

export interface Workspace extends Node {
	type: "workspace";
}

export interface Container extends Node {
	type: "con";
}

export interface WorkspaceEvent {
	change: "focus" | "init" | "empty" | "urgent" | "reload" | "rename" | "restored" | "move";
	current: Workspace;
	old: Workspace;
}

export interface OutputEvent {
	/**
	 * Type of the change (currently only "unspecified").
	 */
	change: "unspecified";
}

export interface ModeEvent {
	/**
	 * The name of current mode in use. The name is the same as specified in config when creating a mode. The default mode is simply named default.
	 */
	change: string;
	/**
	 * Whether pango markup shall be used for displaying this mode.
	 */
	pango_markup: boolean;
}

export interface WindowEvent {
	/**
	 * Indicates the type of change:
	 * * new – the window has become managed by i3
	 * * close – the window has closed
	 * * focus – the window has received input focus
	 * * title – the window’s title has changed
	 * * fullscreen_mode – the window has entered or exited fullscreen mode
	 * * move – the window has changed its position in the tree
	 * * floating – the window has transitioned to or from floating
	 * * urgent – the window has become urgent or lost its urgent status
	 * * mark – a mark has been added to or removed from the window
	 */
	change: "new" | "close" | "focus" | "title" | "fullscreen_mode" | "move" | "floating" | "urgent" | "mark";
	/**
	 * Window’s parent container. Be aware that for the "new" event, the container will hold the initial name of the newly reparented window (e.g. if you run urxvt with a shell that changes the title, you will still at this point get the window title as "urxvt").
	 */
	container: Container;
}

export interface BarconfigUpdateEvent extends BarConfig {}

export interface MouseBinding {
	/**
	 * This will be "keyboard" or "mouse" depending on whether or not this was a keyboard or a mouse binding.
	 */
	input_type: "mouse";
	/**
	 * If the binding was configured with bindcode, this will be the key code that was given for the binding. If the binding is a mouse binding, it will be the number of the mouse button that was pressed. Otherwise it will be 0.
	 */
	input_code: number;
	/**
	 * If this is a keyboard binding that was configured with bindsym, this field will contain the given symbol. Otherwise it will be null.
	 */
	symbol: null;
}

export interface KeyboardBinding {
	/**
	 * This will be "keyboard" or "mouse" depending on whether or not this was a keyboard or a mouse binding.
	 */
	input_type: "keyboard";
	/**
	 * If the binding was configured with bindcode, this will be the key code that was given for the binding. If the binding is a mouse binding, it will be the number of the mouse button that was pressed. Otherwise it will be 0.
	 */
	input_code: 0;
	/**
	 * If this is a keyboard binding that was configured with bindsym, this field will contain the given symbol. Otherwise it will be null.
	 */
	symbol: string;
}

export interface BindingEvent {
	/**
	 * Indicates what sort of binding event was triggered (right now it will always be "run" but may be expanded in the future).
	 */
	change: "run";
	/**
	 * Details about the binding that was run.
	 */
	binding: {
		/**
		 * The i3 command that is configured to run for this binding.
		 */
		command: string;
		/**
		 * The group and modifier keys that were configured with this binding.
		 */
		event_state_mask: string[];
	} & (MouseBinding | KeyboardBinding);
}

export interface ShutdownEvent {
	/**
	 * Indicates why the ipc is shutting down. It can be either "restart" or "exit".
	 */
	change: "exit" | "restart";
}

export interface TickSubscribedEvent {
	/**
	 * `true` if subscribed to the TICK event.
	 */
	first: true;
	/**
	 * Empty string if subscribed to the TICK event.
	 */
	payload: "";
}

export interface SendTickResponseEvent {
	/**
	 * `false` if in response to a SEND_TICK message.
	 */
	first: false;
	/**
	 * Arbitrary string sent as payload to SEND_TICK.
	 */
	payload: string;
}

export type TickEvent = TickSubscribedEvent | SendTickResponseEvent;

export interface EventCtx {
	[i3_EVENT_TYPE.WORKSPACE]: WorkspaceEvent;
	[i3_EVENT_TYPE.OUTPUT]: OutputEvent;
	[i3_EVENT_TYPE.MODE]: ModeEvent;
	[i3_EVENT_TYPE.WINDOW]: WindowEvent;
	[i3_EVENT_TYPE.BARCONFIG_UPDATE]: BarconfigUpdateEvent;
	[i3_EVENT_TYPE.BINDING]: BindingEvent;
	[i3_EVENT_TYPE.SHUTDOWN]: ShutdownEvent;
	[i3_EVENT_TYPE.TICK]: TickEvent;
}
