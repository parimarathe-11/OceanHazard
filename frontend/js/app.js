const form = document.getElementById("reportForm");
const submitBtn = document.getElementById("submitBtn");
const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");
const uploadDummy = document.querySelector(".upload-dummy");

// Show image preview when a file is selected
imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = "block";
            uploadDummy.style.display = "none";
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.style.display = "none";
        uploadDummy.style.display = "flex";
    }
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const image = imageInput.files[0];
    const description = document.getElementById("description").value;
    const latitude = document.getElementById("latitude").value;
    const longitude = document.getElementById("longitude").value;
    
    if (!image || !latitude || !longitude) {
        alert("Upload an image and select a map location.");
        return;
    }
    
    const formData = new FormData();
    formData.append("image", image);
    formData.append("description", description);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    
    // Toggle loading states
    submitBtn.disabled = true;
    const btnText = submitBtn.querySelector("span");
    const spinner = submitBtn.querySelector(".spinner");
    btnText.textContent = "Analyzing Image...";
    spinner.style.display = "block";
    
    const resultBox = document.getElementById("result");
    resultBox.style.display = "none";
    
    try {
        const data = await submitReport(formData);
        
        // Show styled result feedback
        resultBox.innerHTML = `
            <h3>Analysis Complete</h3>
            <p><strong>Category:</strong> ${data.category.toUpperCase()}</p>
            <p><strong>Confidence:</strong> ${(data.confidence * 100).toFixed(0)}%</p>
            <p><strong>Severity:</strong> <span class="badge" style="background-color: var(--${data.severity.toLowerCase()}-severity); color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${data.severity}</span></p>
        `;
        resultBox.style.display = "block";
        
        // Clear form and map selection marker
        form.reset();
        imagePreview.style.display = "none";
        uploadDummy.style.display = "flex";
        if (typeof clearSelectionMarker === "function") {
            clearSelectionMarker();
        }
        
        // Refresh app state
        const reports = await getReports();
        renderReportsOnMap(reports);
        updateDashboard(reports);
    } catch (error) {
        alert(error.message);
    } finally {
        submitBtn.disabled = false;
        btnText.textContent = "Submit Report";
        spinner.style.display = "none";
    }
});

// App Initialization
async function init() {
    try {
        const reports = await getReports();
        renderReportsOnMap(reports);
        updateDashboard(reports);
    } catch (error) {
        console.error("Could not fetch initial reports:", error);
    }
}

document.addEventListener("DOMContentLoaded", init);
