(() => {
  const modelFolderInput = document.querySelector("#model-folder");
  const startCameraButton = document.querySelector("#start-camera");
  const stopCameraButton = document.querySelector("#stop-camera");
  const imageUploadInput = document.querySelector("#image-upload");
  const preview = document.querySelector("#preview");
  const status = document.querySelector("#status");
  const predictionLabel = document.querySelector("#prediction-label");
  const predictionConfidence = document.querySelector("#prediction-confidence");

  let model = null;
  let video = null;
  let animationFrame = null;
  const operationGate = window.detectorLifecycle.createOperationGate();

  function setStatus(message) {
    status.textContent = message;
  }

  function setPrediction(label = "Can you find the pencil? 👀", confidence = "") {
    predictionLabel.textContent = label;
    predictionConfidence.textContent = confidence;
  }

  function setPreview(element) {
    preview.replaceChildren(element);
  }

  function setModelControls(isReady) {
    startCameraButton.disabled = !isReady;
    imageUploadInput.disabled = !isReady;
  }

  async function loadModel(files) {
    stopCamera(false);
    const operation = operationGate.begin();
    setModelControls(false);
    setPrediction();

    if (!files.length) {
      setStatus("Choose your downloaded Teachable Machine model folder first.");
      return;
    }

    try {
      const modelFiles = window.detectorModelFiles.findModelFiles(files);
      setStatus("Loading downloaded Teachable Machine model…");
      const loadedModel = await tmImage.loadFromFiles(
        modelFiles.model,
        modelFiles.weights,
        modelFiles.metadata,
      );
      if (!operationGate.isCurrent(operation)) {
        return;
      }
      model = loadedModel;
      setModelControls(true);
      setStatus("Model loaded from your selected folder. Start the camera or upload an image.");
    } catch (error) {
      if (!operationGate.isCurrent(operation)) {
        return;
      }
      model = null;
      setModelControls(false);
      setStatus(`Could not load the model: ${error.message}`);
    }
  }

  async function predictSource(source, operation) {
    if (!model) {
      setStatus("Load a Teachable Machine model before identifying Pencil.");
      return;
    }

    try {
      const predictions = await model.predict(source);
      if (!operationGate.isCurrent(operation)) {
        return;
      }
      const topPrediction = predictions.reduce(
        (best, current) => current.probability > best.probability ? current : best,
      );
      setPrediction(topPrediction.className, `${(topPrediction.probability * 100).toFixed(1)}% confidence`);
      setStatus("Prediction updated.");
    } catch (error) {
      if (!operationGate.isCurrent(operation)) {
        return;
      }
      setStatus(`Could not identify this image: ${error.message}`);
    }
  }

  async function cameraLoop(operation) {
    if (!operationGate.isCurrent(operation) || !video || video.paused || video.ended) {
      return;
    }
    await predictSource(video, operation);
    if (operationGate.isCurrent(operation)) {
      animationFrame = window.requestAnimationFrame(() => cameraLoop(operation));
    }
  }

  async function startCamera() {
    if (!model) {
      setStatus("Load a model before starting the camera.");
      return;
    }

    stopCamera(false);
    const operation = operationGate.begin();
    startCameraButton.disabled = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (!operationGate.isCurrent(operation)) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      video = document.createElement("video");
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      setPreview(video);
      await video.play();
      startCameraButton.disabled = true;
      stopCameraButton.disabled = false;
      setStatus("Camera is active. Identifying Pencil…");
      animationFrame = window.requestAnimationFrame(() => cameraLoop(operation));
    } catch (error) {
      if (operationGate.isCurrent(operation)) {
        stopCamera(false);
        setStatus("Camera could not start. Check your camera permission and try again.");
      }
    }
  }

  function stopCamera(invalidate = true) {
    if (invalidate) {
      operationGate.begin();
    }
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    if (video?.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
    }
    video = null;
    stopCameraButton.disabled = true;
    startCameraButton.disabled = !model;
  }

  function handleImageUpload(event) {
    stopCamera(false);
    const operation = operationGate.begin();
    const [file] = event.target.files;
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      setStatus("Choose an image file such as JPG, PNG, or WebP.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      if (!operationGate.isCurrent(operation)) {
        return;
      }
      const image = new Image();
      image.alt = "Selected Pencil image";
      image.onload = async () => {
        if (!operationGate.isCurrent(operation)) {
          return;
        }
        setPreview(image);
        await predictSource(image, operation);
      };
      image.onerror = () => {
        if (operationGate.isCurrent(operation)) {
          setStatus("That image could not be opened. Choose another file.");
        }
      };
      image.src = reader.result;
    };
    reader.onerror = () => {
      if (operationGate.isCurrent(operation)) {
        setStatus("That file could not be read. Choose another image.");
      }
    };
    reader.readAsDataURL(file);
  }

  modelFolderInput.addEventListener("change", (event) => loadModel(event.target.files));
  startCameraButton.addEventListener("click", startCamera);
  stopCameraButton.addEventListener("click", () => {
    stopCamera();
    setStatus("Camera stopped.");
  });
  imageUploadInput.addEventListener("change", handleImageUpload);
  window.addEventListener("beforeunload", stopCamera);
})();
