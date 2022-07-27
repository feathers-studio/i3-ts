import { EVENTS, i3_MSG_TYPE } from "./enum.ts";

export interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface Workspace {
	id: number;
	num: number;
	name: string;
	visible: boolean;
	focused: boolean;
	urgent: boolean;
	output: string;
	rect: Rect;
}

export interface Output {
	name: string;
	active: boolean;
	primary: boolean;
	current_workspace: null | string;
	rect: Rect;
}

// Based on https://github.com/i3/i3/blob/535da94536a005fb60e29f7bf902e49390b9cc10/src/ipc.c#L338
export interface Node {
	/**
	 * The internal ID (actually a C pointer value) of this container. Do not make any assumptions about it.
	 * You can use it to (re-)identify and address containers when talking to i3.
	 */
	id: number;
	/**
	 * Type of this container.
	 */
	type: "root" | "output" | "con" | "floating_con" | "workspace" | "dockarea";
	/**
	 * Whether the window is not in the scratchpad ("none"), freshly moved to the scratchpad but not
	 * yet resized ("fresh") or moved to the scratchpad and resized ("changed").
	 */
	scratchpad_state: "none" | "fresh" | "changed";
	/**
	 * The percentage which this container takes in its parent. A value of null means that the percent
	 * property does not make sense for this container, for example for the root container.
	 */
	percent: null | number;
	/**
	 * Whether this container (window, split container, floating container or workspace) has the urgency
	 * hint set, directly or indirectly. All parent containers up until the workspace container will
	 * be marked urgent if they have at least one urgent child.
	 */
	urgent: boolean;
	/**
	 * List of marks assigned to container.
	 */
	marks: string[];
	/**
	 * Whether this container is currently focused.
	 */
	focused: boolean;
	/**
	 * List of child node IDs (see nodes, floating_nodes and id) in focus order. Traversing the tree
	 * by following the first entry in this array will result in eventually reaching the one node
	 * with focused set to true.
	 */
	focus: number[];
	output: string;
	layout: "splitv" | "splith" | "stacked" | "tabbed" | "dockarea" | "output";
	workspace_layout: "default" | "stacked" | "tabbed";
	last_split_layout: "splitv" | "splith";
	title_format?: string;
	window_icon_padding: number;
	sticky: boolean;
	floating: "auto_off" | "auto_on" | "user_off" | "user_on";
	depth?: string;
	previous_workspace_name?: string; // only for type: root, still optional
	/**
	 * The X11 window ID of the actual client window inside this container. This field is set to
	 * null for split containers or otherwise empty containers. This ID corresponds to what xwininfo(1)
	 * and other X11-related tools display (usually in hex).
	 */
	window: null | number;
	/**
	 * Container’s border style.
	 */
	border: "normal" | "none" | "pixel";
	/**
	 * Number of pixels of the border width.
	 */
	current_border_width: number;
	/**
	 * The absolute display coordinates for this container. Display coordinates means that when you
	 * have two `1600x1200` monitors on a single X11 Display (the standard way), the coordinates of
	 * the first window on the second monitor are `{ "x": 1600, "y": 0, "width": 1600, "height": 1200 }`
	 */
	rect: Rect;
	/**
	 * The coordinates of the window decoration inside its container. These coordinates are relative
	 * to the container and do not include the actual client window.
	 */
	deco_rect: Rect;
	window_rect: Rect;
	/**
	 * The original geometry the window specified when i3 mapped it. Used when switching a window to
	 * floating mode, for example.
	 */
	geometry: Rect;
	/**
	 * The internal name of this container. For all containers which are part of the tree structure
	 * down to the workspace contents, this is set to a nice human-readable name of the container.
	 * For containers that have an X11 window, the content is the title (_NET_WM_NAME property) of
	 * that window. For all other containers, the content is not defined (yet).
	 */
	name: null | string;
	/**
	 * The logical number of the workspace. Corresponds to the command to switch to this workspace.
	 * Only defined for type: workspace. For named workspaces, this will be -1.
	 */
	num?: number;
	/**
	 * Whether this container is in fullscreen state or not.
	 * * 0 (no fullscreen)
	 * * 1 (fullscreened on output)
	 * * 2 (fullscreened globally)
	 *
	 * Note that all workspaces are considered fullscreened on their respective output.
	 */
	fullscreen_mode: 0 | 1 | 2;
	/**
	 * The window type (_NET_WM_WINDOW_TYPE).
	 */
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
	gaps?: {
		inner: number;
		outer: number;
		top: number;
		right: number;
		bottom: number;
		left: number;
	};
	/**
	 * This optional field contains all available X11 window properties.
	 *
	 * Window properties are useless to preserve when restarting because they will be queried again
	 * anyway. However, for i3-save-tree(1), they are very useful and save i3-save-tree dealing with X11.
	 */
	window_properties?: {
		class: string;
		instance: string;
		window_role: string;
		machine: string;
		title?: string;
		transient_for: null | number;
	};
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
	/**
	 * The floating child containers of this node. Only non-empty on nodes with type workspace.
	 */
	floating_nodes: Node[];
	/**
	 * The tiling (i.e. non-floating) child containers of this node.
	 */
	nodes: Node[];
}

export interface BarConfig {
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
}

export interface i3Config {
	path: string;
	raw_contents: string;
	variable_replaced_contents: string;
}

// --

export interface RunCommand {
	payload: string;
	reply: ({ success: boolean; parse_error: undefined } | { success: false; parse_error?: true })[];
}

export interface GetWorkspaces {
	payload: null;
	reply: Workspace[];
}

export interface Subscribe {
	payload: typeof EVENTS[number][];
	reply: { success: boolean };
}

export interface GetOutputs {
	payload: null;
	reply: Output[];
}

export interface GetTree {
	payload: null;
	reply: Node;
}

export type GetMarks = {
	payload: null;
	reply: string[];
};

export type GetBarConfig =
	| {
			payload: null;
			reply: string[];
	  }
	| {
			payload: string;
			reply: BarConfig;
	  };

export interface GetVersion {
	payload: null;
	reply: {
		major: number;
		minor: number;
		patch: number;
		human_readable: string;
		loaded_config_file_name: string;
	};
}

export interface GetBindingModes {
	payload: null;
	reply: string[];
}

export interface GetConfig {
	payload: null;
	reply: {
		config: string;
		included_configs: i3Config[];
	};
}

export interface SendTick {
	payload: string;
	reply: { success: boolean };
}

export interface Sync {
	payload: { rnd: number; window: number };
	reply: { success: boolean };
}

export interface GetBindingState {
	payload: null;
	reply: { success: boolean };
}

export type Messages = {
	[i3_MSG_TYPE.RUN_COMMAND]: RunCommand;
	[i3_MSG_TYPE.GET_WORKSPACES]: GetWorkspaces;
	[i3_MSG_TYPE.SUBSCRIBE]: Subscribe;
	[i3_MSG_TYPE.GET_OUTPUTS]: GetOutputs;
	[i3_MSG_TYPE.GET_TREE]: GetTree;
	[i3_MSG_TYPE.GET_MARKS]: GetMarks;
	[i3_MSG_TYPE.GET_BAR_CONFIG]: GetBarConfig;
	[i3_MSG_TYPE.GET_VERSION]: GetVersion;
	[i3_MSG_TYPE.GET_BINDING_MODES]: GetBindingModes;
	[i3_MSG_TYPE.GET_CONFIG]: GetConfig;
	[i3_MSG_TYPE.SEND_TICK]: SendTick;
	[i3_MSG_TYPE.SYNC]: Sync;
	[i3_MSG_TYPE.GET_BINDING_STATE]: GetBindingState;
};

declare const msg: Messages;

const x = msg[0];
