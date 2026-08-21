// Frontend API helper.
// The agreed backend contract is POST /api/reports.
// Update API_BASE only if your team runs Flask on a different address.

const API_BASE = "http://127.0.0.1:5000";

async function submitReport(formData) {
  const response = await fetch(`${API_BASE}/api/reports`, {
    method: "POST",
    body: formData
  });

  let data = {};
  try {
    data = await response.json();
  } catch (_) {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || "Unable to submit the report.");
  }

  return data;
}
