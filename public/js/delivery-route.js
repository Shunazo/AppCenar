const deliveryRoute = {
    async calculateRoute(start, end) {
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`);
        const data = await response.json();
        return data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
    },

    addLocationMarkers(delivery) {
        // Add pickup location marker
        if (this.markers.pickup) {
            this.map.removeLayer(this.markers.pickup);
        }
        this.markers.pickup = L.marker([delivery.pickup.lat, delivery.pickup.lng], {
            icon: this.createCustomIcon('store')
        }).addTo(this.map)
          .bindPopup(`<b>Recoger en:</b><br>${delivery.business_name}`);

        // Add delivery location marker
        if (this.markers.delivery) {
            this.map.removeLayer(this.markers.delivery);
        }
        this.markers.delivery = L.marker([delivery.delivery.lat, delivery.delivery.lng], {
            icon: this.createCustomIcon('location')
        }).addTo(this.map)
          .bindPopup(`<b>Entregar a:</b><br>${delivery.client_name}`);
    },

    createCustomIcon(type) {
        const icons = {
            store: 'fa-store',
            location: 'fa-map-marker-alt'
        };

        return L.divIcon({
            html: `<i class="fas ${icons[type]}"></i>`,
            className: `custom-marker ${type}-marker`,
            iconSize: [30, 30]
        });
    },

    async sendLocationUpdate(orderId) {
        try {
            await fetch(`/delivery/location/${orderId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    location: this.currentPosition
                })
            });
        } catch (error) {
            console.error('Error sending location update:', error);
        }
    },

    completeDelivery(orderId) {
        // Remove from active deliveries
        $(`.delivery-card[data-order-id="${orderId}"]`).fadeOut(() => {
            $(this).remove();
            this.updateDeliveryStats();
        });

        // Clear route and markers
        if (this.routeLayer) {
            this.map.removeLayer(this.routeLayer);
        }
        ['pickup', 'delivery'].forEach(type => {
            if (this.markers[type]) {
                this.map.removeLayer(this.markers[type]);
            }
        });

        this.activeDeliveryId = null;
        showToast('success', 'Entrega completada exitosamente');
    }
};

Object.assign(deliveryManagement, deliveryRoute);
