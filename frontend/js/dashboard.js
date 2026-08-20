let categoryChart;

function updateDashboard(reports) {
    document.getElementById("totalReports").textContent =
        reports.length;
    document.getElementById("highReports").textContent =
        reports.filter(r => r.severity === "High").length;
    document.getElementById("mediumReports").textContent =
        reports.filter(r => r.severity === "Medium").length;

    const counts = {};
    reports.forEach(report => {
        counts[report.category] =
            (counts[report.category] || 0) + 1;
    });

    const ctx = document.getElementById("categoryChart").getContext("2d");
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    // Modern styled Chart.js configuration
    categoryChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: Object.keys(counts).map(k => k.toUpperCase()),
            datasets: [{
                label: "Reports",
                data: Object.values(counts),
                backgroundColor: [
                    'rgba(6, 182, 212, 0.6)',
                    'rgba(16, 185, 129, 0.6)',
                    'rgba(245, 158, 11, 0.6)',
                    'rgba(244, 63, 94, 0.6)',
                    'rgba(59, 130, 246, 0.6)'
                ],
                borderColor: [
                    '#06b6d4',
                    '#10b981',
                    '#f59e0b',
                    '#f43f5e',
                    '#3b82f6'
                ],
                borderWidth: 1.5,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#9ca3af',
                        stepSize: 1
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#9ca3af'
                    }
                }
            }
        }
    });
}
