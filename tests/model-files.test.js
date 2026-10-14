const test = require("node:test");
const assert = require("node:assert/strict");

const { findModelFiles } = require("../detector/static/detector/js/model-files.js");

test("finds the three required Teachable Machine files from a chosen folder", () => {
  const files = [
    { name: "weights.bin" },
    { name: "metadata.json" },
    { name: "model.json" },
  ];

  assert.deepEqual(findModelFiles(files), {
    model: files[2],
    weights: files[0],
    metadata: files[1],
  });
});
