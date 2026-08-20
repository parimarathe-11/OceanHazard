const API_BASE = "http://127.0.0.1:5000/api";

async function getReports() {
    const response = await fetch(`${API_BASE}/reports`);
    if (!response.ok) {
        throw new Error("Could not load reports");
    }
    return response.json();
}

async function submitReport(formData) {
    const response = await fetch(`${API_BASE}/reports`, {
        method: "POST",
        body: formData
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Submission failed");
    }
    return data;
}
