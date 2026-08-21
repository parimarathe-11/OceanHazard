/**
 * Ocean Hazard Map Controller (Leaflet.js)
 * Responsible for map initialization, custom marker rendering with visual
 * category/severity distinctions, interactive location picking, and viewport handling.
 */

// Initialize Leaflet Map
const map = L.map("map", {
    zoomControl: true,
    minZoom: 3,
    maxZoom: 18
}).setView([18.5, 73.5], 6);

// OpenStreetMap Tile Layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Invalidate size on load and resize to prevent container collapse / grey tiles
window.addEventListener("resize", () => {
    map.invalidateSize();
});
setTimeout(() => {
    map.invalidateSize();
}, 250);

let markers = [];
let selectedMarker = null;

/**
 * Returns an appropriate emoji icon based on hazard category
 */
function getCategoryIcon(category) {
    if (!category) return "🌊";
    const cat = category.toLowerCase();
    if (cat.includes("oil")) return "🛢️";
    if (cat.includes("plastic")) return "🧴";
    if (cat.includes("chemical") || cat.includes("toxic")) return "☣️";
    if (cat.includes("debris") || cat.includes("waste")) return "📦";
    if (cat.includes("algae") || cat.includes("bloom")) return "🌿";
    if (cat.includes("clean")) return "✨";
    return "🌊";
}

/**
 * Returns severity classification details: css class, badge color, and label
 */
function getSeverityDetails(severity) {
    const s = (severity || "low").toLowerCase();
    if (s.includes("high")) {
        return { cssClass: "high", label: "High", color: "#f43f5e", bg: "rgba(244, 63, 94, 0.2)" };
    }
    if (s.includes("med")) {
        return { cssClass: "medium", label: "Medium", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.2)" };
    }
    return { cssClass: "low", label: "Low", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.2)" };
}

/**
 * Handle map click to select report coordinates
 */
map.on("click", (event) => {
    const { lat, lng } = event.latlng;
    const formattedLat = lat.toFixed(5);
    const formattedLng = lng.toFixed(5);

    // Update latitude and longitude input fields
    const latInput = document.getElementById("latitude");
    const lngInput = document.getElementById("longitude");
    if (latInput) latInput.value = formattedLat;
    if (lngInput) lngInput.value = formattedLng;

    // Update selected location text in UI
    const locationText = document.getElementById("locationText");
    if (locationText) {
        locationText.textContent = `Selected: ${formattedLat}, ${formattedLng}`;
        locationText.classList.remove("placeholder");
    }

    // Remove previous selection marker if any
    if (selectedMarker) {
        map.removeLayer(selectedMarker);
    }

    // Custom glowing selection pin
    const selectionIcon = L.divIcon({
        className: "custom-selected-marker",
        html: `
            <div class="selection-marker-pin">
                <span class="selection-icon">📍</span>
                <div class="selection-pulse"></div>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -30]
    });

    selectedMarker = L.marker([lat, lng], { icon: selectionIcon }).addTo(map);

    selectedMarker.bindPopup(`
        <div class="marker-popup-content selection-popup">
            <h4>📍 Selected Location</h4>
            <p><strong>Latitude:</strong> ${formattedLat}</p>
            <p><strong>Longitude:</strong> ${formattedLng}</p>
            <span class="popup-hint">Ready for hazard submission</span>
        </div>
    `).openPopup();
});

/**
 * Remove selection marker (e.g. after form submission)
 */
function clearSelectionMarker() {
    if (selectedMarker) {
        map.removeLayer(selectedMarker);
        selectedMarker = null;
    }
    const locationText = document.getElementById("locationText");
    if (locationText) {
        locationText.textContent = "Click on the map to select location";
        locationText.classList.add("placeholder");
    }
    const latInput = document.getElementById("latitude");
    const lngInput = document.getElementById("longitude");
    if (latInput) latInput.value = "";
    if (lngInput) lngInput.value = "";
}

/**
 * Render all reports from API onto the Leaflet map
 * Applies visual distinction based on severity and category
 */
function renderReportsOnMap(reports) {
    if (!Array.isArray(reports)) {
        console.warn("renderReportsOnMap: reports is not an array", reports);
        return;
    }

    // Remove previous report markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    reports.forEach(report => {
        const lat = parseFloat(report.latitude);
        const lng = parseFloat(report.longitude);

        if (isNaN(lat) || isNaN(lng)) {
            console.warn("Skipping report with invalid coordinates:", report);
            return;
        }

        const category = report.category || "Unknown";
        const severity = report.severity || "Low";
        const confidence = typeof report.confidence === "number" ? report.confidence : parseFloat(report.confidence) || 0;
        const description = report.description ? report.description.trim() : "No description provided";

        const categoryIcon = getCategoryIcon(category);
        const sevDetails = getSeverityDetails(severity);

        // Custom divIcon marker with visual distinction for category & severity
        const markerIcon = L.divIcon({
            className: "hazard-div-icon",
            html: `
                <div class="hazard-marker-node severity-${sevDetails.cssClass}">
                    <div class="hazard-marker-badge">
                        <span class="hazard-emoji">${categoryIcon}</span>
                    </div>
                    ${sevDetails.cssClass === "high" ? '<div class="hazard-pulse-ring"></div>' : ""}
                </div>
            `,
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -34]
        });

        const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);

        // Rich styled popup
        const confidencePercent = (confidence * 100).toFixed(0);
        marker.bindPopup(`
            <div class="marker-popup-content hazard-popup">
                <div class="popup-header">
                    <span class="popup-cat-icon">${categoryIcon}</span>
                    <h3 class="popup-title">${category.toUpperCase()}</h3>
                </div>
                <div class="popup-badges">
                    <span class="severity-pill severity-${sevDetails.cssClass}">${sevDetails.label} Severity</span>
                    <span class="confidence-pill">${confidencePercent}% Confidence</span>
                </div>
                <div class="popup-body">
                    <p class="popup-description">${description || "No description provided"}</p>
                    <div class="popup-meta">
                        <span>🌐 ${lat.toFixed(4)}, ${lng.toFixed(4)}</span>
                    </div>
                </div>
            </div>
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
