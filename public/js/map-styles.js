const mapStyles = [
    {
        featureType: 'administrative',
        elementType: 'geometry',
        stylers: [{ visibility: 'simplified' }]
    },
    {
        featureType: 'poi',
        stylers: [{ visibility: 'off' }]
    },
    {
        featureType: 'road',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }]
    },
    {
        featureType: 'transit',
        stylers: [{ visibility: 'off' }]
    },
    {
        featureType: 'water',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
    }
];

class MapUtils {
    static calculateBounds(points) {
        const bounds = new google.maps.LatLngBounds();
        points.forEach(point => {
            bounds.extend(new google.maps.LatLng(point.lat, point.lng));
        });
        return bounds;
    }

    static createCustomMarker(position, label, color) {
        return new google.maps.Marker({
            position: position,
            label: {
                text: label,
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold'
            },
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: color,
                fillOpacity: 0.7,
                strokeWeight: 2,
                strokeColor: 'white',
                scale: 15
            }
        });
    }

    static generateGradientColors(count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const hue = (i * 360 / count) % 360;
            colors.push(`hsl(${hue}, 70%, 50%)`);
        }
        return colors;
    }

    static animateMarker(marker, path, duration) {
        const start = performance.now();
        const numSteps = Math.floor(duration / 16);
        let step = 0;

        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);

            const currentIndex = Math.floor(progress * (path.length - 1));
            if (currentIndex < path.length) {
                marker.setPosition(path[currentIndex]);
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }
}

export { mapStyles, MapUtils };
