let salesChart, productsChart;

document.addEventListener('DOMContentLoaded', () => {
    initializeDateRangeSelector();
    initializeCharts();
    loadAnalytics('today');
});

function initializeDateRangeSelector() {
    const dateRangeSelect = document.getElementById('dateRangeSelect');
    const customDateRange = document.getElementById('customDateRange');

    dateRangeSelect.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            customDateRange.style.display = 'block';
        } else {
            customDateRange.style.display = 'none';
            loadAnalytics(e.target.value);
        }
    });
}

function initializeCharts() {
    // Sales Chart
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    salesChart = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Ventas',
                data: [],
                borderColor: '#4CAF50',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => `$${value}`
                    }
                }
            }
        }
    });

    // Products Chart
    const productsCtx = document.getElementById('productsChart').getContext('2d');
    productsChart = new Chart(productsCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56',
                    '#4BC0C0', '#9966FF', '#FF9F40'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

async function loadAnalytics(period) {
    const dates = getDateRange(period);
    
    try {
        const response = await fetch(`/business/analytics?${new URLSearchParams(dates)}`);
        const data = await response.json();
        
        updateMetrics(data.metrics);
        updateComparisons(data.comparisons);
        updateCharts(data.salesData, data.topProducts);
        
    } catch (error) {
        showAlert('Error al cargar análisis', 'error');
    }
}

function updateMetrics(metrics) {
    document.getElementById('totalSales').textContent = formatCurrency(metrics.total_sales);
    document.getElementById('totalOrders').textContent = metrics.total_orders;
    document.getElementById('averageTicket').textContent = formatCurrency(metrics.average_ticket);
    document.getElementById('averageRating').textContent = metrics.average_rating?.toFixed(1) || '0.0';
}

function updateComparisons(comparisons) {
    updateComparisonText('salesComparison', comparisons.sales);
    updateComparisonText('ordersComparison', comparisons.orders);
    updateComparisonText('ticketComparison', comparisons.ticket);
    updateComparisonText('ratingComparison', comparisons.rating);
}

function updateComparisonText(elementId, percentage) {
    const element = document.getElementById(elementId);
    const isPositive = percentage > 0;
    
    element.innerHTML = `
        <i class="fas fa-${isPositive ? 'arrow-up' : 'arrow-down'}" style="color: ${isPositive ? 'green' : 'red'}"></i>
        ${Math.abs(percentage)}% vs período anterior
    `;
}

function updateCharts(salesData, topProducts) {
    // Update Sales Chart
    salesChart.data.labels = salesData.map(d => formatDate(d.date));
    salesChart.data.datasets[0].data = salesData.map(d => d.total_sales);
    salesChart.update();

    // Update Products Chart
    productsChart.data.labels = topProducts.map(p => p.name);
    productsChart.data.datasets[0].data = topProducts.map(p => p.total_quantity);
    productsChart.update();
}

function getDateRange(period) {
    const today = new Date();
    let startDate = new Date();
    
    switch(period) {
        case 'today':
            startDate = today;
            break;
        case 'week':
            startDate.setDate(today.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(today.getMonth() - 1);
            break;
        case 'custom':
            startDate = document.getElementById('startDate').value;
            today = document.getElementById('endDate').value;
            break;
    }
    
    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
    };
}

function formatCurrency(value) {
    return new Intl.NumberFormat('es-DO', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value || 0);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-DO', {
        month: 'short',
        day: 'numeric'
    });
}
