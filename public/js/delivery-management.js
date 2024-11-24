const deliveryManagement = {
    map: null,
    currentPosition: null,
    markers: {},
    watchId: null,

    init() {
        this.initMap();
        this.initWebSocket();
        this.startLocationTracking();
        this.bindEvents();
    },

    initMap() {
        this.map = L.map('deliveryMap').setView([0, 0], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    },

    initWebSocket() {
        const socket = io();
        const deliveryId = document.body.dataset.deliveryId;

        socket.on('connect', () => {
            socket.emit('joinDeliveryRoom', { deliveryId });
        });

        socket.on('newDeliveryAssigned', (data) => {
            this.handleNewDelivery(data);
        });
    },

    startLocationTracking() {
        if ("geolocation" in navigator) {
            this.watchId = navigator.geolocation.watchPosition(
                position => this.updateLocation(position),
                error => console.error('Error tracking location:', error),
                { enableHighAccuracy: true }
            );
        }
    },

    updateLocation(position) {
        const { latitude, longitude } = position.coords;
        this.currentPosition = { lat: latitude, lng: longitude };

        // Update marker on map
        if (!this.markers.currentLocation) {
            this.markers.currentLocation = L.marker([latitude, longitude])
                .addTo(this.map)
                .bindPopup('Tu ubicación actual');
        } else {
            this.markers.currentLocation.setLatLng([latitude, longitude]);
        }

        // Center map if no route is active
        if (!this.activeRouteId) {
            this.map.setView([latitude, longitude], 15);
        }

        // Send location update for active delivery
        if (this.activeDeliveryId) {
            this.sendLocationUpdate(this.activeDeliveryId);
        }
    },

    async showRoute(orderId) {
        const delivery = await this.getDeliveryDetails(orderId);
        this.activeDeliveryId = orderId;

        // Clear existing route
        if (this.routeLayer) {
            this.map.removeLayer(this.routeLayer);
        }

        // Add markers for pickup and delivery locations
        this.addLocationMarkers(delivery);

        // Get and display route
        const route = await this.calculateRoute(
            this.currentPosition,
            delivery.status === 'assigned' ? delivery.pickup : delivery.delivery
        );

        this.routeLayer = L.polyline(route, { color: 'blue' }).addTo(this.map);
        this.map.fitBounds(this.routeLayer.getBounds());
    },

    async updateDeliveryStatus(orderId, status) {
        try {
            const response = await fetch(`/delivery/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    status,
                    location: this.currentPosition
                })
            });

            const data = await response.json();
            if (data.success) {
                this.updateDeliveryCard(orderId, status);
                if (status === 'delivered') {
                    this.completeDelivery(orderId);
                }
            }
        } catch (error) {
            showToast('error', 'Error al actualizar estado');
        }
    },

    bindEvents() {
        // Handle incoming calls
        document.querySelectorAll('.call-client').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const phone = e.target.dataset.phone;
                window.location.href = `tel:${phone}`;
            });
        });
    }
};

// Initialize on document ready
$(document).ready(() => deliveryManagement.init());
