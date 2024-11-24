const axios = require('axios');

class GeocodingService {
    constructor() {
        this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
        this.baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
    }

    async geocode(address) {
        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    address: address,
                    key: this.apiKey,
                    components: 'country:DO'
                }
            });

            if (response.data.status === 'OK') {
                const location = response.data.results[0].geometry.location;
                return {
                    lat: location.lat,
                    lng: location.lng,
                    formatted_address: response.data.results[0].formatted_address
                };
            } else {
                throw new Error('No se pudo geocodificar la dirección');
            }
        } catch (error) {
            throw new Error('Error en el servicio de geocodificación');
        }
    }

    async reverseGeocode(lat, lng) {
        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    latlng: `${lat},${lng}`,
                    key: this.apiKey
                }
            });

            if (response.data.status === 'OK') {
                return {
                    address: response.data.results[0].formatted_address,
                    components: response.data.results[0].address_components
                };
            } else {
                throw new Error('No se pudo obtener la dirección');
            }
        } catch (error) {
            throw new Error('Error en el servicio de geocodificación inversa');
        }
    }

    getDistanceMatrix(origins, destinations) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
                    params: {
                        origins: origins.join('|'),
                        destinations: destinations.join('|'),
                        key: this.apiKey,
                        mode: 'driving'
                    }
                });

                if (response.data.status === 'OK') {
                    resolve(response.data.rows);
                } else {
                    reject(new Error('Error al calcular distancias'));
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = new GeocodingService();
