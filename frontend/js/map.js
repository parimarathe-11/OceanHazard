const map = L.map("map").setView([19.0760, 72.8777], 5);

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { attribution: "&copy; OpenStreetMap contributors" }
).addTo(map);

let markers = [];

map.on("click", (event) => {
    const { lat, lng } = event.latlng;
    document.getElementById("latitude").value = lat;
    document.getElementById("longitude").value = lng;
    document.getElementById("locationText").textContent =
        `Selected: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    document.getElementById("locationText").classList.remove("placeholder");
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
