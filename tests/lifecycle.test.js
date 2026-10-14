const test = require("node:test");
const assert = require("node:assert/strict");

const { createOperationGate } = require("../detector/static/detector/js/lifecycle.js");

test("only the most recent browser operation remains current", () => {
  const gate = createOperationGate();
  const cameraStart = gate.begin();
  const imageUpload = gate.begin();

  assert.equal(gate.isCurrent(cameraStart), false);
  assert.equal(gate.isCurrent(imageUpload), true);
});
