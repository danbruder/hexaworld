export const HEX_SIZE = 40;

export const COLORS = [
  0x4a9e4a, // green
  0x3a7ecf, // blue
  0xc9a030, // sand
  0x8b5e3c, // brown
  0xd4534a, // red
  0x9b59b6, // purple
  0xe67e22, // orange
  0x95a5a6, // gray
];

export const BACKGROUND_COLOR = 0x1a1a2e;

export const ZOOM_MIN = 0.25;
export const ZOOM_MAX = 3;
export const ZOOM_SPEED = 0.001;

export const BRIDGE_COLOR = 0x8b7355;
export const GHOST_COLOR = 0x555577;
export const CHARACTER_COLOR = 0xffffff;

export const TILE_KINDS = [
  { id: "plain" as const, label: "Plain", icon: "", color: null },
  { id: "grass" as const, label: "Grass", icon: "\u{1F33F}", color: 0x2d5a1e },
  { id: "wood" as const, label: "Wood", icon: "\u{1FAB5}", color: 0x5c3a1e },
  { id: "snow" as const, label: "Snow", icon: "\u{2744}\u{FE0F}", color: 0xc8dce8 },
  { id: "fire" as const, label: "Fire", icon: "\u{1F525}", color: 0x8b2500 },
];
