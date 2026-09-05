import test from "node:test";
import assert from "node:assert/strict";
import { validate } from "@mapbox/mapbox-gl-style-spec";
import { mapStyle } from "../src/constants/mapStyle";
test("custom style satisfies the Mapbox style specification", () => {
  assert.deepEqual(validate(JSON.stringify(mapStyle)), []);
});
