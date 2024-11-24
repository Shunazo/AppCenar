class ZoneAnalytics {
    constructor(map) {
        this.map = map;
        this.heatmap = null;
        this.markers = [];
        this.clusters = [];
    }

    initializeHeatmap(deliveryData) {
        const heatmapData = deliveryData.map(point => ({
            location: new google.maps.LatLng(point.lat, point.lng),
            weight: point.orders
        }));

        this.heatmap = new google.maps.visualization.HeatmapLayer({
            data: heatmapData,
            map: this.map,
            radius: 30,
            opacity: 0.7
        });
    }

    createClusterMarkers(zones) {
        const markerClusterer = new MarkerClusterer(this.map, [], {
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
            maxZoom: 15,
            gridSize: 50
        });

        zones.forEach(zone => {
            const center = this.calculateZoneCenter(zone.coordinates);
            const marker = new google.maps.Marker({
                position: center,
                label: {
                    text: zone.deliveryCount.toString(),
                    color: 'white'
                },
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 20,
                    fillColor: this.getZoneColor(zone.deliveryCount),
                    fillOpacity: 0.7,
                    strokeWeight: 2,
                    strokeColor: 'white'
                }
            });
            
            this.markers.push(marker);
        });

        markerClusterer.addMarkers(this.markers);
    }

    calculateZoneCenter(coordinates) {
        const bounds = new google.maps.LatLngBounds();
        coordinates.forEach(coord => {
            bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
        });
        return bounds.getCenter();
    }

    getZoneColor(deliveryCount) {
        if (deliveryCount > 100) return '#FF0000';
        if (deliveryCount > 50) return '#FFA500';
        if (deliveryCount > 20) return '#FFFF00';
        return '#00FF00';
    }

    generateZoneStatistics(zones) {
        return zones.map(zone => ({
            id: zone.id,
            name: zone.name,
            deliveryCount: zone.deliveryCount,
            averageDeliveryTime: this.calculateAverageDeliveryTime(zone),
            peakHours: this.identifyPeakHours(zone),
            popularItems: this.getPopularItems(zone)
        }));
    }

    calculateAverageDeliveryTime(zone) {
        const deliveryTimes = zone.deliveries.map(d => d.deliveryTime);
        return deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length;
    }

    identifyPeakHours(zone) {
        const hourCounts = new Array(24).fill(0);
        zone.deliveries.forEach(delivery => {
            const hour = new Date(delivery.timestamp).getHours();
            hourCounts[hour]++;
        });
        
        return hourCounts
            .map((count, hour) => ({ hour, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);
    }

    getPopularItems(zone) {
        const itemCounts = new Map();
        zone.deliveries.forEach(delivery => {
            delivery.items.forEach(item => {
                itemCounts.set(item.name, (itemCounts.get(item.name) || 0) + 1);
            });
        });
        
        return Array.from(itemCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }
}

export default ZoneAnalytics;
