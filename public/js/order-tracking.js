let map, deliveryMarker, businessMarker, routingControl;
const orderId = document.querySelector('[data-order-id]').dataset.orderId;

// Initialize map and real-time tracking
document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    initializeWebSocket();
    startLocationPolling();
});

function initializeMap() {
    // Initialize map with business location
    map = L.map('trackingMap').setView([
        parseFloat(businessLat),
        parseFloat(businessLng)
    ], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    // Add business marker
    businessMarker = L.marker([businessLat, businessLng], {
        icon: L.divIcon({
            className: 'business-marker',
            html: '<i class="fas fa-store"></i>'
        })
    }).addTo(map);

    // Add delivery marker
    deliveryMarker = L.marker([0, 0], {
        icon: L.divIcon({
            className: 'delivery-marker',
            html: '<i class="fas fa-motorcycle"></i>'
        })
    }).addTo(map);

    // Initialize routing
    routingControl = L.Routing.control({
        waypoints: [],
        routeWhileDragging: false,
        showAlternatives: false,
        lineOptions: {
            styles: [{ color: '#3388ff', weight: 6 }]
        }
    }).addTo(map);
}

function initializeWebSocket() {
    const socket = io('/tracking');
    
    socket.on('connect', () => {
        socket.emit('join-order-tracking', orderId);
    });

    socket.on('order-status-update', (data) => {
        updateOrderStatus(data.status);
    });

    socket.on('delivery-location-update', (location) => {
        updateDeliveryLocation(location);
    });
}

function startLocationPolling() {
    // Poll for location updates every 10 seconds
    setInterval(async () => {
        try {
            const response = await fetch(`/orders/${orderId}/location`);
            const data = await response.json();
            
            if (data.current_location) {
                updateDeliveryLocation(JSON.parse(data.current_location));
            }
        } catch (error) {
            console.error('Error fetching location:', error);
        }
    }, 10000);
}

function updateDeliveryLocation(location) {
    const { latitude, longitude } = location;
    
    deliveryMarker.setLatLng([latitude, longitude]);
    
    // Update route
    routingControl.setWaypoints([
        L.latLng(latitude, longitude),
        L.latLng(deliveryLat, deliveryLng)
    ]);

    // Calculate and update ETA
    updateEstimatedTime(location);
}

function updateEstimatedTime(location) {
    const deliveryPoint = L.latLng(deliveryLat, deliveryLng);
    const currentPoint = L.latLng(location.latitude, location.longitude);
    const distance = currentPoint.distanceTo(deliveryPoint);
    
    // Estimate time based on average speed (30 km/h)
    const estimatedMinutes = Math.round((distance / 1000) * 2);
    document.querySelector('.estimated-time h3').textContent = `${estimatedMinutes} min`;
}

function updateOrderStatus(status) {
    const steps = document.querySelectorAll('.status-steps .step');
    let activeFound = false;

    steps.forEach(step => {
        const stepStatus = step.dataset.status;
        
        if (stepStatus === status) {
            step.classList.add('active');
            activeFound = true;
        } else if (!activeFound) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else {
            step.classList.remove('completed', 'active');
        }
    });
}

// Cleanup
window.addEventListener('beforeunload', () => {
    if (map) {
        map.remove();
    }
});
