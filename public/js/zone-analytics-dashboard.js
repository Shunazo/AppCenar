let analyticsMap;
let zoneAnalytics;
let peakHoursChart;
let performanceChart;

document.addEventListener('DOMContentLoaded', () => {
    initializeAnalyticsMap();
    initializeCharts();
    initializeEventListeners();
    loadZoneData();
});

function initializeAnalyticsMap() {
    analyticsMap = new google.maps.Map(document.getElementById('analyticsMap'), {
        center: { lat: businessLat, lng: businessLng },
        zoom: 13,
        styles: mapStyles,
        mapTypeControl: false
    });

    zoneAnalytics = new ZoneAnalytics(analyticsMap);
}

function initializeCharts() {
    const peakHoursCtx = document.getElementById('peakHoursChart').getContext('2d');
    peakHoursChart = new Chart(peakHoursCtx, {
        type: 'bar',
        data: {
            labels: Array.from({length: 24}, (_, i) => `${i}:00`),
            datasets: [{
                label: 'Entregas por Hora',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function initializeEventListeners() {
    document.getElementById('toggleHeatmap').addEventListener('click', () => {
        zoneAnalytics.toggleHeatmap();
    });

    document.getElementById('toggleClusters').addEventListener('click', () => {
        zoneAnalytics.toggleClusters();
    });

    document.querySelectorAll('.zone-stat-item').forEach(item => {
        item.addEventListener('click', () => {
            const zoneId = item.dataset.zoneId;
            showZoneDetails(zoneId);
        });
    });
}

async function loadZoneData() {
    try {
        const response = await fetch('/business/zone-analytics');
        const data = await response.json();
        
        if (data.success) {
            updateZoneAnalytics(data.analytics);
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        showAlert('Error al cargar datos de zonas', 'error');
    }
}

function updateZoneAnalytics(analytics) {
    zoneAnalytics.initializeHeatmap(analytics.deliveryPoints);
    zoneAnalytics.createClusterMarkers(analytics.zones);
    updatePeakHoursChart(analytics.peakHours);
}

function updatePeakHoursChart(peakHours) {
    peakHoursChart.data.datasets[0].data = peakHours;
    peakHoursChart.update();
}

function showZoneDetails(zoneId) {
    fetch(`/business/zone-analytics/${zoneId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateZoneDetailsModal(data.details);
                new bootstrap.Modal(document.getElementById('zoneDetailsModal')).show();
            }
        })
        .catch(error => {
            showAlert('Error al cargar detalles de zona', 'error');
        });
}

function updateZoneDetailsModal(details) {
    updatePopularItems(details.popularItems);
    updatePerformanceChart(details.performance);
}

function updatePopularItems(items) {
    const container = document.getElementById('popularItems');
    container.innerHTML = items.map(item => `
        <div class="d-flex justify-content-between mb-2">
            <span>${item.name}</span>
            <strong>${item.count}</strong>
        </div>
    `).join('');
}

function updatePerformanceChart(performance) {
    if (!performanceChart) {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: performance.map(p => p.date),
                datasets: [{
                    label: 'Entregas',
                    data: performance.map(p => p.count),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    } else {
        performanceChart.data.labels = performance.map(p => p.date);
        performanceChart.data.datasets[0].data = performance.map(p => p.count);
        performanceChart.update();
    }
}
