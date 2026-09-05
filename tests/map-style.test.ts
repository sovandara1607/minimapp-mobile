import test from "node:test";
import assert from "node:assert/strict";
import { GOOGLE_MAP_STYLE } from "../src/constants/mapStyle";

const ELEMENT_TYPES = new Set([
  "all",
  "geometry",
  "geometry.fill",
  "geometry.stroke",
  "labels",
  "labels.icon",
  "labels.text",
  "labels.text.fill",
  "labels.text.stroke",
]);
const STYLER_KEYS = new Set([
  "color",
  "hue",
  "lightness",
  "saturation",
  "gamma",
  "invert_lightness",
  "visibility",
  "weight",
]);

test("custom style is a well-formed Google Maps style array", () => {
  assert.ok(Array.isArray(GOOGLE_MAP_STYLE) && GOOGLE_MAP_STYLE.length > 0);
  for (const rule of GOOGLE_MAP_STYLE) {
    if (rule.elementType) assert.ok(ELEMENT_TYPES.has(rule.elementType));
    assert.ok(Array.isArray(rule.stylers) && rule.stylers.length > 0);
    for (const styler of rule.stylers as Record<string, unknown>[]) {
      for (const key of Object.keys(styler)) assert.ok(STYLER_KEYS.has(key));
      if ("color" in styler)
        assert.match(styler.color as string, /^#[0-9A-Fa-f]{6}$/);
    }
  }
});
