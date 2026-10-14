(() => {
  const modelUrlInput = document.querySelector("#model-url");
  const loadModelButton = document.querySelector("#load-model");
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

  function setStatus(message) {
    status.textContent = message;
  }

  function setPrediction(label = "No prediction yet", confidence = "") {
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

  function normalizedModelFolderUrl(value) {
    const parsed = new URL(value.trim());
    if (!/^https?:$/.test(parsed.protocol)) {
      throw new Error("Enter an http or https model folder URL.");
    }
    return parsed.href.endsWith("/") ? parsed.href : `${parsed.href}/`;
  }

  async function loadModel() {
    stopCamera();
    setModelControls(false);
    setPrediction();

    if (!modelUrlInput.value.trim()) {
      setStatus("Enter the URL of your Teachable Machine model folder first.");
      return;
    }

    try {
      const folderUrl = normalizedModelFolderUrl(modelUrlInput.value);
      setStatus("Loading Teachable Machine model…");
      model = await tmImage.load(`${folderUrl}model.json`, `${folderUrl}metadata.json`);
      setModelControls(true);
      setStatus("Model loaded. Start the camera or upload an image.");
    } catch (error) {
      model = null;
      setStatus(`Could not load the model: ${error.message}`);
    }
  }

  async function predictSource(source) {
    if (!model) {
      setStatus("Load a Teachable Machine model before identifying money.");
      return;
    }

    try {
      const predictions = await model.predict(source);
      const topPrediction = predictions.reduce(
        (best, current) => current.probability > best.probability ? current : best,
      );
      setPrediction(topPrediction.className, `${(topPrediction.probability * 100).toFixed(1)}% confidence`);
      setStatus("Prediction updated.");
    } catch (error) {
      setStatus(`Could not identify this image: ${error.message}`);
    }
  }

  async function cameraLoop() {
    if (!video || video.paused || video.ended) {
      return;
    }
    await predictSource(video);
    animationFrame = window.requestAnimationFrame(cameraLoop);
  }

  async function startCamera() {
    if (!model) {
      setStatus("Load a model before starting the camera.");
      return;
    }

    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video = document.createElement("video");
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      setPreview(video);
      await video.play();
      startCameraButton.disabled = true;
      stopCameraButton.disabled = false;
      setStatus("Camera is active. Identifying money…");
      animationFrame = window.requestAnimationFrame(cameraLoop);
    } catch (error) {
      stopCamera();
      setStatus("Camera could not start. Check your camera permission and try again.");
    }
  }

  function stopCamera() {
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
    stopCamera();
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
      const image = new Image();
      image.alt = "Selected money image";
      image.onload = async () => {
        setPreview(image);
        await predictSource(image);
      };
      image.onerror = () => setStatus("That image could not be opened. Choose another file.");
      image.src = reader.result;
    };
    reader.onerror = () => setStatus("That file could not be read. Choose another image.");
    reader.readAsDataURL(file);
  }

  loadModelButton.addEventListener("click", loadModel);
  startCameraButton.addEventListener("click", startCamera);
  stopCameraButton.addEventListener("click", () => {
    stopCamera();
    setStatus("Camera stopped.");
  });
  imageUploadInput.addEventListener("change", handleImageUpload);
  window.addEventListener("beforeunload", stopCamera);
})();
