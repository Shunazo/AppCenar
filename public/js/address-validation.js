let addressMap, addressMarker;
const defaultCenter = { lat: 18.4861, lng: -69.9312 }; // Santo Domingo

document.addEventListener('DOMContentLoaded', () => {
    initializeAddressMap();
    initializeAddressAutocomplete();
    initializeMapPreview();
});

function initializeAddressMap() {
    addressMap = new google.maps.Map(document.getElementById('addressMapPreview'), {
        zoom: 15,
        center: defaultCenter,
        mapTypeControl: false
    });

    addressMarker = new google.maps.Marker({
        map: addressMap,
        draggable: true,
        position: defaultCenter
    });

    google.maps.event.addListener(addressMarker, 'dragend', async function() {
        const position = addressMarker.getPosition();
        const coords = {
            lat: position.lat(),
            lng: position.lng()
        };
        await updateAddressFromCoordinates(coords);
    });
}

function initializeAddressAutocomplete() {
    const addressInput = document.querySelector('input[name="address"]');
    const autocomplete = new google.maps.places.Autocomplete(addressInput, {
        componentRestrictions: { country: 'DO' },
        fields: ['formatted_address', 'geometry', 'name']
    });

    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
            updateMapLocation(place.geometry.location);
        }
    });
}

function initializeMapPreview() {
    const mapPreviewButton = document.createElement('button');
    mapPreviewButton.className = 'btn btn-outline-secondary';
    mapPreviewButton.innerHTML = '<i class="fas fa-map-marker-alt"></i> Ver en Mapa';
    
    const addressInput = document.querySelector('input[name="address"]');
    addressInput.parentNode.appendChild(mapPreviewButton);

    mapPreviewButton.addEventListener('click', (e) => {
        e.preventDefault();
        showMapPreviewModal();
    });
}

async function updateAddressFromCoordinates(coords) {
    try {
        const response = await fetch(`/addresses/reverse-geocode?lat=${coords.lat}&lng=${coords.lng}`);
        const data = await response.json();
        
        if (data.success) {
            document.querySelector('input[name="address"]').value = data.address;
            updateMapLocation(coords);
        }
    } catch (error) {
        showAlert('Error al obtener dirección', 'error');
    }
}

function updateMapLocation(location) {
    addressMap.setCenter(location);
    addressMarker.setPosition(location);
}

function showMapPreviewModal() {
    const modal = new bootstrap.Modal(document.getElementById('mapPreviewModal'));
    modal.show();
    
    // Trigger resize to fix map display issues
    setTimeout(() => {
        google.maps.event.trigger(addressMap, 'resize');
        const address = document.querySelector('input[name="address"]').value;
        if (address) {
            geocodeAddress(address);
        }
    }, 300);
}

async function geocodeAddress(address) {
    try {
        const response = await fetch(`/addresses/geocode?address=${encodeURIComponent(address)}`);
        const data = await response.json();
        
        if (data.success) {
            updateMapLocation(data.coordinates);
        }
    } catch (error) {
        showAlert('Error al geocodificar dirección', 'error');
    }
}
