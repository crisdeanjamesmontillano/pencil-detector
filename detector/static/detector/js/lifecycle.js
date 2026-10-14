(function exposeOperationGate(root) {
  function createOperationGate() {
    let generation = 0;

    return {
      begin() {
        generation += 1;
        return generation;
      },
      isCurrent(token) {
        return token === generation;
      },
    };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { createOperationGate };
  }
  if (root) {
    root.detectorLifecycle = { createOperationGate };
  }
})(typeof window === "undefined" ? null : window);
