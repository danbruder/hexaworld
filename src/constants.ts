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

export const PLAYER_CHARACTERS = [
  { id: "person", label: "Person", icon: "\u{1F9D1}" },
  { id: "woman", label: "Woman", icon: "\u{1F469}" },
  { id: "man", label: "Man", icon: "\u{1F468}" },
  { id: "ninja", label: "Ninja", icon: "\u{1F977}" },
  { id: "astronaut", label: "Astronaut", icon: "\u{1F9D1}\u{200D}\u{1F680}" },
  { id: "racecar", label: "Race Car", icon: "\u{1F3CE}\u{FE0F}" },
  { id: "fox", label: "Fox", icon: "\u{1F98A}" },
  { id: "elephant", label: "Elephant", icon: "\u{1F418}" },
  { id: "cat", label: "Cat", icon: "\u{1F431}" },
  { id: "dog", label: "Dog", icon: "\u{1F436}" },
  { id: "unicorn", label: "Unicorn", icon: "\u{1F984}" },
  { id: "dragon", label: "Dragon", icon: "\u{1F409}" },
  { id: "alien", label: "Alien", icon: "\u{1F47D}" },
  { id: "robot", label: "Robot", icon: "\u{1F916}" },
  { id: "ghost", label: "Ghost", icon: "\u{1F47B}" },
  { id: "eagle", label: "Eagle", icon: "\u{1F985}" },
];

export const COLOR_NAMES = ["Green", "Blue", "Sand", "Brown", "Red", "Purple", "Orange", "Gray"];

export const TILE_KINDS = [
  // Color tile (uses selectedColor)
  { id: "color", label: "Color", icon: "", color: null, defaultDamage: 0 },
  { id: "grass", label: "Grass", icon: "\u{1F33F}", color: 0x2d5a1e, defaultDamage: 0 },
  { id: "wood", label: "Wood", icon: "\u{1FAB5}", color: 0x5c3a1e, defaultDamage: 0 },
  { id: "snow", label: "Snow", icon: "\u{2744}\u{FE0F}", color: 0xc8dce8, defaultDamage: 5 },
  { id: "fire", label: "Fire", icon: "\u{1F525}", color: 0x8b2500, defaultDamage: 30 },
  // Elements
  { id: "lava", label: "Lava", icon: "\u{1F30B}", color: 0xcc3300, defaultDamage: 50 },
  { id: "water", label: "Water", icon: "\u{1F30A}", color: 0x1a5276, defaultDamage: 5 },
  { id: "rain", label: "Rain", icon: "\u{1F327}\u{FE0F}", color: 0x4a6a8a, defaultDamage: 0 },
  { id: "wind", label: "Wind", icon: "\u{1F32C}\u{FE0F}", color: 0x8faabc, defaultDamage: 0 },
  { id: "ice", label: "Ice", icon: "\u{1F9CA}", color: 0xa8d8ea, defaultDamage: 10 },
  { id: "lightning", label: "Lightning", icon: "\u{26A1}", color: 0x3d3055, defaultDamage: 40 },
  // Nature
  { id: "flower", label: "Flower", icon: "\u{1F33A}", color: 0x4a7a2e, defaultDamage: -10 },
  { id: "tree", label: "Tree", icon: "\u{1F333}", color: 0x1b4d1b, defaultDamage: 0 },
  { id: "palm", label: "Palm", icon: "\u{1F334}", color: 0x3a7a3a, defaultDamage: 0 },
  { id: "cactus", label: "Cactus", icon: "\u{1F335}", color: 0x8a7a40, defaultDamage: 15 },
  { id: "mushroom", label: "Mushroom", icon: "\u{1F344}", color: 0x3a2a1a, defaultDamage: -5 },
  { id: "rock", label: "Rock", icon: "\u{1FAA8}", color: 0x5a5a5a, defaultDamage: 0 },
  // Terrain
  { id: "sand", label: "Sand", icon: "\u{1F3D6}\u{FE0F}", color: 0xc2a645, defaultDamage: 0 },
  { id: "mountain", label: "Mountain", icon: "\u{26F0}\u{FE0F}", color: 0x5a4a3a, defaultDamage: 10 },
  { id: "volcano", label: "Volcano", icon: "\u{1F30B}", color: 0x6b3030, defaultDamage: 50 },
  { id: "swamp", label: "Swamp", icon: "\u{1F9A0}", color: 0x3a4a20, defaultDamage: 10 },
  // Structures
  { id: "house", label: "House", icon: "\u{1F3E0}", color: 0x6a5040, defaultDamage: -15 },
  { id: "castle", label: "Castle", icon: "\u{1F3F0}", color: 0x7a7a8a, defaultDamage: -20 },
  { id: "tent", label: "Tent", icon: "\u{26FA}", color: 0x5a7a4a, defaultDamage: -5 },
  { id: "tower", label: "Tower", icon: "\u{1F3EF}", color: 0x8a6a5a, defaultDamage: 0 },
  { id: "farm", label: "Farm", icon: "\u{1F33E}", color: 0x8a7a30, defaultDamage: -10 },
  { id: "mine", label: "Mine", icon: "\u{26CF}\u{FE0F}", color: 0x4a3a2a, defaultDamage: 5 },
  // Special
  { id: "crystal", label: "Crystal", icon: "\u{1F48E}", color: 0x2a4a6a, defaultDamage: -25 },
  { id: "star", label: "Star", icon: "\u{2B50}", color: 0x2a2a4a, defaultDamage: -30 },
  { id: "portal", label: "Portal", icon: "\u{1F300}", color: 0x4a2a6a, defaultDamage: 0 },
  { id: "skull", label: "Skull", icon: "\u{1F480}", color: 0x3a3a3a, defaultDamage: 0 },
  { id: "treasure", label: "Treasure", icon: "\u{1F4B0}", color: 0x6a5a20, defaultDamage: -20 },
  { id: "flag", label: "Flag", icon: "\u{1F6A9}", color: 0x5a4a3a, defaultDamage: 0 },
];
