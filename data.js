
const ITEM_TYPES = [
  "Show All",
  "Artifact",
  "Active",
  "Coin",
  "Bomb",
  "Key",
  "Heart",
  "Consumable Artifact",
  "Weapon",
  "Battery",
  "Hat",
  "Pouch",
  "Scourge"
];

const ITEM_POOLS = [
  "consumable",
  "treasure",
  "secret",
  "snek",
  "boxy",
  "starting_weapon",
  "shop",
  "boss",
  "shop_consumable",
  "safe",
  "charger",
  "wooden_chest",
  "gold_chest",
  "scourged_chest",
  "double_chest",
  "triple_chest",
  "red_chest",
  "pet",
  "orbital",
  "stone_chest",
  "granny",
  "old_man",
  "vampire",
  "roger",
  "unused",
  "spiked_room",
  "duck_chest",
  "gobetta",
];

const DISP_ITEM_POOLS = (['Show All',...ITEM_POOLS]).map(stringifyId);