(function exposeModelFiles(root) {
  function findModelFiles(files) {
    const selectedFiles = Array.from(files);
    const model = selectedFiles.find((file) => file.name === "model.json");
    const metadata = selectedFiles.find((file) => file.name === "metadata.json");
    const weights = selectedFiles.find((file) => file.name.endsWith(".bin"));

    if (!model || !metadata || !weights) {
      throw new Error("Choose the exported model folder containing model.json, metadata.json, and a .bin weights file.");
    }

    return { model, weights, metadata };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { findModelFiles };
  }
  if (root) {
    root.detectorModelFiles = { findModelFiles };
  }
})(typeof window === "undefined" ? null : window);
