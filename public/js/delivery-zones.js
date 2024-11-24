let zoneMap, drawingManager, selectedShape;
let zoneModal;
let currentAction = 'add';

document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    initializeDrawingTools();
    initializeZoneModal();
    loadExistingZones();
});

function initializeMap() {
    zoneMap = new google.maps.Map(document.getElementById('zoneMap'), {
        center: { lat: businessLat, lng: businessLng },
        zoom: 13,
        mapTypeControl: false
    });

    // Add business marker
    new google.maps.Marker({
        position: { lat: businessLat, lng: businessLng },
        map: zoneMap,
        icon: {
            url: '/images/store-marker.png',
            scaledSize: new google.maps.Size(32, 32)
        },
        title: businessName
    });
}

function initializeDrawingTools() {
    drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [google.maps.drawing.OverlayType.POLYGON]
        },
        polygonOptions: {
            fillColor: '#FF0000',
            fillOpacity: 0.3,
            strokeWeight: 2,
            strokeColor: '#FF0000',
            editable: true,
            draggable: true
        }
    });

    drawingManager.setMap(zoneMap);

    google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon) {
        if (selectedShape) {
            selectedShape.setMap(null);
        }
        selectedShape = polygon;
        drawingManager.setDrawingMode(null);
    });
}

function initializeZoneModal() {
    zoneModal = new bootstrap.Modal(document.getElementById('zoneModal'));
    
    document.getElementById('saveZone').addEventListener('click', () => {
        if (validateZoneForm()) {
            saveZone();
        }
    });
}

function loadExistingZones() {
    const zones = JSON.parse(document.getElementById('zonesData').textContent);
    zones.forEach(zone => {
        const polygon = new google.maps.Polygon({
            paths: JSON.parse(zone.coordinates),
            map: zoneMap,
            fillColor: '#FF0000',
            fillOpacity: 0.3,
            strokeWeight: 2,
            strokeColor: '#FF0000'
        });

        polygon.zoneId = zone.id;
        addZoneListeners(polygon);
    });
}

function saveZone() {
    if (!selectedShape) {
        showAlert('Dibuja la zona en el mapa', 'warning');
        return;
    }

    const formData = getZoneFormData();
    formData.coordinates = getPolygonCoordinates(selectedShape);

    const url = currentAction === 'add' ? '/delivery-zones' : `/delivery-zones/${formData.zoneId}`;
    const method = currentAction === 'add' ? 'POST' : 'PUT';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            throw new Error(data.error);
        }
    })
    .catch(error => {
        showAlert(error.message, 'error');
    });
}

function getZoneFormData() {
    const form = document.getElementById('zoneForm');
    return {
        zoneId: form.elements.zoneId.value,
        name: form.elements.name.value,
        deliveryFee: parseFloat(form.elements.deliveryFee.value),
        minOrder: parseFloat(form.elements.minOrder.value),
        estimatedTime: parseInt(form.elements.estimatedTime.value)
    };
}

function getPolygonCoordinates(polygon) {
    const coordinates = [];
    const path = polygon.getPath();
    path.forEach(coord => {
        coordinates.push({
            lat: coord.lat(),
            lng: coord.lng()
        });
    });
    return coordinates;
}

function validateZoneForm() {
    const form = document.getElementById('zoneForm');
    return form.checkValidity();
}

function addZoneListeners(polygon) {
    polygon.addListener('click', () => {
        if (selectedShape) {
            selectedShape.setEditable(false);
        }
        selectedShape = polygon;
        selectedShape.setEditable(true);
    });
}
