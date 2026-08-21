/**
 * Ocean Hazard Analytics Dashboard (Chart.js)
 * Responsible for calculating live hazard statistics, category distribution,
 * severity breakdown, and rendering dynamic charts.
 */

let categoryChartInstance = null;
let severityChartInstance = null;

/**
 * Updates all dashboard metrics and charts with reports data
 * @param {Array} reports - List of report objects from GET /api/reports
 */
function updateDashboard(reports) {
    const reportList = Array.isArray(reports) ? reports : [];

    // Compute basic counters
    const total = reportList.length;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    const categoryCounts = {};

    reportList.forEach(report => {
        const sev = (report.severity || "").toLowerCase();
        if (sev === "high") {
            highCount++;
        } else if (sev === "medium") {
            mediumCount++;
        } else {
            lowCount++;
        }

        // Format category name cleanly
        const rawCat = (report.category || "Unknown").trim();
        const cat = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Update Counter Elements
    const totalElem = document.getElementById("totalReports");
    const highElem = document.getElementById("highReports");
    const mediumElem = document.getElementById("mediumReports");
    const lowElem = document.getElementById("lowReports");

    if (totalElem) totalElem.textContent = total;
    if (highElem) highElem.textContent = highCount;
    if (mediumElem) mediumElem.textContent = mediumCount;
    if (lowElem) lowElem.textContent = lowCount;

    // Render Category Distribution Chart
    renderCategoryChart(categoryCounts);

    // Render Severity Distribution Chart (if canvas element exists)
    renderSeverityChart(highCount, mediumCount, lowCount);
}

/**
 * Renders the Category Statistics Bar Chart
 */
function renderCategoryChart(categoryCounts) {
    const canvas = document.getElementById("categoryChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (categoryChartInstance) {
        categoryChartInstance.destroy();
        categoryChartInstance = null;
    }

    const categories = Object.keys(categoryCounts);
    const counts = Object.values(categoryCounts);

    // Color palette for diverse categories
    const colors = [
        "rgba(6, 182, 212, 0.75)",   // Cyan
        "rgba(244, 63, 94, 0.75)",   // Rose/Red
        "rgba(245, 158, 11, 0.75)",  // Amber
        "rgba(16, 185, 129, 0.75)",  // Emerald
        "rgba(139, 92, 246, 0.75)",  // Violet
        "rgba(59, 130, 246, 0.75)"   // Blue
    ];

    const borderColors = [
        "#06b6d4",
        "#f43f5e",
        "#f59e0b",
        "#10b981",
        "#8b5cf6",
        "#3b82f6"
    ];

    categoryChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: categories.length > 0 ? categories : ["No Data"],
            datasets: [{
                label: "Incidents",
                data: counts.length > 0 ? counts : [0],
                backgroundColor: colors.slice(0, Math.max(categories.length, 1)),
                borderColor: borderColors.slice(0, Math.max(categories.length, 1)),
                borderWidth: 1.5,
                borderRadius: 8,
                maxBarThickness: 45
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 600,
                easing: "easeOutQuart"
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: "rgba(15, 22, 36, 0.95)",
                    titleColor: "#f3f4f6",
                    bodyColor: "#06b6d4",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return ` Reports: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: "#9ca3af",
                        font: { family: "'Outfit', sans-serif", size: 12 }
                    },
                    grid: {
                        color: "rgba(255, 255, 255, 0.06)"
                    }
                },
                x: {
                    ticks: {
                        color: "#9ca3af",
                        font: { family: "'Outfit', sans-serif", size: 12 }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * Renders the Severity Distribution Doughnut Chart
 */
function renderSeverityChart(high, medium, low) {
    const canvas = document.getElementById("severityChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (severityChartInstance) {
        severityChartInstance.destroy();
        severityChartInstance = null;
    }

    const total = high + medium + low;
    const dataValues = total > 0 ? [high, medium, low] : [0, 0, 0];

    severityChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["High", "Medium", "Low"],
            datasets: [{
                data: dataValues,
                backgroundColor: [
                    "rgba(244, 63, 94, 0.8)",   // High: Rose
                    "rgba(245, 158, 11, 0.8)",  // Medium: Amber
                    "rgba(59, 130, 246, 0.8)"   // Low: Blue
                ],
                borderColor: [
                    "#f43f5e",
                    "#f59e0b",
                    "#3b82f6"
                ],
                borderWidth: 1.5,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "68%",
            animation: {
                duration: 600,
                easing: "easeOutQuart"
            },
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        color: "#9ca3af",
                        font: { family: "'Outfit', sans-serif", size: 12 },
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: "circle"
                    }
                },
                tooltip: {
                    backgroundColor: "rgba(15, 22, 36, 0.95)",
                    titleColor: "#f3f4f6",
                    bodyColor: "#f3f4f6",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderWidth: 1,
                    padding: 10
                }
            }
        }
    });
}
