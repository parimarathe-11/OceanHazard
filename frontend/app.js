const imageInput = document.getElementById("imageInput");
const chooseImageBtn = document.getElementById("chooseImageBtn");
const removeImageBtn = document.getElementById("removeImageBtn");
const uploadArea = document.getElementById("uploadArea");
const uploadPrompt = document.getElementById("uploadPrompt");
const previewWrap = document.getElementById("previewWrap");
const imagePreview = document.getElementById("imagePreview");
const reportForm = document.getElementById("reportForm");
const submitBtn = document.getElementById("submitBtn");
const statusBox = document.getElementById("status");
const resultCard = document.getElementById("resultCard");

chooseImageBtn.addEventListener("click", () => imageInput.click());

imageInput.addEventListener("change", () => {
  if (imageInput.files.length) showPreview(imageInput.files[0]);
});

removeImageBtn.addEventListener("click", clearImage);

function showPreview(file) {
  if (!file.type.startsWith("image/")) {
    showStatus("Please choose a valid image file.", "error");
    imageInput.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = event => {
    imagePreview.src = event.target.result;
    uploadPrompt.classList.add("hidden");
    previewWrap.classList.remove("hidden");
    hideStatus();
  };

  reader.readAsDataURL(file);
}

function clearImage() {
  imageInput.value = "";
  imagePreview.src = "";
  previewWrap.classList.add("hidden");
  uploadPrompt.classList.remove("hidden");
}

uploadArea.addEventListener("dragover", event => {
  event.preventDefault();
  uploadArea.classList.add("dragover");
});

uploadArea.addEventListener("dragleave", () => {
  uploadArea.classList.remove("dragover");
});

uploadArea.addEventListener("drop", event => {
  event.preventDefault();
  uploadArea.classList.remove("dragover");

  const file = event.dataTransfer.files[0];
  if (file) {
    imageInput.files = event.dataTransfer.files;
    showPreview(file);
  }
});

reportForm.addEventListener("submit", async event => {
  event.preventDefault();

  const image = imageInput.files[0];
  const description = document.getElementById("description").value.trim();
  const latitude = document.getElementById("latitude").value.trim();
  const longitude = document.getElementById("longitude").value.trim();

  if (!image) {
    showStatus("Please upload a hazard image before submitting.", "error");
    return;
  }

  if (!latitude || !longitude) {
    showStatus("Please enter both latitude and longitude.", "error");
    return;
  }

  const formData = new FormData();
  formData.append("description", description);
  formData.append("latitude", latitude);
  formData.append("longitude", longitude);
  formData.append("image", image);

  setLoading(true);

  try {
    const result = await submitReport(formData);

    document.getElementById("resultCategory").textContent =
      result.category ?? "Not available";

    document.getElementById("resultConfidence").textContent =
      formatConfidence(result.confidence);

    document.getElementById("resultSeverity").textContent =
      result.severity ?? "Not available";

    document.getElementById("resultDescription").textContent =
      result.description || description || "No description provided.";

    resultCard.classList.remove("hidden");
    showStatus("Report submitted successfully.", "success");
    resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    showStatus(error.message || "Something went wrong while submitting the report.", "error");
  } finally {
    setLoading(false);
  }
});

function formatConfidence(value) {
  if (value === null || value === undefined || value === "") return "Not available";

  const number = Number(value);
  if (!Number.isNaN(number)) {
    return number <= 1 ? `${Math.round(number * 100)}%` : `${Math.round(number)}%`;
  }

  return String(value);
}

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;

  if (isLoading) {
    submitBtn.innerHTML = "⏳ Analyzing...";
    showStatus("Analyzing the uploaded image. Please wait...", "loading");
  } else {
    submitBtn.innerHTML = "🚨 Submit Report";
  }
}

function showStatus(message, type) {
  statusBox.textContent = message;
  statusBox.className = `status ${type}`;
}

function hideStatus() {
  statusBox.className = "status hidden";
}
