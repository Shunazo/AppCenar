class ZoneValidator {
    constructor(map) {
        this.map = map;
        this.bounds = new google.maps.LatLngBounds();
    }

    isPointInZone(lat, lng, zonePolygon) {
        const point = new google.maps.LatLng(lat, lng);
        return google.maps.geometry.poly.containsLocation(point, zonePolygon);
    }

    getZoneForAddress(lat, lng, zones) {
        return zones.find(zone => this.isPointInZone(lat, lng, zone.polygon));
    }

    validateZoneShape(polygon) {
        const path = polygon.getPath();
        if (path.getLength() < 3) {
            return {
                valid: false,
                message: 'La zona debe tener al menos 3 puntos'
            };
        }

        const area = google.maps.geometry.spherical.computeArea(path);
        if (area > 100000000) { // 100 km²
            return {
                valid: false,
                message: 'La zona es demasiado grande'
            };
        }

        return { valid: true };
    }

    calculateDeliveryFee(distance) {
        // Base fee + additional fee per km
        const baseFee = 50;
        const feePerKm = 10;
        const fee = baseFee + (distance * feePerKm);
        return Math.round(fee / 10) * 10; // Round to nearest 10
    }

    estimateDeliveryTime(distance) {
        // Base time + additional time per km
        const baseTime = 15;
        const timePerKm = 3;
        return Math.ceil(baseTime + (distance * timePerKm));
    }
}

// Zone utility functions
const zoneUtils = {
    formatZoneCoordinates(coordinates) {
        return coordinates.map(coord => ({
            lat: parseFloat(coord.lat),
            lng: parseFloat(coord.lng)
        }));
    },

    getZoneBounds(coordinates) {
        const bounds = new google.maps.LatLngBounds();
        coordinates.forEach(coord => {
            bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
        });
        return bounds;
    },

    generateZoneColor(index) {
        const colors = [
            '#FF0000', '#00FF00', '#0000FF', 
            '#FFFF00', '#FF00FF', '#00FFFF'
        ];
        return colors[index % colors.length];
    },

    createZonePolygon(coordinates, color) {
        return new google.maps.Polygon({
            paths: coordinates,
            strokeColor: color,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: color,
            fillOpacity: 0.35,
            editable: false
        });
    }
};

// Export both classes
export { ZoneValidator, zoneUtils };