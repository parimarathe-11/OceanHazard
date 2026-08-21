const map = L.map("map").setView([19.0760, 72.8777], 5);

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { attribution: "&copy; OpenStreetMap contributors" }
).addTo(map);

let markers = [];

map.on("click", (event) => {
    const { lat, lng } = event.latlng;
    const latInput = document.getElementById("latitude");
    const lngInput = document.getElementById("longitude");
    if (latInput) latInput.value = lat.toFixed(5);
    if (lngInput) lngInput.value = lng.toFixed(5);
    
    const locText = document.getElementById("locationText");
    if (locText) {
        locText.textContent = `Selected: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        locText.classList.remove("placeholder");
    }
});

function renderReportsOnMap(reports) {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    reports.forEach(report => {
        const marker = L.marker([
            report.latitude,
            report.longitude
        ]).addTo(map);
        marker.bindPopup(`
            <strong>${report.category.toUpperCase()}</strong><br>
            <strong>Severity:</strong> ${report.severity}<br>
            <strong>Confidence:</strong> ${(report.confidence * 100).toFixed(0)}%<br>
            <em>${report.description || 'No description provided'}</em>
        `);
        markers.push(marker);
    });
}

// Recalculate map container size after page loads to prevent height collapse bugs
window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
});
