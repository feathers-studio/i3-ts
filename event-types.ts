import { i3_EVENT_TYPE } from "./enum.ts";

type Node = {
	id: number;
	type: "root" | "output" | "con" | "floating_con" | "workspace" | "dockarea";
	/**
	 * Provided for backwards compatibility only
	 */
	orientation: "none" | "vertical" | "horizontal";
	scratchpad_state: "none" | "fresh" | "changed";
	percent: null | number;
	urgent: boolean;
	marks: string[];
	focused: boolean;
	output: string;
	layout: "splitv" | "splith" | "stacked" | "tabbed" | "dockarea" | "output";
	workspace_layout: "default" | "stacked" | "tabbed";
	last_split_layout: "splitv" | "splith";
	border: "normal" | "none" | "pixel";
	current_border_width: number;
	rect: { x: number; y: number; width: number; height: number };
	deco_rect: { x: number; y: number; width: number; height: number };
	window_rect: { x: number; y: number; width: number; height: number };
	geometry: { x: number; y: number; width: number; height: number };
	name: null | string;
	title_format?: string;
	window_icon_padding: number;
	/** Only defined for type: workspace */
	num?: number;
	gaps: { inner: number; outer: number; top: number; right: number; bottom: number; left: number };
	window: null | number;
	window_type:
		| null
		| "normal"
		| "dock"
		| "dialog"
		| "utility"
		| "toolbar"
		| "splash"
		| "menu"
		| "dropdown_menu"
		| "popup_menu"
		| "tooltip"
		| "notification"
		| "unknown";
	/**
	 * Window properties are useless to preserve when restarting because they will be queried again anyway. However, for i3-save-tree(1), they are very useful and save i3-save-tree dealing with X11.
	 */
	window_properties?: {
		class: string;
		instance: string;
		window_role: string;
		machine: string;
		title?: string;
		transient_for: null | number;
	};
	floating_nodes: Node[];
	focus: number[];
	fullscreen_mode: number; // check for details
	sticky: boolean;
	floating: "auto_off" | "auto_on" | "user_off" | "user_on";
	swallows: (
		| {
				dock: number;
				insert_where: number;
				class?: string;
				instance?: string;
				window_role?: string;
				machine?: string;
		  }
		| { id: number; restart_module: boolean }
	)[];
	nodes: Node[]; // search inplace_restart
	depth?: string;
	previous_workspace_name?: string; // only for type: root, still optional
};

export type Workspace = Node & {
	type: "workspace";
};

export type Container = Node & {
	type: "con";
};

export type WorkspaceEvent = {
	change: "focus" | "init" | "empty" | "urgent" | "reload" | "rename" | "restored" | "move";
	current: Workspace;
	old: Workspace;
};

export type OutputEvent = {
	/**
	 * Type of the change (currently only "unspecified").
	 */
	change: "unspecified";
};

export type ModeEvent = {
	/**
	 * The name of current mode in use. The name is the same as specified in config when creating a mode. The default mode is simply named default.
	 */
	change: string;
	/**
	 * Whether pango markup shall be used for displaying this mode.
	 */
	pango_markup: boolean;
};

export type WindowEvent = {
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
};

export type BarconfigUpdateEvent = {
	/**
	 * The ID for this bar. Included in case you request multiple configurations and want to differentiate the different replies.
	 */
	id: string;
	/**
	 * Either dock (the bar sets the dock window type) or hide (the bar does not show unless a specific key is pressed).
	 */
	mode: "dock" | "hide";
	/**
	 * Either bottom or top at the moment.
	 */
	position: "top" | "bottom";
	/**
	 * Command which will be run to generate a statusline. Each line on stdout of this command will be displayed in the bar. At the moment, no formatting is supported.
	 */
	status_command: string;
	/**
	 * The font to use for text on the bar.
	 */
	font: string;
	/**
	 * Display workspace buttons or not? Defaults to true.
	 */
	workspace_buttons: boolean;
	/**
	 * Display the mode indicator or not? Defaults to true.
	 */
	binding_mode_indicator: boolean;
	/**
	 * Should the bar enable verbose output for debugging? Defaults to false.
	 */
	verbose: boolean;
	/**
	 * Contains key/value pairs of colors. Each value is a color code in hex, formatted #rrggbb (like in HTML).
	 */
	colors: {
		/**
		 * Background color of the bar.
		 */
		background: string;
		/**
		 * Text color to be used for the statusline.
		 */
		statusline: string;
		/**
		 * Text color to be used for the separator.
		 */
		separator: string;
		/**
		 * Background color of the bar on the currently focused monitor output.
		 */
		focused_background: string;
		/**
		 * Text color to be used for the statusline on the currently focused monitor output.
		 */
		focused_statusline: string;
		/**
		 * Text color to be used for the separator on the currently focused monitor output.
		 */
		focused_separator: string;
		/**
		 * Text color for a workspace button when the workspace has focus.
		 */
		focused_workspace_text: string;
		/**
		 * Background color for a workspace button when the workspace has focus.
		 */
		focused_workspace_bg: string;
		/**
		 * Border color for a workspace button when the workspace has focus.
		 */
		focused_workspace_border: string;
		/**
		 * Text color for a workspace button when the workspace is active (visible) on some output, but the focus is on another one. You can only tell this apart from the focused workspace when you are using multiple monitors.
		 */
		active_workspace_text: string;
		/**
		 * Background color for a workspace button when the workspace is active (visible) on some output, but the focus is on another one. You can only tell this apart from the focused workspace when you are using multiple monitors.
		 */
		active_workspace_bg: string;
		/**
		 * Border color for a workspace button when the workspace is active (visible) on some output, but the focus is on another one. You can only tell this apart from the focused workspace when you are using multiple monitors.
		 */
		active_workspace_border: string;
		/**
		 * Text color for a workspace button when the workspace does not have focus and is not active (visible) on any output. This will be the case for most workspaces.
		 */
		inactive_workspace_text: string;
		/**
		 * Background color for a workspace button when the workspace does not have focus and is not active (visible) on any output. This will be the case for most workspaces.
		 */
		inactive_workspace_bg: string;
		/**
		 * Border color for a workspace button when the workspace does not have focus and is not active (visible) on any output. This will be the case for most workspaces.
		 */
		inactive_workspace_border: string;
		/**
		 * Text color for workspaces which contain at least one window with the urgency hint set.
		 */
		urgent_workspace_text: string;
		/**
		 * Background color for workspaces which contain at least one window with the urgency hint set.
		 */
		urgent_workspace_bg: string;
		/**
		 * Border color for workspaces which contain at least one window with the urgency hint set.
		 */
		urgent_workspace_border: string;
		/**
		 * Text color for the binding mode indicator.
		 */
		binding_mode_text: string;
		/**
		 * Background color for the binding mode indicator.
		 */
		binding_mode_bg: string;
		/**
		 * Border color for the binding mode indicator.
		 */
		binding_mode_border: string;
	};
};

export type MouseBinding = {
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
};

export type KeyboardBinding = {
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
};

export type BindingEvent = {
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
};

export type ShutdownEvent = {
	/**
	 * Indicates why the ipc is shutting down. It can be either "restart" or "exit".
	 */
	change: "exit" | "restart";
};

export type TickSubscribedEvent = {
	/**
	 * `true` if subscribed to the TICK event.
	 */
	first: true;
	/**
	 * Empty string if subscribed to the TICK event.
	 */
	payload: "";
};

export type SendTickResponseEvent = {
	/**
	 * `false` if in response to a SEND_TICK message.
	 */
	first: false;
	/**
	 * Arbitrary string sent as payload to SEND_TICK.
	 */
	payload: string;
};

export type TickEvent = TickSubscribedEvent | SendTickResponseEvent;

export type EventCtx = {
	[i3_EVENT_TYPE.WORKSPACE]: WorkspaceEvent;
	[i3_EVENT_TYPE.OUTPUT]: OutputEvent;
	[i3_EVENT_TYPE.MODE]: ModeEvent;
	[i3_EVENT_TYPE.WINDOW]: WindowEvent;
	[i3_EVENT_TYPE.BARCONFIG_UPDATE]: BarconfigUpdateEvent;
	[i3_EVENT_TYPE.BINDING]: BindingEvent;
	[i3_EVENT_TYPE.SHUTDOWN]: ShutdownEvent;
	[i3_EVENT_TYPE.TICK]: TickEvent;
};
