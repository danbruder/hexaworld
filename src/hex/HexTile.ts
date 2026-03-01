import { defineHex, Orientation } from "honeycomb-grid";
import { HEX_SIZE } from "../constants";

export const HexTile = defineHex({
  dimensions: HEX_SIZE,
  orientation: Orientation.FLAT,
  origin: "topLeft",
});
