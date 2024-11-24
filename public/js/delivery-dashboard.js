// Initialize map and geolocation
let map, currentMarker;
let watchId = null;

// WebSocket connection for real-time updates
const socket = io('/delivery');
let currentLocation = null;

// Initialize dashboard components
document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    initializeGeolocation();
    initializeAvailabilityToggle();
    initializeWebSocket();
});

function initializeMap() {
    map = L.map('deliveryMap').setView([18.4861, -69.9312], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    currentMarker = L.marker([0, 0]).addTo(map);
}

function initializeGeolocation() {
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            position => updateLocation(position.coords),
            error => console.error('Error getting location:', error),
            { enableHighAccuracy: true }
        );
    }
}

function updateLocation(coords) {
    currentLocation = {
        latitude: coords.latitude,
        longitude: coords.longitude
    };
    
    currentMarker.setLatLng([coords.latitude, coords.longitude]);
    map.setView([coords.latitude, coords.longitude]);
    
    // Update server with new location if on active delivery
    if (activeDeliveryId) {
        updateDeliveryLocation(activeDeliveryId, currentLocation);
    }
}

// Availability Toggle
function initializeAvailabilityToggle() {
    const toggle = document.getElementById('availabilityToggle');
    toggle.addEventListener('change', async (e) => {
        try {
            const response = await fetch('/delivery/availability', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    isAvailable: e.target.checked
                })
            });
            
            if (!response.ok) {
                throw new Error('Error al actualizar disponibilidad');
            }
            
            updateAvailabilityStatus(e.target.checked);
        } catch (error) {
            showAlert(error.message, 'error');
            e.target.checked = !e.target.checked;
        }
    });
}

// WebSocket handlers
function initializeWebSocket() {
    socket.on('connect', () => {
        if (currentLocation) {
            socket.emit('delivery-location', {
                deliveryId: deliveryId,
                location: currentLocation
            });
        }
    });

    socket.on('new-available-order', (order) => {
        addOrderToTable(order);
        playNotificationSound();
    });

    socket.on('order-cancelled', (orderId) => {
        removeOrderFromTable(orderId);
    });
}

// Order Management
async function acceptDelivery(orderId) {
    try {
        const response = await fetch(`/delivery/orders/${orderId}/accept`, {
            method: 'POST'
        });
        
        if (response.ok) {
            removeOrderFromTable(orderId);
            addActiveDelivery(orderId);
            showAlert('Entrega aceptada exitosamente', 'success');
        }
    } catch (error) {
        showAlert('Error al aceptar entrega', 'error');
    }
}

async function updateDeliveryStatus(orderId, status) {
    try {
        const response = await fetch(`/delivery/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status,
                location: currentLocation
            })
        });
        
        if (response.ok) {
            updateDeliveryCard(orderId, status);
        }
    } catch (error) {
        showAlert('Error al actualizar estado de entrega', 'error');
    }
}

// UI Updates
function addOrderToTable(order) {
    const tbody = document.querySelector('#availableOrdersTable tbody');
    const row = document.createElement('tr');
    row.dataset.orderId = order.id;
    row.innerHTML = `
        <td>${order.business_name}</td>
        <td>${order.business_address}</td>
        <td>${order.delivery_address}</td>
        <td>${order.distance} km</td>
        <td>$${order.delivery_fee}</td>
        <td>
            <button class="btn btn-sm btn-success" onclick="acceptDelivery(${order.id})">
                Aceptar Entrega
            </button>
        </td>
    `;
    tbody.appendChild(row);
}

function updateDeliveryCard(orderId, status) {
    const card = document.querySelector(`.delivery-card[data-delivery-id="${orderId}"]`);
    if (card) {
        const statusBadge = card.querySelector('.status-badge');
        statusBadge.className = `status-badge badge bg-${getStatusColor(status)}`;
        statusBadge.textContent = getStatusText(status);
        
        updateActionButtons(card, status);
    }
}

// Cleanup
window.addEventListener('beforeunload', () => {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
    }
});
